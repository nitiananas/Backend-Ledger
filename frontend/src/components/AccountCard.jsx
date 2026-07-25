import React from "react";
import { Unlock, Shield, XCircle, Coins } from "lucide-react";

export function AccountCard({ acc, balance, onStatusChange, onFaucet, faucetLoading }) {
  const isFaucetActive = faucetLoading[acc._id];

  const renderStatusDot = () => {
    switch (acc.status) {
      case "ACTIVE":
        return (
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "FROZEN":
        return (
          <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Frozen
          </span>
        );
      case "CLOSED":
        return (
          <span className="flex items-center gap-1.5 text-[10px] text-rose-500 font-semibold tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full border border-rose-500 bg-transparent" />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-slate-900/35 border ${
      acc.status === "ACTIVE" 
        ? "border-slate-800/80 hover:border-slate-700/60" 
        : "border-slate-900/60 opacity-60"
    } p-5 rounded-2xl shadow-sm transition-all flex flex-col justify-between h-[180px]`}>
      
      <div>
        <div className="flex items-center justify-between">
          {renderStatusDot()}
          
          <div className="flex items-center gap-0.5 bg-slate-950/80 border border-slate-800/60 p-0.5 rounded-lg select-none">
            <button
              onClick={() => onStatusChange(acc._id, "ACTIVE")}
              className={`p-1 rounded cursor-pointer transition-all ${
                acc.status === "ACTIVE" 
                  ? "bg-indigo-600/95 text-white" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Activate Account"
            >
              <Unlock className="w-3 h-3" />
            </button>
            <button
              onClick={() => onStatusChange(acc._id, "FROZEN")}
              className={`p-1 rounded cursor-pointer transition-all ${
                acc.status === "FROZEN" 
                  ? "bg-amber-600/90 text-white" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Freeze Account"
            >
              <Shield className="w-3 h-3" />
            </button>
            <button
              onClick={() => onStatusChange(acc._id, "CLOSED")}
              className={`p-1 rounded cursor-pointer transition-all ${
                acc.status === "CLOSED" 
                  ? "bg-rose-950/60 text-rose-450" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Close Account"
            >
              <XCircle className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div 
            onClick={() => {
              navigator.clipboard.writeText(acc._id);
              alert("Account ID copied!");
            }}
            className="flex items-center justify-between font-mono text-[11px] text-slate-400 bg-slate-950/50 border border-slate-850 px-2.5 py-1.5 rounded-xl cursor-pointer hover:text-slate-200 transition-all select-all"
            title="Click to copy account ID"
          >
            <span className="truncate max-w-[85%]">{acc._id}</span>
            <span className="text-[7.5px] uppercase font-sans text-slate-500 tracking-wider font-bold shrink-0 ml-1">COPY</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-900/60 flex items-end justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block mb-0.5">Real-time Balance</span>
          <span className="text-xl font-bold font-mono text-white tracking-tight">
            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs text-slate-400 font-medium font-sans ml-1">{acc.currency || "INR"}</span>
          </span>
        </div>

        {acc.status === "ACTIVE" && (
          <button
            onClick={() => onFaucet(acc._id)}
            disabled={isFaucetActive}
            className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-white bg-slate-950/40 hover:bg-indigo-600/90 border border-slate-800/80 hover:border-indigo-500 px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Coins className={`w-3.5 h-3.5 ${isFaucetActive ? "animate-bounce" : ""}`} />
            <span>{isFaucetActive ? "Seeding..." : "Faucet (+10k)"}</span>
          </button>
        )}
      </div>

    </div>
  );
}
