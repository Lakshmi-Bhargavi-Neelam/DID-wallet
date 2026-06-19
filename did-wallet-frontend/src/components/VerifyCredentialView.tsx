import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import {
  Search, ShieldAlert, CheckCircle2, XCircle, RefreshCw,
  Award, Building2, User, CalendarDays, ExternalLink,
  ChevronDown, ChevronUp, Copy, ShieldCheck
} from "lucide-react";
import { CredentialType } from "../types";
import { toGatewayUrl } from "../utils/ipfs";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  valueClass = "text-white"
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-0.5 text-zinc-500 shrink-0">{icon}</div>
      <div>
        <span className="text-[11px] text-zinc-500 block mb-0.5">{label}</span>
        <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VerifyCredentialView() {
  const { credentials } = useWallet();
  const [searchId, setSearchId]           = useState("");
  const [result, setResult]               = useState<CredentialType | null>(null);
  const [hasSearched, setHasSearched]     = useState(false);
  const [isValidating, setIsValidating]   = useState(false);
  const [showAdvanced, setShowAdvanced]   = useState(false);
  const [copied, setCopied]               = useState(false);

  // ── Search logic ────────────────────────────────────────────────────────────
  const doSearch = (id: string) => {
    setIsValidating(true);
    setHasSearched(true);
    setShowAdvanced(false);
    setResult(null);

    setTimeout(() => {
      const match = credentials.find(
        c => c.id.trim().toUpperCase() === id.trim().toUpperCase()
      );
      setResult(match ?? null);
      setIsValidating(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) doSearch(searchId);
  };

  const handleCopyCid = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.cid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // A credential is "valid" if it exists and is NOT revoked
  const isValid = result !== null && !result.revoked;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
          Verify a Credential
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Enter a credential ID to instantly check whether it is genuine and currently valid.
        </p>
      </div>

      {/* Search box */}
      <div className="glassmorphism-card p-6 rounded-2xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="text-sm font-medium text-zinc-300 block">
            Credential ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. CRED-101"
              className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-sm px-4 py-3 pr-12 rounded-xl focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 placeholder-zinc-600 transition"
              required
            />
            <button
              type="submit"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          </div>
        </form>

        {/* Quick shortcuts */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-zinc-500">Try:</span>
          {credentials.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setSearchId(c.id); doSearch(c.id); }}
              className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isValidating && (
        <div className="p-12 flex flex-col items-center space-y-3 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-full animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="text-sm text-zinc-400">Checking credential status...</p>
        </div>
      )}

      {/* Results */}
      {!isValidating && hasSearched && (

        // ── Not found ────────────────────────────────────────────────────────
        result === null ? (
          <div className="p-10 text-center bg-zinc-950/50 border border-dashed border-zinc-800 rounded-2xl space-y-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-full w-fit mx-auto">
              <XCircle className="w-6 h-6 text-zinc-500" />
            </div>
            <h4 className="text-white font-semibold">No credential found</h4>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto">
              No credential with ID <span className="font-mono text-zinc-300">"{searchId.toUpperCase()}"</span> exists in the registry.
            </p>
          </div>

        ) : (

          <div className={`glassmorphism-card rounded-2xl overflow-hidden border ${
            isValid ? "border-emerald-500/20" : "border-red-500/20"
          }`}>

            {/* ── Verdict banner ── */}
            <div className={`px-6 py-6 ${isValid ? "bg-emerald-950/10" : "bg-red-950/10"}`}>

              {/* Big verdict */}
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${isValid ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  {isValid
                    ? <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    : <ShieldAlert className="w-8 h-8 text-red-400" />
                  }
                </div>
                <div>
                  <p className={`text-xl font-bold ${isValid ? "text-emerald-400" : "text-red-400"}`}>
                    {isValid ? "Valid Credential" : "Credential Revoked"}
                  </p>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    {isValid
                      ? "This credential is genuine and has not been revoked."
                      : "This credential has been marked invalid by the issuing organisation."
                    }
                  </p>
                </div>
              </div>

              {/* Revocation reason box */}
              {!isValid && result.revocationReason && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-[11px] uppercase font-mono text-red-400 mb-1">Reason for revocation</p>
                  <p className="text-sm text-zinc-200 leading-relaxed">{result.revocationReason}</p>
                </div>
              )}
            </div>

            {/* ── Human-readable details ── */}
            <div className="px-6 py-6 space-y-5 border-t border-zinc-900/60">

              <p className="text-[11px] uppercase font-mono tracking-wider text-zinc-500">
                Credential Details
              </p>

              <div className="space-y-5">

                <InfoRow
                  icon={<Award className="w-4 h-4" />}
                  label="Credential"
                  value={result.type}
                  valueClass="text-white font-semibold text-base"
                />

                <InfoRow
                  icon={<Building2 className="w-4 h-4" />}
                  label="Issued by"
                  value={result.issuerName}
                />

                <InfoRow
                  icon={<User className="w-4 h-4" />}
                  label="Issued to"
                  value={
                    <span className="font-mono text-sm text-zinc-300">
                      {shortenAddress(result.holder)}
                    </span>
                  }
                />

                <InfoRow
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Issue date"
                  value={formatDate(result.issueDate)}
                  valueClass="text-zinc-300"
                />

              </div>

              {/* ── Status pill ── */}
              <div className="pt-2">
                {isValid ? (
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Currently valid — not revoked</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    <XCircle className="w-4 h-4" />
                    <span>Revoked — no longer valid</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Advanced / technical section (collapsed by default) ── */}
            <div className="border-t border-zinc-900/60">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm text-zinc-500 hover:text-zinc-300 transition"
              >
                <span>View original document & technical details</span>
                {showAdvanced
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />
                }
              </button>

              {showAdvanced && (
                <div className="px-6 pb-6 space-y-5 border-t border-zinc-900/40">

                  <p className="text-[11px] uppercase font-mono tracking-wider text-zinc-500 pt-2">
                    Technical Details
                  </p>

                  {/* IPFS document link */}
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400 font-medium">Original Document (IPFS)</p>
                    <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
                      <span className="font-mono text-xs text-zinc-400 truncate flex-1">{result.cid}</span>
                      <button
                        type="button"
                        onClick={handleCopyCid}
                        className="shrink-0 text-zinc-500 hover:text-white transition"
                        title="Copy CID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={toGatewayUrl(result.cid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-purple-400 hover:text-purple-300 transition"
                        title="Open on IPFS"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    {copied && (
                      <p className="text-[11px] text-emerald-400">CID copied to clipboard.</p>
                    )}
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      The full credential document is stored on IPFS. Click the link icon to retrieve and inspect the original file. The document hash below can be used to confirm it has not been tampered with since issuance.
                    </p>
                  </div>

                  {/* Technical fields grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                    <div className="space-y-1">
                      <p className="text-zinc-500">Credential ID</p>
                      <p className="font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg">
                        {result.id}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-zinc-500">Document Hash (SHA-256)</p>
                      <p className="font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg truncate">
                        {result.documentHash}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-zinc-500">Issuer Address</p>
                      <p className="font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg truncate">
                        {result.issuer}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-zinc-500">Holder Address</p>
                      <p className="font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg truncate">
                        {result.holder}
                      </p>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        )
      )}
    </div>
  );
}
