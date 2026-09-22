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

export function CouponsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const coupons = [
    { code: "STYLE20", discount: "20% off", minOrder: "LKR 33,000+", expires: "Jul 31", active: true },
    { code: "NEWBRAND15", discount: "15% off", minOrder: "Any order", expires: "Aug 15", active: true },
    { code: "FIRST30", discount: "30% off", minOrder: "First order only", expires: "Expired", active: false },
  ];
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="cart" onNavigate={onNavigate} role="customer" />
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <button onClick={() => onNavigate("cart")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 mb-6"><ChevronLeft size={14} />Back to cart</button>
        <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Clash Display', sans-serif" }}>Coupons & Discounts</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <label className="text-sm font-semibold text-gray-700 block mb-3">Enter coupon code</label>
          <div className="flex gap-3">
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm font-mono focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 uppercase" placeholder="STYLE20" />
            <PrimaryBtn onClick={() => { setApplied(code); }} className="!py-3 !px-5 !text-sm">Apply</PrimaryBtn>
          </div>
          {applied && <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"><Check size={12} />Coupon "{applied}" applied successfully!</p>}
        </div>
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Available Coupons</h3>
        <div className="flex flex-col gap-3">
          {coupons.map(c => (
            <div key={c.code} className={`bg-white rounded-2xl border p-5 flex items-center gap-5 ${c.active ? "border-gray-100" : "border-gray-100 opacity-50"}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.active ? "text-white" : "bg-gray-100 text-gray-400"}`} style={c.active ? { background: `linear-gradient(135deg, ${purple}, #9333ea)` } : {}}><Tag size={20} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono font-bold text-gray-900 text-sm">{c.code}</span>
                  {!c.active && <Badge variant="gray">Expired</Badge>}
                </div>
                <p className="text-xs text-gray-500">{c.discount} · {c.minOrder} · {c.expires}</p>
              </div>
              {c.active && <button onClick={() => { setApplied(c.code); setCode(c.code); onNavigate("cart"); }} className="text-xs font-semibold text-purple-600 hover:underline flex-shrink-0">Use</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
