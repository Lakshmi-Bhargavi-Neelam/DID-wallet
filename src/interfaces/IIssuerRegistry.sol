// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IIssuerRegistry
/// @notice Interface for issuer trust checks.
///         Used by CredentialRegistry to verify the caller is a trusted issuer.
interface IIssuerRegistry {
    // ─── Structs ────────────────────────────────────────────────────────────

    struct IssuerView {
        string   name;
        string   issuerType;
        bool     isTrusted;
        uint256  registeredAt;
    }

    // ─── View functions ──────────────────────────────────────────────────────

    /// @notice Returns true if `issuer` is currently a trusted issuer.
    function isTrustedIssuer(address issuer) external view returns (bool);

    /// @notice Returns the full issuer record for `issuer`.
    /// @dev Reverts with IssuerNotFound if address is not registered.
    function getIssuer(address issuer) external view returns (IssuerView memory);
}
