// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IDIDRegistry } from "../interfaces/IDIDRegistry.sol";

/// @title DIDRegistry
/// @notice DID-centric identity registry.
///
/// ┌─────────────────────────────────────────────────────────────────┐
/// │  Identity model                                                 │
/// │                                                                 │
/// │   DID  ──────►  controller wallet                              │
/// │  (permanent)     (replaceable in future phases)                │
/// │                                                                 │
/// │  The DID is the stable identity.                               │
/// │  The wallet is a controller that can, in future versions,      │
/// │  be rotated without changing the DID itself.                   │
/// └─────────────────────────────────────────────────────────────────┘
///
/// Storage layout:
///   dids[didString]        → DIDIdentity   — DID is the primary key
///   walletToDID[wallet]    → didString     — reverse index for fast lookup
///
/// Invariants (Phase 1):
///   - One DID per controller address.
///   - One controller per DID.
///   - DIDs are permanent; no deletion.
///   - Controller is fixed; no rotation yet.  ← extension point for Phase 2
///   - DID strings are caller-supplied but validated and namespaced.
///
/// DID format:   did:wallet:<caller-supplied-id>
/// Examples:     did:wallet:bhargavi
///               did:wallet:alice
///               did:wallet:0xabc123          (caller may use their address)
///
/// The caller supplies the identifier segment; the contract prepends
/// the method prefix "did:wallet:" to ensure all DIDs share a namespace.
/// This is intentionally different from the previous design where the
/// contract constructed the entire string — callers now own their identity
/// label while the contract owns the namespace.
contract DIDRegistry is IDIDRegistry {
    // ─── Internal struct ──────────────────────────────────────────────────────

    /// @dev Full on-chain record for a DID.
    ///      The struct is intentionally minimal for Phase 1.
    ///      Fields left open for Phase 2 extension (add inside struct, no migration needed):
    ///        - address   recoveryAddress
    ///        - address[] delegates
    ///        - uint256   updatedAt
    struct DIDIdentity {
        string  did;         // fully-qualified DID string: "did:wallet:<id>"
        address controller;  // wallet address currently controlling this DID
        uint256 createdAt;   // block.timestamp at creation
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    /// @dev Primary store — DID string → identity record.
    ///      The DID is the key; the wallet is a field inside the record.
    mapping(string  => DIDIdentity) private dids;

    /// @dev Reverse index — controller address → DID string.
    ///      Enables O(1) "does this wallet control a DID?" checks.
    mapping(address => string)      private walletToDID;

    /// @dev Existence flag keyed by DID string.
    ///      Avoids empty-struct comparisons on every lookup.
    mapping(string  => bool)        private didExists;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when a new DID is created.
    /// @param did        The fully-qualified DID string.
    /// @param controller The wallet address that registered and controls this DID.
    /// @param createdAt  Block timestamp of creation.
    event DIDCreated(
        string  indexed did,
        address indexed controller,
        uint256         createdAt
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    /// @notice Caller already controls a DID.
    error AlreadyHasDID();

    /// @notice The requested DID string or address has no registered DID.
    error DIDNotFound();

    /// @notice The caller-supplied identifier segment is empty.
    error EmptyIdentifier();

    /// @notice A DID with this identifier already exists.
    error DIDAlreadyExists();

    // ─── External: registration ───────────────────────────────────────────────

    /// @notice Creates a new DID controlled by the calling address.
    ///
    /// @param identifier  The caller-chosen identity label.
    ///                    The contract prepends "did:wallet:" automatically.
    ///                    Example: pass "bhargavi" → stored as "did:wallet:bhargavi"
    ///
    /// @dev Guards (in order):
    ///        1. Caller must not already control a DID.
    ///        2. Identifier must be non-empty.
    ///        3. The resulting DID string must not already exist.
    function createDID(string memory identifier) external {
        // Guard 1 — one DID per controller
        if (bytes(walletToDID[msg.sender]).length != 0) revert AlreadyHasDID();

        // Guard 2 — identifier is non-empty
        if (bytes(identifier).length == 0) revert EmptyIdentifier();

        // Guard 3 — build full DID and check global uniqueness
        string memory did = _buildDID(identifier);
        if (didExists[did]) revert DIDAlreadyExists();

        uint256 timestamp = block.timestamp;

        // Write primary record (DID → identity)
        dids[did] = DIDIdentity({
            did:        did,
            controller: msg.sender,
            createdAt:  timestamp
        });

        // Write reverse index (controller → DID)
        walletToDID[msg.sender] = did;

        // Mark existence
        didExists[did] = true;

        emit DIDCreated(did, msg.sender, timestamp);
    }

    // ─── External: interface implementation ───────────────────────────────────

    /// @inheritdoc IDIDRegistry
    /// @dev Returns true if the wallet controls any registered DID.
    ///      Never reverts — safe for CredentialRegistry guard calls.
    function hasDID(address controller) external view returns (bool) {
        return bytes(walletToDID[controller]).length != 0;
    }

    /// @inheritdoc IDIDRegistry
    /// @dev Reverts with DIDNotFound if `controller` controls no DID.
    function getDIDByController(address controller) external view returns (string memory) {
        string memory did = walletToDID[controller];
        if (bytes(did).length == 0) revert DIDNotFound();
        return did;
    }

    /// @inheritdoc IDIDRegistry
    /// @dev Resolves a DID string to its full identity record.
    ///      Reverts with DIDNotFound if the DID does not exist.
    function resolveDID(string memory did) external view returns (DIDView memory) {
        if (!didExists[did]) revert DIDNotFound();

        DIDIdentity storage identity = dids[did];
        return DIDView({
            did:        identity.did,
            controller: identity.controller,
            createdAt:  identity.createdAt
        });
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    /// @dev Prepends the method prefix to produce a fully-qualified DID.
    ///      "bhargavi"  →  "did:wallet:bhargavi"
    function _buildDID(string memory identifier) internal pure returns (string memory) {
        return string(abi.encodePacked("did:wallet:", identifier));
    }
}
