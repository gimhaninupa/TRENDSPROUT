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

export function StoreCustomizationScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [tab, setTab] = useState("theme");
  const [primaryColor, setPrimaryColor] = useState("#6C4DF6");
  return (
    <div className="min-h-screen bg-gray-50 pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="store-customization" onNavigate={onNavigate} />
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Store Customization</h1>
          <div className="flex gap-3">
            <GhostBtn className="!py-2.5 !px-4 !text-sm">Preview</GhostBtn>
            <PrimaryBtn onClick={() => onNavigate("vendor-dashboard")} className="!py-2.5 !px-4 !text-sm" icon={<Globe size={14} />}>Publish</PrimaryBtn>
          </div>
        </div>
        <div className="flex gap-3 mb-6">
          {["theme", "branding", "layout", "banner"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"}`} style={tab === t ? { background: purple } : {}}>{t}</button>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {tab === "theme" && (
              <>
                <h3 className="font-bold text-gray-900 mb-5">Color Theme</h3>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">Brand Color</label>
                    <div className="flex gap-3 flex-wrap">
                      {["#6C4DF6", "#e11d48", "#0ea5e9", "#10b981", "#f59e0b", "#0a0a0f"].map(c => (
                        <button key={c} onClick={() => setPrimaryColor(c)} className={`w-10 h-10 rounded-xl border-2 transition-all ${primaryColor === c ? "border-gray-900 scale-110" : "border-transparent"}`} style={{ background: c }} />
                      ))}
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer overflow-hidden" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">Font Style</label>
                    <div className="flex flex-col gap-2">
                      {["Modern Sans", "Editorial Serif", "Geometric", "Minimal"].map(f => (
                        <label key={f} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-purple-200 transition-all">
                          <input type="radio" name="font" defaultChecked={f === "Modern Sans"} className="accent-purple-600" />
                          <span className="text-sm text-gray-700">{f}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
            {tab === "branding" && (
              <>
                <h3 className="font-bold text-gray-900 mb-5">Brand Identity</h3>
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Store Logo</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
                      <Camera size={24} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Drop your logo here or <span className="text-purple-600 font-medium">browse</span></p>
                      <p className="text-xs text-gray-300 mt-1">PNG, SVG — max 2MB</p>
                    </div>
                  </div>
                  <Input label="Store Name" placeholder="Atelier Nord" />
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Store Tagline</label><input className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:outline-none focus:border-purple-400" placeholder="Refined essentials for the considered wardrobe" /></div>
                </div>
              </>
            )}
            {tab === "layout" && (
              <>
                <h3 className="font-bold text-gray-900 mb-5">Store Layout</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Grid 2-col", "Grid 3-col", "Editorial", "Minimal List"].map(l => (
                    <div key={l} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${l === "Grid 3-col" ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-200"}`}>
                      <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center"><Layout size={20} className="text-gray-400" /></div>
                      <p className="text-xs font-semibold text-center text-gray-700">{l}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === "banner" && (
              <>
                <h3 className="font-bold text-gray-900 mb-5">Hero Banner</h3>
                <div className="flex flex-col gap-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden aspect-video hover:border-purple-300 cursor-pointer">
                    <img src="" alt="banner" className="w-full h-full object-cover opacity-60" />
                  </div>
                  <Input label="Banner headline" placeholder="New Summer Collection" />
                  <Input label="Banner subtext" placeholder="Minimal essentials for the season ahead" />
                </div>
              </>
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Live Preview</div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-10 flex items-center px-4 gap-2 border-b border-gray-100">
                {["#f87171", "#fbbf24", "#34d399"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
              </div>
              <div className="p-4">
                <div className="h-24 rounded-xl mb-4 flex items-center justify-center text-white text-lg font-black" style={{ background: `linear-gradient(135deg, ${primaryColor}, #9333ea)` }}>Atelier Nord</div>
                <div className="grid grid-cols-2 gap-2">
                  {products.slice(0, 4).map(p => (
                    <div key={p.id} className="rounded-xl overflow-hidden border border-gray-100">
                      <div className="aspect-square bg-gray-50"><img src={p.image} alt={p.name} className="w-full h-full object-cover" /></div>
                      <div className="p-2"><p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p><p className="text-xs font-bold mt-0.5" style={{ color: primaryColor }}>{lkr(p.price)}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
