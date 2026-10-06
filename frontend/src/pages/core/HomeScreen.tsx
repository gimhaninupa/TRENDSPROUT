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
import api from '../../services/api';
import { 
    Screen, purple, purpleLight, purpleDark, lkr, 
    products, categories, testimonials, analyticsData, pieData, vendorProducts, chatMessages, faqs,
    Badge, StarRating, PrimaryBtn, GhostBtn, Input, GlassCard, ProductCard, Navbar, VendorSidebar, FloatingNav, QuickNav
} from '../../components/shared';

export function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [trendingList, setTrendingList] = useState<any[]>(() => {
    try {
      const vendorSaved = localStorage.getItem('ts_vendor_products');
      return vendorSaved ? JSON.parse(vendorSaved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    api.getProducts({ limit: 12 })
      .then(res => {
        if (isMounted) {
          const formatted = (res?.data || []).map(item => {
            const rawImages = Array.isArray(item.images) && item.images.length > 0 
              ? item.images 
              : (item.image ? [item.image] : []);
            return {
              id: item._id || item.id,
              _id: item._id || item.id,
              name: item.name,
              price: item.price,
              originalPrice: item.originalPrice || Math.round(item.price * 1.25),
              brand: item.brand || item.vendor?.vendorStore?.storeName || 'Independent Label',
              tag: item.tag || 'New',
              rating: item.rating || 5.0,
              reviews: item.reviewsCount || 0,
              image: rawImages[0] || item.image || '',
              images: rawImages,
              category: item.category?.name || item.category || 'Apparel',
              description: item.description,
              sizes: item.sizes || ['S', 'M', 'L'],
              colors: item.colors || ['Standard'],
            };
          });

          const vendorSaved = localStorage.getItem('ts_vendor_products');
          const vendorItems: any[] = vendorSaved ? JSON.parse(vendorSaved) : [];

          const seenIds = new Set<string>();
          const seenNames = new Set<string>();
          const uniqueList: any[] = [];

          // 1. Live database products first
          formatted.forEach((p: any) => {
            const pId = String(p.id || p._id || '');
            const pNameBrand = `${(p.name || '').trim().toLowerCase()}___${(p.brand || '').trim().toLowerCase()}`;
            if (pId) seenIds.add(pId);
            if (pNameBrand !== '___') seenNames.add(pNameBrand);
            uniqueList.push(p);
          });

          // 2. Add local vendor items only if not duplicated
          vendorItems.forEach((p: any) => {
            const pId = String(p.id || p._id || '');
            const pNameBrand = `${(p.name || '').trim().toLowerCase()}___${(p.brand || '').trim().toLowerCase()}`;
            const isDuplicate = (pId && seenIds.has(pId)) || (pNameBrand !== '___' && seenNames.has(pNameBrand));
            if (!isDuplicate) {
              if (pId) seenIds.add(pId);
              if (pNameBrand !== '___') seenNames.add(pNameBrand);
              const rawImgs = Array.isArray(p.images) && p.images.length > 0 
                ? p.images 
                : (p.image ? [p.image] : []);
              uniqueList.push({
                ...p,
                id: p.id || p._id,
                _id: p._id || p.id,
                images: rawImgs,
                image: rawImgs[0] || p.image || '',
              });
            }
          });

          setTrendingList(uniqueList.slice(0, 8));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const getCategoryCount = (categoryName: string) => {
    return trendingList.filter(p => {
      const cat = (typeof p.category === 'string' ? p.category : p.category?.name || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const target = categoryName.toLowerCase();
      return cat.includes(target) || target.includes(cat) || name.includes(target);
    }).length;
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background Ambient Glowing Refraction Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] rounded-full opacity-30 blur-[140px]" style={{ background: `radial-gradient(circle, #c084fc, #7C3AED, transparent)` }} />
        <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] rounded-full opacity-20 blur-[130px]" style={{ background: `radial-gradient(circle, #818cf8, #a855f7, transparent)` }} />
        <div className="absolute bottom-1/4 right-0 w-[550px] h-[550px] rounded-full opacity-25 blur-[140px]" style={{ background: `radial-gradient(circle, #f472b6, #9333ea, transparent)` }} />
      </div>

      <div className="relative z-10">
        <Navbar current="home" onNavigate={onNavigate} />

        {/* Neat Clean Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden min-h-[85vh] flex items-center">
          {/* Subtle Ambient Light Reflections */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-purple-200/35 blur-[130px] pointer-events-none" />
          <div className="absolute top-16 right-16 w-28 h-28 rounded-full bg-white/70 border border-purple-200/50 shadow-xl shadow-purple-500/10 backdrop-blur-xl pointer-events-none hidden md:block" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Clean Typography & Pill CTA */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }} 
              className="lg:col-span-6 flex flex-col items-start text-left z-10"
            >
              <span className="text-xs sm:text-sm font-medium tracking-widest text-gray-500 mb-3 capitalize">
                designer collection for seasonal wear
              </span>

              <h1 
                className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-black text-gray-900 tracking-tight leading-[1.02] mb-8 select-none"
                style={{ fontFamily: "'Clash Display', 'Inter', sans-serif" }}
              >
                FASHION<br />
                <span style={{ color: "#111827" }}>COLLECTION</span>
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => onNavigate("browse")}
                  className="px-9 py-4 rounded-full text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-purple-600/30 hover:shadow-2xl hover:shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${purple}, #7C3AED)` }}
                >
                  <span>SHOP COLLECTION</span>
                </button>
                <button 
                  onClick={() => onNavigate("ai-outfit")}
                  className="px-6 py-4 rounded-full text-purple-700 bg-white/80 hover:bg-white border border-purple-200/80 font-bold text-xs uppercase tracking-wider hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} className="text-purple-600" />
                  <span>AI STYLIST</span>
                </button>
              </div>
            </motion.div>

            {/* Right Column: High-Fashion Editorial Model Showcase */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 30 }} 
              animate={{ opacity: 1, scale: 1, x: 0 }} 
              transition={{ duration: 0.9, delay: 0.15 }} 
              className="lg:col-span-6 relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg lg:max-w-xl">
                {/* Soft backdrop circle glow matching logo */}
                <div 
                  className="absolute -inset-4 rounded-full opacity-35 blur-2xl pointer-events-none" 
                  style={{ background: `radial-gradient(circle, ${purple}40, transparent 70%)` }} 
                />

                {/* Editorial Model Image Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/10 border-4 border-white/90 backdrop-blur-sm bg-gradient-to-b from-purple-50/50 to-white/80">
                  <img 
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85" 
                    alt="Fashion Collection Editorial" 
                    className="w-full h-[460px] sm:h-[540px] object-cover object-top hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                  {/* Clean Minimalist Season Tag */}
                  <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 text-[11px] font-bold text-gray-900 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: purple }} />
                    <span>SPRING / SUMMER 2026</span>
                  </div>
                </div>

                {/* Ambient Minimalist Frosted Orb Accent */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/85 border border-white/90 shadow-lg shadow-purple-500/10 backdrop-blur-xl hidden sm:flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">NEW DROP</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* AI Features Suite - Frosted Glass Aesthetics */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                <Sparkles size={12} />
                Next-Gen Fashion Intelligence
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mt-1 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Fashion Engineered by AI
              </h2>
              <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto font-normal">
                Our neural models understand your aesthetic DNA, occasion requirements, and runway trends in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Bot className="w-5 h-5" />, title: "AI Chatbot Stylist", desc: "Instant high-fashion styling advice trained on decades of global runway trends.", screen: "ai-chatbot" as Screen, tag: "Interactive" },
                { icon: <Wand2 className="w-5 h-5" />, title: "Outfit Generator", desc: "Complete head-to-toe outfits tailored to your occasion, vibe, and budget.", screen: "ai-outfit" as Screen, tag: "Smart Match" },
                { icon: <Image className="w-5 h-5" />, title: "Text to Design", desc: "Describe any dream outfit in natural language and visualize it instantly.", screen: "text-to-design" as Screen, tag: "Generative" },
              ].map(f => (
                <motion.div 
                  key={f.title} 
                  whileHover={{ y: -6, scale: 1.01 }} 
                  onClick={() => onNavigate(f.screen)}
                  className="rounded-3xl p-6 cursor-pointer bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl shadow-purple-900/5 hover:bg-white/95 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-300/30 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>
                        {f.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100/80">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-purple-700 transition-colors leading-snug">
                      {f.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      {f.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                    Launch Studio <ArrowRight size={13} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section - Glass Look */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Curated Collections</div>
                <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Shop by Category</h2>
              </div>
              <button onClick={() => onNavigate("browse")} className="hidden md:flex items-center gap-2 text-sm font-bold text-purple-600 hover:gap-3 transition-all px-4 py-2 rounded-xl bg-white/60 backdrop-blur-lg border border-purple-100 shadow-sm">
                View all <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
              {categories.slice(0, 5).map(cat => (
                <motion.div 
                  key={cat.name} 
                  whileHover={{ y: -6, scale: 1.02 }} 
                  onClick={() => onNavigate("browse")} 
                  className="group relative rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg shadow-purple-950/5 border-2 border-white/80 hover:shadow-2xl hover:shadow-purple-400/20 transition-all duration-300"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4">
                    <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
                      <h3 className="text-white font-bold text-sm sm:text-base leading-snug truncate">{cat.name}</h3>
                      <p className="text-purple-200 text-xs font-medium mt-0.5">{getCategoryCount(cat.name)} pieces</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section - Glass Look */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Runway & Streetwear</div>
                <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Trending Now</h2>
              </div>
              <button onClick={() => onNavigate("browse")} className="flex items-center gap-2 text-sm font-bold text-purple-600 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-lg border border-purple-100 shadow-sm">
                See all <ArrowRight size={16} />
              </button>
            </div>
            {trendingList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
                {trendingList.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>Fresh Catalog Ready for New Drops</h3>
                <p className="text-sm text-gray-500 mb-6">No products have been listed yet. Open a store or add your first fashion collection from the vendor portal.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <PrimaryBtn onClick={() => onNavigate("vendor-add-product")} icon={<Plus size={16} />}>
                    Add First Product
                  </PrimaryBtn>
                  <GhostBtn onClick={() => onNavigate("browse")}>
                    Explore Categories
                  </GhostBtn>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Vendor CTA - Glassmorphism Showcase Banner */}
        <section id="sell-section" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div 
              className="rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden shadow-2xl shadow-purple-950/30 border border-white/20 backdrop-blur-2xl" 
              style={{ background: `linear-gradient(135deg, rgba(30, 16, 53, 0.95) 0%, rgba(59, 20, 100, 0.95) 50%, rgba(109, 40, 217, 0.9) 100%)` }}
            >
              {/* Luminous Inner Glows */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-purple-200 text-xs font-bold uppercase tracking-wider mb-6 border border-white/15">
                  <Store size={14} className="text-purple-300" />
                  TRENDSPROUT Vendor Portal
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Launch Your Fashion Brand with AI
                </h2>
                <p className="text-purple-200 text-base lg:text-lg mb-8 max-w-xl mx-auto leading-relaxed font-light">
                  Set up your store in minutes, auto-generate AI product shoots & listings, and reach thousands of fashion-forward shoppers with instant PayHere & COD payouts.
                </p>

                {/* Vendor Feature Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 text-left">
                  {[
                    { icon: <Sparkles size={16} className="text-yellow-400" />, title: "AI Photo Studio", desc: "1-Click BG magic" },
                    { icon: <FileText size={16} className="text-purple-300" />, title: "AI Copywriter", desc: "Auto SEO descriptions" },
                    { icon: <TrendingUp size={16} className="text-emerald-400" />, title: "Smart Pricing", desc: "Market auto-pricing" },
                    { icon: <CreditCard size={16} className="text-blue-300" />, title: "PayHere LK & COD", desc: "Direct daily payouts" },
                  ].map((feat, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-xl rounded-2xl p-3.5 border border-white/15 hover:bg-white/15 transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        {feat.icon}
                        <span className="text-white text-xs font-bold">{feat.title}</span>
                      </div>
                      <p className="text-[11px] text-purple-200">{feat.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={() => onNavigate("vendor-dashboard")} 
                    className="px-8 py-4 rounded-2xl bg-white font-black text-purple-900 text-base hover:bg-purple-50 hover:shadow-2xl hover:shadow-purple-950/40 transition-all flex items-center gap-2 cursor-pointer shadow-xl"
                  >
                    <Store size={18} />
                    Open Vendor Studio
                  </button>
                  <button 
                    onClick={() => onNavigate("register")} 
                    className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 font-bold text-white text-base hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Start Selling Free <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Glass Look */}
        <section className="py-20 relative">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-4xl font-black text-gray-900 text-center mb-12" style={{ fontFamily: "'Clash Display', sans-serif" }}>Frequently Asked</h2>
            <div className="flex flex-col gap-3.5">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/80 shadow-md shadow-purple-950/5 overflow-hidden">
                  <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-bold text-gray-900 hover:text-purple-700 transition-colors">
                    {faq.q}
                    <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${activeFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {activeFaq === i && <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-purple-100/40 pt-4 font-normal">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-950 py-14 text-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-10 mb-10">
              <div>
                <div className="font-black text-white text-xl mb-3 flex items-center gap-2.5" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">TS</div>
                  TRENDSPROUT
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">The AI-powered fashion marketplace for the next generation of style.</p>
              </div>
              {[
                ["Shop", [
                  { label: "Dresses", route: "browse" }, 
                  { label: "Blazers", route: "browse" }, 
                  { label: "Accessories", route: "browse" }, 
                  { label: "New Arrivals", route: "browse" }
                ]],
                ["Sell", [
                  { label: "Start Selling", route: "register" }, 
                  { label: "Vendor Dashboard", route: "vendor-dashboard" }, 
                  { label: "AI Tools", route: "ai-chatbot" }, 
                  { label: "Pricing", route: "home" }
                ]],
              ].map(([title, links]) => (
                <div key={title as string}>
                  <div className="font-semibold text-white text-sm mb-4">{title as string}</div>
                  <ul className="flex flex-col gap-2">
                    {(links as {label: string, route: any}[]).map(l => <li key={l.label}><button onClick={() => onNavigate(l.route)} className="text-gray-400 text-sm hover:text-white transition-colors">{l.label}</button></li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-900 pt-8 text-center">
              <p className="text-gray-500 text-xs">© 2026 TRENDSPROUT. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
