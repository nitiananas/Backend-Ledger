import React from "react";
import { Coins, RefreshCw, User, LogOut } from "lucide-react";

export function Navbar({ user, refreshLoading, dashboardLoading, onRefresh, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-[#080b13]/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8.5 w-8.5 bg-indigo-500/10 flex items-center justify-center rounded-lg border border-indigo-500/20 text-indigo-400">
          <Coins className="w-4.5 h-4.5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wider uppercase">Ledger Console</h1>
          <span className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">Double-Entry Journal System</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Pill */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-300 font-medium">{user.name}</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500 font-mono select-all">{user.email}</span>
        </div>

        {/* Sync/Refresh */}
        <button
          onClick={onRefresh}
          disabled={refreshLoading || dashboardLoading}
          className="p-2 text-slate-400 hover:text-white bg-slate-900/40 border border-slate-800 rounded-xl hover:bg-slate-800/40 active:scale-95 transition-all cursor-pointer"
          title="Sync console data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshLoading || dashboardLoading ? "animate-spin text-indigo-400" : ""}`} />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-950/10 hover:bg-red-950/30 border border-red-950/40 hover:border-red-900/40 text-red-400 hover:text-red-300 px-3.5 py-1.8 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Disconnect</span>
        </button>
      </div>
    </header>
  );
}
