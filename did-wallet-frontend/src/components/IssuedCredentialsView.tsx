import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { Award, ClipboardCheck, Search, ShieldCheck, ShieldAlert, Calendar, User, Clipboard } from "lucide-react";
import { CredentialType } from "../types";

export default function IssuedCredentialsView() {
  const { credentials, address, role } = useWallet();
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic
  const filteredCredentials = credentials.filter(c => {
    // Role filter: If Issuer, they see what they issued. If admin/holder, they see all.
    const isIssuerOriginated = role === "Issuer" ? c.issuer.toLowerCase() === address?.toLowerCase() : true;
    if (!isIssuerOriginated) return false;

    const matchesFilter = 
      filter === "all" ||
      (filter === "active" && !c.revoked) ||
      (filter === "revoked" && c.revoked);

    const matchesSearch = 
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.holder.toLowerCase().includes(search.toLowerCase()) ||
      c.issuerName.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Issued Credentials Ledger</h2>
          <p className="text-gray-400 text-sm">Review credentials recorded on the blockchain registry corresponding to your identity keys.</p>
        </div>
      </div>

      {/* Filter and search control bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search input */}
        <div className="relative md:col-span-2">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search credentials, holder addresses, program terms, or issuers..."
            className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-4 py-3.5 pl-10 rounded-xl focus:outline-none focus:border-purple-500/40 transition placeholder-zinc-600"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex bg-zinc-950 p-1.5 border border-zinc-900 rounded-xl justify-between">
          {(["all", "active", "revoked"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 text-center py-1.5 rounded-lg text-xs capitalize transition duration-150 font-medium ${
                filter === t 
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Rendering */}
      {filteredCredentials.length === 0 ? (
        <div className="p-16 text-center bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl space-y-4">
          <div className="p-3.5 bg-zinc-900 rounded-full w-fit mx-auto text-zinc-600">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-medium text-sm">No Credentials Match Criteria</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">No records were found that match the status filters or query search keywords.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCredentials.map((cred) => (
            <div 
              key={cred.id} 
              className="glassmorphism-card p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-purple-300 font-mono font-bold">{cred.id}</span>
                    <h3 className="text-white font-display font-semibold text-sm leading-snug">{cred.type}</h3>
                  </div>

                  {cred.revoked ? (
                    <span className="flex-shrink-0 text-[9px] font-mono uppercase bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded-md">
                      Revoked
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-[9px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">
                      Active status
                    </span>
                  )}
                </div>

                {/* Sub data blocks */}
                <div className="border-t border-zinc-900/60 pt-4 space-y-3 text-xs">
                  
                  {/* Holder info block */}
                  <div className="space-y-1 bg-zinc-950 p-2.5 rounded-lg border border-zinc-900/50">
                    <span className="text-zinc-500 text-[9px] font-mono tracking-wider uppercase block">Holder Address</span>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-200 font-mono truncate max-w-[200px]">{cred.holder}</span>
                      <button 
                        onClick={() => handleCopy(cred.holder, cred.id + "-holder")}
                        className="text-zinc-500 hover:text-white transition ml-2"
                      >
                        {copiedId === cred.id + "-holder" ? <span className="text-emerald-400 text-[10px]">Copied</span> : <Clipboard className="w-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Issuer info block */}
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2 bg-zinc-900/30 rounded-lg">
                      <span className="text-zinc-500 block">Signed Authority</span>
                      <span className="text-zinc-300 font-semibold max-w-xs truncate">{cred.issuerName}</span>
                    </div>
                    <div className="p-2 bg-zinc-900/30 rounded-lg">
                      <span className="text-zinc-500 block">Anchoring Date</span>
                      <span className="text-zinc-400 font-mono">{cred.issueDate}</span>
                    </div>
                  </div>

                  {/* Document hash details */}
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1">
                    <span className="truncate max-w-[170px]" title={cred.cid}>IPFS: {cred.cid}</span>
                    <span className="font-mono text-zinc-600 truncate max-w-[130px]" title={cred.documentHash}>{cred.documentHash}</span>
                  </div>

                  {cred.revoked && cred.revocationReason && (
                    <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg mt-2 font-mono text-[9px] text-red-400">
                      <span className="font-bold">REVOCATION REASON:</span> {cred.revocationReason}
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
