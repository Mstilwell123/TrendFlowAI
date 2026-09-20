import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Logo from "./Logo";
import Sidebar from "./Sidebar";

function MobileTopBar({ onOpenMenu }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-900 sticky top-0 z-30 backdrop-blur-md bg-black/80">
      <button
        onClick={onOpenMenu}
        data-testid="sidebar-open-btn"
        className="text-neutral-300 hover:text-white"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <Logo />
      <div className="w-6" />
    </div>
  );
}

function MobileDrawer({ onClose }) {
  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <aside className="relative w-72 flex flex-col bg-[#0a0a0a] border-r border-neutral-900">
        <Sidebar onCloseMobile={onClose} />
      </aside>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-neutral-900 bg-[#0a0a0a] sticky top-0 h-screen">
        <Sidebar />
      </aside>
      {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
      <main className="flex-1 min-w-0 flex flex-col">
        <MobileTopBar onOpenMenu={() => setMobileOpen(true)} />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
