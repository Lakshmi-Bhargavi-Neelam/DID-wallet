import React, { useState } from "react";import { WalletProvider, useWallet } from "./context/WalletContext";
import { MOCK_ACCOUNTS } from "./data";
import { 
  Users, Shield, Award, Key, CheckCircle, Clock, ExternalLink, 
  Menu, X, LayoutDashboard, UserCheck, FilePlus, ShieldAlert, 
  Building, Sliders, LogOut, ChevronLeft, ChevronRight, Bell, Sparkles 
} from "lucide-react";

// Sub component views imported
import WelcomeView from "./components/WelcomeView";
import DashboardHomeView from "./components/DashboardHomeView";
import ProfileView from "./components/ProfileView";
import CreateDIDView from "./components/CreateDIDView";
import VerifyCredentialView from "./components/VerifyCredentialView";
import IssueCredentialView from "./components/IssueCredentialView";
import IssuedCredentialsView from "./components/IssuedCredentialsView";
import RevokeCredentialView from "./components/RevokeCredentialView";
import RegisterIssuerView from "./components/RegisterIssuerView";
import IssuerManagementView from "./components/IssuerManagementView";

function DashboardContainer() {
  const { 
    address, 
    role, 
    activePage, 
    navigateTo, 
    disconnectWallet, 
    connectWallet,
    notification,
    isContractMode,
    setNotification 
  } = useWallet();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Active view router dispatcher
  const renderActiveView = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHomeView />;
      case "profile":
        return <ProfileView />;
      case "create-did":
        return <CreateDIDView />;
      case "verify-credential":
        return <VerifyCredentialView />;
      case "issue-credential":
        return <IssueCredentialView />;
      case "issued-credentials":
        return <IssuedCredentialsView />;
      case "revoke-credential":
        return <RevokeCredentialView />;
      case "register-issuer":
        return <RegisterIssuerView />;
      case "issuer-management":
        return <IssuerManagementView />;
      default:
        return <DashboardHomeView />;
    }
  };

  const navigationItems = [
    {
      id: "dashboard",
      name: "Overview Dashboard",
      icon: LayoutDashboard,
      roles: ["Holder", "Issuer", "Admin"]
    },
    {
      id: "profile",
      name: "My DID Profile",
      icon: UserCheck,
      roles: ["Holder", "Issuer", "Admin"]
    },
    {
      id: "create-did",
      name: "Create DID",
      icon: Key,
      roles: ["Holder", "Issuer"]   // Admin has no use case for a personal DID here
    },
    {
      id: "verify-credential",
      name: "Verify Credential",
      icon: CheckCircle,
      roles: ["Holder", "Issuer", "Admin"]
    },
    {
      id: "issue-credential",
      name: "Issue Credential",
      icon: FilePlus,
      roles: ["Issuer"]             // Admin cannot issue — not a trusted institution
    },
    {
      id: "issued-credentials",
      name: "Issued Credentials",
      icon: Award,
      roles: ["Issuer"]
    },
    {
      id: "revoke-credential",
      name: "Revoke Credential",
      icon: ShieldAlert,
      roles: ["Issuer"]             // Admin cannot revoke — not an issuer
    },
    {
      id: "register-issuer",
      name: "Register Issuer",
      icon: Building,
      roles: ["Admin"]
    },
    {
      id: "issuer-management",
      name: "Issuer Management",
      icon: Sliders,
      roles: ["Admin"]
    }
  ];

  // Filter sidebar elements based on authorized permissions matching active role
  const allowedNavs = navigationItems.filter(item => item.roles.includes(role));

  const abbreviatedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 flex font-sans select-none relative overflow-hidden">
      
      {/* Dynamic Background radial filters */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* LEFT SIDEBAR (Desktop collapsible) */}
      <aside 
        className={`hidden md:flex flex-col flex-shrink-0 bg-[#0c0c0e] border-r border-zinc-900 transition-all duration-300 relative z-30 ${
          sidebarOpen ? "w-64" : "w-18"
        }`}
      >
        {/* Toggle Collapse button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition shadow-lg shadow-black/80"
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3.5 border-b border-zinc-900/40">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg border border-purple-400/20 shadow-lg shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-white block">PRO-DID</span>
              <span className="text-[9px] font-mono text-purple-400 tracking-wider block uppercase -mt-0.5">SOVEREIGNTY</span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto">
          {allowedNavs.map((item) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigateTo(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition duration-150 text-xs font-medium text-left ${
                  isActive 
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.05)]" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent"
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400 font-bold' : 'text-zinc-400'}`} />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Role Switcher Sandbox Help panel */}
        {sidebarOpen && (
          <div className="p-4 mx-3 mb-4 bg-zinc-950/80 border border-zinc-900/70 rounded-xl space-y-2 text-[10px]">
            <span className="text-zinc-500 font-mono uppercase tracking-wider block font-semibold">Switch Active Role</span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button 
                onClick={() => connectWallet(MOCK_ACCOUNTS.HOLDER_1)}
                className={`py-1 rounded font-mono ${role === "Holder" ? 'bg-purple-950/50 border border-purple-500/30 text-purple-400 font-bold' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                Holder
              </button>
              <button 
                onClick={() => connectWallet(MOCK_ACCOUNTS.ISSUER_1)}
                className={`py-1 rounded font-mono ${role === "Issuer" ? 'bg-purple-950/50 border border-purple-500/30 text-purple-400 font-bold' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                Issuer
              </button>
              <button 
                onClick={() => connectWallet(MOCK_ACCOUNTS.ADMIN)}
                className={`py-1 rounded font-mono ${role === "Admin" ? 'bg-purple-950/50 border border-purple-500/30 text-purple-400 font-bold' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Logout bottom row */}
        <div className="p-4 border-t border-zinc-900/50">
          <button
            onClick={disconnectWallet}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition duration-150 text-left ${
              !sidebarOpen && "justify-center px-0"
            }`}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Disconnect key</span>}
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <header className="bg-[#070709]/80 backdrop-blur-md border-b border-zinc-900/50 h-16 px-6 sticky top-0 flex items-center justify-between z-20">
          
          {/* Mobile Hamburguer trigger */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 rounded-lg"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <span className="font-display font-bold text-sm tracking-tight text-white block">PRO-DID</span>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-zinc-400">
            <span className="font-semibold text-white">Network:</span>
            <span className="flex items-center space-x-1.5 font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>{isContractMode ? "On-chain (Anvil)" : "Simulation Mode"}</span>
            </span>
          </div>

          {/* Right Header profiles menu */}
          <div className="flex items-center space-x-4">
            
            {/* Role Badge inside navbar */}
            <span className="text-[10px] uppercase font-mono tracking-wide bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-400 border border-purple-500/25 px-2.5 py-1 rounded-md">
              {role} Account
            </span>

            {/* Profile Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2.5 p-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-full shrink-0 pl-1.5 pr-2.5 h-9 transition active:scale-98"
              >
                <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-display font-semibold text-white text-xs">
                  {role === "Admin" ? "AD" : role === "Issuer" ? "IS" : "H1"}
                </div>
                <span className="text-xs text-zinc-300 font-mono hidden sm:inline-block">
                  {abbreviatedAddress}
                </span>
              </button>

              {/* Dropdown Menu block */}
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2.5 w-60 bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl p-2.5 z-40 space-y-1.5">
                    <div className="px-2 py-1.5 border-b border-zinc-905">
                      <span className="text-zinc-500 text-[9px] font-mono uppercase block">Active Account Address</span>
                      <code className="text-xs text-purple-300 font-mono mt-0.5 block truncate">{address}</code>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigateTo("profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2 border border-transparent hover:bg-zinc-900 rounded-lg py-2 text-xs text-zinc-300"
                    >
                      Audit DID Keys Document
                    </button>

                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2 border border-transparent hover:bg-red-500/5 hover:text-red-400 rounded-lg py-2 text-xs text-zinc-500"
                    >
                      Disconnect Identity Wallet
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTAINER CONTENT WRAPPER */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md animate-fade-in flex">
          <div className="w-72 bg-zinc-950 border-r border-zinc-900 p-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900/60">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span className="font-display font-bold text-white tracking-tight">PRO-DID</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white bg-zinc-900 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <span className="text-[10px] text-zinc-500 font-mono uppercase">Navigate ({role})</span>
              <nav className="space-y-1">
                {allowedNavs.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigateTo(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive 
                          ? "bg-purple-500/10 text-purple-400" 
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4">
              {/* Mobile Role Switch helper */}
              <div className="p-3 bg-zinc-900/50 rounded-xl space-y-2 text-[10px]">
                <span className="text-zinc-500 font-mono uppercase">Quick Switch Role</span>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                  <button onClick={() => { connectWallet(MOCK_ACCOUNTS.HOLDER_1); setMobileMenuOpen(false); }} className={`py-1 rounded ${role === 'Holder' ? 'bg-purple-500/20 text-purple-300':'text-zinc-500'}`}>Holder</button>
                  <button onClick={() => { connectWallet(MOCK_ACCOUNTS.ISSUER_1); setMobileMenuOpen(false); }} className={`py-1 rounded ${role === 'Issuer' ? 'bg-purple-500/20 text-purple-300':'text-zinc-500'}`}>Issuer</button>
                  <button onClick={() => { connectWallet(MOCK_ACCOUNTS.ADMIN); setMobileMenuOpen(false); }} className={`py-1 rounded ${role === 'Admin' ? 'bg-purple-500/20 text-purple-300':'text-zinc-500'}`}>Admin</button>
                </div>
              </div>

              <button
                onClick={() => {
                  disconnectWallet();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 text-zinc-500 hover:text-red-400 text-xs px-3 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL HIGH-FIDELITY TOAST NOTIFIER */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`p-4 rounded-xl border flex items-center space-x-3.5 shadow-2xl ${
            notification.type === "success" 
              ? "bg-zinc-950 border-emerald-500/20 shadow-emerald-950/20" 
              : notification.type === "error" 
                ? "bg-zinc-950 border-red-500/20 shadow-red-950/20"
                : "bg-zinc-950 border-purple-500/20 shadow-purple-950/20"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              notification.type === "success" 
                ? "bg-emerald-400" 
                : notification.type === "error" 
                  ? "bg-red-400"
                  : "bg-purple-400"
            }`} />
            
            <div className="text-xs">
              <span className="text-white font-medium block">{notification.message}</span>
            </div>

            <button 
              onClick={() => setNotification(null)}
              className="text-[10px] text-zinc-500 hover:text-white px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <InnerApp />
    </WalletProvider>
  );
}

function InnerApp() {
  const { address } = useWallet();
  if (address) {
    return <DashboardContainer />;
  }
  return <WelcomeView />;
}
