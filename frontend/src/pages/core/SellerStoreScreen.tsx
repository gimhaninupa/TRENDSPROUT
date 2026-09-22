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

export function SellerStoreScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="seller-store" onNavigate={onNavigate} role="customer" />
      <div className="pt-16">
        <div className="relative h-72 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80" alt="Store banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7))" }} />
          <div className="absolute bottom-8 left-8 flex items-end gap-5">
            <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden flex-shrink-0 bg-white shadow-xl">
              <img src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=200&h=200&q=80" alt="Brand logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>Atelier Nord</h1>
              <p className="text-white/80 text-sm">Refined essentials for the considered wardrobe</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />4.9 · 1,240 reviews</span>
                <span>✓ Verified Brand</span>
                <span>🌿 Sustainable</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              {["All", "Blazers", "Knitwear", "Dresses", "Accessories"].map(f => (
                <button key={f} className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${f === "All" ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:border-purple-300"}`} style={f === "All" ? { background: purple } : {}}>{f}</button>
              ))}
            </div>
            <button onClick={() => onNavigate("ai-chatbot")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-200 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-all">
              <MessageSquare size={14} />Message Brand
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
