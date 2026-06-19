import React, { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { ShieldAlert, Plus, Shield, UserCheck, Calendar, ClipboardCheck } from "lucide-react";

export default function RegisterIssuerView() {
  const { issuers, registerIssuer, role } = useWallet();
  const [addressInput, setAddressInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState("Educational Institution");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto generator helper
  const handleAutofillMock = () => {
    const randomHexAddress = "0x" + Array.from({ length: 40 }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join("");

    setAddressInput(randomHexAddress);
    setNameInput("MIT Professional Identity Registry");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role !== "Admin") {
      alert("Unauthorized: Only the Smart Contract Owner (Admin) may whitelist trusted signing authorities.");
      return;
    }

    if (!addressInput || !nameInput || !typeInput) {
      alert("Please fill out all fields in the registration form.");
      return;
    }

    if (!addressInput.startsWith("0x") || addressInput.length !== 42) {
      alert("Please provide a valid 42-character hexadecimal public address (starting with 0x).");
      return;
    }

    setIsSubmitting(true);
    // Simulate mining latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = await registerIssuer({
      address: addressInput.trim(),
      name: nameInput.trim(),
      type: typeInput.trim()
    });

    setIsSubmitting(false);

    if (success) {
      setAddressInput("");
      setNameInput("");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">Register Trusted Signing Authority</h2>
        <p className="text-gray-400 text-sm">Whitelist universities, certification bodies, and tech institutions. Authorizes them to append professional credentials globally.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column Form */}
        <div className="lg:col-span-1">
          <div className="glassmorphism-card p-6 rounded-2xl space-y-5 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <span className="text-xs font-mono font-medium text-purple-400 uppercase tracking-wider">Authority Whitelister</span>
              <button
                type="button"
                onClick={handleAutofillMock}
                className="text-[9px] text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition px-2 py-0.5 rounded border border-zinc-800"
              >
                Autofill Mock
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">Organization Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Stanford Academic Registry"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white font-sans text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 placeholder-zinc-700 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block font-mono">Ledger Cryptographic Address</label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value.toLowerCase())}
                  placeholder="0x..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/10 placeholder-zinc-700 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">Organization Category Type</label>
                <select
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-500/40 transition"
                >
                  <option value="Educational Institution">Educational Institution</option>
                  <option value="Professional Association">Professional Association</option>
                  <option value="Government Authority">Government Authority</option>
                  <option value="Standardized Testing Board">Standardized Testing Board</option>
                </select>
              </div>

              <button
                type="submit"
                id="btn-register-new-issuer"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs py-3 rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-xl shadow-purple-950/15"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Authorize Publisher</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column Whitelisted Registry Matrix */}
        <div className="lg:col-span-2">
          <div className="glassmorphism-card p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-white text-base">Whitelisted Cryptographic Authorities</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-[11px] font-mono text-zinc-500">
                    <th className="pb-3 font-normal">Organization Name</th>
                    <th className="pb-3 font-normal">Registry Address</th>
                    <th className="pb-3 font-normal">Classification</th>
                    <th className="pb-3 font-normal text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50 text-xs text-zinc-300">
                  {issuers.map((iss) => (
                    <tr key={iss.address} className="hover:bg-zinc-900/10 transition">
                      <td className="py-3 font-sans font-semibold text-white">
                        {iss.name}
                      </td>
                      <td className="py-3 font-mono text-purple-300/90 max-w-[120px] truncate" title={iss.address}>
                        {iss.address}
                      </td>
                      <td className="py-3 font-medium">
                        <span className="inline-block px-2 py-0.5 rounded-full border border-purple-500/10 bg-purple-500/5 text-purple-400 text-[10px]">
                          {iss.type}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-zinc-500 text-[10px] text-right">
                        {new Date(iss.registeredAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
