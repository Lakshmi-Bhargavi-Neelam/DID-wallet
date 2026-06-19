/**
 * ipfs.ts — IPFS upload and hash utilities
 *
 * Upload flow:
 *   1. User picks a file in the browser.
 *   2. computeSHA256() hashes the raw bytes using the Web Crypto API (no library needed).
 *   3. uploadToPinata() pins the file to IPFS via Pinata's public upload endpoint.
 *      - If VITE_PINATA_JWT is set   → real upload, returns a real CID.
 *      - If VITE_PINATA_JWT is empty → simulation mode, returns a deterministic fake CID
 *        so the app stays fully demonstrable without a Pinata account.
 *
 * The returned { cid, documentHash } pair is what gets stored on-chain.
 */

// ── SHA-256 hash ──────────────────────────────────────────────────────────────

/**
 * Computes the SHA-256 hash of a File using the browser's built-in Web Crypto API.
 * Returns a 0x-prefixed hex string (bytes32-compatible).
 */
export async function computeSHA256(file: File): Promise<string> {
  const buffer     = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  const hashHex    = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}

// ── IPFS upload ───────────────────────────────────────────────────────────────

export interface IPFSUploadResult {
  cid: string;           // e.g. "ipfs://QmXoy..."
  gatewayUrl: string;    // e.g. "https://gateway.pinata.cloud/ipfs/QmXoy..."
  documentHash: string;  // 0x-prefixed SHA-256 hex
  simulated: boolean;    // true when no Pinata JWT is configured
}

/**
 * Uploads a file to IPFS via Pinata.
 * Falls back to a simulated CID when VITE_PINATA_JWT is not configured.
 */
export async function uploadToPinata(file: File): Promise<IPFSUploadResult> {
  const documentHash = await computeSHA256(file);
  const jwt          = import.meta.env.VITE_PINATA_JWT;

  // ── Simulation fallback (no JWT configured) ───────────────────────────────
  if (!jwt) {
    // Generate a deterministic-looking fake CID from the file name + size
    const seed   = `${file.name}-${file.size}-${file.lastModified}`;
    let   hash   = 5381;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
      hash = hash >>> 0; // keep unsigned 32-bit
    }
    const fakeSuffix = Math.abs(hash).toString(16).padStart(8, "0");
    const fakeCID    = `QmSimulated${fakeSuffix}${"a".repeat(36 - fakeSuffix.length)}`;

    return {
      cid:          `ipfs://${fakeCID}`,
      gatewayUrl:   `https://ipfs.io/ipfs/${fakeCID}`,
      documentHash,
      simulated:    true,
    };
  }

  // ── Real Pinata upload ────────────────────────────────────────────────────
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: file.name })
  );
  formData.append(
    "pinataOptions",
    JSON.stringify({ cidVersion: 1 })
  );

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method:  "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body:    formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${text}`);
  }

  const data: { IpfsHash: string } = await response.json();
  const cid = data.IpfsHash;

  return {
    cid:          `ipfs://${cid}`,
    gatewayUrl:   `https://gateway.pinata.cloud/ipfs/${cid}`,
    documentHash,
    simulated:    false,
  };
}

// ── Gateway URL helper ────────────────────────────────────────────────────────

/**
 * Converts any ipfs:// URI to a public HTTP gateway URL.
 * Falls back to ipfs.io if no dedicated gateway is configured.
 */
export function toGatewayUrl(cidOrUri: string): string {
  const raw = cidOrUri.replace(/^ipfs:\/\//, "");
  return `https://ipfs.io/ipfs/${raw}`;
}
