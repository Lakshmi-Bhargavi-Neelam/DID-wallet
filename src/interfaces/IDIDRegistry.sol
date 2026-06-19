// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IDIDRegistry
/// @notice Interface for DID-centric identity resolution.
///
/// The DID is the primary identity object.
/// A wallet address is a controller of a DID, not the identity itself.
/// This separation allows future key rotation without changing the DID.
///
/// Used by CredentialRegistry to verify that a holder controls a DID
/// before a credential can be issued to them.
interface IDIDRegistry {
    // ─── Structs ─────────────────────────────────────────────────────────────

    /// @notice The minimal DID view exposed to external contracts.
    /// @dev Deliberately omits internal fields that only DIDRegistry needs
    ///      (e.g. future recovery keys, delegate lists).
    struct DIDView {
        string  did;          // the DID string:  did:wallet:<id>
        address controller;   // wallet currently in control of this DID
        uint256 createdAt;    // block.timestamp at creation
    }

    // ─── View functions ───────────────────────────────────────────────────────

    /// @notice Returns true if `controller` controls any registered DID.
    /// @dev Used by CredentialRegistry as the holder-existence guard.
    function hasDID(address controller) external view returns (bool);

    /// @notice Returns the DID string controlled by `controller`.
    /// @dev Reverts with DIDNotFound if the address controls no DID.
    function getDIDByController(address controller) external view returns (string memory);

    /// @notice Returns the full DIDView record for a given DID string.
    /// @dev Reverts with DIDNotFound if the DID does not exist.
    function resolveDID(string memory did) external view returns (DIDView memory);
}
