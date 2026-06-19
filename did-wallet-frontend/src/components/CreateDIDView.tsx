import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { Key, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

export default function CreateDIDView() {
  const { address, profiles, createDID, navigateTo } = useWallet();
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [generatedDIDString, setGeneratedDIDString] = useState("");

  const currentProfile = profiles.find(p => p.address.toLowerCase() === address?.toLowerCase());

  // Alphanumeric identifier validator (SaaS level validation)
  const isValidIdentifier = (id: string) => {
    return /^[a-z0-9_]{3,20}$/.test(id);
  };

  const steps = [
    "Generating public/private identity keys...",
    "Compiling W3C compliance JSON-LD schema document...",
    "Computing deterministic hash verification index...",
    "Anchoring credentials handle to decentralized registry..."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    if (!isValidIdentifier(identifier)) {
      alert("Please enter a valid identifier (3-20 characters, lowercase letters, numbers, and underscores only).");
      return;
    }

    setIsSubmitting(true);
    setStep(0);
    setCompleted(false);

    // Simulate cryptographic steps sequence for professional Web3 visual experience
    for (let i = 0; i < steps.length; i++) {
      setStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const success = await createDID(identifier);
    if (success) {
      setGeneratedDIDString(`did:wallet:${identifier.trim().toLowerCase().replace(/[^a-z0-9_]/g, "")}`);
      setCompleted(true);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Create Professional DID Handle</h2>
        <p className="text-gray-400 text-sm">Register your unique professional moniker and bind your cryptographic keys to the decentralized ledger.</p>
      </div>

      {currentProfile ? (
        <div className="glassmorphism-card p-6 rounded-2xl border-purple-500/10 space-y-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-white font-medium text-base">You possess an active, registered DID Profile</h3>
            <p className="text-xs text-zinc-400">Your address is already bound to a sovereign professional identity. No further activation is necessary.</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 grid grid-cols-1 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 block font-mono uppercase text-[9px] tracking-wider">Monitored Handle</span>
              <span className="text-white font-semibold flex items-center mt-1">@{currentProfile.identifier}</span>
            </div>
            <div>
              <span className="text-zinc-500 block font-mono uppercase text-[9px] tracking-wider">Cryptographic DID Document</span>
              <code className="text-[11px] text-zinc-300 font-mono block break-all bg-zinc-900/60 p-2 rounded mt-1">{currentProfile.did}</code>
            </div>
          </div>

          <button
            onClick={() => navigateTo("dashboard")}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center"
          >
            Return to Dashboard &rarr;
          </button>
        </div>
      ) : (
        <div className="glassmorphism-card p-6 sm:p-8 rounded-2xl relative overflow-hidden">
          {/* Subtle glow decorative filter */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-none" />

          {isSubmitting ? (
            <div className="py-6 space-y-6">
              {!completed ? (
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-full animate-spin">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-semibold text-sm">Compiling Cryptographic Identity</h4>
                    <p className="text-xs text-zinc-400 font-mono">{steps[step]}</p>
                  </div>

                  <div className="w-full max-w-sm mt-4 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full transition-all duration-300"
                      style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-5 animate-fade-in">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-white font-display font-bold text-lg">Decentralized Profile Anchor Succeeded</h4>
                    <p className="text-xs text-zinc-400">Your custom handle is now published and mapped on-chain. Universities can now issue verifiable academic degrees to you.</p>
                  </div>

                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-left space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Global Claim URI</span>
                      <span className="text-white font-semibold">@{identifier}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-xs block">Generated DID String:</span>
                      <code className="text-[10px] text-zinc-400 block font-mono break-all p-2 bg-zinc-900 rounded select-all">
                        {generatedDIDString}
                      </code>
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => navigateTo("profile")}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-purple-950/20"
                    >
                      Inspect Profile Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-3 text-purple-400 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Key className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold uppercase font-mono tracking-wider">Identity Document Constructor</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Choose Alphanumeric Handle</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="bhargavi"
                    maxLength={20}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-sm px-4 py-3 pl-8 rounded-xl focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                    required
                  />
                </div>
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Use only lowercase alphanumeric characters and underscores (e.g., <code className="text-zinc-400 text-[10px]">bhargavi</code>, <code className="text-zinc-400 text-[10px]">alice_tech</code>). Min 3, max 20 letters.
                </p>
              </div>

              {/* Warning tip info card */}
              <div className="bg-zinc-900/60 p-4 border border-zinc-900 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-4.5 h-4.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-gray-400 leading-normal">
                  <span className="text-zinc-200 block font-semibold mb-0.5">Sovereign Key Anchor Commitment</span>
                  This publishes a cryptographic proof mapping your physical wallet address on the blockchain to your selected handle. Anyone will be able to query and verify credentials linked to this DID public document. This action cannot be undone on the ledger.
                </div>
              </div>

              <button
                type="submit"
                id="btn-register-did"
                disabled={!identifier || identifier.length < 3}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-900 disabled:to-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 text-white font-medium text-sm py-3 px-6 rounded-xl transition duration-200 shadow-xl shadow-purple-950/10 active:scale-98"
              >
                Create DID Identity
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
