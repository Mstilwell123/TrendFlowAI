import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Clapperboard, FolderOpen, Settings, LogOut, X, Dna } from "lucide-react";
import { useAuth } from "../lib/auth";
import Logo from "./Logo";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard", end: true },
  { to: "/app/tiktok/study", label: "Analyze", icon: Clapperboard, testid: "nav-analyze", matchPrefix: "/app/tiktok|/app/youtube|/app/instagram|/app/facebook" },
  { to: "/app/vault", label: "Vault", icon: FolderOpen, testid: "nav-vault" },
  { to: "/app/settings", label: "DNA / Settings", icon: Dna, testid: "nav-settings" },
];

function isActive(item, pathname) {
  if (item.end) return pathname === item.to;
  if (item.matchPrefix) {
    return item.matchPrefix.split("|").some((p) => pathname.startsWith(p));
  }
  return pathname.startsWith(item.to);
}

function SidebarHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-5 py-5 border-b border-neutral-900">
      <Logo />
      <button
        className="md:hidden text-neutral-400 hover:text-white"
        onClick={onClose}
        data-testid="sidebar-close-btn"
        aria-label="Close menu"
      >
        <X size={20} />
      </button>
    </div>
  );
}

function SidebarNav({ pathname, onNavigate }) {
  return (
    <nav className="flex-1 px-3 py-5 space-y-1">
      {NAV.map((n) => {
        const Icon = n.icon;
        const active = isActive(n, pathname);
        return (
          <Link
            key={n.to} to={n.to}
            data-testid={n.testid}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
              active
                ? "bg-neutral-900 text-white border-l-2 border-yellow-500 pl-[10px]"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            <span>{n.label}</span>
          </Link>
        );
      })}
      <div className="px-3 pt-6 pb-2 text-[10px] uppercase tracking-widest text-neutral-600">
        Platforms
      </div>
      {["tiktok", "youtube", "instagram", "facebook"].map((plat) => {
        const label = plat[0].toUpperCase() + plat.slice(1);
        const to = `/app/${plat}/study`;
        const active = pathname.startsWith(`/app/${plat}`);
        return (
          <Link
            key={plat}
            to={to}
            data-testid={`nav-platform-${plat}`}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs transition-colors ${
              active ? "text-yellow-500" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {label}
            {plat !== "tiktok" && <span className="text-neutral-700 ml-auto">soon</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ user, onLogout }) {
  return (
    <div className="px-3 py-4 border-t border-neutral-900">
      <div className="px-3 py-2 mb-2">
        <div className="text-xs text-neutral-500 uppercase tracking-wider">Signed in as</div>
        <div className="text-sm text-white truncate" data-testid="layout-user-email">{user?.email}</div>
        <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
          <span className="uppercase tracking-wider">{user?.subscription_tier || "free"}</span>
          <span className="text-neutral-600">·</span>
          <span>{user?.niche || "no niche"}</span>
        </div>
      </div>
      <button
        onClick={onLogout}
        data-testid="layout-logout-btn"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors"
      >
        <LogOut size={16} strokeWidth={1.5} />
        <span>Sign out</span>
      </button>
    </div>
  );
}

export default function Sidebar({ onCloseMobile }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  return (
    <>
      <SidebarHeader onClose={onCloseMobile} />
      <SidebarNav pathname={loc.pathname} onNavigate={onCloseMobile} />
      <SidebarFooter user={user} onLogout={() => { logout(); nav("/"); }} />
    </>
  );
}
