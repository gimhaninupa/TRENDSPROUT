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
import { useAuth } from '../../context/AuthContext';

export function CustomerDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user } = useAuth();
  const displayName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Sophia";

  const wishlistCount = (() => {
    try {
      const saved = localStorage.getItem('ts_wishlist');
      return saved ? JSON.parse(saved).length : 2;
    } catch {
      return 2;
    }
  })();

  const activeOrdersCount = (() => {
    try {
      const saved = localStorage.getItem('ts_last_order');
      return saved ? 1 : 2;
    } catch {
      return 2;
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="customer-dashboard" onNavigate={onNavigate} role="customer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Good day, {displayName} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's new for you today</p>
          </div>
          <button onClick={() => onNavigate("ai-chatbot")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>
            <Bot size={16} />Ask AI Stylist
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Orders", value: String(activeOrdersCount), sub: "Tracking live", icon: <Package size={20} />, screen: "orders" as Screen },
            { label: "Wishlist Items", value: String(wishlistCount), sub: "In your collection", icon: <Heart size={20} />, screen: "wishlist" as Screen },
            { label: "Total Spent", value: "LKR 408,600", sub: "This year", icon: <CreditCard size={20} />, screen: "orders" as Screen },
            { label: "Style Score", value: "94", sub: "Top 5%", icon: <Sparkles size={20} />, screen: "ai-outfit" as Screen },
          ].map(s => (
            <div key={s.label} onClick={() => onNavigate(s.screen)} className="bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 group-hover:text-purple-500 transition-colors">{s.icon}</span>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
              </div>
              <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label} · {s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Recommended For You</h2>
              <button onClick={() => onNavigate("browse")} className="text-xs font-semibold text-purple-600 flex items-center gap-1">See all <ArrowRight size={12} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
              <div className="flex flex-col gap-3">
                {([] as any[]).map(o => (
                  <div key={o.name} onClick={() => onNavigate("tracking")} className="flex items-center gap-3 cursor-pointer group">
                    <img src={o.img} alt={o.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">{o.name}</p>
                      <p className="text-xs text-gray-400">{o.date}</p>
                    </div>
                    <Badge variant={o.status === "Delivered" ? "green" : o.status === "Shipping" ? "purple" : "gray"}>{o.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={() => onNavigate("ai-outfit")} className="rounded-2xl p-5 cursor-pointer relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
              <Wand2 size={24} className="text-white mb-3" />
              <h3 className="text-white font-bold mb-1">AI Outfit of the Day</h3>
              <p className="text-purple-200 text-xs mb-4">3 new looks generated for rooftop dinner</p>
              <div className="flex items-center gap-1.5 text-white text-xs font-semibold">View looks <ArrowRight size={12} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">AI Style Insights</h3>
              <div className="space-y-3">
                {[["Minimalist", 78], ["Editorial", 65], ["Streetwear", 42]].map(([label, pct]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-600 font-medium">{label}</span><span className="text-purple-600 font-bold">{pct}%</span></div>
                    <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${purple}, #9333ea)` }} /></div>
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
