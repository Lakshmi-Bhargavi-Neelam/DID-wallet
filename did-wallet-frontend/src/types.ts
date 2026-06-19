export type UserRole = "Holder" | "Issuer" | "Admin";

export interface DIDProfile {
  identifier: string; // e.g. "bhargavi"
  did: string;        // e.g. "did:wallet:bhargavi"
  address: string;    // Wallet address
  createdAt: string;  // ISO timestamp
}

/**
 * Mirrors the IssuerView struct in IssuerRegistry.sol.
 * Note: `registrationNumber` is NOT stored on-chain — it is a frontend-only
 * display field kept for UI purposes and stored in localStorage only.
 */
export interface IssuerRegistration {
  address: string;
  name: string;
  type: string;        // maps to issuerType in the contract
  isTrusted?: boolean; // reflects on-chain isTrusted flag (optional in sim mode)
  registeredAt: string;
}

export interface CredentialType {
  id: string;           // Credential ID (e.g. "CRED-7319") — credentialId on-chain
  type: string;         // e.g. "B.Sc. Computer Science" — credentialType on-chain
  holder: string;       // Holder's wallet address
  issuer: string;       // Issuer's wallet address
  issuerName: string;   // Resolved issuer name (not stored on-chain)
  cid: string;          // IPFS CID of the metadata document
  documentHash: string; // bytes32 hash of the document (hex string)
  issueDate: string;    // YYYY-MM-DD (derived from on-chain issuedAt timestamp)
  revoked: boolean;
  revocationReason?: string; // frontend-only; not stored on-chain
}

export interface ActivityLog {
  id: string;
  type: "CREATE_DID" | "ISSUE_CREDENTIAL" | "REVOKE_CREDENTIAL" | "REGISTER_ISSUER";
  title: string;
  description: string;
  timestamp: string;
  hash: string; // transaction hash (real or simulated)
}
