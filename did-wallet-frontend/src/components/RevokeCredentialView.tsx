import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ShieldAlert, AlertTriangle, Loader2 } from "lucide-react";
import { CredentialType } from "../types";

export default function RevokeCredentialView() {
  const { credentials, revokeCredential, navigateTo } = useWallet();
  const [credId,           setCredId]           = useState("");
  const [reason,           setReason]           = useState("");
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [targetCred,       setTargetCred]       = useState<CredentialType | null>(null);
  const [notFoundError,    setNotFoundError]    = useState("");

  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFoundError("");

    const match = credentials.find(
      c => c.id.trim().toUpperCase() === credId.trim().toUpperCase()
    );

    if (!match) {
      setNotFoundError(`No credential found with ID "${credId}".`);
      return;
    }
    if (match.revoked) {
      setNotFoundError(`Credential "${credId}" is already revoked.`);
      return;
    }

    setTargetCred(match);
    setShowConfirm(true);
  };

  const handleConfirmRevoke = async () => {
    if (!targetCred) return;
    setIsSubmitting(true);
    setShowConfirm(false);

    const success = await revokeCredential(targetCred.id, reason);
    setIsSubmitting(false);

    if (success) {
      setCredId("");
      setReason("");
      setTargetCred(null);
      navigateTo("issued-credentials");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Revoke Credential</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Permanently mark a credential as invalid. This cannot be undone.
        </p>
      </div>

      <div className="glassmorphism-card p-6 sm:p-8 rounded-2xl">
        <form onSubmit={handleOpenConfirmation} className="space-y-5">

          <div className="flex items-center space-x-3 text-red-400 pb-2 border-b border-zinc-900/60">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-semibold font-mono uppercase tracking-wider">Revocation Form</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">Credential ID</label>
            <input
              type="text"
              value={credId}
              onChange={(e) => { setCredId(e.target.value); setNotFoundError(""); }}
              placeholder="e.g. CRED-101"
              className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10 placeholder-zinc-700 transition"
              required
            />
            {notFoundError && (
              <p className="text-xs text-red-400 mt-1">{notFoundError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">Reason for revocation</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this credential is being revoked..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10 placeholder-zinc-700 transition resize-none"
              required
            />
          </div>

          <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Revoking a credential marks it permanently invalid. Verifiers will see the revocation status and reason immediately.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-medium text-sm py-3 rounded-xl transition flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Revoking...</span></>
            ) : (
              <span>Revoke Credential</span>
            )}
          </button>
        </form>
      </div>

      {/* Confirmation modal */}
      {showConfirm && targetCred && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Confirm Revocation</h3>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">
              Are you sure you want to revoke{" "}
              <span className="text-white font-mono font-semibold">{targetCred.id}</span>?
              This cannot be reversed.
            </p>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Credential</span>
                <span className="text-white font-medium">{targetCred.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Holder</span>
                <span className="text-white font-mono">
                  {targetCred.holder.slice(0, 10)}…{targetCred.holder.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Issued by</span>
                <span className="text-white">{targetCred.issuerName}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm font-medium py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2.5 rounded-xl transition"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
