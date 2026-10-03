import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag, Search, Heart, User, Menu, X, ChevronRight, Star, Zap,
  Sparkles, TrendingUp, Package, BarChart2, Users, Settings, LogOut,
  ArrowRight, Check, ShoppingCart, Bell, MessageSquare, Eye, Edit3,
  Upload, Truck, CreditCard, Lock, Mail, Phone, MapPin, Grid, List,
  Filter, ChevronDown, Plus, Minus, Trash2, RefreshCw, AlertCircle,
  CheckCircle, Clock, Store, Bot, Wand2, Image, Tag, DollarSign,
  Activity, PieChart, FileText, Shield, ChevronLeft, Home, Layers,
  Camera, Share2, Bookmark, ThumbsUp, MoreHorizontal, Send, Mic,
  Palette, Layout, Globe, Download, ToggleLeft, Key, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from "recharts";
import { Link, useNavigate } from 'react-router-dom';
import { 
    Screen, purple, purpleLight, purpleDark, lkr, 
    products, categories, testimonials, analyticsData, pieData, vendorProducts, chatMessages, faqs,
    Badge, StarRating, PrimaryBtn, GhostBtn, Input, GlassCard, ProductCard, Navbar, VendorSidebar, FloatingNav, QuickNav
} from '../../components/shared';

import { api } from "../../services/api";

export function AdminDashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [actionModal, setActionModal] = useState<{ id: string; vendorName: string; amount: number; action: "approve" | "reject" } | null>(null);
  const [refNumber, setRefNumber] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (activeTab === "Payments" || activeTab === "Vendors") {
      fetchPayouts();
    }
  }, [activeTab]);

  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const res = await api.getAdminPayouts();
      if (res.data) setPayouts(res.data);
    } catch (err) {
      console.error("Failed to load admin payouts", err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!actionModal) return;
    setSubmittingAction(true);
    try {
      const nextStatus = actionModal.action === "approve" ? "Completed" : "Rejected";
      await api.updatePayoutStatus(actionModal.id, nextStatus, refNumber, rejectReason);
      alert(`Payout successfully ${nextStatus.toLowerCase()}!`);
      setActionModal(null);
      setRefNumber("");
      setRejectReason("");
      fetchPayouts();
    } catch (err: any) {
      alert(err.message || "Failed to update payout status");
    } finally {
      setSubmittingAction(false);
    }
  };

  const pendingPayoutTotal = payouts.filter(p => p.status === "Pending").reduce((acc, p) => acc + (p.amount || 0), 0);
  const completedPayoutTotal = payouts.filter(p => p.status === "Completed").reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-60 h-screen sticky top-0 flex flex-col pt-8 pb-6" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-6 mb-8 font-bold text-white text-lg flex items-center gap-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            <span style={{ color: purple }}>TS</span> Admin Center
          </div>
          <div className="flex-1 px-3 space-y-1">
            {[
              { icon: <Home size={16} />, label: "Overview" },
              { icon: <CreditCard size={16} />, label: "Payments", badge: payouts.filter(p => p.status === "Pending").length },
              { icon: <Store size={16} />, label: "Vendors" },
              { icon: <ShoppingBag size={16} />, label: "Orders" },
              { icon: <Package size={16} />, label: "Products" },
              { icon: <Users size={16} />, label: "Users" },
              { icon: <PieChart size={16} />, label: "Reports" },
              { icon: <Settings size={16} />, label: "Settings" },
            ].map((item) => (
              <button 
                key={item.label} 
                onClick={() => setActiveTab(item.label)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${
                  activeTab === item.label ? "text-purple-300 font-semibold" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                style={activeTab === item.label ? { background: `${purple}22`, borderLeft: `3px solid ${purple}` } : {}}
              >
                <div className="flex items-center gap-3">
                  {item.icon}{item.label}
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="px-3">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-white transition-colors w-full">
              <LogOut size={16} />Exit Admin
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                {activeTab === "Payments" ? "Vendor Settlements & Multi-Vendor Payouts" : `${activeTab}`}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Automated Split-Payment Ledger & Sri Lankan Banking Wire Controls</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => fetchPayouts()} className="px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-gray-300 hover:text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <RefreshCw size={13} className={loadingPayouts ? "animate-spin" : ""} /> Refresh
              </button>
              <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white relative" style={{ background: "rgba(255,255,255,0.05)" }}>
                <Bell size={16} /><span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">7</span>
              </button>
            </div>
          </div>

          {activeTab === "Payments" ? (
            <div className="space-y-6">
              {/* Payout Metric Highlights */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{lkr(pendingPayoutTotal)}</div>
                  <p className="text-xs text-amber-300/70 mt-1">{payouts.filter(p => p.status === "Pending").length} vendor withdrawal requests waiting</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Disbursed Settlements</span>
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{lkr(completedPayoutTotal)}</div>
                  <p className="text-xs text-emerald-300/70 mt-1">Transferred directly to vendor accounts</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "rgba(147, 51, 234, 0.08)", border: "1px solid rgba(147, 51, 234, 0.2)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Marketplace Platform Fee</span>
                    <Shield size={16} className="text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white">10.0% Flat</div>
                  <p className="text-xs text-purple-300/70 mt-1">Deducted automatically on multi-vendor cart splits</p>
                </div>
              </div>

              {/* Payouts Table */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <h3 className="font-bold text-white text-base">Vendor Withdrawal Requests</h3>
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
          ) : (
            <div>
              {/* Overview Screen */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Platform Sales", val: "LKR 792M", change: "+31%", icon: <DollarSign size={18} /> },
                  { label: "Active Shoppers", val: "52,840", change: "+18%", icon: <Users size={18} /> },
                  { label: "Verified Vendors", val: "1,243", change: "+24%", icon: <Store size={18} /> },
                  { label: "Pending Payouts", val: lkr(pendingPayoutTotal), change: "Action Req", icon: <CreditCard size={18} /> },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-400">{s.icon}</span>
                      <span className="text-xs font-semibold text-emerald-400">{s.change}</span>
                    </div>
                    <div className="text-2xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 className="font-bold text-white mb-5">Platform Revenue & Commission Flow</h3>
                  <ResponsiveContainer width="100%" height={200}>
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
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-white">Recent Top Vendors</h3>
                    <button onClick={() => setActiveTab("Payments")} className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                      View Settlements <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Atelier Nord", status: "Active", revenue: "LKR 12.6M", products: 47 },
                      { name: "Maison Éclat", status: "Active", revenue: "LKR 8.9M", products: 32 },
                      { name: "Studio Voss", status: "Pending", revenue: "LKR 1.2M", products: 14 },
                      { name: "Nordic Thread", status: "Active", revenue: "LKR 6.5M", products: 28 },
                    ].map(v => (
                      <div key={v.name} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div>
                          <p className="text-sm font-semibold text-white">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.products} products</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{v.revenue}</p>
                          <Badge variant={v.status === "Active" ? "green" : "amber"}>{v.status}</Badge>
                        </div>
                      </div>
                    ))}
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
                onClick={handleUpdateStatus}
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

