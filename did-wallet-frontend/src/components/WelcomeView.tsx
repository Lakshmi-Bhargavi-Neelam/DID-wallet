import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { Shield, Award, Key, UserCheck, ChevronRight, ArrowRight } from "lucide-react";
import { MOCK_ACCOUNTS } from "../data";

export default function WelcomeView() {
  const { connectWallet, isConnecting } = useWallet();
  const [showPicker, setShowPicker] = useState(false);

  const hasMetaMask = typeof window !== "undefined" && !!(window as any).ethereum;

  const demoAccounts = [
    {
      label: "Holder",
      address: MOCK_ACCOUNTS.HOLDER_1,
      desc: "Has a registered DID and credentials issued to their wallet.",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    },
    {
      label: "Issuer",
      address: MOCK_ACCOUNTS.ISSUER_1,
      desc: "Trusted institution authorised to issue credentials.",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    },
    {
      label: "Admin",
      address: MOCK_ACCOUNTS.ADMIN,
      desc: "Contract owner who manages the issuer whitelist.",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 font-sans overflow-hidden relative">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/15 via-[#070709] to-[#070709] pointer-events-none" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl border border-purple-400/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold tracking-tight text-lg text-white">PRO-DID</span>
            <span className="text-[10px] text-purple-400 font-mono block tracking-wider uppercase leading-none mt-0.5">
              Identity Wallet
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-4 py-2 rounded-lg transition font-medium"
        >
          Connect Wallet
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative z-10 flex flex-col items-center">
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-none max-w-4xl">
          Own Your Professional{" "}
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent italic">
            Identity
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
          Receive credentials from trusted institutions, stored on-chain with documents pinned to IPFS.
          Anyone can verify a credential instantly — no central authority required.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => setShowPicker(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium px-8 py-4 rounded-xl shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition flex items-center justify-center space-x-2"
          >
            <span>Launch Wallet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-gray-300 text-sm font-medium px-8 py-4 rounded-xl transition"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features-section" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            How it works
          </h2>
          <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto">
            Three smart contracts. One credential lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glassmorphism-card p-6 rounded-2xl group hover:border-purple-500/30 transition">
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-400 mb-5">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white mb-2">Register a DID</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Create a <code className="text-purple-300 text-xs">did:wallet:&lt;id&gt;</code> anchored on-chain — your permanent, self-owned identity.
            </p>
          </div>

          <div className="glassmorphism-card p-6 rounded-2xl group hover:border-purple-500/30 transition">
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-400 mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white mb-2">Receive Credentials</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trusted issuers upload a document to IPFS and record the credential on-chain with a SHA-256 integrity hash.
            </p>
          </div>

          <div className="glassmorphism-card p-6 rounded-2xl group hover:border-purple-500/30 transition">
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-400 mb-5">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white mb-2">Verify Instantly</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Anyone can verify a credential by ID — the contract returns its validity and revocation status as a free view call.
            </p>
          </div>

          <div className="glassmorphism-card p-6 rounded-2xl group hover:border-purple-500/30 transition">
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-400 mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white mb-2">Revoke if Needed</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Issuers can permanently revoke credentials. The revocation is instant and reflected in every verification.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 bg-[#040405] relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-500/60" />
            <span>PRO-DID — Decentralized Identity Wallet</span>
          </div>
          <span>Solidity · Foundry · React · ethers v6 · IPFS</span>
        </div>
      </footer>

      {/* Wallet picker modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-base">Connect Wallet</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Use MetaMask or pick a demo account to explore.
                </p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              >
                Close
              </button>
            </div>

            {/* MetaMask */}
            <div className="p-5 border-b border-zinc-900">
              {hasMetaMask ? (
                <button
                  onClick={() => { setShowPicker(false); connectWallet(); }}
                  disabled={isConnecting}
                  className="w-full bg-[#E2761B] hover:bg-[#E2761B]/90 disabled:opacity-50 text-white font-medium text-sm py-3.5 rounded-xl transition flex items-center justify-center space-x-3"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg"
                    alt="MetaMask"
                    className="w-5 h-5"
                    onError={e => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                  <span>{isConnecting ? "Connecting…" : "Connect with MetaMask"}</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="w-full bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm py-3.5 rounded-xl flex items-center justify-center space-x-3 cursor-not-allowed">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg"
                      alt="MetaMask"
                      className="w-5 h-5 opacity-40"
                      onError={e => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                    <span>MetaMask not installed</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
                    MetaMask browser extension is not detected.{" "}
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Install MetaMask
                    </a>{" "}
                    to connect a real wallet, or use a demo account below.
                  </p>
                </div>
              )}
            </div>

            {/* Demo accounts */}
            <div className="p-5">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-3">
                Demo accounts — simulation mode
              </p>
              <div className="space-y-2">
                {demoAccounts.map(acct => (
                  <button
                    key={acct.label}
                    onClick={() => { setShowPicker(false); connectWallet(acct.address); }}
                    className="w-full text-left p-3.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/20 rounded-xl transition group flex justify-between items-start"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition">
                          {acct.label}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded border font-mono ${acct.color}`}>
                          {acct.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{acct.desc}</p>
                      <code className="text-[10px] text-zinc-500 font-mono">
                        {acct.address.slice(0, 14)}…{acct.address.slice(-10)}
                      </code>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
