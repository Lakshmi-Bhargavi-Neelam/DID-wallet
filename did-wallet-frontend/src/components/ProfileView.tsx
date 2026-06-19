import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { User, Award, Copy, CheckCircle, Lock, ExternalLink, Key, ArrowRight } from "lucide-react";
import { toGatewayUrl } from "../utils/ipfs";

export default function ProfileView() {
  const { address, role, profiles, credentials, navigateTo } = useWallet();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentProfile   = profiles.find(p => p.address.toLowerCase() === address?.toLowerCase());
  const myCredentials    = credentials.filter(c => c.holder.toLowerCase() === address?.toLowerCase());

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">My Profile</h2>
        <p className="text-zinc-400 text-sm mt-1">Your on-chain identity and credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Identity card */}
        <div className="lg:col-span-1">
          <div className="glassmorphism-card p-6 rounded-2xl space-y-6">

            {/* Avatar + role */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center border border-purple-400/20">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">
                  {currentProfile ? `@${currentProfile.identifier}` : "No DID registered"}
                </h3>
                <span className="text-[11px] font-mono text-purple-400">{role}</span>
              </div>
            </div>

            {/* Status rows */}
            <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">DID Status</span>
                {currentProfile
                  ? <span className="text-emerald-400 font-medium">Registered</span>
                  : <span className="text-yellow-500">Not created</span>
                }
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Credentials held</span>
                <span className="text-white font-mono">{myCredentials.length}</span>
              </div>
              {currentProfile && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Registered on</span>
                  <span className="text-zinc-400 font-mono text-[10px]">
                    {new Date(currentProfile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* No DID — create CTA (visible to both Holder and Issuer) */}
            {!currentProfile && (
              <button
                onClick={() => navigateTo("create-did")}
                className="w-full flex items-center justify-between p-3 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition group text-left"
              >
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs font-medium text-purple-300">Register a DID</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {role === "Issuer"
                        ? "Create a personal identity to receive credentials from other institutions."
                        : "Create your on-chain identity to receive credentials."
                      }
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition shrink-0" />
              </button>
            )}

            {/* Wallet address */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Wallet Address</span>
                <button onClick={() => address && handleCopy(address, "address")} className="text-zinc-500 hover:text-white transition">
                  {copiedId === "address" ? <span className="text-emerald-400 text-[10px]">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <code className="text-xs text-zinc-300 font-mono block break-all bg-zinc-950 p-2.5 rounded border border-zinc-900 select-all">
                {address}
              </code>
            </div>

            {/* DID string */}
            {currentProfile && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">DID</span>
                  <button onClick={() => handleCopy(currentProfile.did, "did")} className="text-zinc-500 hover:text-white transition">
                    {copiedId === "did" ? <span className="text-emerald-400 text-[10px]">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <code className="text-[11px] text-zinc-300 font-mono block break-all bg-zinc-950 p-2.5 rounded border border-zinc-900 select-all leading-relaxed">
                  {currentProfile.did}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Credentials list */}
        <div className="lg:col-span-2">
          <div className="glassmorphism-card p-6 rounded-2xl">
            <h3 className="font-semibold text-white text-base mb-1 flex items-center space-x-2">
              <Award className="w-4.5 h-4.5 text-purple-400" />
              <span>My Credentials</span>
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Credentials issued to your wallet address.
            </p>

            {myCredentials.length === 0 ? (
              <div className="p-12 text-center bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl space-y-3">
                <div className="p-3 bg-zinc-900 rounded-full w-fit mx-auto text-zinc-600">
                  <Lock className="w-6 h-6" />
                </div>
                <p className="text-sm text-white font-medium">No credentials yet</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Ask a registered issuer to issue a credential to your wallet address.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myCredentials.map(cred => (
                  <div
                    key={cred.id}
                    className="bg-zinc-950/70 border border-zinc-900 rounded-xl overflow-hidden relative hover:border-purple-500/20 transition"
                  >
                    {/* Status bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${cred.revoked ? "bg-red-500" : "bg-purple-500"}`} />

                    <div className="pl-5 pr-5 py-5 space-y-3">

                      {/* Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-purple-300 font-bold">{cred.id}</span>
                          <h4 className="text-white font-semibold text-sm mt-0.5">{cred.type}</h4>
                        </div>
                        {cred.revoked ? (
                          <span className="text-[10px] font-mono bg-red-500/15 border border-red-500/20 text-red-400 px-2 py-0.5 rounded shrink-0">
                            Revoked
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded shrink-0">
                            Valid
                          </span>
                        )}
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-zinc-900/50 rounded-lg space-y-0.5">
                          <span className="text-zinc-500 block">Issued by</span>
                          <span className="text-zinc-200 font-medium">{cred.issuerName}</span>
                        </div>
                        <div className="p-2.5 bg-zinc-900/50 rounded-lg space-y-0.5">
                          <span className="text-zinc-500 block">Issue date</span>
                          <span className="text-zinc-300 font-mono">{cred.issueDate}</span>
                        </div>
                      </div>

                      {/* Revocation reason */}
                      {cred.revoked && cred.revocationReason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs">
                          <span className="text-red-400 font-semibold block">Reason for revocation:</span>
                          <span className="text-zinc-300 mt-0.5 block">{cred.revocationReason}</span>
                        </div>
                      )}

                      {/* Valid — show IPFS link */}
                      {!cred.revoked && (
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-900/60 pt-3">
                          <span className="flex items-center space-x-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Document stored on IPFS</span>
                          </span>
                          <a
                            href={toGatewayUrl(cred.cid)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition"
                          >
                            <span>View document</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
