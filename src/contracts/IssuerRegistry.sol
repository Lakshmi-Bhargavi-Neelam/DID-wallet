// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IIssuerRegistry } from "../interfaces/IIssuerRegistry.sol";

/// @title IssuerRegistry
/// @notice Manages the set of trusted credential issuers.
///
/// Only the contract owner (deployer) can register or remove issuers.
/// Issuers are typed entities: University, Company, TrainingInstitute, Government, etc.
/// The issuer type is a free string — no enum — to allow new categories without
/// contract upgrades.
///
/// Trust model:
///   - Registering an issuer sets isTrusted = true.
///   - Removing an issuer sets isTrusted = false but preserves the record.
///     This lets the frontend display "formerly trusted issuer" rather than
///     showing a blank entry for credentials that were issued while trusted.
///   - Re-registering a removed issuer is not permitted in Phase 1.
contract IssuerRegistry is IIssuerRegistry {
    // ─── Storage ──────────────────────────────────────────────────────────────

    struct Issuer {
        string  name;
        string  issuerType;
        bool    isTrusted;
        uint256 registeredAt;
    }

    /// @dev Maps issuer address → Issuer record.
    mapping(address => Issuer) private issuers;

    /// @dev The account that can register / remove issuers.
    address private immutable owner;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when a new issuer is registered.
    event IssuerRegistered(
        address indexed issuer,
        string          name,
        string          issuerType,
        uint256         registeredAt
    );

    /// @notice Emitted when an issuer is removed.
    event IssuerRemoved(address indexed issuer);

    // ─── Errors ───────────────────────────────────────────────────────────────

    /// @notice Caller is not the contract owner.
    error NotOwner();

    /// @notice Issuer address is already registered.
    error AlreadyRegistered();

    /// @notice No issuer record exists for the queried address.
    error IssuerNotFound();

    /// @notice Issuer is already removed / not trusted.
    error NotRegistered();

    /// @notice Provided name or issuerType string is empty.
    error EmptyField();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── External functions ───────────────────────────────────────────────────

    /// @notice Registers a new trusted issuer.
    /// @param issuer     The wallet address of the issuer.
    /// @param name       Human-readable name (e.g. "MIT").
    /// @param issuerType Category string (e.g. "University").
    /// @dev Only callable by the contract owner.
    function registerIssuer(
        address       issuer,
        string memory name,
        string memory issuerType
    ) external onlyOwner {
        if (issuers[issuer].registeredAt != 0) revert AlreadyRegistered();
        if (bytes(name).length == 0 || bytes(issuerType).length == 0) revert EmptyField();

        issuers[issuer] = Issuer({
            name:         name,
            issuerType:   issuerType,
            isTrusted:    true,
            registeredAt: block.timestamp
        });

        emit IssuerRegistered(issuer, name, issuerType, block.timestamp);
    }

    /// @notice Removes a trusted issuer.
    ///         Sets isTrusted = false; preserves the record for historical lookup.
    /// @param issuer The wallet address of the issuer to remove.
    /// @dev Only callable by the contract owner.
    function removeIssuer(address issuer) external onlyOwner {
        if (issuers[issuer].registeredAt == 0) revert IssuerNotFound();
        if (!issuers[issuer].isTrusted) revert NotRegistered();

        issuers[issuer].isTrusted = false;

        emit IssuerRemoved(issuer);
    }

    /// @inheritdoc IIssuerRegistry
    function isTrustedIssuer(address issuer) external view returns (bool) {
        return issuers[issuer].isTrusted;
    }

    /// @inheritdoc IIssuerRegistry
    /// @dev Reverts with IssuerNotFound if the address was never registered.
    function getIssuer(address issuer) external view returns (IssuerView memory) {
        if (issuers[issuer].registeredAt == 0) revert IssuerNotFound();

        Issuer storage rec = issuers[issuer];
        return IssuerView({
            name:         rec.name,
            issuerType:   rec.issuerType,
            isTrusted:    rec.isTrusted,
            registeredAt: rec.registeredAt
        });
    }

    /// @notice Returns the address of the contract owner.
    function getOwner() external view returns (address) {
        return owner;
    }
}
