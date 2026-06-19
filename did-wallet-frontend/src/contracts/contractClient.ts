/**
 * contractClient.ts
 *
 * Thin wrapper around ethers v6 that wires the frontend to the deployed
 * Solidity contracts on Anvil (or any EVM-compatible network).
 *
 * Environment variables (set in .env):
 *   VITE_DID_REGISTRY_ADDRESS
 *   VITE_ISSUER_REGISTRY_ADDRESS
 *   VITE_CREDENTIAL_REGISTRY_ADDRESS
 *
 * Falls back to simulation mode when:
 *   - MetaMask / window.ethereum is not present, OR
 *   - Contract addresses are not configured.
 */

import { BrowserProvider, Contract, hexlify, toUtf8Bytes, zeroPadValue } from "ethers";
import {
  DID_REGISTRY_ABI,
  ISSUER_REGISTRY_ABI,
  CREDENTIAL_REGISTRY_ABI,
} from "./abis";

// ── Address config ────────────────────────────────────────────────────────────
export const CONTRACT_ADDRESSES = {
  didRegistry:        import.meta.env.VITE_DID_REGISTRY_ADDRESS        as string | undefined,
  issuerRegistry:     import.meta.env.VITE_ISSUER_REGISTRY_ADDRESS     as string | undefined,
  credentialRegistry: import.meta.env.VITE_CREDENTIAL_REGISTRY_ADDRESS as string | undefined,
};

export function isContractModeAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window as any).ethereum &&
    !!CONTRACT_ADDRESSES.didRegistry &&
    !!CONTRACT_ADDRESSES.issuerRegistry &&
    !!CONTRACT_ADDRESSES.credentialRegistry
  );
}

// ── Provider / signer helpers ─────────────────────────────────────────────────
async function getSigner() {
  const provider = new BrowserProvider((window as any).ethereum);
  return provider.getSigner();
}

async function getProvider() {
  return new BrowserProvider((window as any).ethereum);
}

// ── Contract factory helpers ──────────────────────────────────────────────────
async function getDIDRegistryRW() {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESSES.didRegistry!, DID_REGISTRY_ABI, signer);
}

async function getDIDRegistryRO() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESSES.didRegistry!, DID_REGISTRY_ABI, provider);
}

async function getIssuerRegistryRW() {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESSES.issuerRegistry!, ISSUER_REGISTRY_ABI, signer);
}

async function getIssuerRegistryRO() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESSES.issuerRegistry!, ISSUER_REGISTRY_ABI, provider);
}

async function getCredentialRegistryRW() {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESSES.credentialRegistry!, CREDENTIAL_REGISTRY_ABI, signer);
}

async function getCredentialRegistryRO() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESSES.credentialRegistry!, CREDENTIAL_REGISTRY_ABI, provider);
}

// ── DIDRegistry calls ─────────────────────────────────────────────────────────

/**
 * Calls DIDRegistry.createDID on-chain.
 * @returns The generated DID string (did:wallet:<identifier>)
 */
export async function onChain_createDID(identifier: string): Promise<string> {
  const contract = await getDIDRegistryRW();
  const tx = await contract.createDID(identifier);
  await tx.wait();
  // Return the canonical DID string matching the contract's _buildDID helper
  return `did:wallet:${identifier}`;
}

/**
 * Returns true if `address` controls a registered DID.
 */
export async function onChain_hasDID(address: string): Promise<boolean> {
  const contract = await getDIDRegistryRO();
  return contract.hasDID(address);
}

/**
 * Returns the DID string for a given controller address.
 * Throws if the address has no DID.
 */
export async function onChain_getDIDByController(address: string): Promise<string> {
  const contract = await getDIDRegistryRO();
  return contract.getDIDByController(address);
}

// ── IssuerRegistry calls ──────────────────────────────────────────────────────

/**
 * Registers a new trusted issuer (owner-only on-chain).
 */
export async function onChain_registerIssuer(
  issuerAddress: string,
  name: string,
  issuerType: string
): Promise<void> {
  const contract = await getIssuerRegistryRW();
  const tx = await contract.registerIssuer(issuerAddress, name, issuerType);
  await tx.wait();
}

/**
 * Removes a trusted issuer (owner-only on-chain).
 */
export async function onChain_removeIssuer(issuerAddress: string): Promise<void> {
  const contract = await getIssuerRegistryRW();
  const tx = await contract.removeIssuer(issuerAddress);
  await tx.wait();
}

/**
 * Returns true if `issuerAddress` is currently a trusted issuer.
 */
export async function onChain_isTrustedIssuer(issuerAddress: string): Promise<boolean> {
  const contract = await getIssuerRegistryRO();
  return contract.isTrustedIssuer(issuerAddress);
}

/**
 * Fetches the on-chain IssuerView record for `issuerAddress`.
 */
export async function onChain_getIssuer(issuerAddress: string) {
  const contract = await getIssuerRegistryRO();
  return contract.getIssuer(issuerAddress);
}

// ── CredentialRegistry calls ──────────────────────────────────────────────────

/**
 * Issues a credential on-chain.
 * @param documentHash  Hex string (0x…) or raw bytes32.  The frontend passes a
 *                      hex string; we normalise to bytes32 here.
 */
export async function onChain_issueCredential(
  credentialId: string,
  cid: string,
  documentHash: string,
  holderAddress: string,
  credentialType: string
): Promise<void> {
  const contract = await getCredentialRegistryRW();

  // Normalise documentHash: the contract expects bytes32.
  // Accept "0x" prefixed hex strings (64 hex chars) or shorter values.
  const hashBytes32: `0x${string}` = documentHash.startsWith("0x")
    ? (zeroPadValue(documentHash, 32) as `0x${string}`)
    : (hexlify(zeroPadValue(toUtf8Bytes(documentHash), 32)) as `0x${string}`);

  const tx = await contract.issueCredential(
    credentialId,
    cid,
    hashBytes32,
    holderAddress,
    credentialType
  );
  await tx.wait();
}

/**
 * Revokes a credential on-chain (original issuer only).
 */
export async function onChain_revokeCredential(credentialId: string): Promise<void> {
  const contract = await getCredentialRegistryRW();
  const tx = await contract.revokeCredential(credentialId);
  await tx.wait();
}

/**
 * Verifies a credential and returns its full on-chain metadata.
 * This is a free view call — no gas cost.
 */
export async function onChain_verifyCredential(credentialId: string) {
  const contract = await getCredentialRegistryRO();
  return contract.verifyCredential(credentialId);
}

/**
 * Returns the full Credential struct for a given ID.
 */
export async function onChain_getCredential(credentialId: string) {
  const contract = await getCredentialRegistryRO();
  return contract.getCredential(credentialId);
}

/**
 * Returns all credential IDs held by `holderAddress`.
 */
export async function onChain_getCredentialsByHolder(holderAddress: string): Promise<string[]> {
  const contract = await getCredentialRegistryRO();
  return contract.getCredentialsByHolder(holderAddress);
}

/**
 * Returns all credential IDs issued by `issuerAddress`.
 */
export async function onChain_getCredentialsByIssuer(issuerAddress: string): Promise<string[]> {
  const contract = await getCredentialRegistryRO();
  return contract.getCredentialsByIssuer(issuerAddress);
}
