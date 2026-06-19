import React, { useRef, useState } from "react";
import { useWallet } from "../context/WalletContext";
import {
  Award, Database, UploadCloud, FileText, X,
  CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { uploadToPinata } from "../utils/ipfs";

// ── Upload state type ─────────────────────────────────────────────────────────
type UploadStatus = "idle" | "hashing" | "uploading" | "done" | "error";

export default function IssueCredentialView() {
  const { address, role, profiles, issueCredential, navigateTo } = useWallet();

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [credId,        setCredId]        = useState(() => `CRED-${Math.floor(100 + Math.random() * 900)}`);
  const [credType,      setCredType]      = useState("");
  const [holderAddress, setHolderAddress] = useState("");

  // ── File / IPFS state ────────────────────────────────────────────────────────
  const [selectedFile,  setSelectedFile]  = useState<File | null>(null);
  const [cid,           setCid]           = useState("");
  const [docHash,       setDocHash]       = useState("");
  const [uploadStatus,  setUploadStatus]  = useState<UploadStatus>("idle");
  const [uploadError,   setUploadError]   = useState("");
  const [isSimulated,   setIsSimulated]   = useState(false);

  // ── Submit state ─────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File selection → auto-upload ─────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous upload state
    setSelectedFile(file);
    setCid("");
    setDocHash("");
    setUploadError("");
    setUploadStatus("hashing");

    try {
      setUploadStatus("uploading");
      const result = await uploadToPinata(file);

      setCid(result.cid);
      setDocHash(result.documentHash);
      setIsSimulated(result.simulated);
      setUploadStatus("done");
    } catch (err: any) {
      setUploadError(err.message ?? "Upload failed. Please try again.");
      setUploadStatus("error");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setCid("");
    setDocHash("");
    setUploadStatus("idle");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Form submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credId || !credType || !holderAddress || !cid || !docHash) return;
    if (!holderAddress.startsWith("0x") || holderAddress.length !== 42) {
      alert("Please provide a valid Ethereum address (42 characters, starting with 0x).");
      return;
    }

    setIsSubmitting(true);

    const success = await issueCredential({
      id:           credId.trim(),
      type:         credType.trim(),
      holder:       holderAddress.trim(),
      cid:          cid.trim(),
      documentHash: docHash.trim(),
      issueDate:    new Date().toISOString().split("T")[0],
    });

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setCredType("");
      setHolderAddress("");
      setSelectedFile(null);
      setCid("");
      setDocHash("");
      setUploadStatus("idle");
      setCredId(`CRED-${Math.floor(100 + Math.random() * 900)}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      navigateTo("issued-credentials");
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSubmit =
    !!credId && !!credType && !!holderAddress &&
    uploadStatus === "done" &&
    !isSubmitting;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
          Issue Credential
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Fill in the credential details, upload the document, and issue it on-chain.
        </p>
      </div>

      <div className="glassmorphism-card p-6 sm:p-8 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section header */}
          <div className="flex items-center space-x-2 text-purple-400 pb-2 border-b border-zinc-900/60">
            <Award className="w-4.5 h-4.5" />
            <span className="text-xs font-semibold font-mono uppercase tracking-wider">
              Credential Details
            </span>
          </div>

          {/* Credential ID + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Credential ID
              </label>
              <input
                type="text"
                value={credId}
                onChange={(e) => setCredId(e.target.value)}
                placeholder="CRED-104"
                className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Credential Type
              </label>
              <input
                type="text"
                value={credType}
                onChange={(e) => setCredType(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 placeholder-zinc-700 transition"
                required
              />
            </div>
          </div>

          {/* Holder address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Holder Wallet Address
            </label>
            <input
              type="text"
              value={holderAddress}
              onChange={(e) => setHolderAddress(e.target.value)}
              placeholder="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
              className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 placeholder-zinc-700 transition"
              required
            />
            {/* Known holders quick-fill */}
            {profiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-zinc-500 self-center">Registered holders:</span>
                {profiles.map(p => (
                  <button
                    key={p.address}
                    type="button"
                    onClick={() => setHolderAddress(p.address)}
                    className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/60 font-mono text-[10px] text-zinc-400 hover:text-white hover:border-purple-500/20 transition"
                  >
                    @{p.identifier}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Document upload ─────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-purple-400 pb-2 border-b border-zinc-900/60">
              <UploadCloud className="w-4.5 h-4.5" />
              <span className="text-xs font-semibold font-mono uppercase tracking-wider">
                Credential Document
              </span>
            </div>

            {/* Drop zone — shown when no file selected */}
            {!selectedFile && (
              <label
                htmlFor="doc-upload"
                className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-800 hover:border-purple-500/40 rounded-2xl cursor-pointer bg-zinc-950/40 hover:bg-purple-500/5 transition-all duration-200 group"
              >
                <UploadCloud className="w-8 h-8 text-zinc-600 group-hover:text-purple-400 transition mb-2" />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition">
                  Click to upload or drag and drop
                </span>
                <span className="text-[11px] text-zinc-600 mt-1">
                  PDF, PNG, JPG, DOCX — any file up to 50 MB
                </span>
                <input
                  id="doc-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}

            {/* File selected — status card */}
            {selectedFile && (
              <div className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                uploadStatus === "done"
                  ? "border-emerald-500/20 bg-emerald-950/10"
                  : uploadStatus === "error"
                  ? "border-red-500/20 bg-red-950/10"
                  : "border-zinc-800 bg-zinc-950/40"
              }`}>

                {/* File info row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 bg-zinc-900 rounded-lg shrink-0">
                      <FileText className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-zinc-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="shrink-0 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition ml-3"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload progress / status */}
                {(uploadStatus === "hashing" || uploadStatus === "uploading") && (
                  <div className="flex items-center space-x-2 text-xs text-zinc-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400 shrink-0" />
                    <span>
                      {uploadStatus === "hashing"
                        ? "Computing document hash..."
                        : "Uploading to IPFS..."}
                    </span>
                  </div>
                )}

                {uploadStatus === "done" && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isSimulated
                          ? "Document processed (simulation — no Pinata JWT configured)"
                          : "Document uploaded to IPFS successfully"
                        }
                      </span>
                    </div>

                    {/* CID and hash previews — read-only, auto-filled */}
                    <div className="space-y-2 pt-1">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                          IPFS CID
                        </span>
                        <p className="font-mono text-[11px] text-zinc-300 bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-lg truncate">
                          {cid}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                          SHA-256 Document Hash
                        </span>
                        <p className="font-mono text-[11px] text-zinc-300 bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-lg truncate">
                          {docHash}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <div className="flex items-start space-x-2 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Upload failed</p>
                      <p className="text-zinc-500 mt-0.5">{uploadError}</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1.5 text-purple-400 hover:text-purple-300 underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Explanation note */}
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              The document is pinned to IPFS. Its content hash is stored on-chain alongside the credential,
              so verifiers can confirm the document has not been modified since issuance.
            </p>
          </div>

          {/* Notice */}
          <div className="bg-zinc-900/60 p-4 border border-zinc-900 rounded-xl flex items-start space-x-3">
            <Database className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-zinc-400 leading-normal">
              Submitting records this credential in the on-chain registry.
              Your address <code className="text-zinc-200">({address?.slice(0, 10)}…)</code> will be
              permanently recorded as the issuer.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-900 disabled:to-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-medium text-sm py-3 rounded-xl transition duration-200 shadow-xl shadow-purple-950/15 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Issuing credential...</span>
              </>
            ) : (
              <span>Issue Credential</span>
            )}
          </button>

          {/* Hint when document not yet uploaded */}
          {!canSubmit && !isSubmitting && uploadStatus !== "done" && (
            <p className="text-center text-[11px] text-zinc-500">
              Upload a document above to enable submission.
            </p>
          )}

        </form>
      </div>
    </div>
  );
}
