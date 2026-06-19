// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IDIDRegistry }    from "../interfaces/IDIDRegistry.sol";
import { IIssuerRegistry } from "../interfaces/IIssuerRegistry.sol";

/// @title CredentialRegistry
/// @notice Manages the full lifecycle of verifiable credentials:
///         issuance, revocation, and view-only verification.
///
/// Design principles:
///   - Only lightweight metadata is stored on-chain (IDs, CIDs, addresses, flags).
///   - Full credential content lives in IPFS; the CID is the on-chain pointer.
///   - Verification is a pure view call — no transaction, no gas cost for verifiers.
///   - CredentialRegistry depends on DIDRegistry and IssuerRegistry via interfaces.
///     The two dependencies remain completely independent of each other.
///
/// Issuance guards (in order):
///   1. Caller is a trusted issuer.
///   2. Holder owns a DID.
///   3. Credential ID does not already exist.
///   4. CID is not empty.
///   5. Credential type is not empty.
///
/// Revocation guards (in order):
///   1. Credential exists.
///   2. Credential is not already revoked.
///   3. Caller is the original issuer of this credential.
contract CredentialRegistry {
    // ─── Structs ──────────────────────────────────────────────────────────────

    struct Credential {
        string  credentialId;
        string  credentialType;  // "Degree" | "Certification" | "Experience" | "License"
        string  cid;             // IPFS CID — pointer to the full credential document
        bytes32 documentHash;
        address issuer;
        address holder;
        bool    revoked;
        uint256 issuedAt;        // block.timestamp at issuance
        uint256 revokedAt;       // 0 until revoked; block.timestamp at revocation
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    /// @dev Primary store: credentialId → Credential.
    mapping(string  => Credential) private credentials;

    /// @dev Index: holder address → list of credential IDs they own.
    mapping(address => string[])   private holderCredentials;

    /// @dev Index: issuer address → list of credential IDs they have issued.
    mapping(address => string[])   private issuerCredentials;

    /// @dev Fast existence check; avoids struct read on every guard.
    mapping(string  => bool)       private credentialExists;

    /// @dev Immutable references to sibling registries (set in constructor).
    IDIDRegistry    private immutable didRegistry;
    IIssuerRegistry private immutable issuerRegistry;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when a new credential is issued.
    /// @param credentialId  Caller-supplied unique identifier.
    /// @param issuer        Address of the trusted issuer.
    /// @param holder        Address of the credential holder.
    /// @param credentialType Category label stored on-chain (e.g. "Degree").
    /// @param cid           IPFS CID of the full credential document.
    /// @param issuedAt      Block timestamp of issuance.
    event CredentialIssued(
        string  indexed credentialId,
        address indexed issuer,
        address indexed holder,
        string          credentialType,
        string          cid,
        bytes32 documentHash,
        uint256         issuedAt
    );

    /// @notice Emitted when a credential is revoked.
    /// @param credentialId  The revoked credential's identifier.
    /// @param issuer        Address of the issuer who revoked it.
    /// @param revokedAt     Block timestamp of revocation.
    event CredentialRevoked(
        string  indexed credentialId,
        address indexed issuer,
        uint256         revokedAt
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    /// @notice msg.sender is not a trusted issuer.
    error NotTrustedIssuer();

    /// @notice The credential holder does not have a registered DID.
    error HolderHasNoDID();

    /// @notice A credential with this ID already exists.
    error CredentialAlreadyExists();

    /// @notice The IPFS CID string is empty.
    error EmptyCID();

    /// @notice The credential type string is empty.
    error EmptyCredentialType();

    /// @notice No credential exists with the given ID.
    error CredentialNotFound();

    /// @notice The credential has already been revoked.
    error AlreadyRevoked();

    /// @notice Caller is not the original issuer of this credential.
    error NotCredentialIssuer();

    error EmptyDocumentHash();

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _didRegistry    Address of the deployed DIDRegistry contract.
    /// @param _issuerRegistry Address of the deployed IssuerRegistry contract.
    constructor(address _didRegistry, address _issuerRegistry) {
        didRegistry    = IDIDRegistry(_didRegistry);
        issuerRegistry = IIssuerRegistry(_issuerRegistry);
    }

    // ─── External: issuance ───────────────────────────────────────────────────

    /// @notice Issues a new verifiable credential.
    /// @param credentialId   Unique identifier chosen by the issuer (e.g. "mit-btech-2024-001").
    ///                       Must be globally unique across all issuers.
    /// @param cid            IPFS CID of the full credential document.
    /// @param documentHash   Hash of the credential document used for integrity verification.
    /// @param holder         Wallet address of the credential recipient.
    /// @param credentialType Category label (e.g. "Degree", "Certification").
    ///
    /// @dev Guards (in order):
    ///        1. msg.sender must be a trusted issuer.
    ///        2. holder must control a registered DID.
    ///        3. credentialId must not already exist.
    ///        4. cid must not be empty.
    ///        5. credentialType must not be empty.
    function issueCredential(
        string memory credentialId,
        string memory cid,
        bytes32 documentHash,
        address       holder,
        string memory credentialType
    ) external {
        // Guard 1 — trusted issuer
        if (!issuerRegistry.isTrustedIssuer(msg.sender)) revert NotTrustedIssuer();

        // Guard 2 — holder controls a registered DID
        if (!didRegistry.hasDID(holder)) revert HolderHasNoDID();

        // Guard 3 — credential ID is unique
        if (credentialExists[credentialId]) revert CredentialAlreadyExists();

        // Guard 4 — CID is non-empty
        if (bytes(cid).length == 0) revert EmptyCID();

        if (documentHash == bytes32(0)) {
            revert EmptyDocumentHash();
        }

        // Guard 5 — credential type is non-empty
        if (bytes(credentialType).length == 0) revert EmptyCredentialType();

        uint256 timestamp = block.timestamp;

        credentials[credentialId] = Credential({
            credentialId:   credentialId,
            credentialType: credentialType,
            cid:            cid,
            documentHash: documentHash,
            issuer:         msg.sender,
            holder:         holder,
            revoked:        false,
            issuedAt:       timestamp,
            revokedAt:      0
        });

        credentialExists[credentialId] = true;
        holderCredentials[holder].push(credentialId);
        issuerCredentials[msg.sender].push(credentialId);

        emit CredentialIssued(
            credentialId,
            msg.sender,
            holder,
            credentialType,
            cid,
            documentHash,
            timestamp
        );
    }

    // ─── External: revocation ─────────────────────────────────────────────────

    /// @notice Revokes an existing credential.
    ///         Only the original issuer of the credential may revoke it.
    ///         Revocation is permanent — credentials cannot be un-revoked in Phase 1.
    ///
    /// @param credentialId The identifier of the credential to revoke.
    ///
    /// @dev Guards (in order):
    ///        1. Credential must exist.
    ///        2. Credential must not already be revoked.
    ///        3. msg.sender must be the original issuer.
    function revokeCredential(string memory credentialId) external {
        // Guard 1 — exists
        if (!credentialExists[credentialId]) revert CredentialNotFound();

        Credential storage cred = credentials[credentialId];

        // Guard 2 — not already revoked
        if (cred.revoked) revert AlreadyRevoked();

        // Guard 3 — caller is original issuer
        if (cred.issuer != msg.sender) revert NotCredentialIssuer();

        uint256 timestamp = block.timestamp;

        cred.revoked   = true;
        cred.revokedAt = timestamp;

        emit CredentialRevoked(credentialId, msg.sender, timestamp);
    }

    // ─── External: verification (view — no gas cost for verifiers) ────────────

    /// @notice Verifies a credential and returns its full on-chain metadata.
    ///         This is a pure view call — no transaction required, no gas cost.
    ///
    /// @param credentialId The identifier to look up.
    /// @return id           The credential ID.
    /// @return credType     The credential type (e.g. "Degree").
    /// @return cid          IPFS CID of the full document.
    /// @return documentHash Hash of the credential document used for integrity verification.
    /// @return issuer       Address of the issuing entity.
    /// @return holder       Address of the credential holder.
    /// @return revoked      True if the credential has been revoked.
    /// @return issuedAt     Timestamp of issuance.
    /// @return revokedAt    Timestamp of revocation (0 if not revoked).
    function verifyCredential(string memory credentialId)
        external
        view
        returns (
            string  memory id,
            string  memory credType,
            string  memory cid,
            bytes32 documentHash,
            address        issuer,
            address        holder,
            bool           revoked,
            uint256        issuedAt,
            uint256        revokedAt
        )
    {
        if (!credentialExists[credentialId]) revert CredentialNotFound();

        Credential storage cred = credentials[credentialId];

        return (
            cred.credentialId,
            cred.credentialType,
            cred.cid,
            cred.documentHash,
            cred.issuer,
            cred.holder,
            cred.revoked,
            cred.issuedAt,
            cred.revokedAt
        );
    }

    // ─── External: queries ────────────────────────────────────────────────────

    /// @notice Returns the full Credential struct for a given ID.
    ///         Useful for the frontend when building credential detail views.
    /// @param credentialId The identifier to look up.
    function getCredential(string memory credentialId)
        external
        view
        returns (Credential memory)
    {
        if (!credentialExists[credentialId]) revert CredentialNotFound();
        return credentials[credentialId];
    }

    /// @notice Returns all credential IDs held by `holder`.
    /// @param holder The wallet address of the credential holder.
    function getCredentialsByHolder(address holder)
        external
        view
        returns (string[] memory)
    {
        return holderCredentials[holder];
    }

    /// @notice Returns all credential IDs issued by `issuer`.
    /// @param issuer The wallet address of the issuer.
    function getCredentialsByIssuer(address issuer)
        external
        view
        returns (string[] memory)
    {
        return issuerCredentials[issuer];
    }

    /// @notice Returns the address of the DIDRegistry this contract reads from.
    function getDIDRegistry() external view returns (address) {
        return address(didRegistry);
    }

    /// @notice Returns the address of the IssuerRegistry this contract reads from.
    function getIssuerRegistry() external view returns (address) {
        return address(issuerRegistry);
    }
}
