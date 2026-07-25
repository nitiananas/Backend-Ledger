import React, { useState } from "react";
import { Mail, Lock, User, UserPlus, Coins } from "lucide-react";
import { SleekAlert } from "../components/SleekAlert";

export function AuthPage({
  onLogin,
  onRegister,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  authError,
  authSuccess
}) {
  const [tab, setTab] = useState("login");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tab === "login") {
      onLogin(e);
    } else {
      onRegister(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-slate-900/20 border border-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 bg-indigo-500/10 flex items-center justify-center rounded-2xl border border-indigo-500/20 text-indigo-400 mb-4">
            <Coins className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Backend Ledger
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
            A secure double-entry accounting ledger node with immutable validation.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800/60 mt-4 select-none">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
              tab === "login"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
              tab === "register"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Register
          </button>
        </div>

        <SleekAlert type="error" message={authError} />
        <SleekAlert type="success" message={authSuccess} />

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {tab === "register" && (
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#080b13] border border-slate-850 focus:border-indigo-500/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@ledger.com"
                className="w-full bg-[#080b13] border border-slate-850 focus:border-indigo-500/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080b13] border border-slate-850 focus:border-indigo-500/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10 mt-3 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {tab === "login" ? (
              <>
                <User className="w-3.5 h-3.5" /> Authentication
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
