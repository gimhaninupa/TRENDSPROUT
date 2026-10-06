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
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export type Screen =
  | "splash" | "home" | "login" | "register" | "otp" | "forgot-password"
  | "customer-dashboard" | "browse" | "product-detail" | "cart" | "checkout"
  | "payment" | "order-success" | "orders" | "tracking" | "wishlist"
  | "profile" | "profile-settings"
  | "ai-chatbot" | "ai-outfit" | "text-to-design"
  | "vendor-dashboard" | "vendor-products" | "vendor-analytics" | "vendor-add-product"
  | "vendor-ai-description" | "vendor-ai-pricing" | "store-customization" | "vendor-payouts" | "vendor-orders"
  | "admin-dashboard"
  | "error-404" | "error-payment" | "seller-store" | "search-results" | "coupons";

// ─── Data ─────────────────────────────────────────────────────────────────────
export const categories = [
  { name: 'Dresses', slug: 'dresses', count: 0, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
  { name: 'T-Shirts', slug: 't-shirts', count: 0, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80' },
  { name: 'Shirts', slug: 'shirts', count: 0, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' },
  { name: 'Blazers', slug: 'blazers', count: 0, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80' },
  { name: 'Jackets & Coats', slug: 'jackets-coats', count: 0, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
  { name: 'Knitwear', slug: 'knitwear', count: 0, image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Hoodies & Sweats', slug: 'hoodies-sweats', count: 0, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Pants & Trousers', slug: 'pants-trousers', count: 0, image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=400&q=80' },
  { name: 'Jeans & Denim', slug: 'jeans-denim', count: 0, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80' },
  { name: 'Skirts', slug: 'skirts', count: 0, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=400&q=80' },
  { name: 'Shorts', slug: 'shorts', count: 0, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Footwear', slug: 'footwear', count: 0, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bags', slug: 'bags', count: 0, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80' },
  { name: 'Accessories', slug: 'accessories', count: 0, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80' },
];

export const products: any[] = [];

export const testimonials = [
  {
    name: "Kavindi Perera",
    rating: 5,
    text: "The AI Stylist built me a custom look for a wedding in 30 seconds. The marketplace quality exceeded expectations!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Dineth Jayasuriya",
    rating: 5,
    text: "As a vendor, TRENDSPROUT gives me instant access to modern fashion buyers. The AI pricing and description tools save hours every week.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Shenaya Fernando",
    rating: 5,
    text: "Seamless delivery in Colombo, real-time courier tracking, and the Text-to-Design feature feels like pure fashion sci-fi.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  }
];

export const analyticsData = [
  { month: "Jan", revenue: 0, orders: 0 },
  { month: "Feb", revenue: 0, orders: 0 },
  { month: "Mar", revenue: 0, orders: 0 },
  { month: "Apr", revenue: 0, orders: 0 },
  { month: "May", revenue: 0, orders: 0 },
  { month: "Jun", revenue: 0, orders: 0 },
  { month: "Jul", revenue: 0, orders: 0 }
];

export const pieData: { name: string; value: number; color: string }[] = [];

export const vendorProducts: any[] = [];

export const chatMessages = [
  { role: "ai", text: "Hello! I'm your TRENDSPROUT AI Stylist ✨ Tell me what occasion you're preparing for, your preferred aesthetic, or budget, and I'll curate looks from our catalog for you." }
];

export const faqs = [
  { q: "How does the AI Stylist work?", a: "Our AI Stylist combines fashion runway trend analysis with our catalog's real-time inventory to recommend pieces that match your body profile, occasion, and budget." },
  { q: "What are the delivery times within Sri Lanka?", a: "Colombo and suburbs receive orders within 1-2 business days. Islandwide delivery takes 2-4 business days with full GPS parcel tracking." },
  { q: "What payment methods are supported?", a: "We accept Visa, MasterCard, Sampath/Commercial Bank online transfers, and Cash on Delivery (COD)." },
  { q: "Can I sell my fashion brand on TRENDSPROUT?", a: "Yes! Simply navigate to the Vendor Portal, submit your store details, and you'll get access to vendor analytics, AI copywriters, and automated fulfillment." }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const purple = "#6C4DF6";
export const purpleLight = "#f4f2ff";
export const purpleDark = "#4c32d4";
// ─── Nav ──────────────────────────────────────────────────────────────────────
export const aiTools = [
  { screen: "ai-chatbot" as Screen, icon: <Bot size={15} />, label: "AI Chatbot", desc: "Real-time style advice" },
  { screen: "ai-outfit" as Screen, icon: <Wand2 size={15} />, label: "Outfit Generator", desc: "Complete looks for any occasion" },
  { screen: "text-to-design" as Screen, icon: <Image size={15} />, label: "Text to Design", desc: "Describe & visualize your piece" },
];
// ─── Vendor Sidebar ───────────────────────────────────────────────────────────
// ═══ SCREENS ══════════════════════════════════════════════════════════════════

// ─── Splash ───────────────────────────────────────────────────────────────────
// ─── Home / Landing ───────────────────────────────────────────────────────────
// ─── Auth ─────────────────────────────────────────────────────────────────────
// ─── Customer Dashboard ───────────────────────────────────────────────────────
// ─── Browse / Search ──────────────────────────────────────────────────────────
// ─── Product Detail ───────────────────────────────────────────────────────────
// ─── Cart ─────────────────────────────────────────────────────────────────────
// ─── Checkout ─────────────────────────────────────────────────────────────────
// ─── Payment / Order Success ───────────────────────────────────────────────────
// ─── Orders / Tracking ────────────────────────────────────────────────────────
// ─── Wishlist ─────────────────────────────────────────────────────────────────
// ─── AI Chatbot ───────────────────────────────────────────────────────────────
// ─── AI Outfit Recommendation ─────────────────────────────────────────────────
// ─── Text to Design ───────────────────────────────────────────────────────────
// ─── Vendor Dashboard ─────────────────────────────────────────────────────────
// ─── Vendor Products ──────────────────────────────────────────────────────────
// ─── Vendor Add Product ───────────────────────────────────────────────────────
// ─── Vendor AI Description ────────────────────────────────────────────────────
// ─── Vendor AI Pricing ────────────────────────────────────────────────────────
// ─── Vendor Analytics ─────────────────────────────────────────────────────────
// ─── Store Customization ──────────────────────────────────────────────────────
// ─── Seller Store ─────────────────────────────────────────────────────────────
// ─── Profile ──────────────────────────────────────────────────────────────────
// ─── Profile Settings ─────────────────────────────────────────────────────────
// ─── Admin Dashboard ──────────────────────────────────────────────────────────
// ─── Error Screens ────────────────────────────────────────────────────────────
// ─── Coupons ──────────────────────────────────────────────────────────────────
// ─── Nav Bar for quick access ─────────────────────────────────────────────────
// ─── Screen Switcher ─────────────────────────────────────────────────────────
// ═══ App Root ══════════════════════════════════════════════════════════════════


export function lkr(amount: number) {
  return "LKR " + amount.toLocaleString("en-LK");
}

export function Badge({ children, variant = "purple" }: { children: React.ReactNode; variant?: "purple" | "green" | "red" | "amber" | "gray" }) {
  const styles: Record<string, string> = {
    purple: "bg-purple-100 text-purple-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>{children}</span>;
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
      ))}
    </div>
  );
}

export function PrimaryBtn({ children, onClick, className = "", icon }: { children: React.ReactNode; onClick?: () => void; className?: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg hover:shadow-purple-200 active:scale-95 ${className}`}
      style={{ background: `linear-gradient(135deg, #6C4DF6, #9333ea)` }}
    >
      {icon}{children}
    </button>
  );
}

export function GhostBtn({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ label, type = "text", placeholder, icon }: { label?: string; type?: string; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all ${icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-black/5 backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

export function ProductCard({ product, onNavigate }: { product: typeof products[0]; onNavigate: (s: Screen) => void }) {
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleCardClick = () => {
    try {
      const rawImgs = Array.isArray((product as any).images) && (product as any).images.length > 0
        ? (product as any).images
        : ((product as any).image ? [(product as any).image] : []);
      localStorage.setItem('ts_selected_product', JSON.stringify({
        ...product,
        images: rawImgs,
        image: rawImgs[0] || (product as any).image || '',
      }));
    } catch {}
    onNavigate("product-detail");
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-50">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <Badge variant={product.tag === "Sale" ? "red" : product.tag === "Trending" ? "purple" : "green"}>{product.tag}</Badge>
        </div>
        <button
          onClick={e => { e.stopPropagation(); setWished(!wished); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart size={14} className={wished ? "fill-red-500 text-red-500" : "text-gray-400"} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-purple-600 font-medium mb-1">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">{lkr(product.price)}</span>
            <span className="text-xs text-gray-400 line-through">{lkr(product.originalPrice)}</span>
          </div>
          <button
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:shadow-lg hover:shadow-purple-200 ${added ? "bg-emerald-600" : ""}`}
            style={added ? {} : { background: purple }}
            title="Add to cart"
          >
            {added ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Navbar({ current, onNavigate, role: explicitRole }: { current: Screen; onNavigate: (s: Screen) => void; role?: "customer" | "vendor" | "admin" | "guest" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const aiDropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, role: authRole } = useAuth();
  const { cartCount } = useCart();
  const effectiveRole = isAuthenticated ? (explicitRole || authRole || "customer") : "guest";

  const aiScreens: Screen[] = ["ai-chatbot", "ai-outfit", "text-to-design"];
  const isAiActive = aiScreens.includes(current);

  // Close AI dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(event.target as Node)) {
        setAiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <nav className="w-full max-w-6xl bg-white/80 backdrop-blur-2xl border border-white/80 shadow-xl shadow-purple-950/10 rounded-full px-4 sm:px-6 py-2 flex items-center justify-between pointer-events-auto transition-all duration-300">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 font-black text-base sm:text-lg tracking-tight shrink-0 group cursor-pointer" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>TS</span>
          <span style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TRENDSPROUT</span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <button onClick={() => onNavigate("browse")} className={`hover:text-purple-600 transition-colors cursor-pointer ${current === "browse" || current === "search-results" ? "text-purple-600 font-bold" : ""}`}>Shop</button>
          
          {/* AI dropdown */}
          <div 
            ref={aiDropdownRef} 
            className="relative py-1" 
            onMouseEnter={() => setAiOpen(true)} 
            onMouseLeave={() => setAiOpen(false)}
          >
            <button 
              type="button"
              onClick={() => setAiOpen(prev => !prev)}
              className={`flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-pointer select-none ${isAiActive ? "text-purple-600 font-bold" : ""}`}
            >
              <Sparkles size={14} className={isAiActive ? "text-purple-600" : "text-purple-500"} />
              <span>AI Tools</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${aiOpen ? "rotate-180 text-purple-600" : ""}`} />
            </button>
            <AnimatePresence>
              {aiOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
                >
                  <div className="w-64 bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl shadow-purple-950/20 p-2.5 ring-1 ring-black/5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 mb-1">AI Styling Suite</p>
                    {aiTools.map(t => (
                      <button 
                        key={t.screen} 
                        onClick={() => { onNavigate(t.screen); setAiOpen(false); }}
                        className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-2xl text-left hover:bg-purple-50/80 transition-all group cursor-pointer ${current === t.screen ? "bg-purple-50 text-purple-700 font-bold" : ""}`}
                      >
                        <span className={`mt-0.5 p-1.5 rounded-xl ${current === t.screen ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600"} transition-colors`}>{t.icon}</span>
                        <div>
                          <p className={`text-xs font-bold ${current === t.screen ? "text-purple-700" : "text-gray-800 group-hover:text-purple-700"} transition-colors`}>{t.label}</p>
                          <p className="text-[11px] text-gray-400 group-hover:text-gray-500 leading-tight">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => onNavigate("seller-store")} className={`hover:text-purple-600 transition-colors cursor-pointer ${current === "seller-store" ? "text-purple-600 font-bold" : ""}`}>Brands</button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button 
            onClick={() => onNavigate("vendor-dashboard")} 
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white shadow-sm cursor-pointer"
          >
            <Store size={13} />
            <span>Vendor Studio</span>
          </button>
          <button onClick={() => onNavigate("search-results")} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all cursor-pointer" title="Search"><Search size={16} /></button>
          <button onClick={() => onNavigate("wishlist")} className="hidden xs:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all cursor-pointer" title="Wishlist"><Heart size={16} /></button>
          <button onClick={() => onNavigate("cart")} className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all cursor-pointer" title="Cart">
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse" style={{ background: purple }}>
                {cartCount}
              </span>
            )}
          </button>
          {effectiveRole === "guest" || !isAuthenticated
            ? <button onClick={() => onNavigate("login")} className="py-2 px-5 rounded-full text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all cursor-pointer" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>Sign In</button>
            : <button onClick={() => onNavigate("profile")} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer flex items-center justify-center bg-purple-100 text-purple-700 font-bold text-xs" title="My Profile">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user?.name || "avatar"} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name.charAt(0).toUpperCase() : (user?.username ? user.username.charAt(0).toUpperCase() : "U")}</span>
                )}
              </button>
          }
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition-all cursor-pointer ml-0.5" aria-label="Toggle Menu">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
    </header>

      {/* Mobile Drawer - Partial Screen Floating Card with Backdrop */}
      {mobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden" 
            onClick={() => setMobileOpen(false)} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed top-16 right-3 w-[290px] max-w-[85vw] max-h-[calc(100dvh-5rem)] bg-white/95 backdrop-blur-2xl rounded-3xl border border-gray-100 shadow-2xl p-4 flex flex-col gap-1.5 overflow-y-auto z-50"
          >
            {/* Quick Vendor CTA */}
            <button 
              onClick={() => { onNavigate("vendor-dashboard"); setMobileOpen(false); }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white font-bold text-xs shadow-md mb-1 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Store size={16} className="text-purple-300" />
                <span>Open Vendor Studio</span>
              </div>
              <ChevronRight size={14} className="text-purple-300" />
            </button>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mt-1">Shopping</p>
            {[
              { label: "Shop Catalog", screen: "browse" as Screen, icon: <ShoppingBag size={15} /> },
              { label: "Search Products", screen: "search-results" as Screen, icon: <Search size={15} /> },
              { label: "Saved Wishlist", screen: "wishlist" as Screen, icon: <Heart size={15} /> },
              { label: "Brand Stores", screen: "seller-store" as Screen, icon: <Store size={15} /> },
              { label: "Active Orders", screen: "orders" as Screen, icon: <Package size={15} /> },
            ].map(item => (
              <button key={item.label} onClick={() => { onNavigate(item.screen); setMobileOpen(false); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${current === item.screen ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}>
                <span className="text-gray-400">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mt-2">AI Tools</p>
            {aiTools.map(item => (
              <button key={item.label} onClick={() => { onNavigate(item.screen); setMobileOpen(false); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${current === item.screen ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-700 hover:bg-gray-50"}`}>
                <span className="text-purple-600">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{item.label}</p>
                </div>
              </button>
            ))}

            <div className="pt-2.5 mt-1 border-t border-gray-100 flex items-center justify-between">
              {effectiveRole === "guest" || !isAuthenticated ? (
                <PrimaryBtn onClick={() => { onNavigate("login"); setMobileOpen(false); }} className="w-full !py-2 !text-xs">Sign In / Register</PrimaryBtn>
              ) : (
                <button onClick={() => { onNavigate("profile"); setMobileOpen(false); }} className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <span className="text-xs font-bold text-gray-800">{user?.name || user?.username || "My Account"}</span>
                  </div>
                  <span className="text-[11px] text-purple-600 font-semibold">Profile →</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}

export function VendorSidebar({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const [vendorMobileOpen, setVendorMobileOpen] = useState(false);
  const items = [
    { screen: "vendor-dashboard" as Screen, icon: <Home size={18} />, label: "Dashboard" },
    { screen: "vendor-products" as Screen, icon: <Package size={18} />, label: "Products" },
    { screen: "vendor-add-product" as Screen, icon: <Plus size={18} />, label: "Add Product (AI BG)" },
    { screen: "vendor-payouts" as Screen, icon: <CreditCard size={18} />, label: "Payouts & Wallet" },
    { screen: "vendor-ai-description" as Screen, icon: <FileText size={18} />, label: "AI Copywriter" },
    { screen: "vendor-ai-pricing" as Screen, icon: <DollarSign size={18} />, label: "AI Smart Pricing" },
    { screen: "vendor-orders" as Screen, icon: <ShoppingBag size={18} />, label: "Orders" },
    { screen: "store-customization" as Screen, icon: <Palette size={18} />, label: "Store" },
    { screen: "profile-settings" as Screen, icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Top App Bar for Vendor Mode */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0f] z-50 flex items-center justify-between px-4 border-b border-white/10 shadow-lg">
        <button 
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 font-bold text-base text-white hover:opacity-90 transition-opacity cursor-pointer text-left" 
          style={{ fontFamily: "'Clash Display', sans-serif" }}
        >
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-md shadow-purple-900/40" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>TS</span>
          <div className="flex flex-col">
            <span className="leading-tight">TRENDSPROUT</span>
            <span className="text-[10px] text-gray-400 font-normal tracking-wide">Vendor Studio</span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate("home")} 
            className="px-2.5 py-1.5 rounded-lg bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Store</span>
          </button>
          <button 
            onClick={() => setVendorMobileOpen(!vendorMobileOpen)} 
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Toggle Vendor Menu"
          >
            {vendorMobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Vendor Partial Drawer */}
      {vendorMobileOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40" 
            onClick={() => setVendorMobileOpen(false)} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden fixed top-16 right-3 w-[290px] max-w-[85vw] max-h-[calc(100dvh-5rem)] bg-[#0a0a0f]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-4 flex flex-col gap-1 overflow-y-auto z-50"
          >
            {items.map(item => (
              <button
                key={item.screen}
                onClick={() => { onNavigate(item.screen); setVendorMobileOpen(false); }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${current === item.screen ? "text-white bg-purple-900/40 border-l-2 border-purple-500 font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                {item.icon}{item.label}
              </button>
            ))}
            <div className="pt-2.5 mt-1 border-t border-white/10">
              <button onClick={() => { onNavigate("home"); setVendorMobileOpen(false); }} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-purple-300 hover:text-white hover:bg-white/5 transition-all w-full cursor-pointer">
                <LogOut size={15} />Return to Storefront
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:flex fixed top-0 left-0 h-full w-60 flex-col pt-8 pb-6 z-40" style={{ background: "#0a0a0f" }}>
        <div className="px-6 mb-8">
          <button 
            onClick={() => onNavigate("home")} 
            className="group flex flex-col items-start text-left cursor-pointer transition-transform active:scale-95"
          >
            <div className="flex items-center gap-2.5 font-bold text-lg text-white group-hover:text-purple-300 transition-colors" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg shadow-purple-900/50 group-hover:scale-105 transition-transform" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>TS</span>
              TRENDSPROUT
            </div>
            <p className="text-xs text-gray-500 mt-1 pl-10 group-hover:text-gray-400 transition-colors">Vendor Portal</p>
          </button>
        </div>
        <div className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
          {items.map(item => (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${current === item.screen ? "text-white font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              style={current === item.screen ? { background: `linear-gradient(135deg, ${purple}22, ${purple}11)`, color: "#a78bfa", borderLeft: `2px solid ${purple}` } : {}}
            >
              {item.icon}{item.label}
            </button>
          ))}
        </div>
        <div className="px-3 mt-auto pt-4 border-t border-white/5">
          <button onClick={() => onNavigate("home")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full cursor-pointer">
            <LogOut size={18} />Back to Store
          </button>
        </div>
      </div>
    </>
  );
}

export function FloatingNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const isVendor = ["vendor-dashboard", "vendor-products", "vendor-add-product", "vendor-ai-description", "vendor-ai-pricing", "store-customization", "vendor-payouts", "vendor-orders"].includes(current);
  const isAdmin = current === "admin-dashboard";
  const isFullscreen = ["splash", "payment", "error-404", "error-payment"].includes(current);
  if (isVendor || isAdmin || isFullscreen) return null;
  return null;
}

export function QuickNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const [open, setOpen] = useState(false);
  const screens: { label: string; screen: Screen; group: string }[] = [
    { group: "Landing", label: "Home", screen: "home" },
    { group: "Auth", label: "Login", screen: "login" },
    { group: "Auth", label: "Register", screen: "register" },
    { group: "Auth", label: "OTP", screen: "otp" },
    { group: "Auth", label: "Forgot Password", screen: "forgot-password" },
    { group: "Customer", label: "Dashboard", screen: "customer-dashboard" },
    { group: "Customer", label: "Browse", screen: "browse" },
    { group: "Customer", label: "Search", screen: "search-results" },
    { group: "Customer", label: "Product Detail", screen: "product-detail" },
    { group: "Customer", label: "Cart", screen: "cart" },
    { group: "Customer", label: "Checkout", screen: "checkout" },
    { group: "Customer", label: "Payment", screen: "payment" },
    { group: "Customer", label: "Orders", screen: "orders" },
    { group: "Customer", label: "Tracking", screen: "tracking" },
    { group: "Customer", label: "Wishlist", screen: "wishlist" },
    { group: "Customer", label: "Profile", screen: "profile" },
    { group: "Customer", label: "Settings", screen: "profile-settings" },
    { group: "Customer", label: "Seller Store", screen: "seller-store" },
    { group: "Customer", label: "Coupons", screen: "coupons" },
    { group: "AI", label: "AI Chatbot", screen: "ai-chatbot" },
    { group: "AI", label: "Outfit Generator", screen: "ai-outfit" },
    { group: "AI", label: "Text to Design", screen: "text-to-design" },
    { group: "Vendor", label: "Vendor Dashboard", screen: "vendor-dashboard" },
    { group: "Vendor", label: "Products", screen: "vendor-products" },
    { group: "Vendor", label: "Payouts & Wallet", screen: "vendor-payouts" },
    { group: "Vendor", label: "Orders & Fulfillment", screen: "vendor-orders" },
    { group: "Vendor", label: "Add Product", screen: "vendor-add-product" },
    { group: "Vendor", label: "AI Description", screen: "vendor-ai-description" },
    { group: "Vendor", label: "AI Pricing", screen: "vendor-ai-pricing" },
    { group: "Vendor", label: "Store Customization", screen: "store-customization" },
    { group: "Admin", label: "Admin Dashboard", screen: "admin-dashboard" },
    { group: "Errors", label: "404 Error", screen: "error-404" },
    { group: "Errors", label: "Payment Failed", screen: "error-payment" },
  ];
  const groups = [...new Set(screens.map(s => s.group))];
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button onClick={() => setOpen(!open)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-purple-400/40 transition-all hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>
        {open ? <X size={20} /> : <Grid size={20} />}
      </button>
      {open && (
        <div className="absolute bottom-14 right-0 w-72 max-h-[70vh] overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-2xl shadow-black/20 p-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-3">Navigate to Screen</p>
          {groups.map(group => (
            <div key={group} className="mb-3">
              <p className="text-xs font-semibold text-gray-500 px-2 mb-1.5">{group}</p>
              {screens.filter(s => s.group === group).map(s => (
                <button key={s.screen} onClick={() => { onNavigate(s.screen); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${current === s.screen ? "text-white font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-purple-700"}`}
                  style={current === s.screen ? { background: purple } : {}}>
                  {s.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
