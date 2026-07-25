import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  PlusCircle, 
  Send, 
  History, 
  User, 
  LogOut, 
  Lock, 
  Mail, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Coins,
  Shield,
  Unlock,
  Slash
} from "lucide-react";

const API_BASE = "http://localhost:3000/api";

function App() {
  const [user, setUser] = useState(null);
  const [authTab, setAuthTab] = useState("login");
  const [authLoading, setAuthLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Dashboard states
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Send transaction states
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState("");
  const [txSuccess, setTxSuccess] = useState("");

  // Filtering states
  const [filterAccount, setFilterAccount] = useState("all");
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Faucet states
  const [faucetLoading, setFaucetLoading] = useState({});

  // Generate a random idempotency key
  const regenerateKey = () => {
    const rand = Math.random().toString(36).substring(2, 10);
    const ts = Date.now();
    setIdempotencyKey(`tx-${rand}-${ts}`);
  };

  // Check auth status
  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Whenever user changes, fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      regenerateKey();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    try {
      await Promise.all([fetchAccounts(), fetchTransactions()]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/accounts`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts);
        // Fetch balance for each account
        data.accounts.forEach((acc) => {
          fetchBalance(acc._id);
        });
        if (data.accounts.length > 0 && !fromAccount) {
          // Set default sender account
          const activeAccounts = data.accounts.filter(a => a.status === "ACTIVE");
          if (activeAccounts.length > 0) {
            setFromAccount(activeAccounts[0]._id);
          } else {
            setFromAccount(data.accounts[0]._id);
          }
        }
      }
    } catch (err) {
      console.error("Fetch accounts error:", err);
    }
  };

  const fetchBalance = async (accountId) => {
    try {
      const res = await fetch(`${API_BASE}/accounts/balance/${accountId}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBalances((prev) => ({
          ...prev,
          [accountId]: data.balance,
        }));
      }
    } catch (err) {
      console.error(`Fetch balance error for ${accountId}:`, err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const url = filterAccount && filterAccount !== "all" 
        ? `${API_BASE}/transactions?accountId=${filterAccount}`
        : `${API_BASE}/transactions`;
        
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Fetch transactions error:", err);
    }
  };

  // Refetch transactions whenever filterAccount changes
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [filterAccount]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess("Registration successful! Logging in...");
        setUser(data.user);
        setEmail("");
        setPassword("");
        setName("");
      } else {
        setAuthError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setAuthError("Failed to connect to the backend server.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess("Login successful!");
        setUser(data.user);
        setEmail("");
        setPassword("");
      } else {
        setAuthError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setAuthError("Failed to connect to the backend server.");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setUser(null);
        setAccounts([]);
        setBalances({});
        setTransactions([]);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const res = await fetch(`${API_BASE}/accounts`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        fetchAccounts();
      }
    } catch (err) {
      console.error("Create account error:", err);
    }
  };

  const handleStatusChange = async (accountId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/accounts/${accountId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (res.ok) {
        fetchAccounts();
        fetchTransactions();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleFaucet = async (accountId) => {
    setFaucetLoading((prev) => ({ ...prev, [accountId]: true }));
    try {
      const res = await fetch(`${API_BASE}/accounts/${accountId}/faucet`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        fetchBalance(accountId);
        fetchTransactions();
      } else {
        const errData = await res.json();
        alert(errData.message || "Faucet failed");
      }
    } catch (err) {
      console.error("Faucet error:", err);
    } finally {
      setFaucetLoading((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  const handleSendTransaction = async (e) => {
    e.preventDefault();
    setTxError("");
    setTxSuccess("");
    setTxLoading(true);

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      setTxError("All fields are required");
      setTxLoading(false);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setTxError("Amount must be a positive number");
      setTxLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccount,
          toAccount: toAccount.trim(),
          amount: numAmount,
          idempotencyKey,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTxSuccess("Transaction completed successfully!");
        setAmount("");
        setToAccount("");
        regenerateKey();
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        setTxError(data.message || "Transaction failed");
      }
    } catch (err) {
      console.error("Transaction error:", err);
      setTxError("Failed to process transaction.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshLoading(true);
    await fetchDashboardData();
    setRefreshLoading(false);
  };

  // Determine if a transaction is a Debit or Credit relative to the current user's accounts
  const getTransactionDirection = (tx) => {
    const userAccountIds = accounts.map((a) => a._id);
    const fromId = tx.fromAccount?._id || tx.fromAccount;
    const toId = tx.toAccount?._id || tx.toAccount;

    const isFromUser = userAccountIds.includes(fromId);
    const isToUser = userAccountIds.includes(toId);

    if (isFromUser && isToUser) {
      return "INTERNAL";
    } else if (isFromUser) {
      return "DEBIT";
    } else if (isToUser) {
      return "CREDIT";
    }
    return "EXTERNAL";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-300">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
          <span className="text-sm font-medium tracking-wider">Connecting to Backend Ledger...</span>
        </div>
      </div>
    );
  }

  // Authentication Layout
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-[#111827]/40 border border-gray-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-500/10 flex items-center justify-center rounded-xl border border-indigo-500/20 text-indigo-400 mb-4">
              <Coins className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Backend Ledger
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Sleek, secure, immutable double-entry ledger database
            </p>
          </div>

          <div className="flex border-b border-gray-800/60 mt-6">
            <button
              onClick={() => { setAuthTab("login"); setAuthError(""); setAuthSuccess(""); }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                authTab === "login"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthTab("register"); setAuthError(""); setAuthSuccess(""); }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                authTab === "register"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl p-3 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          {authTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#1e293b]/30 border border-gray-800/80 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1e293b]/30 border border-gray-800/80 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 mt-2 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" /> Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#1e293b]/30 border border-gray-800/80 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#1e293b]/30 border border-gray-800/80 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password (min. 6 chars)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1e293b]/30 border border-gray-800/80 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 mt-2 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Dashboard Layout
  return (
    <div className="min-h-screen bg-[#070a13] text-gray-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0b0f19]/70 backdrop-blur-md border-b border-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500/10 flex items-center justify-center rounded-lg border border-indigo-500/20 text-indigo-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Backend Ledger</h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">Double Entry Ledger Console</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 bg-[#111827]/40 border border-gray-800/85 px-3 py-1.5 rounded-xl text-xs">
            <User className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-300 font-medium">{user.name}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500 select-all font-mono">{user.email}</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshLoading || dashboardLoading}
            className="p-2 text-gray-500 hover:text-white bg-[#111827]/40 border border-gray-800 rounded-xl hover:bg-gray-800/40 active:scale-95 transition-all"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${refreshLoading || dashboardLoading ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-950/20 hover:bg-red-900/35 border border-red-900/30 hover:border-red-800/40 text-red-400 hover:text-red-300 px-3.5 py-2 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all shadow-md"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Grid: Accounts and Send Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Accounts list (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Your Ledger Accounts</h2>
                <p className="text-xs text-gray-500">Manage statuses, balances, and request test faucet credits.</p>
              </div>
              <button
                onClick={handleCreateAccount}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Create Account
              </button>
            </div>

            {dashboardLoading && accounts.length === 0 ? (
              <div className="bg-[#111827]/40 border border-gray-800 rounded-2xl py-20 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-600" />
                <span className="text-sm text-gray-500 font-medium">Fetching accounts...</span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="bg-[#111827]/20 border border-dashed border-gray-800 rounded-2xl py-16 flex flex-col items-center text-center px-4">
                <div className="w-12 h-12 bg-gray-900 flex items-center justify-center rounded-xl border border-gray-800 text-gray-600 mb-4">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-300">No Accounts Created Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
                  You need a ledger account to send/receive transactions and aggregate balances.
                </p>
                <button
                  onClick={handleCreateAccount}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  Create My First Account
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((acc) => {
                  const balance = balances[acc._id] !== undefined ? balances[acc._id] : 0;
                  const isFaucetActive = faucetLoading[acc._id];
                  const statusColors = {
                    ACTIVE: "bg-green-500/10 border-green-500/20 text-green-400",
                    FROZEN: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
                    CLOSED: "bg-red-500/10 border-red-500/20 text-red-400"
                  };

                  return (
                    <div 
                      key={acc._id} 
                      className={`bg-[#111827]/45 border ${
                        acc.status === "ACTIVE" 
                          ? "border-gray-800 hover:border-gray-700/80" 
                          : "border-gray-800/40 opacity-70"
                      } p-5 rounded-2xl shadow-md transition-all relative flex flex-col justify-between`}
                    >
                      <div>
                        {/* Account Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                            statusColors[acc.status]
                          }`}>
                            {acc.status}
                          </span>
                          
                          {/* Status changer buttons */}
                          <div className="flex items-center gap-1 bg-[#0d131f] border border-gray-800 p-0.5 rounded-lg">
                            <button
                              onClick={() => handleStatusChange(acc._id, "ACTIVE")}
                              className={`p-1 rounded text-[10px] ${
                                acc.status === "ACTIVE" 
                                  ? "bg-indigo-600 text-white" 
                                  : "text-gray-500 hover:text-gray-300"
                              }`}
                              title="Activate Account"
                            >
                              <Unlock className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(acc._id, "FROZEN")}
                              className={`p-1 rounded text-[10px] ${
                                acc.status === "FROZEN" 
                                  ? "bg-yellow-600 text-white" 
                                  : "text-gray-500 hover:text-gray-300"
                              }`}
                              title="Freeze Account"
                            >
                              <Shield className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(acc._id, "CLOSED")}
                              className={`p-1 rounded text-[10px] ${
                                acc.status === "CLOSED" 
                                  ? "bg-red-900/60 text-white" 
                                  : "text-gray-500 hover:text-gray-300"
                              }`}
                              title="Close Account"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Account ID / Copy */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase">Account ID</span>
                          <div 
                            className="font-mono text-xs text-indigo-300 select-all cursor-pointer hover:text-indigo-200 break-all bg-[#0b0f19]/80 border border-gray-800/80 px-2 py-1.5 rounded-lg flex items-center justify-between"
                            title="Click to copy account ID"
                            onClick={() => {
                              navigator.clipboard.writeText(acc._id);
                              alert("Account ID copied to clipboard!");
                            }}
                          >
                            <span className="truncate">{acc._id}</span>
                            <span className="text-[8px] bg-gray-800 text-gray-400 border border-gray-700 px-1 py-0.5 rounded font-sans select-none shrink-0 ml-2">COPY</span>
                          </div>
                        </div>
                      </div>

                      {/* Balance & Faucet */}
                      <div className="mt-6 pt-4 border-t border-gray-800/40 flex items-end justify-between">
                        <div>
                          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Available Balance</span>
                          <span className="text-2xl font-black text-white font-mono tracking-tight">
                            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-xs text-gray-400 font-medium font-sans ml-1">{acc.currency || "INR"}</span>
                          </span>
                        </div>

                        {acc.status === "ACTIVE" && (
                          <button
                            onClick={() => handleFaucet(acc._id)}
                            disabled={isFaucetActive}
                            className="flex items-center gap-1 text-[11px] font-bold bg-[#1e293b]/60 border border-gray-800 text-indigo-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 px-3 py-1.5 rounded-xl active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Coins className={`w-3.5 h-3.5 ${isFaucetActive ? "animate-bounce" : ""}`} />
                            <span>{isFaucetActive ? "Adding..." : "+10k Faucet"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transfer Form (Right 1 col) */}
          <div className="bg-[#111827]/40 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                  <Send className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-base font-bold text-white">Transfer Funds</h2>
              </div>
              <p className="text-xs text-gray-500 mb-5">Perform double-entry ledger transfers instantly between active accounts.</p>

              {txError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-start gap-2.5 mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{txError}</span>
                </div>
              )}

              {txSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl p-3 flex items-start gap-2.5 mb-4">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{txSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSendTransaction} className="space-y-4">
                {/* From Account */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Source Account</label>
                  <select
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gray-800 focus:border-indigo-500/40 text-xs text-white rounded-xl py-2.5 px-3 outline-none"
                  >
                    <option value="" disabled>Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc._id.slice(-8)} ({acc.status}) - Balance: {balances[acc._id]?.toLocaleString() || 0} INR
                      </option>
                    ))}
                  </select>
                </div>

                {/* To Account */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Recipient Account ID</label>
                  <input
                    type="text"
                    required
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    placeholder="paste 24-character mongodb ID"
                    className="w-full bg-[#0b0f19] border border-gray-800 focus:border-indigo-500/40 font-mono text-xs text-white rounded-xl py-2.5 px-3 outline-none placeholder:text-gray-700"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Transfer Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs font-semibold">INR</span>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#0b0f19] border border-gray-800 focus:border-indigo-500/40 font-mono text-xs text-white rounded-xl py-2.5 pl-10 pr-3 outline-none"
                    />
                  </div>
                </div>

                {/* Idempotency Key */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Idempotency Key</label>
                    <button
                      type="button"
                      onClick={regenerateKey}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={idempotencyKey}
                    onChange={(e) => setIdempotencyKey(e.target.value)}
                    placeholder="tx-idempotency-key"
                    className="w-full bg-[#0b0f19] border border-gray-800/80 focus:border-indigo-500/40 font-mono text-xs text-gray-500 rounded-xl py-2.5 px-3 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={txLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:scale-100 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/10 mt-2 flex items-center justify-center gap-2"
                >
                  {txLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{txLoading ? "Processing Transfer..." : "Execute Transfer"}</span>
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Transaction History Section */}
        <div className="bg-[#111827]/40 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                  <History className="w-4.5 h-4.5" />
                </div>
                <h2 className="text-base font-bold text-white">Double-Entry Transaction History</h2>
              </div>
              <p className="text-xs text-gray-500">Immutable ledger entries demonstrating balance movement and status audits.</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Filter:</label>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="bg-[#0b0f19] border border-gray-800 text-xs text-white rounded-xl py-2 px-3 outline-none"
              >
                <option value="all">All Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    Account: ...{acc._id.slice(-8)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          {transactions.length === 0 ? (
            <div className="border border-dashed border-gray-800 rounded-2xl py-12 flex flex-col items-center justify-center text-center">
              <History className="w-8 h-8 text-gray-700 mb-3" />
              <h4 className="text-xs font-semibold text-gray-400">No Transaction History</h4>
              <p className="text-[11px] text-gray-600 mt-0.5">Use the Faucet to load funds or execute transfers to see records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-900 rounded-xl bg-[#0b0f19]/30">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0b0f19]/90 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-900">
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">From Account</th>
                    <th className="py-3 px-4">To Account</th>
                    <th className="py-3 px-4">Flow</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60 font-medium">
                  {transactions.map((tx) => {
                    const direction = getTransactionDirection(tx);
                    const isDebit = direction === "DEBIT";
                    const isCredit = direction === "CREDIT";
                    const isInternal = direction === "INTERNAL";

                    // Display details
                    const fromAccText = tx.fromAccount?.user?.name 
                      ? `${tx.fromAccount.user.name} (...${tx.fromAccount._id.slice(-6)})`
                      : `...${(tx.fromAccount?._id || tx.fromAccount || "").slice(-8)}`;

                    const toAccText = tx.toAccount?.user?.name 
                      ? `${tx.toAccount.user.name} (...${tx.toAccount._id.slice(-6)})`
                      : `...${(tx.toAccount?._id || tx.toAccount || "").slice(-8)}`;

                    const txDate = new Date(tx.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });

                    const statusColors = {
                      PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                      COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
                      FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
                      REVERSED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
                    };

                    return (
                      <tr key={tx._id} className="hover:bg-gray-900/10 text-gray-300">
                        {/* Date */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                          {txDate}
                        </td>
                        
                        {/* Transaction ID & Key */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-gray-400 select-all truncate max-w-[150px]">
                              {tx._id}
                            </span>
                            <span className="text-[9px] text-gray-600 font-sans tracking-tight truncate max-w-[180px]" title={tx.idempotencyKey}>
                              IK: {tx.idempotencyKey}
                            </span>
                          </div>
                        </td>

                        {/* From Account */}
                        <td className="py-3.5 px-4 font-mono text-gray-400 whitespace-nowrap">
                          {fromAccText}
                        </td>

                        {/* To Account */}
                        <td className="py-3.5 px-4 font-mono text-gray-400 whitespace-nowrap">
                          {toAccText}
                        </td>

                        {/* Flow Badge */}
                        <td className="py-3.5 px-4">
                          {isDebit && (
                            <span className="text-[9px] font-bold text-red-400 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded">
                              DEBIT
                            </span>
                          )}
                          {isCredit && (
                            <span className="text-[9px] font-bold text-green-400 bg-green-950/20 border border-green-900/30 px-2 py-0.5 rounded">
                              CREDIT
                            </span>
                          )}
                          {isInternal && (
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/20 border border-indigo-900/30 px-2 py-0.5 rounded font-sans">
                              INTERNAL
                            </span>
                          )}
                          {direction === "EXTERNAL" && (
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-850 border border-gray-800 px-2 py-0.5 rounded">
                              EXTERNAL
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className={`py-3.5 px-4 text-right font-bold font-mono text-xs whitespace-nowrap ${
                          isDebit ? "text-red-400" : isCredit ? "text-green-400" : "text-white"
                        }`}>
                          {isDebit ? "-" : isCredit ? "+" : ""}
                          {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                            statusColors[tx.status] || "bg-gray-800"
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

      </main>
    </div>
  );
}

export default App;
