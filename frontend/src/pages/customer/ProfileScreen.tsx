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
  const { user, logout } = useAuth();
  const avatarUrl = user?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
  const fullName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Sophia Laurent";
  const email = user?.email || "shopper@trendsprout.com";
  const role = user?.role ? user.role.toUpperCase() : "CUSTOMER";

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="profile" onNavigate={onNavigate} role="customer" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
          <div className="relative">
            <img src={avatarUrl} alt="profile" className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 shadow-sm" />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:opacity-90" style={{ background: purple }}><Camera size={13} /></button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{fullName}</h1>
              <Badge variant="purple">{role}</Badge>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{email} · TRENDSPROUT Member</p>
            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              {[["50", "Orders"], ["12", "Wishlist"], ["4", "Reviews"]].map(([v, l]) => (
                <div key={l} className="text-center"><div className="font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{v}</div><div className="text-xs text-gray-400">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate("profile-settings")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-all cursor-pointer"><Settings size={14} />Settings</button>
            <button onClick={() => { logout(); onNavigate("login"); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all cursor-pointer"><LogOut size={13} />Sign Out</button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "My Orders", icon: <Package size={20} />, items: ["3 active orders", "View all orders", "Track shipments"], screen: "orders" as Screen },
            { title: "Wishlist", icon: <Heart size={20} />, items: ["12 saved items", "2 items on sale", "Share collection"], screen: "wishlist" as Screen },
            { title: "AI Style Profile", icon: <Sparkles size={20} />, items: ["Minimalist · 78%", "Editorial · 65%", "Update preferences"], screen: "ai-outfit" as Screen },
            { title: "Account Settings", icon: <Settings size={20} />, items: ["Privacy & Security", "Notifications", "Payment methods"], screen: "profile-settings" as Screen },
          ].map(card => (
            <div key={card.title} onClick={() => onNavigate(card.screen)} className="bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-purple-600 group-hover:text-purple-700 transition-colors">{card.icon}</span>
                <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{card.title}</h3>
                <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-purple-400 transition-colors" />
              </div>
              {card.items.map(item => <p key={item} className="text-sm text-gray-500 mb-1.5">{item}</p>)}
            </div>
          ))}
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3"><LogOut size={18} className="text-red-400" /><span className="text-sm font-medium text-gray-700">Sign Out</span></div>
          <button onClick={() => onNavigate("home")} className="text-xs font-semibold text-red-500 hover:underline">Sign out of all devices</button>
        </div>
      </div>
    </div>
  );
}
