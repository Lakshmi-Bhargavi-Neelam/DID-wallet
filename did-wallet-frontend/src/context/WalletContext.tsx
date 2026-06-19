import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, DIDProfile, IssuerRegistration, CredentialType, ActivityLog } from "../types";
import {
  MOCK_ACCOUNTS,
  INITIAL_DID_PROFILES,
  INITIAL_ISSUERS,
  INITIAL_CREDENTIALS,
  INITIAL_LOGS,
  generateTxHash
} from "../data";
import {
  isContractModeAvailable,
  onChain_createDID,
  onChain_hasDID,
  onChain_getDIDByController,
  onChain_registerIssuer,
  onChain_removeIssuer,
  onChain_isTrustedIssuer,
  onChain_issueCredential,
  onChain_revokeCredential,
  onChain_getCredential,
  onChain_getCredentialsByHolder,
} from "../contracts/contractClient";

// ── Context shape ─────────────────────────────────────────────────────────────

interface WalletContextType {
  address: string | null;
  role: UserRole;
  profiles: DIDProfile[];
  issuers: IssuerRegistration[];
  credentials: CredentialType[];
  logs: ActivityLog[];
  activePage: string;
  isConnecting: boolean;
  isContractMode: boolean;           // true = real on-chain, false = localStorage sim
  notification: { message: string; type: "success" | "error" | "info" } | null;

  navigateTo: (page: string) => void;
  connectWallet: (customAddress?: string) => Promise<void>;
  disconnectWallet: () => void;
  createDID: (identifier: string) => Promise<boolean>;
  issueCredential: (cred: Omit<CredentialType, "issuer" | "issuerName" | "revoked">) => Promise<boolean>;
  revokeCredential: (id: string, reason: string) => Promise<boolean>;
  registerIssuer: (issuer: Omit<IssuerRegistration, "registeredAt">) => Promise<boolean>;
  removeIssuer: (issuerAddress: string) => Promise<boolean>;
  setNotification: (notif: { message: string; type: "success" | "error" | "info" } | null) => void;
  addActivityLog: (type: ActivityLog["type"], title: string, description: string) => void;
}

// ── Context creation ──────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Persisted state ──────────────────────────────────────────────────────────
  // We restore the wallet address only if this browser SESSION already
  // authenticated (sessionStorage flag). This ensures the welcome page always
  // shows on a fresh browser open, while surviving hot-reloads during development.
  const [address, setAddress] = useState<string | null>(() => {
    const sessionActive = sessionStorage.getItem("did_wallet_session") === "1";
    return sessionActive ? (localStorage.getItem("did_wallet_address") || null) : null;
  });
  const [role, setRole] = useState<UserRole>(() =>
    (localStorage.getItem("did_wallet_role") as UserRole) || "Holder"
  );
  const [profiles, setProfiles] = useState<DIDProfile[]>(() => {
    const s = localStorage.getItem("did_wallet_profiles");
    return s ? JSON.parse(s) : INITIAL_DID_PROFILES;
  });
  const [issuers, setIssuers] = useState<IssuerRegistration[]>(() => {
    const s = localStorage.getItem("did_wallet_issuers");
    return s ? JSON.parse(s) : INITIAL_ISSUERS;
  });
  const [credentials, setCredentials] = useState<CredentialType[]>(() => {
    const s = localStorage.getItem("did_wallet_credentials");
    return s ? JSON.parse(s) : INITIAL_CREDENTIALS;
  });
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const s = localStorage.getItem("did_wallet_logs");
    return s ? JSON.parse(s) : INITIAL_LOGS;
  });

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activePage, setActivePage] = useState<string>(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "welcome";
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [notification, setNotificationState] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Whether we have real contract addresses + MetaMask available
  const isContractMode = isContractModeAvailable();

  // ── Persist to localStorage ───────────────────────────────────────────────────
  useEffect(() => {
    if (address) localStorage.setItem("did_wallet_address", address);
    else localStorage.removeItem("did_wallet_address");
  }, [address]);
  useEffect(() => { localStorage.setItem("did_wallet_role", role); }, [role]);
  useEffect(() => { localStorage.setItem("did_wallet_profiles", JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem("did_wallet_issuers", JSON.stringify(issuers)); }, [issuers]);
  useEffect(() => { localStorage.setItem("did_wallet_credentials", JSON.stringify(credentials)); }, [credentials]);
  useEffect(() => { localStorage.setItem("did_wallet_logs", JSON.stringify(logs)); }, [logs]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotificationState({ message, type });
    setTimeout(() => setNotificationState(null), 5000);
  };

  const setNotification = (
    notif: { message: string; type: "success" | "error" | "info" } | null
  ) => setNotificationState(notif);

  const addActivityLog = (
    type: ActivityLog["type"],
    title: string,
    description: string
  ) => {
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      hash: generateTxHash()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const navigateTo = (page: string) => {
    window.location.hash = page;
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) setActivePage(hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // ── Role detection ────────────────────────────────────────────────────────────
  const detectRole = (addr: string): UserRole => {
    const clean = addr.toLowerCase();
    if (clean === MOCK_ACCOUNTS.ADMIN.toLowerCase()) return "Admin";
    if (issuers.some(i => i.address.toLowerCase() === clean)) return "Issuer";
    return "Holder";
  };

  useEffect(() => {
    if (address) setRole(detectRole(address));
    else setRole("Holder");
  }, [address, issuers]);

  // ── Connect wallet ────────────────────────────────────────────────────────────
  const connectWallet = async (customAddress?: string) => {
    setIsConnecting(true);
    try {
      let walletAddr = customAddress;

      if (!walletAddr) {
        // ── Real MetaMask path ───────────────────────────────────────────────
        // No demo address was passed — the user clicked "Connect with MetaMask".
        // If MetaMask is not installed, throw so the UI can show a clear message.
        if (typeof window === "undefined" || !(window as any).ethereum) {
          throw new Error("NO_METAMASK");
        }

        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts"
        });

        if (!accounts?.[0]) {
          throw new Error("No account returned from MetaMask");
        }

        walletAddr = accounts[0];
      }

      setAddress(walletAddr);
      const userRole = detectRole(walletAddr);
      setRole(userRole);

      // Mark this browser session as authenticated
      sessionStorage.setItem("did_wallet_session", "1");

      const modeLabel = isContractModeAvailable() ? "On-chain" : "Simulation";
      showToast(
        `Wallet connected: ${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)} (${userRole} · ${modeLabel})`,
        "success"
      );
      addActivityLog(
        "CREATE_DID",
        "Wallet Connection Established",
        `Connected ${walletAddr} in ${userRole} mode.`
      );
      navigateTo("dashboard");
    } catch (err: any) {
      if (err?.message === "NO_METAMASK") {
        showToast("MetaMask is not installed. Use a demo account to explore.", "error");
      } else if (err?.code === 4001) {
        // User rejected the MetaMask connection prompt
        showToast("Connection rejected in MetaMask.", "error");
      } else {
        showToast("Connection failed.", "error");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // ── Disconnect ────────────────────────────────────────────────────────────────
  const disconnectWallet = () => {
    setAddress(null);
    setRole("Holder");
    sessionStorage.removeItem("did_wallet_session");
    showToast("Wallet disconnected", "info");
    navigateTo("welcome");
  };

  // ── Create DID ────────────────────────────────────────────────────────────────
  const createDID = async (identifier: string): Promise<boolean> => {
    if (!address) { showToast("Connect your wallet first", "error"); return false; }

    const cleanId = identifier.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!cleanId) { showToast("Identifier cannot be empty", "error"); return false; }

    const idTaken  = profiles.some(p => p.identifier === cleanId);
    const addrUsed = profiles.some(p => p.address.toLowerCase() === address.toLowerCase());
    if (idTaken)  { showToast(`Identifier '${cleanId}' is already taken`, "error"); return false; }
    if (addrUsed) { showToast("This wallet already has a registered DID", "error"); return false; }

    try {
      let generatedDid: string;

      if (isContractMode) {
        // ── On-chain path ──────────────────────────────────────────────────────
        generatedDid = await onChain_createDID(cleanId);
      } else {
        // ── Simulation path ────────────────────────────────────────────────────
        await new Promise(resolve => setTimeout(resolve, 600));
        generatedDid = `did:wallet:${cleanId}`;
      }

      const newProfile: DIDProfile = {
        identifier: cleanId,
        did: generatedDid,
        address,
        createdAt: new Date().toISOString()
      };

      setProfiles(prev => [...prev, newProfile]);
      addActivityLog("CREATE_DID", "Identity Created", `Registered ${generatedDid}`);
      showToast(`DID registered: ${generatedDid}`, "success");
      return true;
    } catch (err: any) {
      const reason = err?.reason ?? err?.message ?? "Transaction failed";
      showToast(`Create DID failed: ${reason}`, "error");
      return false;
    }
  };

  // ── Issue credential ──────────────────────────────────────────────────────────
  const issueCredential = async (
    cred: Omit<CredentialType, "issuer" | "issuerName" | "revoked">
  ): Promise<boolean> => {
    if (!address) { showToast("Connect your wallet first", "error"); return false; }
    if (role !== "Issuer" && role !== "Admin") {
      showToast("Unauthorized: must be a trusted Issuer or Admin", "error");
      return false;
    }
    if (credentials.some(c => c.id === cred.id)) {
      showToast(`Credential ID ${cred.id} already exists`, "error");
      return false;
    }

    const issuerRecord  = issuers.find(i => i.address.toLowerCase() === address.toLowerCase());
    const issuerName    = issuerRecord?.name ?? "Registered Authority";

    try {
      if (isContractMode) {
        // ── On-chain path ──────────────────────────────────────────────────────
        await onChain_issueCredential(
          cred.id,
          cred.cid,
          cred.documentHash,
          cred.holder,
          cred.type
        );
      } else {
        // ── Simulation path ────────────────────────────────────────────────────
        await new Promise(resolve => setTimeout(resolve, 800));

        const holderHasDID = profiles.some(
          p => p.address.toLowerCase() === cred.holder.toLowerCase()
        );
        if (!holderHasDID) {
          showToast(
            `Warning: holder (${cred.holder.slice(0, 8)}…) has no DID. Issued in simulation.`,
            "info"
          );
        }
      }

      const newCred: CredentialType = { ...cred, issuer: address, issuerName, revoked: false };
      setCredentials(prev => [newCred, ...prev]);
      addActivityLog("ISSUE_CREDENTIAL", "Credential Issued", `Issued '${cred.type}' to ${cred.holder.slice(0, 10)}…`);
      showToast(`Credential ${cred.id} issued successfully!`, "success");
      return true;
    } catch (err: any) {
      const reason = err?.reason ?? err?.message ?? "Transaction failed";
      showToast(`Issue credential failed: ${reason}`, "error");
      return false;
    }
  };

  // ── Revoke credential ─────────────────────────────────────────────────────────
  const revokeCredential = async (id: string, reason: string): Promise<boolean> => {
    if (!address) { showToast("Connect your wallet first", "error"); return false; }
    if (role !== "Issuer" && role !== "Admin") {
      showToast("Unauthorized: must be a trusted Issuer or Admin", "error");
      return false;
    }

    const idx = credentials.findIndex(c => c.id === id);
    if (idx === -1) { showToast(`Credential ${id} not found`, "error"); return false; }

    const target = credentials[idx];
    if (target.revoked) { showToast(`Credential ${id} is already revoked`, "error"); return false; }
    if (role !== "Admin" && target.issuer.toLowerCase() !== address.toLowerCase()) {
      showToast("Unauthorized: only the original issuer can revoke", "error");
      return false;
    }

    try {
      if (isContractMode) {
        // ── On-chain path ──────────────────────────────────────────────────────
        await onChain_revokeCredential(id);
      } else {
        // ── Simulation path ────────────────────────────────────────────────────
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const updated = [...credentials];
      updated[idx] = { ...target, revoked: true, revocationReason: reason || "Revoked by issuer." };
      setCredentials(updated);
      addActivityLog("REVOKE_CREDENTIAL", "Credential Revoked", `Revoked ${id}: ${reason}`);
      showToast(`Credential ${id} revoked successfully.`, "success");
      return true;
    } catch (err: any) {
      const reason_ = err?.reason ?? err?.message ?? "Transaction failed";
      showToast(`Revoke failed: ${reason_}`, "error");
      return false;
    }
  };

  // ── Register issuer (Admin only) ──────────────────────────────────────────────
  const registerIssuer = async (
    issuer: Omit<IssuerRegistration, "registeredAt">
  ): Promise<boolean> => {
    if (role !== "Admin") { showToast("Unauthorized: Admin only", "error"); return false; }
    if (issuers.some(i => i.address.toLowerCase() === issuer.address.toLowerCase())) {
      showToast("Address is already a registered issuer", "error");
      return false;
    }

    try {
      if (isContractMode) {
        // ── On-chain path ──────────────────────────────────────────────────────
        // IssuerRegistry.registerIssuer takes (address, name, issuerType).
        // The frontend collects `type` (maps to issuerType) and `name`.
        await onChain_registerIssuer(issuer.address, issuer.name, issuer.type);
      } else {
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const newIssuer: IssuerRegistration = { ...issuer, registeredAt: new Date().toISOString() };
      setIssuers(prev => [...prev, newIssuer]);
      addActivityLog("REGISTER_ISSUER", "Issuer Registered", `Registered ${issuer.name}.`);
      showToast(`Successfully whitelisted: ${issuer.name}`, "success");
      return true;
    } catch (err: any) {
      const reason = err?.reason ?? err?.message ?? "Transaction failed";
      showToast(`Register issuer failed: ${reason}`, "error");
      return false;
    }
  };

  // ── Remove issuer (Admin only) ────────────────────────────────────────────────
  const removeIssuer = async (issuerAddress: string): Promise<boolean> => {
    if (role !== "Admin") { showToast("Unauthorized: Admin only", "error"); return false; }

    try {
      if (isContractMode) {
        await onChain_removeIssuer(issuerAddress);
      } else {
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      setIssuers(prev =>
        prev.map(i =>
          i.address.toLowerCase() === issuerAddress.toLowerCase()
            ? { ...i, isTrusted: false }
            : i
        )
      );
      showToast("Issuer removed.", "info");
      return true;
    } catch (err: any) {
      const reason = err?.reason ?? err?.message ?? "Transaction failed";
      showToast(`Remove issuer failed: ${reason}`, "error");
      return false;
    }
  };

  // ── Context value ─────────────────────────────────────────────────────────────
  return (
    <WalletContext.Provider
      value={{
        address,
        role,
        profiles,
        issuers,
        credentials,
        logs,
        activePage,
        isConnecting,
        isContractMode,
        notification,
        navigateTo,
        connectWallet,
        disconnectWallet,
        createDID,
        issueCredential,
        revokeCredential,
        registerIssuer,
        removeIssuer,
        setNotification,
        addActivityLog,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
