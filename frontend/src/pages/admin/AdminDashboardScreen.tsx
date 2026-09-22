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

export function AdminDashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>
      <div className="flex">
        <div className="w-56 h-screen sticky top-0 flex flex-col pt-8 pb-6" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-6 mb-8 font-bold text-white text-lg" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            <span style={{ color: purple }}>TS</span> Admin
          </div>
          <div className="flex-1 px-3 space-y-1">
            {[
              { icon: <Home size={16} />, label: "Overview" },
              { icon: <Users size={16} />, label: "Users" },
              { icon: <Store size={16} />, label: "Vendors" },
              { icon: <Package size={16} />, label: "Products" },
              { icon: <ShoppingBag size={16} />, label: "Orders" },
              { icon: <CreditCard size={16} />, label: "Payments" },
              { icon: <PieChart size={16} />, label: "Reports" },
              { icon: <Settings size={16} />, label: "Settings" },
            ].map((item, i) => (
              <button key={item.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${i === 0 ? "text-purple-300" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                style={i === 0 ? { background: `${purple}22`, borderLeft: `2px solid ${purple}` } : {}}>
                {item.icon}{item.label}
              </button>
            ))}
          </div>
          <div className="px-3">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-white transition-colors w-full">
              <LogOut size={16} />Exit Admin
            </button>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>Platform Overview</h1><p className="text-gray-500 text-sm mt-0.5">Jul 22, 2026</p></div>
            <div className="flex gap-3">
              <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors relative" style={{ background: "rgba(255,255,255,0.05)" }}><Bell size={16} /><span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">7</span></button>
              <img src="" alt="admin" className="w-9 h-9 rounded-xl object-cover border border-gray-700" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Revenue", val: "LKR 792M", change: "+31%", icon: <DollarSign size={18} /> },
              { label: "Active Users", val: "52,840", change: "+18%", icon: <Users size={18} /> },
              { label: "Vendors", val: "1,243", change: "+24%", icon: <Store size={18} /> },
              { label: "Orders Today", val: "1,087", change: "+12%", icon: <ShoppingBag size={18} /> },
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
              <h3 className="font-bold text-white mb-5">Revenue Trend</h3>
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
              <h3 className="font-bold text-white mb-5">Recent Vendors</h3>
              <div className="space-y-3">
                {[
                  { name: "Atelier Nord", status: "Active", revenue: "LKR 12.6M", products: 47 },
                  { name: "Maison Éclat", status: "Active", revenue: "LKR 8.9M", products: 32 },
                  { name: "Studio Voss", status: "Pending", revenue: "LKR 0", products: 0 },
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
      </div>
    </div>
  );
}
