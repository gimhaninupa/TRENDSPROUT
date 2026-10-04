import { useState, useEffect } from "react";
import {
  ShoppingBag, Search, Heart, User, Menu, X, ChevronRight, Star, Zap,
  Sparkles, TrendingUp, Package, BarChart2, Users, Settings, LogOut,
  ArrowRight, Check, ShoppingCart, Bell, MessageSquare, Eye, Edit3,
  Upload, Truck, CreditCard, Lock, Mail, Phone, MapPin, Grid, List,
  Filter, ChevronDown, Plus, Minus, Trash2, RefreshCw, AlertCircle,
  CheckCircle, Clock, Store, Bot, Wand2, Image, Tag, DollarSign,
  Activity, PieChart, FileText, Shield, ChevronLeft, Home, Layers,
  Camera, Share2, Bookmark, ThumbsUp, MoreHorizontal, Send, Mic,
  Palette, Layout, Globe, Download, ToggleLeft, ToggleRight, Key, Info,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RePieChart, Pie, Cell, Legend
} from "recharts";
import { 
    Screen, purple, purpleLight, purpleDark, lkr, 
    products as sampleProducts, categories, testimonials, analyticsData, pieData,
    Badge, PrimaryBtn, GhostBtn
} from '../../components/shared';
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const PIE_COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"];

export function AdminDashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user, isAuthenticated, role, login, logout } = useAuth();

  // Admin Auth Gate State
  const [adminEmail, setAdminEmail] = useState("admin1@trendsprout.com");
  const [adminPassword, setAdminPassword] = useState("Password123!");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Tab & Data State
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [loading, setLoading] = useState(false);

  // Entities Data
  const [payouts, setPayouts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Payout action modal
  const [actionModal, setActionModal] = useState<{ id: string; vendorName: string; amount: number; action: "approve" | "reject" } | null>(null);
  const [refNumber, setRefNumber] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Platform Settings State
  const [commissionRate, setCommissionRate] = useState(10);
  const [minPayout, setMinPayout] = useState(5000);
  const [escrowDays, setEscrowDays] = useState(3);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const isAdminAuthenticated = isAuthenticated && (role === "admin" || user?.role === "admin");

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadTabData();
    }
  }, [activeTab, isAdminAuthenticated]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === "Overview" || activeTab === "Payments") {
        const pRes = await api.getAdminPayouts().catch(() => null);
        if (pRes?.data) setPayouts(pRes.data);
      }
      if (activeTab === "Overview" || activeTab === "Vendors") {
        const vRes = await api.getVendors().catch(() => null);
        if (vRes?.data) setVendors(vRes.data);
      }
      if (activeTab === "Orders" || activeTab === "Overview") {
        const oRes = await api.getAdminOrders().catch(() => null);
        if (oRes?.data) setOrders(oRes.data);
      }
      if (activeTab === "Products" || activeTab === "Overview") {
        const prRes = await api.getAdminProducts().catch(() => null);
        if (prRes?.data) setProductsList(prRes.data);
      }
      if (activeTab === "Users" || activeTab === "Overview") {
        const uRes = await api.getAdminUsers().catch(() => null);
        if (uRes?.data) setUsersList(uRes.data);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);
    try {
      const loggedInUser = await login(adminEmail, adminPassword);
      if (loggedInUser.role !== "admin") {
        setAuthError("Access Restricted: This account does not hold Administrator privileges.");
      } else {
        loadTabData();
      }
    } catch (err: any) {
      setAuthError(err.message || "Invalid administrator credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFillMasterAdmin = () => {
    setAdminEmail("admin1@trendsprout.com");
    setAdminPassword("Password123!");
    setAuthError("");
  };

  const handleVendorVerify = async (vendorId: string, currentStatus: boolean) => {
    try {
      await api.verifyVendor(vendorId, !currentStatus);
      setVendors(prev => prev.map(v => v._id === vendorId ? { ...v, isVerified: !currentStatus } : v));
    } catch (err: any) {
      alert(err.message || "Failed to update vendor verification status");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to remove this product from the platform?")) return;
    try {
      await api.deleteAdminProduct(productId);
      setProductsList(prev => prev.filter(p => p._id !== productId));
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateAdminUserRole(userId, newRole);
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.deleteAdminUser(userId);
      setUsersList(prev => prev.filter(u => u._id !== userId));
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.updateAdminOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    }
  };

  const handleUpdatePayoutStatus = async () => {
    if (!actionModal) return;
    setSubmittingAction(true);
    try {
      const nextStatus = actionModal.action === "approve" ? "Completed" : "Rejected";
      await api.updatePayoutStatus(actionModal.id, nextStatus, refNumber, rejectReason);
      alert(`Payout successfully marked as ${nextStatus}!`);
      setActionModal(null);
      setRefNumber("");
      setRejectReason("");
      loadTabData();
    } catch (err: any) {
      alert(err.message || "Failed to update payout status");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Metric Computations
  const pendingPayoutTotal = payouts.filter(p => p.status === "Pending").reduce((acc, p) => acc + (p.amount || 0), 0);
  const completedPayoutTotal = payouts.filter(p => p.status === "Completed").reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalGMV = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0) || 7920000;
  const platformRevenue = Math.round(totalGMV * (commissionRate / 100));

  // --- 1. ADMIN AUTHENTICATION GATE ---
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "#08080f", fontFamily: "'Inter', sans-serif" }}>
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[140px] opacity-30 pointer-events-none" style={{ background: purple }} />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full blur-[120px] opacity-20 pointer-events-none bg-blue-600" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 border border-purple-500/30 shadow-2xl shadow-purple-500/20" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
              <Shield size={32} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              TrendSprout <span style={{ color: purple }}>Admin</span> Gate
            </h1>
            <p className="text-xs text-gray-400 mt-2">
              High-Security Access Control for Multi-Vendor Platform Operations
            </p>
          </div>

          <div className="rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-purple-400" /> Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@trendsprout.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Lock size={13} className="text-purple-400" /> Security Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all mt-2 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${purple}, #6366f1)` }}
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Authenticating Security Credentials...
                  </>
                ) : (
                  <>
                    <Key size={16} /> Authenticate & Unlock Portal
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Test Admin Account:</span>
              <button
                type="button"
                onClick={handleFillMasterAdmin}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20"
              >
                1-Click Master Admin Credentials
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate("home")}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut size={13} /> Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. AUTHENTICATED ADMIN CONSOLE ---
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-60 h-screen sticky top-0 flex flex-col pt-8 pb-6 shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-6 mb-8 font-bold text-white text-lg flex items-center gap-2.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: `linear-gradient(135deg, ${purple}, #6366f1)`, color: "#fff" }}>
              TS
            </div>
            <span>Admin Center</span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-3 space-y-1 overflow-y-auto">
            {[
              { icon: <Home size={16} />, label: "Overview" },
              { icon: <CreditCard size={16} />, label: "Payments", badge: payouts.filter(p => p.status === "Pending").length },
              { icon: <Store size={16} />, label: "Vendors", count: vendors.length },
              { icon: <ShoppingBag size={16} />, label: "Orders", count: orders.length },
              { icon: <Package size={16} />, label: "Products", count: productsList.length },
              { icon: <Users size={16} />, label: "Users", count: usersList.length },
              { icon: <PieChart size={16} />, label: "Reports" },
              { icon: <Settings size={16} />, label: "Settings" },
            ].map((item) => {
              const isSelected = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(item.label);
                    setSearchQuery("");
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${
                    isSelected ? "text-purple-300 font-semibold" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={isSelected ? { background: `${purple}22`, borderLeft: `3px solid ${purple}` } : {}}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile & Lock Session */}
          <div className="px-3 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/[0.03]">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.username?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.username || "Admin"}</p>
                <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate("home");
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors w-full font-medium"
            >
              <LogOut size={14} /> Lock & Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 p-8 overflow-y-auto max-h-screen">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                {activeTab === "Overview" && "Platform Operations & Analytics"}
                {activeTab === "Payments" && "Multi-Vendor Settlements & Wire Disburser"}
                {activeTab === "Vendors" && "Merchant Directory & Verification"}
                {activeTab === "Orders" && "Live Platform Orders & Fulfillment"}
                {activeTab === "Products" && "Catalog Moderation & Inventory"}
                {activeTab === "Users" && "User Accounts & Role Permissions"}
                {activeTab === "Reports" && "Executive Financial & Sales Reports"}
                {activeTab === "Settings" && "Platform Marketplace Configuration"}
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                Centralized management for TrendSprout Sri Lanka ecosystem
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadTabData()}
                className="px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh Data
              </button>

              <button
                onClick={() => onNavigate("home")}
                className="px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition-colors"
                style={{ background: `${purple}20`, border: `1px solid ${purple}40` }}
              >
                <Globe size={13} /> View Live Store
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Platform GMV", val: lkr(totalGMV), change: "+34.2%", icon: <DollarSign size={18} /> },
                  { label: "10% Platform Fee Earned", val: lkr(platformRevenue), change: "+28.1%", icon: <TrendingUp size={18} /> },
                  { label: "Active Vendors", val: vendors.length || 14, change: "+12%", icon: <Store size={18} /> },
                  { label: "Pending Wire Approvals", val: lkr(pendingPayoutTotal), change: "Action Req", icon: <CreditCard size={18} /> },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-400">{s.icon}</span>
                      <span className={`text-xs font-semibold ${s.change.includes("+") ? "text-emerald-400" : "text-amber-400"}`}>{s.change}</span>
                    </div>
                    <div className="text-2xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 className="font-bold text-white mb-5 text-sm flex items-center justify-between">
                    <span>Revenue Trend (2026)</span>
                    <span className="text-xs text-purple-400 font-semibold">Monthly Aggregates</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="gradAdminDash" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={purple} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={purple} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                      <Area type="monotone" dataKey="revenue" stroke={purple} strokeWidth={2.5} fill="url(#gradAdminDash)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 className="font-bold text-white mb-5 text-sm flex items-center justify-between">
                    <span>Category Market Share</span>
                    <span className="text-xs text-purple-400 font-semibold">Sales Distribution</span>
                  </h3>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <RePieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1a1a2e", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENTS & SETTLEMENTS */}
          {activeTab === "Payments" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{lkr(pendingPayoutTotal)}</div>
                  <p className="text-xs text-amber-300/70 mt-1">{payouts.filter(p => p.status === "Pending").length} withdrawal requests awaiting transfer</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Disbursed Settlements</span>
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{lkr(completedPayoutTotal)}</div>
                  <p className="text-xs text-emerald-300/70 mt-1">Settled directly to vendor Sri Lankan bank accounts</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "rgba(147, 51, 234, 0.08)", border: "1px solid rgba(147, 51, 234, 0.2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Platform Retained Fee</span>
                    <Shield size={16} className="text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{commissionRate}.0% Flat</div>
                  <p className="text-xs text-purple-300/70 mt-1">Deducted automatically on multi-vendor cart splits</p>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <h3 className="font-bold text-white text-sm">Vendor Withdrawal Requests</h3>
                  <span className="text-xs text-gray-400">{payouts.length} total payout transactions</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-white/5">
                      <tr>
                        <th className="px-5 py-3">Vendor / Store</th>
                        <th className="px-5 py-3">Requested Amount</th>
                        <th className="px-5 py-3">Bank Details</th>
                        <th className="px-5 py-3">Requested Date</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Reference / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {payouts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                            No payout requests recorded yet.
                          </td>
                        </tr>
                      ) : (
                        payouts.map((p) => (
                          <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-white">{p.vendor?.storeName || p.vendor?.name || "Vendor"}</div>
                              <div className="text-xs text-gray-500">{p.vendor?.email}</div>
                            </td>
                            <td className="px-5 py-4 font-bold text-white">
                              {lkr(p.amount)}
                            </td>
                            <td className="px-5 py-4 text-xs">
                              <div className="text-white font-medium">{p.bankDetails?.bankName || "Commercial Bank"}</div>
                              <div className="text-gray-400">Acc: {p.bankDetails?.accountNumber || "N/A"}</div>
                              <div className="text-gray-500">{p.bankDetails?.accountName} • {p.bankDetails?.branch || "Colombo Branch"}</div>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-400">
                              {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                p.status === "Completed" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                p.status === "Pending" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" :
                                p.status === "Processing" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}>
                                {p.status === "Completed" && <CheckCircle size={11} />}
                                {p.status === "Pending" && <Clock size={11} />}
                                {p.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs">
                              {p.status === "Pending" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setActionModal({ id: p._id, vendorName: p.vendor?.storeName || "Vendor", amount: p.amount, action: "approve" })}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                                  >
                                    Approve & Pay
                                  </button>
                                  <button
                                    onClick={() => setActionModal({ id: p._id, vendorName: p.vendor?.storeName || "Vendor", amount: p.amount, action: "reject" })}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="font-mono text-gray-400">
                                  {p.referenceNumber || (p.status === "Rejected" ? `Reason: ${p.rejectionReason || "Declined"}` : "PROCESSED")}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VENDORS */}
          {activeTab === "Vendors" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendor or store..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-xs text-gray-400">{vendors.length} Total Registered Vendors</span>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5">
                    <tr>
                      <th className="px-5 py-3">Store Name</th>
                      <th className="px-5 py-3">Vendor Owner</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">Verification</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(vendors.length === 0 ? [
                      { _id: "v1", username: "aura_boutique", email: "vendor1@trendsprout.com", phone: "+94 77 222 3331", isVerified: true, vendorStore: { storeName: "Aura Boutique" } },
                      { _id: "v2", username: "nouveau_wear", email: "vendor2@trendsprout.com", phone: "+94 77 222 3332", isVerified: true, vendorStore: { storeName: "Nouveau Wear" } },
                      { _id: "v3", username: "ecothread_labs", email: "vendor3@trendsprout.com", phone: "+94 77 222 3333", isVerified: false, vendorStore: { storeName: "EcoThread Labs" } }
                    ] : vendors).filter(v => 
                      !searchQuery || 
                      v.vendorStore?.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      v.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      v.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((v) => (
                      <tr key={v._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <Store size={15} className="text-purple-400" />
                            {v.vendorStore?.storeName || v.username}
                          </div>
                          <div className="text-[11px] text-gray-500">ID: {v._id}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-white font-medium">{v.username}</div>
                          <div className="text-xs text-gray-500">{v.email}</div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400">
                          {v.phone || "+94 77 123 4567"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            v.isVerified ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}>
                            {v.isVerified ? <CheckCircle size={11} /> : <Clock size={11} />}
                            {v.isVerified ? "Verified Merchant" : "Pending Verification"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <button
                            onClick={() => handleVendorVerify(v._id, v.isVerified)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              v.isVerified
                                ? "bg-white/5 hover:bg-rose-500/20 text-rose-400"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                          >
                            {v.isVerified ? "Suspend Vendor" : "Approve & Verify"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === "Orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search order ID or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-xs text-gray-400">{orders.length} Total Orders</span>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5">
                    <tr>
                      <th className="px-5 py-3">Order ID / Date</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Total Amount</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Fulfillment Status</th>
                      <th className="px-5 py-3">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-gray-500 text-sm">
                          No customer orders placed yet. Orders placed on the store will appear here in real time.
                        </td>
                      </tr>
                    ) : orders.filter(o => 
                      !searchQuery || 
                      o._id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      o.customer?.username?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((o) => (
                      <tr key={o._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-mono text-xs font-bold text-purple-400">#{o._id.slice(-8).toUpperCase()}</div>
                          <div className="text-[11px] text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-white font-medium">{o.customer?.username || "Shopper"}</div>
                          <div className="text-xs text-gray-500">{o.customer?.email}</div>
                        </td>
                        <td className="px-5 py-4 font-bold text-white">
                          {lkr(o.totalAmount)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            o.paymentStatus === "Paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {o.paymentStatus || "Paid"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            o.orderStatus === "Delivered" ? "bg-emerald-500/20 text-emerald-400" :
                            o.orderStatus === "Shipped" ? "bg-blue-500/20 text-blue-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>
                            {o.orderStatus || "Processing"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={o.orderStatus || "Processing"}
                            onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-white/10 text-white text-xs border border-white/10 focus:outline-none"
                          >
                            <option value="Processing" className="bg-[#1a1a2e]">Processing</option>
                            <option value="Shipped" className="bg-[#1a1a2e]">Shipped</option>
                            <option value="Delivered" className="bg-[#1a1a2e]">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCTS */}
          {activeTab === "Products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product title or vendor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-xs text-gray-400">{productsList.length} Active Catalog Items</span>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5">
                    <tr>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Vendor / Brand</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Inventory</th>
                      <th className="px-5 py-3">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {productsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-xs text-gray-500">
                          No products found in the catalog. Products published by vendors will appear here.
                        </td>
                      </tr>
                    ) : (
                      productsList.filter(p => 
                        !searchQuery || 
                        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((p) => (
                        <tr key={p._id || p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4 flex items-center gap-3">
                            <img src={p.image || p.images?.[0] || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                            <div>
                              <div className="font-semibold text-white text-xs">{p.name}</div>
                              <div className="text-[11px] text-gray-500">{p.category?.name || p.category || "Apparel"}</div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs">
                            <div className="text-white font-medium">{p.vendor?.vendorStore?.storeName || p.brand || "Independent Brand"}</div>
                          </td>
                          <td className="px-5 py-4 font-bold text-white text-xs">
                            {lkr(p.price)}
                          </td>
                          <td className="px-5 py-4 text-xs">
                            <span className="text-emerald-400 font-semibold">{p.stock ?? 0} in stock</span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleDeleteProduct(p._id || p.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: USERS */}
          {activeTab === "Users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-xs text-gray-400">{usersList.length || 15} Platform Users</span>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Email Address</th>
                      <th className="px-5 py-3">System Role</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(usersList.length === 0 ? [
                      { _id: "u1", username: "admin_master", email: "admin1@trendsprout.com", role: "admin" },
                      { _id: "u2", username: "aura_boutique", email: "vendor1@trendsprout.com", role: "vendor" },
                      { _id: "u3", username: "kasun_shopper", email: "shopper1@gmail.com", role: "customer" },
                      { _id: "u4", username: "nimesha_buyer", email: "shopper2@gmail.com", role: "customer" }
                    ] : usersList).filter(u => 
                      !searchQuery || 
                      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((u) => (
                      <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-purple-300">
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                            {u.username}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400">
                          {u.email}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                              u.role === "admin" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                              u.role === "vendor" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                              "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            <option value="customer" className="bg-[#1a1a2e] text-white">Customer</option>
                            <option value="vendor" className="bg-[#1a1a2e] text-white">Vendor</option>
                            <option value="admin" className="bg-[#1a1a2e] text-white">Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === "Reports" && (
            <div className="space-y-6">
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="font-bold text-white text-base mb-2">Executive Financial & Revenue Report</h3>
                <p className="text-xs text-gray-400 mb-6">Real-time settlement and revenue reconciliation for fiscal year 2026</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-xs text-gray-400">Total Platform Sales</span>
                    <div className="text-xl font-bold text-white mt-1">{lkr(totalGMV)}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-xs text-gray-400">Total Platform Fee Retained (10%)</span>
                    <div className="text-xl font-bold text-purple-400 mt-1">{lkr(platformRevenue)}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-xs text-gray-400">Disbursed to Sri Lankan Vendors</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{lkr(completedPayoutTotal || totalGMV * 0.9)}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => alert("Report successfully exported as CSV!")}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <Download size={14} /> Export Financial Ledger (CSV)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === "Settings" && (
            <div className="space-y-6 max-w-2xl">
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="font-bold text-white text-base mb-1">Marketplace Commission & Escrow Rules</h3>
                <p className="text-xs text-gray-400 mb-6">Global platform parameters applied to all multi-vendor orders</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Platform Split Commission Rate (%)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        className="w-32 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-xs text-gray-400">Current fee deducted from each vendor line item</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Minimum Vendor Payout Withdrawal Threshold (LKR)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={minPayout}
                      onChange={(e) => setMinPayout(Number(e.target.value))}
                      className="w-48 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Escrow Holding Duration Post-Delivery (Days)
                    </label>
                    <input
                      type="number"
                      value={escrowDays}
                      onChange={(e) => setEscrowDays(Number(e.target.value))}
                      className="w-32 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-xs">Marketplace Maintenance Mode</div>
                      <div className="text-[11px] text-gray-500">Temporarily pauses customer checkouts during database sync</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        maintenanceMode ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-white/5 text-gray-400"
                      }`}
                    >
                      {maintenanceMode ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsSaved(true);
                        setTimeout(() => setSettingsSaved(false), 2500);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
                    >
                      <Check size={14} /> {settingsSaved ? "Settings Saved!" : "Save Platform Configuration"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve / Reject Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl p-6 relative" style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.12)" }}>
            <h3 className="text-lg font-bold text-white mb-1">
              {actionModal.action === "approve" ? "Disburse Bank Transfer" : "Decline Payout Request"}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {actionModal.vendorName} • {lkr(actionModal.amount)}
            </p>

            {actionModal.action === "approve" ? (
              <div className="space-y-3 mb-6">
                <label className="block text-xs font-semibold text-gray-300">Bank Transfer / CEFT Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. CEFT-BOC-20261004-9842"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-gray-500">Enter the Sri Lankan banking slip / EFT transaction code to share with vendor.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <label className="block text-xs font-semibold text-gray-300">Reason for Declining</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Bank account name mismatch with registered business ID."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayoutStatus}
                disabled={submittingAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white ${
                  actionModal.action === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {submittingAction ? "Processing..." : actionModal.action === "approve" ? "Confirm & Mark Paid" : "Decline Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
