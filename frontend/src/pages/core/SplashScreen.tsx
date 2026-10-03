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
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 180);

    const timer = setTimeout(() => {
      onNavigate("home");
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onNavigate]);

  return (
    <div 
      onClick={() => onNavigate("home")}
      className="fixed inset-0 w-full h-full min-h-[100dvh] z-[999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer" 
      style={{ background: `radial-gradient(circle at 50% 40%, #1e0b3e 0%, #0a0a0f 70%, #050508 100%)` }}
    >
      {/* Ambient background glow rings */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full opacity-30 blur-3xl pointer-events-none animate-pulse" 
        style={{ background: `radial-gradient(circle, ${purple}, #9333ea)` }} 
      />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 15 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        transition={{ duration: 0.7, ease: "easeOut" }} 
        className="relative z-10 flex flex-col items-center gap-4 px-6 text-center"
      >
        {/* Glowing Logo Icon */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl opacity-75 blur-md animate-pulse" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }} />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-2xl border border-white/20" 
            style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}
          >
            TS
          </div>
        </div>

        {/* Brand Title */}
        <div className="mt-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            TRENDSPROUT
          </h1>
          <p className="text-purple-300 text-xs sm:text-sm font-semibold tracking-widest uppercase mt-2">
            AI-Powered Fashion Discovery
          </p>
        </div>

        {/* Mobile-Friendly Glowing Progress Bar */}
        <div className="w-56 sm:w-72 mt-6 flex flex-col items-center gap-2">
          <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 backdrop-blur-md">
            <motion.div 
              className="h-full rounded-full" 
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                background: `linear-gradient(90deg, #a855f7, #ec4899, #8b5cf6)`,
                boxShadow: "0 0 12px rgba(168, 85, 247, 0.8)"
              }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
          <div className="flex items-center justify-between w-full px-1 text-[11px] text-gray-400 font-mono">
            <span className="text-purple-300">Loading intelligence…</span>
            <span className="font-bold text-white">{Math.min(progress, 100)}%</span>
          </div>
        </div>

        {/* Touch to enter hint */}
        <p className="text-gray-500 text-[11px] mt-6 animate-pulse">
          Tap anywhere to skip →
        </p>
      </motion.div>
    </div>
  );
}
