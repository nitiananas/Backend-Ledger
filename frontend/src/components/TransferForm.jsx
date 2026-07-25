import React from "react";
import { Send, RefreshCw } from "lucide-react";
import { SleekAlert } from "./SleekAlert";

export function TransferForm({
  accounts,
  balances,
  fromAccount,
  setFromAccount,
  toAccount,
  setToAccount,
  amount,
  setAmount,
  idempotencyKey,
  setIdempotencyKey,
  regenerateKey,
  onSubmit,
  txLoading,
  txError,
  txSuccess
}) {
  return (
    <div className="bg-slate-900/35 border border-slate-800/80 p-5 rounded-2xl shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Send className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Execute Transfer</h2>
        </div>
        <p className="text-[10px] text-slate-500 mb-5">Double-entry ledger debit & credit operation with idempotency protection.</p>

        <div className="space-y-4">
          <SleekAlert type="error" message={txError} />
          <SleekAlert type="success" message={txSuccess} />

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Source Account */}
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Source Account</label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full bg-[#080b13] border border-slate-800 focus:border-indigo-500/50 text-xs text-white rounded-xl py-2.5 px-3 outline-none transition-all cursor-pointer"
              >
                <option value="" disabled>Select account</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    ...{acc._id.slice(-8)} ({acc.status}) - Balance: {balances[acc._id]?.toLocaleString() || 0} INR
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Account */}
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recipient Account ID</label>
              <input
                type="text"
                required
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                placeholder="Paste 24-character Account ID"
                className="w-full bg-[#080b13] border border-slate-800 focus:border-indigo-500/50 font-mono text-xs text-white rounded-xl py-2.5 px-3 outline-none transition-all placeholder:text-slate-700"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Transfer Amount</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-xs font-semibold">INR</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#080b13] border border-slate-800 focus:border-indigo-500/50 font-mono text-xs text-white rounded-xl py-2.5 pl-11 pr-3 outline-none transition-all"
                />
              </div>
            </div>

            {/* Idempotency Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Idempotency Key</label>
                <button
                  type="button"
                  onClick={regenerateKey}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-all"
                >
                  Regenerate
                </button>
              </div>
              <input
                type="text"
                required
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                className="w-full bg-[#080b13]/60 border border-slate-850 font-mono text-[10px] text-slate-500 rounded-xl py-2.5 px-3 outline-none cursor-not-allowed"
                readOnly
              />
            </div>

            <button
              type="submit"
              disabled={txLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:scale-100 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10 mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {txLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{txLoading ? "Verifying..." : "Execute Ledger Entry"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
