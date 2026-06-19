# PRO-DID — Decentralized Identity Wallet

A full-stack self-sovereign identity (SSI) system built on EVM-compatible smart contracts.
Users can register W3C-style Decentralized Identifiers (DIDs), trusted institutions can issue and revoke verifiable credentials, and anyone can verify a credential's authenticity on-chain — with zero gas cost for the verifier.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  WalletContext ──► contractClient.ts ──► ethers v6          │
│                                │                            │
│         localStorage fallback (simulation mode)             │
└────────────────────────────────┼────────────────────────────┘
                                 │ JSON-RPC
┌────────────────────────────────▼────────────────────────────┐
│                    Anvil / EVM Node                         │
│                                                             │
│  DIDRegistry          IssuerRegistry     CredentialRegistry │
│  ─────────────        ─────────────      ────────────────── │
│  createDID()          registerIssuer()   issueCredential()  │
│  hasDID()             removeIssuer()     revokeCredential()  │
│  getDIDByController() isTrustedIssuer()  verifyCredential()  │
│  resolveDID()         getIssuer()        getCredential()     │
└─────────────────────────────────────────────────────────────┘
                                 │
                          IPFS (Pinata)
                    full credential documents
```

### Smart Contracts

| Contract | Description |
|---|---|
| `DIDRegistry` | Anchors `did:wallet:<id>` identifiers on-chain. One DID per address. |
| `IssuerRegistry` | Owner-controlled whitelist of trusted credential issuers. Soft-delete preserves history. |
| `CredentialRegistry` | Issues, revokes, and verifies credentials. Stores IPFS CID + document hash. Verification is a free view call. |

### Frontend

React 19 + TypeScript + Tailwind CSS + ethers v6.

Three role-gated views:
- **Holder** — create DID, view/verify credentials
- **Issuer** — issue and revoke credentials
- **Admin** — register/manage trusted issuers

The frontend auto-detects whether MetaMask and contract addresses are configured.
If not, it runs in **simulation mode** using localStorage — so the UI is fully explorable without a running node.

---

## Tech Stack

- **Solidity 0.8.24** — smart contracts
- **Foundry** — build, test, deploy (Forge + Anvil + Cast)
- **React 19 + TypeScript** — frontend
- **ethers v6** — contract interaction
- **Tailwind CSS v4** — styling
- **Vite** — frontend bundler

---

## Local Development

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `anvil`, `cast`)
- Node.js 18+ and npm
- MetaMask browser extension (optional — simulation mode works without it)

### One-command setup

```bash
make setup
```

This will:
1. Build the Solidity contracts
2. Start Anvil in the background
3. Deploy all three contracts
4. Write contract addresses to `did-wallet-frontend/.env`
5. Install frontend dependencies

Then start the frontend:

```bash
make frontend
```

### Manual steps

```bash
# 1. Build contracts
forge build

# 2. Run tests
forge test -v

# 3. Start local node (in a separate terminal)
anvil

# 4. Deploy contracts
# Copy the private key from Anvil's output (account #0)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# 5. Copy the addresses from deployment.json into the frontend .env
cp did-wallet-frontend/.env.example did-wallet-frontend/.env
# Then fill in VITE_DID_REGISTRY_ADDRESS, VITE_ISSUER_REGISTRY_ADDRESS,
# and VITE_CREDENTIAL_REGISTRY_ADDRESS from deployment.json

# 6. Install and run the frontend
cd did-wallet-frontend
npm install
npm run dev
```

Open http://localhost:3000 and connect MetaMask to `http://localhost:8545` (chain ID 31337).

---

## Contract Tests

```bash
forge test -v
```

```
[PASS] test_CreateDID_SetsHasDIDToTrue()
[PASS] test_HasDID()
[PASS] test_GetDIDByController()
[PASS] test_ResolveDID()
[PASS] test_CreateDID_RevertIf_AlreadyHasDID()
[PASS] test_CreateDID_RevertIf_EmptyIdentifier()
[PASS] test_CreateDID_RevertIf_DIDAlreadyExists()
[PASS] test_GetDIDByController_RevertIf_DIDNotFound()
[PASS] test_BuildDID()
[PASS] test_IssueCredential()
[PASS] test_VerifyCredential()
[PASS] test_GetCredential()
[PASS] test_GetCredentialsByHolder()
[PASS] test_GetCredentialsByIssuer()
[PASS] test_GetDID_Issuer_Registries()
[PASS] test_IssueCredential_RevertIf_NotTrustedIssuer()
[PASS] test_IssueCredential_RevertIf_HolderHasNoDID()
```

---

## Project Structure

```
did-wallet/
├── src/
│   ├── contracts/
│   │   ├── DIDRegistry.sol
│   │   ├── IssuerRegistry.sol
│   │   └── CredentialRegistry.sol
│   └── interfaces/
│       ├── IDIDRegistry.sol
│       └── IIssuerRegistry.sol
├── test/
│   ├── DIDRegistry.t.sol
│   └── CredentialRegistry.t.sol
├── script/
│   └── Deploy.s.sol
├── did-wallet-frontend/
│   ├── src/
│   │   ├── contracts/
│   │   │   ├── abis.ts          # typed ABIs for all three contracts
│   │   │   └── contractClient.ts # ethers v6 wrapper with sim fallback
│   │   ├── context/
│   │   │   └── WalletContext.tsx
│   │   └── components/          # role-gated views
│   └── .env.example
├── Makefile                     # one-command local setup
└── foundry.toml
```

---

## Design Decisions

**Why `did:wallet:` method?**
The DID method namespace is intentionally custom. The contract owns the namespace prefix (`did:wallet:`) and callers supply the identifier segment. This keeps DIDs human-readable while ensuring global uniqueness within the registry.

**Why separate IssuerRegistry?**
Decoupling issuer trust from credential issuance makes each contract independently testable and upgradeable. The CredentialRegistry only depends on the `IIssuerRegistry` interface — swapping the trust model doesn't require touching credential logic.

**Why IPFS + documentHash?**
Full credential documents (JSON-LD) are stored off-chain on IPFS. Only the CID and a SHA-256 document hash are stored on-chain. Verifiers can independently fetch the document from IPFS and compare the hash to detect tampering without storing large blobs on-chain.

**Simulation mode**
The frontend runs fully without MetaMask or a running node using localStorage. This makes the UI demonstrable anywhere and lets you explore all three roles without a Web3 setup.
