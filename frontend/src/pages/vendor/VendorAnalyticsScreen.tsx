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

export function VendorAnalyticsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [stats, setStats] = useState([
    { label: "Total Revenue", val: "LKR 0", change: "0%" },
    { label: "Orders Delivered", val: "0", change: "0%" },
    { label: "Conversion Rate", val: "0%", change: "0%" },
    { label: "Store Products", val: "0", change: "0 active" },
  ]);

  useEffect(() => {
    api.getVendorWallet()
      .then(res => {
        if (res?.data) {
          const w = res.data;
          setStats([
            { label: "Total Revenue", val: lkr(w.grossSales || 0), change: "+0%" },
            { label: "Orders Delivered", val: String(w.soldItems?.length || 0), change: "+0%" },
            { label: "Available Balance", val: lkr(w.availableBalance || 0), change: "Ready to withdraw" },
            { label: "Total Paid Out", val: lkr(w.totalPaidOut || 0), change: "Settled" },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 lg:pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-analytics" onNavigate={onNavigate} />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Analytics</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Real-time performance and AI trend insights</p>
          </div>
          <select className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none self-start sm:self-auto cursor-pointer">
            {["Last 7 days", "Last 30 days", "Last 3 months", "This year"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.val}</div>
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <span className="text-xs text-gray-400">{s.label}</span>
                <span className="text-xs font-semibold text-emerald-600">{s.change}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5">Revenue vs Orders</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="gradVendorAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={purple} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="revenue" stroke={purple} strokeWidth={2.5} fill="url(#gradVendorAnalytics)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5">Top Products</h3>
            <div className="space-y-4">
              {vendorProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <img src={products[p.id - 1]?.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 w-full">
                      <div className="h-full rounded-full" style={{ width: `${(p.sales / 203) * 100}%`, background: purple }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">{p.sales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">AI Trend Predictor</h3>
            <Badge variant="purple">Beta</Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {([] as any[]).map(t => (
              <div key={t.trend} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{t.trend}</p>
                  <span className="text-xs font-bold" style={{ color: t.color }}>{t.momentum}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full mb-2">
                  <div className="h-full rounded-full" style={{ width: `${t.momentum}%`, background: t.color }} />
                </div>
                <p className="text-xs font-medium" style={{ color: t.color }}>{t.forecast}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
