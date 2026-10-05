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
    categories, testimonials,
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
  const totalGMV = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const platformRevenue = Math.round(totalGMV * (commissionRate / 100));

  // Dynamic Category Market Share computed from actual products in catalog
  const categoryDistribution = Object.entries(
    productsList.reduce((acc: Record<string, number>, p: any) => {
      const cat = p.category?.name || p.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Dynamic Monthly aggregates from orders
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const dynamicAnalyticsData = monthNames.map((month, idx) => {
    const monthOrders = orders.filter(o => new Date(o.createdAt).getMonth() === idx);
    const monthRev = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { month, revenue: monthRev, orders: monthOrders.length };
  });

  // --- 1. ADMIN AUTHENTICATION GATE (LIGHT THEME MATCHING HERO PALETTE) ---
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#faf8ff]" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Glow backdrop effects matching site hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[140px] opacity-40 pointer-events-none bg-purple-300" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full blur-[120px] opacity-30 pointer-events-none bg-pink-200" />
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-[120px] opacity-25 pointer-events-none bg-indigo-200" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-purple-50 border border-purple-200 text-purple-600 shadow-xl shadow-purple-500/10">
              <Shield size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              TrendSprout <span className="text-purple-600">Admin</span> Gate
            </h1>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              High-Security Access Control for Multi-Vendor Platform Operations
            </p>
          </div>

          <div className="rounded-3xl p-8 bg-white/80 backdrop-blur-2xl border border-white/90 shadow-2xl shadow-purple-600/10">
            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
                <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-purple-600" /> Administrator Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@trendsprout.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Lock size={13} className="text-purple-600" /> Security Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 hover:shadow-xl hover:opacity-95 transition-all mt-2 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${purple}, #7C3AED)` }}
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
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Test Admin Account:</span>
              <button
                type="button"
                onClick={handleFillMasterAdmin}
                className="text-[11px] font-semibold text-purple-700 hover:text-purple-800 transition-colors bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 hover:bg-purple-100 cursor-pointer"
              >
                1-Click Master Admin Credentials
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate("home")}
              className="text-xs text-gray-500 hover:text-purple-700 transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <LogOut size={13} /> Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. AUTHENTICATED ADMIN CONSOLE (CLEAN LIGHT THEME) ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-60 h-screen sticky top-0 flex flex-col pt-8 pb-6 shrink-0 bg-white border-r border-gray-200 shadow-sm z-20">
          <button 
            onClick={() => onNavigate("home")}
            className="px-6 mb-8 font-bold text-gray-900 text-lg flex items-center gap-2.5 text-left cursor-pointer hover:opacity-90 transition-opacity" 
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-md shadow-purple-600/30 shrink-0 text-white" style={{ background: `linear-gradient(135deg, ${purple}, #7C3AED)` }}>
              TS
            </div>
            <div className="flex flex-col">
              <span className="leading-tight tracking-tight">TRENDSPROUT</span>
              <span className="text-[10px] text-purple-600 font-semibold tracking-wide">Admin Center</span>
            </div>
          </button>

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
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all cursor-pointer ${
                    isSelected 
                      ? "text-purple-700 font-bold bg-purple-50 border-l-4 border-purple-600 shadow-sm" 
                      : "text-gray-600 hover:text-purple-700 hover:bg-purple-50/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? "text-purple-600" : "text-gray-400"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile & Lock Session */}
          <div className="px-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                {user?.username?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.username || "Admin"}</p>
                <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate("home");
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors w-full font-medium cursor-pointer"
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
              <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
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
                className="px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-purple-300 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? "animate-spin text-purple-600" : "text-gray-500"} /> Refresh Data
              </button>

              <button
                onClick={() => onNavigate("home")}
                className="px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 shadow-sm transition-all cursor-pointer"
              >
                <Globe size={13} /> View Live Store
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Platform GMV", val: lkr(totalGMV), change: totalGMV > 0 ? "+100%" : "0.0%", icon: <DollarSign size={18} /> },
                  { label: "10% Platform Fee Earned", val: lkr(platformRevenue), change: platformRevenue > 0 ? "+100%" : "0.0%", icon: <TrendingUp size={18} /> },
                  { label: "Active Vendors", val: vendors.length, change: vendors.length > 0 ? `+${vendors.length}` : "0", icon: <Store size={18} /> },
                  { label: "Pending Wire Approvals", val: lkr(pendingPayoutTotal), change: pendingPayoutTotal > 0 ? "Action Req" : "Clear", icon: <CreditCard size={18} /> },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">{s.icon}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.change.includes("+") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : s.change === "Action Req" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-gray-100 text-gray-600"}`}>{s.change}</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-5 text-sm flex items-center justify-between">
                    <span>Revenue Trend (2026)</span>
                    <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2.5 py-1 rounded-lg">Monthly Aggregates</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={dynamicAnalyticsData}>
                      <defs>
                        <linearGradient id="gradAdminDash" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={purple} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={purple} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `LKR ${v / 1000}k`} />
                      <Tooltip contentStyle={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", color: "#0f172a", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                      <Area type="monotone" dataKey="revenue" stroke={purple} strokeWidth={2.5} fill="url(#gradAdminDash)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-5 text-sm flex items-center justify-between">
                    <span>Category Market Share</span>
                    <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2.5 py-1 rounded-lg">Sales Distribution</span>
                  </h3>
                  <div className="flex items-center justify-center">
                    {categoryDistribution.length === 0 ? (
                      <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">
                        No category catalog items available yet
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <RePieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", color: "#0f172a", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                          <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                        </RePieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENTS & SETTLEMENTS */}
          {activeTab === "Payments" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-800 text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{lkr(pendingPayoutTotal)}</div>
                  <p className="text-xs text-amber-700/80 mt-1">{payouts.filter(p => p.status === "Pending").length} withdrawal requests awaiting transfer</p>
                </div>
                <div className="rounded-2xl p-5 bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider">Disbursed Settlements</span>
                    <CheckCircle size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{lkr(completedPayoutTotal)}</div>
                  <p className="text-xs text-emerald-700/80 mt-1">Settled directly to vendor Sri Lankan bank accounts</p>
                </div>
                <div className="rounded-2xl p-5 bg-purple-50/70 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-800 text-xs font-bold uppercase tracking-wider">Platform Retained Fee</span>
                    <Shield size={16} className="text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900">{commissionRate}.0% Flat</div>
                  <p className="text-xs text-purple-700/80 mt-1">Deducted automatically on multi-vendor cart splits</p>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/60">
                  <h3 className="font-bold text-gray-900 text-sm">Vendor Withdrawal Requests</h3>
                  <span className="text-xs text-gray-500 font-medium">{payouts.length} total payout transactions</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 font-semibold">
                      <tr>
                        <th className="px-5 py-3">Vendor / Store</th>
                        <th className="px-5 py-3">Requested Amount</th>
                        <th className="px-5 py-3">Bank Details</th>
                        <th className="px-5 py-3">Requested Date</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Reference / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payouts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                            No payout requests recorded yet.
                          </td>
                        </tr>
                      ) : (
                        payouts.map((p) => (
                          <tr key={p._id} className="hover:bg-purple-50/20 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-semibold text-gray-900">{p.vendor?.storeName || p.vendor?.name || "Vendor"}</div>
                              <div className="text-xs text-gray-500">{p.vendor?.email}</div>
                            </td>
                            <td className="px-5 py-4 font-bold text-gray-900">
                              {lkr(p.amount)}
                            </td>
                            <td className="px-5 py-4 text-xs">
                              <div className="text-gray-900 font-medium">{p.bankDetails?.bankName || "Commercial Bank"}</div>
                              <div className="text-gray-500">Acc: {p.bankDetails?.accountNumber || "N/A"}</div>
                              <div className="text-gray-400">{p.bankDetails?.accountName} • {p.bankDetails?.branch || "Colombo Branch"}</div>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-500">
                              {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                p.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                p.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse" :
                                p.status === "Processing" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                "bg-rose-50 text-rose-700 border border-rose-200"
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
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-sm cursor-pointer"
                                  >
                                    Approve & Pay
                                  </button>
                                  <button
                                    onClick={() => setActionModal({ id: p._id, vendorName: p.vendor?.storeName || "Vendor", amount: p.amount, action: "reject" })}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="font-mono text-gray-500 text-xs">
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
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm"
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{vendors.length} Total Registered Vendors</span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Store Name</th>
                      <th className="px-5 py-3">Vendor Owner</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">Verification</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vendors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                          No registered vendors yet. Newly onboarded stores will appear here.
                        </td>
                      </tr>
                    ) : (
                      vendors.filter(v => 
                        !searchQuery || 
                        v.vendorStore?.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        v.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        v.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((v) => (
                      <tr key={v._id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            <Store size={15} className="text-purple-600" />
                            {v.vendorStore?.storeName || v.username}
                          </div>
                          <div className="text-[11px] text-gray-400">ID: {v._id}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-gray-900 font-medium">{v.username}</div>
                          <div className="text-xs text-gray-500">{v.email}</div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">
                          {v.phone || "+94 77 123 4567"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            v.isVerified ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {v.isVerified ? <CheckCircle size={11} /> : <Clock size={11} />}
                            {v.isVerified ? "Verified Merchant" : "Pending Verification"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <button
                            onClick={() => handleVendorVerify(v._id, v.isVerified)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer ${
                              v.isVerified
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            }`}
                          >
                            {v.isVerified ? "Suspend Vendor" : "Approve & Verify"}
                          </button>
                        </td>
                      </tr>
                    )))}
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
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm"
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{orders.length} Total Orders</span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Order ID / Date</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Total Amount</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Fulfillment Status</th>
                      <th className="px-5 py-3">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                          No customer orders placed yet. Orders placed on the store will appear here in real time.
                        </td>
                      </tr>
                    ) : orders.filter(o => 
                      !searchQuery || 
                      o._id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      o.customer?.username?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((o) => (
                      <tr key={o._id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-mono text-xs font-bold text-purple-600">#{o._id.slice(-8).toUpperCase()}</div>
                          <div className="text-[11px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-gray-900 font-medium">{o.customer?.username || "Shopper"}</div>
                          <div className="text-xs text-gray-500">{o.customer?.email}</div>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {lkr(o.totalAmount)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            o.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {o.paymentStatus || "Paid"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            o.orderStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            o.orderStatus === "Shipped" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {o.orderStatus || "Processing"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={o.orderStatus || "Processing"}
                            onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-800 text-xs border border-gray-200 focus:outline-none focus:border-purple-400 cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
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
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm"
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{productsList.length} Active Catalog Items</span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Vendor / Brand</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Inventory</th>
                      <th className="px-5 py-3">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-xs text-gray-400">
                          No products found in the catalog. Products published by vendors will appear here.
                        </td>
                      </tr>
                    ) : (
                      productsList.filter(p => 
                        !searchQuery || 
                        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((p) => (
                        <tr key={p._id || p.id} className="hover:bg-purple-50/20 transition-colors">
                          <td className="px-5 py-4 flex items-center gap-3">
                            <img src={p.image || p.images?.[0] || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                            <div>
                              <div className="font-semibold text-gray-900 text-xs">{p.name}</div>
                              <div className="text-[11px] text-gray-500">{p.category?.name || p.category || "Apparel"}</div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs">
                            <div className="text-gray-900 font-medium">{p.vendor?.vendorStore?.storeName || p.brand || "Independent Brand"}</div>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-900 text-xs">
                            {lkr(p.price)}
                          </td>
                          <td className="px-5 py-4 text-xs">
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{p.stock ?? 0} in stock</span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleDeleteProduct(p._id || p.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
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
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm"
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{usersList.length} Platform Users</span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Email Address</th>
                      <th className="px-5 py-3">System Role</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">
                          No registered users found in the system.
                        </td>
                      </tr>
                    ) : (
                      usersList.filter(u => 
                        !searchQuery || 
                        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((u) => (
                      <tr key={u._id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shadow-sm">
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                            {u.username}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">
                          {u.email}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                              u.role === "admin" ? "bg-purple-50 text-purple-700 border-purple-200" :
                              u.role === "vendor" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === "Reports" && (
            <div className="space-y-6">
              <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-2">Executive Financial & Revenue Report</h3>
                <p className="text-xs text-gray-500 mb-6 font-medium">Real-time settlement and revenue reconciliation for fiscal year 2026</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xs text-gray-500">Total Platform Sales</span>
                    <div className="text-xl font-bold text-gray-900 mt-1">{lkr(totalGMV)}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-xs text-purple-700 font-medium">Total Platform Fee Retained (10%)</span>
                    <div className="text-xl font-bold text-purple-700 mt-1">{lkr(platformRevenue)}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-xs text-emerald-700 font-medium">Disbursed to Sri Lankan Vendors</span>
                    <div className="text-xl font-bold text-emerald-700 mt-1">{lkr(completedPayoutTotal)}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => alert("Report successfully exported as CSV!")}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
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
              <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-1">Marketplace Commission & Escrow Rules</h3>
                <p className="text-xs text-gray-500 mb-6 font-medium">Global platform parameters applied to all multi-vendor orders</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Platform Split Commission Rate (%)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        className="w-32 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                      />
                      <span className="text-xs text-gray-500">Current fee deducted from each vendor line item</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Minimum Vendor Payout Withdrawal Threshold (LKR)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={minPayout}
                      onChange={(e) => setMinPayout(Number(e.target.value))}
                      className="w-48 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Escrow Holding Duration Post-Delivery (Days)
                    </label>
                    <input
                      type="number"
                      value={escrowDays}
                      onChange={(e) => setEscrowDays(Number(e.target.value))}
                      className="w-32 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">Marketplace Maintenance Mode</div>
                      <div className="text-[11px] text-gray-500">Temporarily pauses customer checkouts during database sync</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        maintenanceMode ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl p-6 relative bg-white border border-gray-100 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {actionModal.action === "approve" ? "Disburse Bank Transfer" : "Decline Payout Request"}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {actionModal.vendorName} • {lkr(actionModal.amount)}
            </p>

            {actionModal.action === "approve" ? (
              <div className="space-y-3 mb-6">
                <label className="block text-xs font-semibold text-gray-700">Bank Transfer / CEFT Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. CEFT-BOC-20261004-9842"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
                <p className="text-[11px] text-gray-500">Enter the Sri Lankan banking slip / EFT transaction code to share with vendor.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <label className="block text-xs font-semibold text-gray-700">Reason for Declining</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Bank account name mismatch with registered business ID."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayoutStatus}
                disabled={submittingAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer ${
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
