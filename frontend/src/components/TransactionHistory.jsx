import React from "react";
import { History } from "lucide-react";

export function TransactionHistory({
  transactions,
  accounts,
  filterAccount,
  setFilterAccount,
  getTransactionDirection
}) {
  return (
    <div className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Audit Logs</h2>
          </div>
          <p className="text-[10px] text-slate-500">Double-entry ledger immutable entries for balance validation.</p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2 bg-[#080b13] border border-slate-850 px-3 py-1.5 rounded-xl">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account:</label>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="bg-transparent border-none text-xs text-white outline-none cursor-pointer pr-1"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                ...{acc._id.slice(-8)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="border border-dashed border-slate-800/80 rounded-xl py-12 flex flex-col items-center justify-center text-center">
          <History className="w-8 h-8 text-slate-700 mb-3" />
          <h4 className="text-xs font-semibold text-slate-400">No logs on ledger</h4>
          <p className="text-[10px] text-slate-600 mt-0.5">Initialize faucet credits or execute transactions to populate history.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-900 rounded-xl bg-[#080b13]/10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#080b13]/85 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-900">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Tx Signature / Idempotency</th>
                <th className="py-3 px-4">From Address</th>
                <th className="py-3 px-4">To Address</th>
                <th className="py-3 px-4">Flow</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 font-medium">
              {transactions.map((tx) => {
                const direction = getTransactionDirection(tx);
                const isDebit = direction === "DEBIT";
                const isCredit = direction === "CREDIT";
                const isInternal = direction === "INTERNAL";

                const fromAccText = tx.fromAccount?.user?.name 
                  ? `${tx.fromAccount.user.name} (...${tx.fromAccount._id.slice(-5)})`
                  : `...${(tx.fromAccount?._id || tx.fromAccount || "").slice(-8)}`;

                const toAccText = tx.toAccount?.user?.name 
                  ? `${tx.toAccount.user.name} (...${tx.toAccount._id.slice(-5)})`
                  : `...${(tx.toAccount?._id || tx.toAccount || "").slice(-8)}`;

                const txDate = new Date(tx.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                });

                const statusColors = {
                  PENDING: "bg-yellow-500/5 text-yellow-400 border-yellow-500/10",
                  COMPLETED: "bg-emerald-500/5 text-emerald-400 border-emerald-500/10",
                  FAILED: "bg-rose-500/5 text-rose-400 border-rose-500/10",
                  REVERSED: "bg-slate-500/5 text-slate-400 border-slate-500/10",
                };

                return (
                  <tr key={tx._id} className="hover:bg-slate-900/15 text-slate-300">
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {txDate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-400 select-all truncate max-w-[130px]" title={tx._id}>
                          {tx._id}
                        </span>
                        <span className="text-[8.5px] text-slate-600 font-sans tracking-tight truncate max-w-[150px]" title={tx.idempotencyKey}>
                          IK: {tx.idempotencyKey}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {fromAccText}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {toAccText}
                    </td>
                    <td className="py-3 px-4">
                      {isDebit && (
                        <span className="text-[8px] font-bold text-rose-400 bg-rose-950/20 border border-rose-900/30 px-1.5 py-0.5 rounded">
                          DEBIT
                        </span>
                      )}
                      {isCredit && (
                        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                          CREDIT
                        </span>
                      )}
                      {isInternal && (
                        <span className="text-[8px] font-bold text-indigo-400 bg-indigo-950/20 border border-indigo-900/30 px-1.5 py-0.5 rounded font-sans">
                          INTERNAL
                        </span>
                      )}
                      {direction === "EXTERNAL" && (
                        <span className="text-[8px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                          EXTERNAL
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold font-mono text-xs whitespace-nowrap ${
                      isDebit ? "text-rose-400" : isCredit ? "text-emerald-400" : "text-white"
                    }`}>
                      {isDebit ? "-" : isCredit ? "+" : ""}
                      {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[8.5px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                        statusColors[tx.status] || "bg-slate-800"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
