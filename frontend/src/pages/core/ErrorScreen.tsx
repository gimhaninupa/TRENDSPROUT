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

export function ErrorScreen({ type, onNavigate }: { type: "404" | "payment-failed" | "server"; onNavigate: (s: Screen) => void }) {
  const configs = {
    "404": { icon: <AlertCircle size={48} className="text-purple-400" />, title: "Page Not Found", desc: "The page you're looking for has been moved, renamed, or doesn't exist." },
    "payment-failed": { icon: <CreditCard size={48} className="text-red-400" />, title: "Payment Failed", desc: "We couldn't process your payment. Your card was not charged." },
    "server": { icon: <RefreshCw size={48} className="text-amber-400" />, title: "Server Error", desc: "Something went wrong on our end. Our team has been notified." },
  };
  const c = configs[type];
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white text-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-6">{c.icon}</div>
      <h1 className="text-5xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>{type === "404" ? "404" : type === "payment-failed" ? "Oops" : "500"}</h1>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{c.title}</h2>
      <p className="text-gray-500 max-w-sm mb-8">{c.desc}</p>
      <div className="flex gap-3">
        <PrimaryBtn onClick={() => onNavigate("home")}>Go Home</PrimaryBtn>
        {type === "payment-failed" && <GhostBtn onClick={() => onNavigate("checkout")}>Change Payment Method</GhostBtn>}
        {type === "server" && <GhostBtn onClick={() => window.location.reload()}>Refresh</GhostBtn>}
      </div>
    </div>
  );
}
