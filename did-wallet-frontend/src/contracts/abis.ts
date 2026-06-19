/**
 * Contract ABIs — generated from Foundry `out/` artifacts.
 * Keep in sync with the Solidity source files.
 */

export const DID_REGISTRY_ABI = [
  {
    "type": "function",
    "name": "createDID",
    "inputs": [{ "name": "identifier", "type": "string" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "hasDID",
    "inputs": [{ "name": "controller", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDIDByController",
    "inputs": [{ "name": "controller", "type": "address" }],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolveDID",
    "inputs": [{ "name": "did", "type": "string" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "did", "type": "string" },
          { "name": "controller", "type": "address" },
          { "name": "createdAt", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "DIDCreated",
    "inputs": [
      { "name": "did", "type": "string", "indexed": true },
      { "name": "controller", "type": "address", "indexed": true },
      { "name": "createdAt", "type": "uint256", "indexed": false }
    ]
  }
] as const;

export const ISSUER_REGISTRY_ABI = [
  {
    "type": "function",
    "name": "registerIssuer",
    "inputs": [
      { "name": "issuer", "type": "address" },
      { "name": "name", "type": "string" },
      { "name": "issuerType", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeIssuer",
    "inputs": [{ "name": "issuer", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isTrustedIssuer",
    "inputs": [{ "name": "issuer", "type": "address" }],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getIssuer",
    "inputs": [{ "name": "issuer", "type": "address" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "name", "type": "string" },
          { "name": "issuerType", "type": "string" },
          { "name": "isTrusted", "type": "bool" },
          { "name": "registeredAt", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getOwner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "IssuerRegistered",
    "inputs": [
      { "name": "issuer", "type": "address", "indexed": true },
      { "name": "name", "type": "string", "indexed": false },
      { "name": "issuerType", "type": "string", "indexed": false },
      { "name": "registeredAt", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "IssuerRemoved",
    "inputs": [
      { "name": "issuer", "type": "address", "indexed": true }
    ]
  }
] as const;

export const CREDENTIAL_REGISTRY_ABI = [
  {
    "type": "function",
    "name": "issueCredential",
    "inputs": [
      { "name": "credentialId", "type": "string" },
      { "name": "cid", "type": "string" },
      { "name": "documentHash", "type": "bytes32" },
      { "name": "holder", "type": "address" },
      { "name": "credentialType", "type": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeCredential",
    "inputs": [{ "name": "credentialId", "type": "string" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verifyCredential",
    "inputs": [{ "name": "credentialId", "type": "string" }],
    "outputs": [
      { "name": "id", "type": "string" },
      { "name": "credType", "type": "string" },
      { "name": "cid", "type": "string" },
      { "name": "documentHash", "type": "bytes32" },
      { "name": "issuer", "type": "address" },
      { "name": "holder", "type": "address" },
      { "name": "revoked", "type": "bool" },
      { "name": "issuedAt", "type": "uint256" },
      { "name": "revokedAt", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCredential",
    "inputs": [{ "name": "credentialId", "type": "string" }],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          { "name": "credentialId", "type": "string" },
          { "name": "credentialType", "type": "string" },
          { "name": "cid", "type": "string" },
          { "name": "documentHash", "type": "bytes32" },
          { "name": "issuer", "type": "address" },
          { "name": "holder", "type": "address" },
          { "name": "revoked", "type": "bool" },
          { "name": "issuedAt", "type": "uint256" },
          { "name": "revokedAt", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCredentialsByHolder",
    "inputs": [{ "name": "holder", "type": "address" }],
    "outputs": [{ "name": "", "type": "string[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCredentialsByIssuer",
    "inputs": [{ "name": "issuer", "type": "address" }],
    "outputs": [{ "name": "", "type": "string[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getDIDRegistry",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getIssuerRegistry",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CredentialIssued",
    "inputs": [
      { "name": "credentialId", "type": "string", "indexed": true },
      { "name": "issuer", "type": "address", "indexed": true },
      { "name": "holder", "type": "address", "indexed": true },
      { "name": "credentialType", "type": "string", "indexed": false },
      { "name": "cid", "type": "string", "indexed": false },
      { "name": "documentHash", "type": "bytes32", "indexed": false },
      { "name": "issuedAt", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "CredentialRevoked",
    "inputs": [
      { "name": "credentialId", "type": "string", "indexed": true },
      { "name": "issuer", "type": "address", "indexed": true },
      { "name": "revokedAt", "type": "uint256", "indexed": false }
    ]
  }
] as const;
