import { DIDProfile, IssuerRegistration, CredentialType, ActivityLog } from "./types";

// Standard Hardhat / Metamask test accounts to feel authentic to developers
export const MOCK_ACCOUNTS = {
  ADMIN: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  ISSUER_1: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  ISSUER_2: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  HOLDER_1: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  HOLDER_2: "0x15d34AAf54a67C6490d10222306De23E11122473"
};

export const INITIAL_DID_PROFILES: DIDProfile[] = [
  {
    identifier: "bhargavi",
    did: "did:wallet:bhargavi",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    createdAt: "2026-05-10T12:00:00Z"
  },
  {
    identifier: "alice_dev",
    did: "did:wallet:alice_dev",
    address: "0x15d34AAf54a67C6490d10222306De23E11122473",
    createdAt: "2026-06-01T14:30:22Z"
  }
];

export const INITIAL_ISSUERS: IssuerRegistration[] = [
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    name: "Oxford Identity Authority",
    type: "Educational Institution",
    isTrusted: true,
    registeredAt: "2026-02-14T09:15:00Z"
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    name: "Global Tech Association (GTA)",
    type: "Professional Association",
    isTrusted: true,
    registeredAt: "2026-03-20T11:45:00Z"
  }
];

export const INITIAL_CREDENTIALS: CredentialType[] = [
  {
    id: "CRED-101",
    type: "M.Sc. in Decentralized Systems",
    holder: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    issuer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    issuerName: "Oxford Identity Authority",
    cid: "ipfs://QmXoypizjW3WknFiJnKLwHCnH72vedxjQkDDP1mXWo6uco",
    documentHash: "0x8fae839e1a1cd4be66b2a3ff487ef84eeef2098d5c4be4bb561efde7e293a9d2",
    issueDate: "2026-05-15",
    revoked: false
  },
  {
    id: "CRED-102",
    type: "Principal Cryptographic Engineer Certificate",
    holder: "0x15d34AAf54a67C6490d10222306De23E11122473",
    issuer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    issuerName: "Global Tech Association (GTA)",
    cid: "ipfs://QmYwAPzwh3pC1r9ZqNnK73vPe9xS6W7v18pXkYq81r2pWo",
    documentHash: "0x3ab82fe00998a1cd40bee662a3cc4e87eeee2098d5c4be4bb561efdf4819aa3d5",
    issueDate: "2026-06-05",
    revoked: false
  },
  {
    id: "CRED-103",
    type: "Suspicious Certified Professional (Revoked Exam)",
    holder: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    issuer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    issuerName: "Global Tech Association (GTA)",
    cid: "ipfs://QmZxpizjW9PknFiJnKLaHCnH12vedxjQkDDP1zBWo9uco8",
    documentHash: "0x91fae839e1a2cd47e66ba3ff487ee84eeef2098d5c4be4bb561efde7e182390a",
    issueDate: "2026-06-10",
    revoked: true,
    revocationReason: "Candidate used unauthorized materials during online proctored exam."
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "LOG-1",
    type: "CREATE_DID",
    title: "DID Anchor Registered",
    description: "DID registered on-chain for standard wallet address.",
    timestamp: "2026-06-15T10:00:22Z",
    hash: "0x4ca82feaa998e1cd40bee442a3cc4e88ffef2098d5c4be4bb561efdf4819ff3a"
  },
  {
    id: "LOG-2",
    type: "REGISTER_ISSUER",
    title: "Oxford Authority Added",
    description: "Oxford Identity Authority has been successfully whitelisted as Verified Issuer.",
    timestamp: "2026-06-16T14:22:10Z",
    hash: "0x11ab82ff77c1cd4e10bea212a4cc4e17eeee2098d5c4be4bb561efdf4819d9d1"
  }
];

export function generateDID(identifier: string): string {
  // Matches the contract: _buildDID prepends "did:wallet:"
  const cleanId = identifier.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  return `did:wallet:${cleanId}`;
}

export function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
