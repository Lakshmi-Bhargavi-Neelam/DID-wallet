/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DID_REGISTRY_ADDRESS: string;
  readonly VITE_ISSUER_REGISTRY_ADDRESS: string;
  readonly VITE_CREDENTIAL_REGISTRY_ADDRESS: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_PINATA_JWT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
