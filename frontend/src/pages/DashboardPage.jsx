import React from "react";
import { 
  PlusCircle, 
  LayoutGrid, 
  ScrollText, 
  HelpCircle, 
  Activity, 
  ShieldCheck, 
  Database,
  Terminal,
  Compass
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { AccountCard } from "../components/AccountCard";
import { TransferForm } from "../components/TransferForm";
import { TransactionHistory } from "../components/TransactionHistory";

export function DashboardPage({
  user,
  accounts,
  balances,
  transactions,
  dashboardLoading,
  fromAccount,
  setFromAccount,
  toAccount,
  setToAccount,
  amount,
  setAmount,
  idempotencyKey,
  setIdempotencyKey,
  regenerateKey,
  txLoading,
  txError,
  txSuccess,
  filterAccount,
  setFilterAccount,
  refreshLoading,
  faucetLoading,
  handleManualRefresh,
  handleLogout,
  handleCreateAccount,
  handleStatusChange,
  handleFaucet,
  handleSendTransaction,
  getTransactionDirection
}) {
  return (
    <div className="min-h-screen bg-[#06080e] text-slate-300 flex">
      
      {/* Premium Sidebar (Left Column) */}
      <aside className="w-60 border-r border-slate-900 bg-[#080b13]/40 p-6 hidden lg:flex flex-col justify-between shrink-0 select-none">
        <div className="space-y-7">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-7 w-7 bg-indigo-500 flex items-center justify-center rounded-lg text-white font-black text-sm tracking-tighter">
              L
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wider uppercase block">LEDGER NODE</span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block">Double-Entry v2</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <span className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">Systems Console</span>
            <a href="#dashboard" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-white bg-slate-900/60 border border-slate-800/80 rounded-xl transition-all">
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <span>Dashboard</span>
            </a>
            <a href="#ledgers" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 rounded-xl transition-all">
              <Database className="w-4 h-4 text-slate-500" />
              <span>Ledgers</span>
            </a>
            <a href="#audit" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 rounded-xl transition-all">
              <ScrollText className="w-4 h-4 text-slate-500" />
              <span>Audit Trail</span>
            </a>
            <a href="#status" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 rounded-xl transition-all">
              <Activity className="w-4 h-4 text-slate-500" />
              <span>System Status</span>
            </a>
          </nav>

          {/* Tools Menu */}
          <nav className="space-y-1">
            <span className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">Developers</span>
            <a href="#api" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 rounded-xl transition-all">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>Console API</span>
            </a>
            <a href="#sandbox" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 rounded-xl transition-all">
              <Compass className="w-4 h-4 text-slate-500" />
              <span>Sandbox Docs</span>
            </a>
          </nav>
        </div>

        {/* Security badge at bottom */}
        <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Immutable Security</span>
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed">
            All database modifications block direct overrides. Entries are secured by double-entry ledger journals.
          </p>
        </div>
      </aside>

      {/* Main Console Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Navbar */}
        <Navbar 
          user={user}
          refreshLoading={refreshLoading}
          dashboardLoading={dashboardLoading}
          onRefresh={handleManualRefresh}
          onLogout={handleLogout}
        />

        {/* Console Workspace Grid */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Center Pane (Left 2 columns on desktop) */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Accounts Header & Grid */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight uppercase">Ledger Accounts</h2>
                    <p className="text-[11px] text-slate-500">Real-time status management and balance auditing.</p>
                  </div>
                  <button
                    onClick={handleCreateAccount}
                    className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-650/90 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.97] cursor-pointer shadow-lg shadow-indigo-550/5 border border-indigo-600/20"
                  >
                    <PlusCircle className="w-4 h-4" /> Create Account
                  </button>
                </div>

                {dashboardLoading && accounts.length === 0 ? (
                  <div className="bg-slate-900/10 border border-slate-900 rounded-2xl py-20 flex flex-col items-center justify-center space-y-3">
                    <Activity className="w-7 h-7 animate-pulse text-indigo-500" />
                    <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading console ledger...</span>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl py-14 flex flex-col items-center text-center px-4">
                    <div className="w-10 h-10 bg-slate-950/80 flex items-center justify-center rounded-xl border border-slate-900 text-slate-600 mb-4">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Accounts Configured</h3>
                    <p className="text-[10px] text-slate-650 max-w-xs mt-1 mb-5 leading-relaxed">
                      You must configure a ledger account to track credits, debits, and journal double-entries.
                    </p>
                    <button
                      onClick={handleCreateAccount}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                    >
                      Provision First Account
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {accounts.map((acc) => (
                      <AccountCard
                        key={acc._id}
                        acc={acc}
                        balance={balances[acc._id] !== undefined ? balances[acc._id] : 0}
                        onStatusChange={handleStatusChange}
                        onFaucet={handleFaucet}
                        faucetLoading={faucetLoading}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Transaction Logs */}
              <TransactionHistory 
                transactions={transactions}
                accounts={accounts}
                filterAccount={filterAccount}
                setFilterAccount={setFilterAccount}
                getTransactionDirection={getTransactionDirection}
              />

            </div>

            {/* Right Pane (Transfer sheet, 1 column on desktop) */}
            <div className="xl:col-span-1">
              <TransferForm 
                accounts={accounts}
                balances={balances}
                fromAccount={fromAccount}
                setFromAccount={setFromAccount}
                toAccount={toAccount}
                setToAccount={setToAccount}
                amount={amount}
                setAmount={setAmount}
                idempotencyKey={idempotencyKey}
                setIdempotencyKey={setIdempotencyKey}
                regenerateKey={regenerateKey}
                onSubmit={handleSendTransaction}
                txLoading={txLoading}
                txError={txError}
                txSuccess={txSuccess}
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
