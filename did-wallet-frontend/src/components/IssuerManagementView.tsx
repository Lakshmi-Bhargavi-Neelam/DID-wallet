import React from "react";
import { useWallet } from "../context/WalletContext";
import { ShieldCheck, ShieldAlert, Building2 } from "lucide-react";

export default function IssuerManagementView() {
  const { issuers, credentials, removeIssuer, role } = useWallet();

  const handleRemove = async (address: string, name: string) => {
    if (!window.confirm(`Remove "${name}" as a trusted issuer? This cannot be undone.`)) return;
    await removeIssuer(address);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Issuer Management</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Registered trusted issuers. Only the Admin can remove an issuer.
        </p>
      </div>

      {issuers.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-sm text-zinc-500">No issuers registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issuers.map(iss => {
            const issuedCount = credentials.filter(
              c => c.issuer.toLowerCase() === iss.address.toLowerCase()
            ).length;
            const isTrusted = iss.isTrusted !== false;

            return (
              <div
                key={iss.address}
                className={`glassmorphism-card p-6 rounded-2xl border transition ${
                  isTrusted ? "border-zinc-800" : "border-red-500/20"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${isTrusted ? "bg-purple-500/10 text-purple-400" : "bg-red-500/10 text-red-400"}`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">{iss.name}</h3>
                      <code className="text-[10px] text-zinc-500 font-mono block truncate">{iss.address}</code>
                    </div>
                  </div>

                  {isTrusted ? (
                    <span className="flex items-center space-x-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Trusted</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Removed</span>
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-center">
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/40">
                    <span className="text-zinc-500 text-[9px] uppercase font-mono block">Credentials Issued</span>
                    <span className="text-white font-mono font-bold text-sm mt-0.5 block">{issuedCount}</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/40">
                    <span className="text-zinc-500 text-[9px] uppercase font-mono block">Registered On</span>
                    <span className="text-zinc-400 font-mono text-[10px] mt-1 block">
                      {new Date(iss.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Type */}
                <div className="mt-4 pt-4 border-t border-zinc-900/50 flex justify-between items-center text-xs text-zinc-500">
                  <span>{iss.type}</span>
                  {role === "Admin" && isTrusted && (
                    <button
                      onClick={() => handleRemove(iss.address, iss.name)}
                      className="text-red-400 hover:text-red-300 text-xs transition"
                    >
                      Remove issuer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
