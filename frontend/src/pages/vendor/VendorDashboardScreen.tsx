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

export function VendorDashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-gray-50 pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-dashboard" onNavigate={onNavigate} />
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Vendor Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Atelier Nord · Jul 22, 2026</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onNavigate("vendor-add-product")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: purple }}><Plus size={16} />Add Product</button>
            <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-purple-300 bg-white relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">4</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Monthly Revenue", value: "LKR 12.6M", change: "+24%", icon: <DollarSign size={20} />, up: true },
            { label: "Total Orders", value: "263", change: "+18%", icon: <ShoppingBag size={20} />, up: true },
            { label: "Active Products", value: "47", change: "+3", icon: <Package size={20} />, up: true },
            { label: "Avg. Rating", value: "4.9", change: "+0.1", icon: <Star size={20} />, up: true },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">{s.icon}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.up ? "text-emerald-700 bg-emerald-100" : "text-red-600 bg-red-100"}`}>{s.change}</span>
              </div>
              <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Revenue Overview</h3>
              <button onClick={() => onNavigate("vendor-analytics")} className="text-xs font-semibold text-purple-600 flex items-center gap-1">Full report <ArrowRight size={12} /></button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="gradVendorDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={purple} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="revenue" stroke={purple} strokeWidth={2.5} fill="url(#gradVendorDash)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={160}>
              <RePieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-3">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /><span className="text-gray-600">{d.name}</span></div>
                  <span className="font-semibold text-gray-900">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <button onClick={() => onNavigate("orders")} className="text-xs font-semibold text-purple-600">View all</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 font-semibold border-b border-gray-100">
                {["Order ID", "Customer", "Product", "Amount", "Status", "Date"].map(h => <th key={h} className="text-left pb-3 pr-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {([] as any[]).map(o => (
                <tr key={o.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs font-medium text-gray-700">{o.id}</td>
                  <td className="py-3 pr-4 text-gray-700">{o.customer}</td>
                  <td className="py-3 pr-4 text-gray-700">{o.product}</td>
                  <td className="py-3 pr-4 font-semibold text-gray-900">{lkr(o.amount)}</td>
                  <td className="py-3 pr-4"><Badge variant={o.status === "Delivered" ? "green" : o.status === "Shipping" ? "purple" : "amber"}>{o.status}</Badge></td>
                  <td className="py-3 text-gray-400 text-xs">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { icon: <FileText size={20} />, title: "AI Description Generator", desc: "Auto-write compelling product listings", screen: "vendor-ai-description" as Screen },
            { icon: <DollarSign size={20} />, title: "AI Pricing Advisor", desc: "Optimize prices with market intelligence", screen: "vendor-ai-pricing" as Screen },
            { icon: <TrendingUp size={20} />, title: "Trend Predictor", desc: "See what's selling next season", screen: "vendor-analytics" as Screen },
          ].map(tool => (
            <div key={tool.title} onClick={() => onNavigate(tool.screen)} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30 transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>{tool.icon}</div>
              <div><p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{tool.title}</p><p className="text-xs text-gray-400">{tool.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
