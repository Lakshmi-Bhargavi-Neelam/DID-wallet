import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import {
  Award, ArrowRight, ShieldAlert, CheckCircle2, XCircle,
  User, Building2, Key, ExternalLink, ShieldCheck, FileText
} from "lucide-react";
import { toGatewayUrl } from "../utils/ipfs";

// ── Holder dashboard ──────────────────────────────────────────────────────────

function HolderDashboard() {
  const { address, profiles, issuers, credentials, navigateTo, isContractMode } = useWallet();
  const [activeTab, setActiveTab] = useState<"credentials" | "issuers">("credentials");

  const currentProfile = profiles.find(p => p.address.toLowerCase() === address?.toLowerCase());
  const myCredentials  = credentials.filter(c => c.holder.toLowerCase() === address?.toLowerCase());

  // Only issuers who have issued at least one credential to this holder
  const myIssuerAddresses = [...new Set(myCredentials.map(c => c.issuer.toLowerCase()))];
  const myIssuers = issuers.filter(i => myIssuerAddresses.includes(i.address.toLowerCase()));

  const validCount   = myCredentials.filter(c => !c.revoked).length;
  const revokedCount = myCredentials.filter(c => c.revoked).length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/20 via-zinc-900 to-zinc-950 p-6 sm:p-8 border border-zinc-800">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {currentProfile ? `Welcome, @${currentProfile.identifier}` : "Welcome"}
          </h2>
          <p className="text-sm text-zinc-400">
            {currentProfile
              ? <>Your DID: <code className="font-mono text-purple-300 text-xs">{currentProfile.did}</code></>
              : "You don't have a DID yet. Register one to start receiving credentials."
            }
          </p>
          <p className="text-[11px] text-zinc-600 font-mono">
            {isContractMode ? "● On-chain mode" : "● Simulation mode"}
          </p>
        </div>
      </div>

      {/* CTA — no DID yet */}
      {!currentProfile && (
        <button
          onClick={() => navigateTo("create-did")}
          className="w-full text-left p-5 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl transition group flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Register your DID</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Create your on-chain identity so institutions can issue credentials to you.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition shrink-0" />
        </button>
      )}

      {/* Stats — holder-specific only */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-white">{myCredentials.length}</span>
          <p className="text-xs text-zinc-400">My Credentials</p>
        </div>
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-emerald-400">{validCount}</span>
          <p className="text-xs text-zinc-400">Valid</p>
        </div>
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-red-400">{revokedCount}</span>
          <p className="text-xs text-zinc-400">Revoked</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("credentials")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === "credentials"
              ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>My Credentials</span>
          {myCredentials.length > 0 && (
            <span className="bg-zinc-800 text-zinc-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full">
              {myCredentials.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("issuers")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === "issuers"
              ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>My Issuers</span>
          {myIssuers.length > 0 && (
            <span className="bg-zinc-800 text-zinc-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full">
              {myIssuers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab: My Credentials */}
      {activeTab === "credentials" && (
        <div className="space-y-3">
          {myCredentials.length === 0 ? (
            <div className="glassmorphism-card p-10 rounded-2xl text-center space-y-3">
              <div className="p-3 bg-zinc-900 rounded-full w-fit mx-auto">
                <FileText className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-sm text-white font-medium">No credentials yet</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Once a registered institution issues a credential to your wallet address, it will appear here.
              </p>
              <button
                onClick={() => navigateTo("verify-credential")}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Verify an existing credential by ID →
              </button>
            </div>
          ) : (
            myCredentials.map(cred => (
              <div
                key={cred.id}
                className={`glassmorphism-card p-5 rounded-2xl border transition hover:border-purple-500/20 ${
                  cred.revoked ? "border-red-500/10" : "border-zinc-800"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  {/* Left */}
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${cred.revoked ? "bg-red-500/10" : "bg-purple-500/10"}`}>
                      {cred.revoked
                        ? <XCircle className="w-5 h-5 text-red-400" />
                        : <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] font-mono text-purple-300 font-bold">{cred.id}</span>
                        {cred.revoked ? (
                          <span className="text-[9px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded">
                            Revoked
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                            Valid
                          </span>
                        )}
                      </div>
                      <p className="text-white font-semibold text-sm mt-0.5">{cred.type}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Issued by <span className="text-zinc-300">{cred.issuerName}</span> · {cred.issueDate}
                      </p>
                    </div>
                  </div>

                  {/* Right — view document */}
                  {!cred.revoked && (
                    <a
                      href={toGatewayUrl(cred.cid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View document</span>
                    </a>
                  )}
                </div>

                {/* Revocation reason */}
                {cred.revoked && cred.revocationReason && (
                  <div className="mt-3 p-3 bg-red-500/5 border border-red-500/15 rounded-xl text-xs text-zinc-400">
                    <span className="text-red-400 font-medium">Reason: </span>
                    {cred.revocationReason}
                  </div>
                )}
              </div>
            ))
          )}

          {myCredentials.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => navigateTo("profile")}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <span>Full profile</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: My Issuers */}
      {activeTab === "issuers" && (
        <div className="space-y-3">
          {myIssuers.length === 0 ? (
            <div className="glassmorphism-card p-10 rounded-2xl text-center">
              <p className="text-sm text-white font-medium">No issuers yet</p>
              <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto">
                The institutions that issue credentials to you will appear here.
              </p>
            </div>
          ) : (
            myIssuers.map(iss => {
              const credsByIssuer = myCredentials.filter(
                c => c.issuer.toLowerCase() === iss.address.toLowerCase()
              );
              const validByIssuer   = credsByIssuer.filter(c => !c.revoked).length;
              const revokedByIssuer = credsByIssuer.filter(c => c.revoked).length;

              return (
                <div key={iss.address} className="glassmorphism-card p-5 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-purple-500/10 rounded-xl shrink-0">
                        <Building2 className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{iss.name}</p>
                        <p className="text-[11px] text-zinc-500">{iss.type}</p>
                      </div>
                    </div>
                    {iss.isTrusted !== false ? (
                      <span className="flex items-center space-x-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Trusted</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg shrink-0">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Removed</span>
                      </span>
                    )}
                  </div>

                  {/* Credentials from this issuer */}
                  <div className="mt-4 pt-4 border-t border-zinc-900/50 space-y-2">
                    <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                      Credentials from this issuer
                    </p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-emerald-400 font-mono font-bold">{validByIssuer}</span>
                      <span className="text-zinc-500">valid</span>
                      {revokedByIssuer > 0 && (
                        <>
                          <span className="text-red-400 font-mono font-bold">{revokedByIssuer}</span>
                          <span className="text-zinc-500">revoked</span>
                        </>
                      )}
                    </div>
                    <div className="space-y-1.5 mt-2">
                      {credsByIssuer.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-xs bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="font-mono text-purple-300 text-[10px] shrink-0">{c.id}</span>
                            <span className="text-zinc-300 truncate">{c.type}</span>
                          </div>
                          {c.revoked ? (
                            <span className="text-[9px] text-red-400 font-mono shrink-0 ml-2">Revoked</span>
                          ) : (
                            <span className="text-[9px] text-emerald-400 font-mono shrink-0 ml-2">Valid</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bottom quick action */}
      <div className="glassmorphism-card p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">Verify a credential</p>
            <p className="text-xs text-zinc-500">Check if any credential ID is valid and not revoked.</p>
          </div>
        </div>
        <button
          onClick={() => navigateTo("verify-credential")}
          className="flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition shrink-0"
        >
          <span>Go</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
}

// ── Issuer dashboard ──────────────────────────────────────────────────────────

function IssuerDashboard() {
  const { address, profiles, issuers, credentials, navigateTo, isContractMode } = useWallet();
  const [activeTab, setActiveTab] = useState<"issued" | "holders" | "revoked">("issued");

  const myIssuerRecord  = issuers.find(i => i.address.toLowerCase() === address?.toLowerCase());
  const myIssued        = credentials.filter(c => c.issuer.toLowerCase() === address?.toLowerCase());
  const myActive        = myIssued.filter(c => !c.revoked);
  const myRevoked       = myIssued.filter(c => c.revoked);

  // Unique holders this issuer has issued to
  const myHolderAddresses = [...new Set(myIssued.map(c => c.holder.toLowerCase()))];
  const myHolders = myHolderAddresses.map(addr => {
    const profile = profiles.find(p => p.address.toLowerCase() === addr);
    const creds   = myIssued.filter(c => c.holder.toLowerCase() === addr);
    return { address: addr, identifier: profile?.identifier ?? null, credentials: creds };
  });

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/20 via-zinc-900 to-zinc-950 p-6 sm:p-8 border border-zinc-800">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {myIssuerRecord ? myIssuerRecord.name : "Issuer Dashboard"}
          </h2>
          {myIssuerRecord && (
            <p className="text-sm text-zinc-400">{myIssuerRecord.type}</p>
          )}
          <p className="text-[11px] text-zinc-600 font-mono">
            {isContractMode ? "● On-chain mode" : "● Simulation mode"}
          </p>
        </div>
      </div>

      {/* Stats — issuer-specific only */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-white">{myIssued.length}</span>
          <p className="text-xs text-zinc-400">Total Issued</p>
        </div>
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-emerald-400">{myActive.length}</span>
          <p className="text-xs text-zinc-400">Active</p>
        </div>
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-red-400">{myRevoked.length}</span>
          <p className="text-xs text-zinc-400">Revoked</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-xl w-fit flex-wrap gap-1">
        {(["issued", "holders", "revoked"] as const).map(tab => {
          const count = tab === "issued" ? myActive.length : tab === "holders" ? myHolders.length : myRevoked.length;
          const labels = { issued: "Active Credentials", holders: "Holders", revoked: "Revoked" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === tab
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <span>{labels[tab]}</span>
              {count > 0 && (
                <span className="bg-zinc-800 text-zinc-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Active Credentials */}
      {activeTab === "issued" && (
        <div className="space-y-3">
          {myActive.length === 0 ? (
            <div className="glassmorphism-card p-10 rounded-2xl text-center space-y-3">
              <div className="p-3 bg-zinc-900 rounded-full w-fit mx-auto">
                <Award className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-sm text-white font-medium">No active credentials issued yet</p>
              <button
                onClick={() => navigateTo("issue-credential")}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Issue your first credential →
              </button>
            </div>
          ) : (
            myActive.map(cred => (
              <div key={cred.id} className="glassmorphism-card p-5 rounded-2xl border border-zinc-800 hover:border-purple-500/20 transition">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-purple-300 font-bold">{cred.id}</span>
                      <p className="text-white font-semibold text-sm mt-0.5">{cred.type}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Issued to{" "}
                        <span className="font-mono text-zinc-300">
                          {profiles.find(p => p.address.toLowerCase() === cred.holder.toLowerCase())
                            ? `@${profiles.find(p => p.address.toLowerCase() === cred.holder.toLowerCase())!.identifier}`
                            : `${cred.holder.slice(0, 10)}…`
                          }
                        </span>
                        {" · "}{cred.issueDate}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded shrink-0">
                    Active
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Holders */}
      {activeTab === "holders" && (
        <div className="space-y-3">
          {myHolders.length === 0 ? (
            <div className="glassmorphism-card p-10 rounded-2xl text-center">
              <p className="text-sm text-white font-medium">No credentials issued yet</p>
              <p className="text-xs text-zinc-500 mt-2">Holders you issue credentials to will appear here.</p>
            </div>
          ) : (
            myHolders.map(holder => {
              const validCount_   = holder.credentials.filter(c => !c.revoked).length;
              const revokedCount_ = holder.credentials.filter(c => c.revoked).length;
              return (
                <div key={holder.address} className="glassmorphism-card p-5 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl shrink-0">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {holder.identifier ? `@${holder.identifier}` : "Unregistered Holder"}
                      </p>
                      <code className="text-[10px] text-zinc-500 font-mono">{holder.address}</code>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {holder.credentials.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-xs bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="font-mono text-purple-300 text-[10px] shrink-0">{c.id}</span>
                          <span className="text-zinc-300 truncate">{c.type}</span>
                        </div>
                        {c.revoked ? (
                          <span className="text-[9px] text-red-400 font-mono shrink-0 ml-2">Revoked</span>
                        ) : (
                          <span className="text-[9px] text-emerald-400 font-mono shrink-0 ml-2">Active</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-900/50 flex gap-4 text-xs text-zinc-500">
                    <span><span className="text-emerald-400 font-mono font-bold">{validCount_}</span> active</span>
                    {revokedCount_ > 0 && (
                      <span><span className="text-red-400 font-mono font-bold">{revokedCount_}</span> revoked</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Revoked */}
      {activeTab === "revoked" && (
        <div className="space-y-3">
          {myRevoked.length === 0 ? (
            <div className="glassmorphism-card p-10 rounded-2xl text-center">
              <p className="text-sm text-white font-medium">No revoked credentials</p>
            </div>
          ) : (
            myRevoked.map(cred => (
              <div key={cred.id} className="glassmorphism-card p-5 rounded-2xl border border-red-500/10">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-red-500/10 rounded-xl shrink-0">
                    <XCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-purple-300 font-bold">{cred.id}</span>
                        <p className="text-white font-semibold text-sm mt-0.5">{cred.type}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Holder: <span className="font-mono text-zinc-400">
                            {profiles.find(p => p.address.toLowerCase() === cred.holder.toLowerCase())
                              ? `@${profiles.find(p => p.address.toLowerCase() === cred.holder.toLowerCase())!.identifier}`
                              : `${cred.holder.slice(0, 10)}…`}
                          </span>
                        </p>
                      </div>
                      <span className="text-[9px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded shrink-0">
                        Revoked
                      </span>
                    </div>
                    {cred.revocationReason && (
                      <div className="mt-3 p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-zinc-400">
                        <span className="text-red-400 font-medium">Reason: </span>
                        {cred.revocationReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}


function AdminDashboard() {
  const { issuers, credentials, navigateTo, isContractMode } = useWallet();

  const trustedIssuers   = issuers.filter(i => i.isTrusted !== false);
  const removedIssuers   = issuers.filter(i => i.isTrusted === false);
  const totalCredentials = credentials.length;
  const revokedCount     = credentials.filter(c => c.revoked).length;
  const totalHolders     = [...new Set(credentials.map(c => c.holder.toLowerCase()))].length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/20 via-zinc-900 to-zinc-950 p-6 sm:p-8 border border-zinc-800">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-zinc-400">
            You are the contract owner. Register and remove trusted issuers to control who can issue credentials.
          </p>
          <p className="text-[11px] text-zinc-600 font-mono">
            {isContractMode ? "● On-chain mode" : "● Simulation mode"}
          </p>
        </div>
      </div>

      {/* Registry stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-white">{trustedIssuers.length}</span>
          <p className="text-xs text-zinc-400">Trusted Issuers</p>
        </div>
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-white">{totalCredentials}</span>
          <p className="text-xs text-zinc-400">Total Credentials</p>
        </div>
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-white">{totalHolders}</span>
          <p className="text-xs text-zinc-400">Unique Holders</p>
        </div>
        <div className="glassmorphism-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-2xl font-bold font-mono text-red-400">{revokedCount}</span>
          <p className="text-xs text-zinc-400">Revoked</p>
        </div>
      </div>

      {/* Trusted issuers list */}
      <div className="glassmorphism-card p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Trusted Issuers</span>
          </h3>
          <button
            onClick={() => navigateTo("register-issuer")}
            className="flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition"
          >
            <span>+ Register new</span>
          </button>
        </div>

        {trustedIssuers.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/40 border border-dashed border-zinc-800 rounded-xl space-y-2">
            <p className="text-sm text-white font-medium">No trusted issuers yet</p>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Register institutions so they can issue credentials to holders.
            </p>
            <button
              onClick={() => navigateTo("register-issuer")}
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Register first issuer →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {trustedIssuers.map(iss => {
              const issued = credentials.filter(
                c => c.issuer.toLowerCase() === iss.address.toLowerCase()
              ).length;
              return (
                <div key={iss.address} className="flex items-center justify-between bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                      <Building2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{iss.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {iss.type} · registered {new Date(iss.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0 ml-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-white font-mono font-bold">{issued}</span>
                      <p className="text-[9px] text-zinc-500">credentials</p>
                    </div>
                    <span className="flex items-center space-x-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-mono">
                      <ShieldCheck className="w-3 h-3" /><span>Trusted</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Removed issuers */}
      {removedIssuers.length > 0 && (
        <div className="glassmorphism-card p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Removed Issuers</span>
          </h3>
          <div className="space-y-2">
            {removedIssuers.map(iss => (
              <div key={iss.address} className="flex items-center justify-between bg-zinc-950 border border-red-500/10 rounded-xl px-4 py-3 opacity-70">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                    <Building2 className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-300 font-medium truncate">{iss.name}</p>
                    <p className="text-[10px] text-zinc-500">{iss.type}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded-lg font-mono shrink-0">
                  Removed
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600 mt-3">
            Removed issuers can no longer issue credentials. Their previously issued credentials remain on-chain.
          </p>
        </div>
      )}

      {/* Credentials by issuer breakdown */}
      {credentials.length > 0 && (
        <div className="glassmorphism-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Credentials by Issuer</h3>
            <button
              onClick={() => navigateTo("issuer-management")}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>Manage issuers</span><ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {issuers.map(iss => {
              const issued   = credentials.filter(c => c.issuer.toLowerCase() === iss.address.toLowerCase());
              const active   = issued.filter(c => !c.revoked).length;
              const revoked  = issued.filter(c => c.revoked).length;
              if (issued.length === 0) return null;
              return (
                <div key={iss.address} className="flex items-center justify-between text-xs bg-zinc-950 border border-zinc-900 rounded-lg px-4 py-3">
                  <span className="text-zinc-300 font-medium truncate mr-4">{iss.name}</span>
                  <div className="flex items-center space-x-4 shrink-0 font-mono">
                    <span className="text-emerald-400">{active} active</span>
                    {revoked > 0 && <span className="text-red-400">{revoked} revoked</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardHomeView() {
  const { role } = useWallet();
  if (role === "Holder") return <HolderDashboard />;
  if (role === "Issuer") return <IssuerDashboard />;
  return <AdminDashboard />;
}
