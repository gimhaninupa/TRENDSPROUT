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

export function ProfileScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar current="profile" onNavigate={onNavigate} />
        <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-purple-950/5">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
              <User size={30} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>Sign in to your account</h2>
            <p className="text-gray-500 text-sm mb-6">Access your orders, saved wishlist, AI style profile, and Vendor Studio.</p>
            <div className="flex flex-col gap-3">
              <PrimaryBtn onClick={() => onNavigate("login")} className="w-full !py-3.5 !rounded-xl">Sign In / Register</PrimaryBtn>
              <GhostBtn onClick={() => onNavigate("home")} className="w-full !py-3 !rounded-xl">Back to Store</GhostBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";
  const fullName = localStorage.getItem("ts_profile_name") || (user?.username ? user.username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Shopper");
  const email = user?.email || "user@trendsprout.com";
  const role = user?.role ? user.role.toUpperCase() : "CUSTOMER";
  const dob = localStorage.getItem("ts_buyer_dob") || "2000-05-18";
  const nic = localStorage.getItem("ts_buyer_id_num") || "200013904521";
  const city = localStorage.getItem("ts_buyer_city") || "Colombo";
  const storeName = localStorage.getItem("ts_vendor_store_name") || "Luxe Atelier Colombo";

  const wishlistCount = (() => {
    try {
      const saved = localStorage.getItem('ts_wishlist');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  })();

  const ordersCount = (() => {
    try {
      const saved = localStorage.getItem('ts_last_order');
      return saved ? 1 : 0;
    } catch {
      return 0;
    }
  })();

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="profile" onNavigate={onNavigate} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        
        {/* Main Identity Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/80 p-6 sm:p-8 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl shadow-purple-950/5">
          <div className="relative">
            <img src={avatarUrl} alt="profile" className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 shadow-md shadow-purple-500/10" />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:opacity-90" style={{ background: purple }}><Camera size={13} /></button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{fullName}</h1>
              <Badge variant="purple">{role}</Badge>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{email} · TRENDSPROUT Member</p>
            
            {/* Identity Micro Details */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs text-gray-600">
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-medium">DOB: {dob}</span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold flex items-center gap-1">
                <Check size={12} /> NIC: {nic}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-medium">📍 {city}, LK</span>
            </div>

            <div className="flex flex-wrap gap-5 mt-5 justify-center md:justify-start pt-4 border-t border-gray-100">
              {[
                [ordersCount, "Orders"], 
                [wishlistCount, "Wishlist"], 
                [0, "Reviews"]
              ].map(([v, l]) => (
                <div key={l} className="text-center md:text-left">
                  <div className="font-black text-lg text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{v}</div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
            <button onClick={() => onNavigate("profile-settings")} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer">
              <Settings size={14} /> Edit Identity & Profile
            </button>
            <button onClick={() => { logout(); onNavigate("login"); }} className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all cursor-pointer">
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>

        {/* Separate Vendor Section Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-7 mb-6 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl shadow-purple-950/20 border border-white/15 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
            <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-200 shrink-0 border border-white/20">
              <Store size={26} />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-lg font-black" style={{ fontFamily: "'Clash Display', sans-serif" }}>{storeName}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">Vendor Active</span>
              </div>
              <p className="text-purple-200 text-xs sm:text-sm font-light">
                Manage your catalog, AI product shoots, PayHere LK payouts, and store verification details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 shrink-0 w-full sm:w-auto justify-center">
            <button 
              onClick={() => onNavigate("vendor-dashboard")}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-white text-purple-900 font-extrabold text-xs uppercase tracking-wider hover:bg-purple-50 transition-all cursor-pointer shadow-lg"
            >
              Vendor Studio →
            </button>
            <button 
              onClick={() => onNavigate("profile-settings")}
              className="px-3.5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer text-xs font-bold"
              title="Vendor Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: "My Orders & Tracking", icon: <Package size={20} />, items: ["Live order status", "Courier GPS Tracking", "Past invoices"], screen: "orders" as Screen },
            { title: "Saved Wishlist", icon: <Heart size={20} />, items: ["Saved luxury apparel", "Price drop alerts", "Share lookbook"], screen: "wishlist" as Screen },
            { title: "AI Style DNA Profile", icon: <Sparkles size={20} />, items: ["Personalized fit metrics", "Silhouette draping", "Occasion generator"], screen: "ai-outfit" as Screen },
            { title: "Identity & Security Settings", icon: <Settings size={20} />, items: ["National ID verification", "Date of birth & address", "Password & 2FA"], screen: "profile-settings" as Screen },
          ].map(card => (
            <div key={card.title} onClick={() => onNavigate(card.screen)} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 p-6 cursor-pointer hover:border-purple-300 hover:shadow-xl hover:shadow-purple-950/5 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{card.title}</h3>
                <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-purple-600 transition-colors" />
              </div>
              {card.items.map(item => <p key={item} className="text-xs text-gray-500 mb-1.5 font-normal">• {item}</p>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
