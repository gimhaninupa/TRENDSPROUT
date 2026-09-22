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

export function SplashScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  useEffect(() => { const t = setTimeout(() => onNavigate("home"), 2200); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: `linear-gradient(135deg, #0a0a0f 0%, #1a0a3e 50%, #0a0a0f 100%)` }}>
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-purple-900" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>TS</div>
        <div className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>TRENDSPROUT</div>
        <p className="text-purple-300 text-sm font-medium tracking-widest uppercase">AI-Powered Fashion</p>
        <motion.div initial={{ width: 0 }} animate={{ width: 120 }} transition={{ delay: 0.8, duration: 1.2 }} className="h-0.5 rounded-full mt-6" style={{ background: `linear-gradient(90deg, ${purple}, #9333ea)` }} />
      </motion.div>
    </div>
  );
}
