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
  | "vendor-ai-description" | "vendor-ai-pricing" | "store-customization"
  | "admin-dashboard"
  | "error-404" | "error-payment" | "seller-store" | "search-results" | "coupons";

// ─── Data ─────────────────────────────────────────────────────────────────────
export const categories = [
  { name: 'Dresses', slug: 'dresses', count: 48, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80' },
  { name: 'Blazers', slug: 'blazers', count: 32, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80' },
  { name: 'Accessories', slug: 'accessories', count: 64, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=400&q=80' },
  { name: 'Activewear', slug: 'activewear', count: 28, image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Denim', slug: 'denim', count: 41, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80' },
  { name: 'Footwear', slug: 'footwear', count: 35, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
  { name: 'Knitwear', slug: 'knitwear', count: 22, image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Outerwear', slug: 'outerwear', count: 19, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
];

export const products = [
  {
    id: 'p1',
    name: 'Linen Slip Dress',
    price: 8500,
    originalPrice: 12000,
    brand: 'Aura Label',
    tag: 'Trending',
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    description: 'Breezy lightweight 100% organic European linen dress with adjustable straps and side slits. Crafted for tropical days and breezy rooftop evenings in Colombo.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Midnight Black', 'Ivory', 'Sage Green'],
  },
  {
    id: 'p2',
    name: 'Oversized Wool Blazer',
    price: 14500,
    originalPrice: 18000,
    brand: 'Nouveau Collective',
    tag: 'Sale',
    rating: 4.9,
    reviews: 38,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    description: 'Structured tailoring meets relaxed street fit. Features custom horn buttons, deep internal pockets, and padded shoulder contours.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Earth Brown', 'Charcoal', 'Cream'],
  },
  {
    id: 'p3',
    name: 'Leather Crossbody Bag',
    price: 9500,
    originalPrice: 11000,
    brand: 'Sprout Studio',
    tag: 'Trending',
    rating: 4.7,
    reviews: 19,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    description: 'Handcrafted full-grain pebbled leather with magnetic flap enclosure and gold hardware. Perfect compact companion for daily essentials.',
    sizes: ['One Size'],
    colors: ['Cognac Tan', 'Noir Black'],
  },
  {
    id: 'p4',
    name: 'Seamless Gym Leggings',
    price: 4200,
    originalPrice: 5000,
    brand: 'Veloce Active',
    tag: 'New',
    rating: 4.9,
    reviews: 52,
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80',
    description: 'High-waisted compression rib waistband with moisture-wicking 4-way stretch fabric. Squat-proof and sculpt-enhancing.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Lilac Purple', 'Shadow Black', 'Teal'],
  },
  {
    id: 'p5',
    name: 'Relaxed Vintage Denim Jacket',
    price: 7800,
    originalPrice: 9500,
    brand: 'Nouveau Collective',
    tag: 'Trending',
    rating: 4.6,
    reviews: 16,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    description: '13oz heavyweight vintage wash denim with dropped shoulders and antique brass hardware. Ages gracefully with every wear.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Washed Indigo', 'Raw Blue'],
  },
  {
    id: 'p6',
    name: 'Minimalist Vegan Sneakers',
    price: 11200,
    originalPrice: 15000,
    brand: 'Monolith Studio',
    tag: 'Sale',
    rating: 4.8,
    reviews: 44,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    description: 'Clean architectural silhouette made from durable vegan leather with recycled rubber soles and orthotic memory foam insoles.',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Classic White', 'Off-White Gum'],
  },
  {
    id: 'p7',
    name: 'Cable Knit Cashmere Cardigan',
    price: 6900,
    originalPrice: 8500,
    brand: 'Aura Label',
    tag: 'New',
    rating: 4.9,
    reviews: 29,
    image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=600&q=80',
    description: 'Ultra-soft chunky knit with textured cables and genuine horn buttons. Cozy oversized fit for breezy evening comfort.',
    sizes: ['S', 'M', 'L'],
    colors: ['Oatmeal', 'Espresso', 'Forest Green'],
  },
  {
    id: 'p8',
    name: 'Water-Resistant City Trench',
    price: 19500,
    originalPrice: 24000,
    brand: 'Sprout Studio',
    tag: 'Trending',
    rating: 5.0,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    description: 'Double-breasted storm flap trench coat featuring water-repellent gabardine twill, storm welt pockets, and adjustable waist sash.',
    sizes: ['S', 'M', 'L'],
    colors: ['Khaki Beige', 'Midnight Navy'],
  },
  {
    id: 'p9',
    name: 'Satin Cowl Party Dress',
    price: 12500,
    originalPrice: 15000,
    brand: 'Aura Label',
    tag: 'Trending',
    rating: 4.9,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
    description: 'Lustrous satin midi dress with elegant draped cowl neckline and delicate cross-back spaghetti straps.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Emerald Green', 'Champagne Gold', 'Ruby'],
  },
  {
    id: 'p10',
    name: 'Tailored Pleated Trousers',
    price: 9200,
    originalPrice: 11500,
    brand: 'Nouveau Collective',
    tag: 'New',
    rating: 4.8,
    reviews: 21,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    description: 'High-waisted wide leg trousers with sharp double front pleats and fluid tropical drape.',
    sizes: ['28', '30', '32', '34'],
    colors: ['Slate Grey', 'Ecru Cream', 'Jet Black'],
  },
  {
    id: 'p11',
    name: 'Heavyweight Street Boxy Tee',
    price: 3800,
    originalPrice: 4800,
    brand: 'Monolith Studio',
    tag: 'Trending',
    rating: 4.7,
    reviews: 35,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    description: '260GSM combed organic cotton with dropped shoulders and ribbed neckline for clean modern drape.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Washed Black', 'Bone White', 'Moss'],
  },
  {
    id: 'p12',
    name: 'Classic Oxford Button-Down',
    price: 5800,
    originalPrice: 7000,
    brand: 'Sprout Studio',
    tag: 'Sale',
    rating: 4.8,
    reviews: 19,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp 100% fine cotton oxford weave shirt with mother-of-pearl buttons and tailored cuff styling.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Sky Blue', 'Crisp White'],
  },
  {
    id: 'p13',
    name: 'Minimalist Utility Cargo Pants',
    price: 8200,
    originalPrice: 10000,
    brand: 'Monolith Studio',
    tag: 'New',
    rating: 4.8,
    reviews: 23,
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=600&q=80',
    description: 'Contemporary relaxed utility cargos featuring magnetic flush pockets and adjustable ankle bungee cords.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Olive Green', 'Stealth Charcoal'],
  },
  {
    id: 'p14',
    name: 'Gold Link Statement Necklace',
    price: 4500,
    originalPrice: 6000,
    brand: 'Sprout Studio',
    tag: 'Trending',
    rating: 4.9,
    reviews: 41,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    description: '18k gold-plated solid brass chunky link chain with custom geometric clasp closure.',
    sizes: ['One Size'],
    colors: ['18k Gold'],
  }
];

export const testimonials = [
  {
    name: "Kavindi Perera",
    rating: 5,
    text: "The AI Stylist built me a full cocktail look for a wedding in 30 seconds. The linen quality from Aura Label exceeded expectations!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Dineth Jayasuriya",
    rating: 5,
    text: "As a vendor, TRENDSPROUT gives me instant access to modern streetwear buyers. The AI pricing and description tools save hours every week.",
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
  { month: "Jan", revenue: 420000, orders: 48 },
  { month: "Feb", revenue: 580000, orders: 62 },
  { month: "Mar", revenue: 750000, orders: 85 },
  { month: "Apr", revenue: 920000, orders: 110 },
  { month: "May", revenue: 1150000, orders: 135 },
  { month: "Jun", revenue: 1420000, orders: 172 },
  { month: "Jul", revenue: 1850000, orders: 215 }
];

export const pieData = [
  { name: "Dresses", value: 38, color: "#6C4DF6" },
  { name: "Blazers", value: 24, color: "#9333ea" },
  { name: "Streetwear", value: 20, color: "#ec4899" },
  { name: "Accessories", value: 18, color: "#f59e0b" }
];

export const vendorProducts = products.slice(0, 5);

export const chatMessages = [
  { role: "ai", text: "Hello! I'm your TRENDSPROUT AI Stylist ✨ Tell me where you're heading, your preferred vibe, or any style questions, and I'll curate the perfect look for you." },
  { role: "user", text: "I need an outfit for an outdoor dinner party in Colombo this Friday. Something chic and modern under LKR 15,000." },
  { role: "ai", text: "For a warm Colombo evening, I recommend pairing our Linen Slip Dress in Sage Green (LKR 8,500) with minimalist gold drop earrings and strappy block heels. Effortlessly stylish and breathable! Would you like me to add it to your cart?" }
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
  { screen: "browse" as Screen, icon: <TrendingUp size={15} />, label: "Trend Predictor", desc: "What's hot next season" },
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
      localStorage.setItem('ts_selected_product', JSON.stringify(product));
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
  const { user, isAuthenticated, role: authRole } = useAuth();
  const { cartCount } = useCart();
  const effectiveRole = explicitRole || (isAuthenticated ? authRole : "guest");

  const aiScreens: Screen[] = ["ai-chatbot", "ai-outfit", "text-to-design"];
  const isAiActive = aiScreens.includes(current);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2 font-bold text-xl tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>TS</span>
          <span style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TRENDSPROUT</span>
        </button>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
          <button onClick={() => onNavigate("browse")} className={`hover:text-purple-600 transition-colors ${current === "browse" || current === "search-results" ? "text-purple-600" : ""}`}>Shop</button>
          {/* AI dropdown */}
          <div className="relative" onMouseEnter={() => setAiOpen(true)} onMouseLeave={() => setAiOpen(false)}>
            <button className={`flex items-center gap-1 hover:text-purple-600 transition-colors ${isAiActive ? "text-purple-600" : ""}`}>
              <Sparkles size={14} />AI Tools<ChevronDown size={12} className={`transition-transform ${aiOpen ? "rotate-180" : ""}`} />
            </button>
            {aiOpen && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/10 py-3 px-2 z-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">AI Features</p>
                {aiTools.map(t => (
                  <button key={t.screen} onClick={() => { onNavigate(t.screen); setAiOpen(false); }}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-purple-50 transition-all group ${current === t.screen ? "bg-purple-50" : ""}`}>
                    <span className={`mt-0.5 ${current === t.screen ? "text-purple-600" : "text-gray-400 group-hover:text-purple-500"} transition-colors`}>{t.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${current === t.screen ? "text-purple-700" : "text-gray-800"}`}>{t.label}</p>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onNavigate("seller-store")} className={`hover:text-purple-600 transition-colors ${current === "seller-store" ? "text-purple-600" : ""}`}>Brands</button>
          <button onClick={() => onNavigate(effectiveRole === "vendor" ? "vendor-dashboard" : "vendor-dashboard")} className="hover:text-purple-600 transition-colors">Sell</button>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => onNavigate("search-results")} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all"><Search size={18} /></button>
          <button onClick={() => onNavigate("wishlist")} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all"><Heart size={18} /></button>
          <button onClick={() => onNavigate("cart")} className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse" style={{ background: purple }}>
                {cartCount}
              </span>
            )}
          </button>
          {effectiveRole === "guest"
            ? <PrimaryBtn onClick={() => onNavigate("login")} className="!py-2 !px-4 !text-xs">Sign In</PrimaryBtn>
            : <button onClick={() => onNavigate("profile")} className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all">
                <img src={user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} alt="avatar" className="w-full h-full object-cover" />
              </button>
          }
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 flex items-center justify-center text-gray-600">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1">
          {[
            { label: "Shop", screen: "browse" as Screen },
            { label: "AI Chatbot", screen: "ai-chatbot" as Screen },
            { label: "Outfit Generator", screen: "ai-outfit" as Screen },
            { label: "Text to Design", screen: "text-to-design" as Screen },
            { label: "Trend Predictor", screen: "browse" as Screen },
            { label: "Brands", screen: "seller-store" as Screen },
            { label: "Sell on TRENDSPROUT", screen: "vendor-dashboard" as Screen },
            { label: "Cart", screen: "cart" as Screen },
            { label: "Wishlist", screen: "wishlist" as Screen },
          ].map(item => (
            <button key={item.label} onClick={() => { onNavigate(item.screen); setMobileOpen(false); }}
              className="text-left text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50 hover:text-purple-600 transition-colors">
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

export function VendorSidebar({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const items = [
    { screen: "vendor-dashboard" as Screen, icon: <Home size={18} />, label: "Dashboard" },
    { screen: "vendor-products" as Screen, icon: <Package size={18} />, label: "Products" },
    { screen: "vendor-add-product" as Screen, icon: <Plus size={18} />, label: "Add Product (AI BG)" },
    { screen: "vendor-ai-description" as Screen, icon: <FileText size={18} />, label: "AI Copywriter" },
    { screen: "vendor-ai-pricing" as Screen, icon: <DollarSign size={18} />, label: "AI Smart Pricing" },
    { screen: "vendor-analytics" as Screen, icon: <BarChart2 size={18} />, label: "Analytics" },
    { screen: "orders" as Screen, icon: <ShoppingBag size={18} />, label: "Orders" },
    { screen: "store-customization" as Screen, icon: <Palette size={18} />, label: "Store" },
    { screen: "profile-settings" as Screen, icon: <Settings size={18} />, label: "Settings" },
  ];
  return (
    <div className="fixed top-0 left-0 h-full w-60 flex flex-col pt-8 pb-6" style={{ background: "#0a0a0f" }}>
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2.5 font-bold text-lg text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>TS</span>
          TRENDSPROUT
        </div>
        <p className="text-xs text-gray-500 mt-1 pl-10">Vendor Portal</p>
      </div>
      <div className="flex-1 px-3 flex flex-col gap-1">
        {items.map(item => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${current === item.screen ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            style={current === item.screen ? { background: `linear-gradient(135deg, ${purple}22, ${purple}11)`, color: "#a78bfa", borderLeft: `2px solid ${purple}` } : {}}
          >
            {item.icon}{item.label}
          </button>
        ))}
      </div>
      <div className="px-3 mt-auto">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full">
          <LogOut size={18} />Back to Store
        </button>
      </div>
    </div>
  );
}

export function FloatingNav({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const isVendor = ["vendor-dashboard", "vendor-products", "vendor-analytics", "vendor-add-product", "vendor-ai-description", "vendor-ai-pricing", "store-customization"].includes(current);
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
    { group: "Vendor", label: "Analytics", screen: "vendor-analytics" },
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
