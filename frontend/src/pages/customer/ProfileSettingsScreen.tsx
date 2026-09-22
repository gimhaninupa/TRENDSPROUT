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

export function ProfileSettingsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [tab, setTab] = useState("privacy");
  const [notifications, setNotifications] = useState({ orders: true, promotions: false, ai: true, brands: true });
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="profile" onNavigate={onNavigate} role="customer" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <button onClick={() => onNavigate("profile")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 mb-6"><ChevronLeft size={14} />Profile</button>
        <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Clash Display', sans-serif" }}>Account Settings</h1>
        <div className="flex gap-2 mb-6">
          {["privacy", "notifications", "security", "danger"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? (t === "danger" ? "bg-red-500 text-white" : "text-white") : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"}`} style={tab === t && t !== "danger" ? { background: purple } : {}}>{t === "danger" ? "Delete Account" : t}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {tab === "privacy" && (
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-gray-900">Privacy Settings</h3>
              {[{ label: "Public profile", sub: "Allow others to see your style profile", on: true }, { label: "Activity visibility", sub: "Show when you've recently been active", on: false }, { label: "Data personalization", sub: "Use activity to improve AI recommendations", on: true }, { label: "Third-party sharing", sub: "Share anonymized data with brand partners", on: false }].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-semibold text-gray-900">{s.label}</p><p className="text-xs text-gray-400">{s.sub}</p></div>
                  <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${s.on ? "" : "bg-gray-200"}`} style={s.on ? { background: purple } : {}}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${s.on ? "left-5" : "left-1"} shadow-sm`} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "notifications" && (
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-gray-900">Notification Preferences</h3>
              {(Object.keys(notifications) as Array<keyof typeof notifications>).map(k => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-semibold text-gray-900 capitalize">{k === "ai" ? "AI Recommendations" : k === "brands" ? "New from Saved Brands" : k === "orders" ? "Order Updates" : "Promotions"}</p><p className="text-xs text-gray-400">{k === "ai" ? "Daily outfit picks and trend alerts" : k === "orders" ? "Shipping and delivery notifications" : k === "brands" ? "New drops from brands you follow" : "Sales, coupons, and special offers"}</p></div>
                  <div onClick={() => setNotifications(n => ({ ...n, [k]: !n[k] }))} className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${notifications[k] ? "" : "bg-gray-200"}`} style={notifications[k] ? { background: purple } : {}}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications[k] ? "left-5" : "left-1"} shadow-sm`} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "security" && (
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-gray-900">Security</h3>
              <Input label="Current password" type="password" placeholder="••••••••" icon={<Lock size={16} />} />
              <Input label="New password" type="password" placeholder="Min. 8 characters" icon={<Lock size={16} />} />
              <Input label="Confirm new password" type="password" placeholder="Match new password" icon={<Lock size={16} />} />
              <PrimaryBtn className="w-full !py-3.5" icon={<Key size={16} />}>Update Password</PrimaryBtn>
              <div className="mt-2 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-900 mb-1">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 mb-3">Add an extra layer of security to your account</p>
                <GhostBtn className="!py-2 !px-4 !text-xs">Enable 2FA</GhostBtn>
              </div>
            </div>
          )}
          {tab === "danger" && (
            <div>
              <h3 className="font-bold text-red-600 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-6">This will permanently delete your account, all your orders history, wishlist, and AI style profile. This action cannot be undone.</p>
              <div className="flex flex-col gap-4">
                <Input label="Confirm your password" type="password" placeholder="Enter password to confirm" icon={<Lock size={16} />} />
                <div className="flex items-start gap-2.5">
                  <input type="checkbox" id="confirm-delete" className="mt-0.5 accent-red-600" />
                  <label htmlFor="confirm-delete" className="text-sm text-gray-600">I understand this action is permanent and irreversible.</label>
                </div>
                <button onClick={() => onNavigate("home")} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm bg-red-500 hover:bg-red-600 transition-all">
                  <Trash2 size={16} />Delete My Account Permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
