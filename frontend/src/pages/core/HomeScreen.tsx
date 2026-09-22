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
      const vendorItems = vendorSaved ? JSON.parse(vendorSaved) : [];
      return [...vendorItems, ...products].slice(0, 4);
    } catch {
      return products.slice(0, 4);
    }
  });

  useEffect(() => {
    let isMounted = true;
    api.getProducts({ limit: 4 })
      .then(res => {
        if (isMounted && res?.data && res.data.length > 0) {
          const formatted = res.data.slice(0, 4).map(item => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice || Math.round(item.price * 1.25),
            brand: item.brand || 'Aura Label',
            tag: item.tag || 'Trending',
            rating: item.rating || 4.9,
            reviews: item.reviewsCount || 24,
            image: item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
            category: item.category?.name || item.category || 'Dresses',
            description: item.description,
            sizes: item.sizes || ['S', 'M', 'L'],
            colors: item.colors || ['Black', 'Ivory'],
          }));
          setTrendingList(formatted);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="home" onNavigate={onNavigate} role="guest" />
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${purple}, transparent)` }} />
          <div className="absolute -bottom-20 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl" style={{ background: `radial-gradient(circle, #9333ea, transparent)` }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8" style={{ background: purpleLight, color: purple }}>
              <Sparkles size={12} />AI-Powered Fashion Discovery
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-none mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Wear the<br />
              <span style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Future</span><br />
              of Fashion
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
              Discover emerging brands, get AI-powered style advice, and design your own pieces. The marketplace built for the next generation of fashion.
            </p>
            <div className="flex flex-wrap gap-4">
              <PrimaryBtn onClick={() => onNavigate("browse")} className="!py-4 !px-8 !text-base !rounded-2xl" icon={<ShoppingBag size={18} />}>Shop Now</PrimaryBtn>
              <GhostBtn onClick={() => onNavigate("ai-outfit")} className="!py-4 !px-8 !text-base !rounded-2xl">Try AI Stylist</GhostBtn>
            </div>
            <div className="flex items-center gap-6 mt-10">
              {[["50K+", "Products"], ["1.2K+", "Brands"], ["98%", "Satisfaction"]].map(([num, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{num}</div>
                  <div className="text-xs text-gray-400 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10">
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" alt="Fashion hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 60%, ${purple}33)` }} />
            </div>
            <GlassCard className="absolute -bottom-4 -left-8 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: purple }}><Bot size={18} /></div>
              <div>
                <div className="text-xs font-bold text-gray-900">AI Outfit Ready</div>
                <div className="text-xs text-gray-500">3 looks generated for you</div>
              </div>
            </GlassCard>
            <GlassCard className="absolute top-8 -right-6 p-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["/photo-1494790108377-be9c29b29330", "/photo-1507003211169-0a1dd7228f2d", "/photo-1438761681033-6461ffad8d80"].map((id, i) => (
                  <img key={i} src={`https://images.unsplash.com${id}?auto=format&fit=crop&w=150&h=150&q=80`} alt="user" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div className="text-xs">
                <span className="font-bold text-gray-900">2.4K</span>
                <span className="text-gray-500"> shopping now</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <Badge variant="purple">Powered by AI</Badge>
            <h2 className="text-4xl font-black text-gray-900 mt-4 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>Fashion Intelligence</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Our AI doesn't just recommend — it understands your style DNA and evolves with every interaction.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Bot size={24} />, title: "AI Chatbot Stylist", desc: "Real-time fashion advice powered by LLMs trained on decades of runway data.", screen: "ai-chatbot" as Screen },
              { icon: <Wand2 size={24} />, title: "Outfit Generator", desc: "Complete looks built from your wardrobe and our catalog — personalized to your occasion.", screen: "ai-outfit" as Screen },
              { icon: <Image size={24} />, title: "Text to Design", desc: "Describe your dream piece in words and watch our AI bring it to life visually.", screen: "text-to-design" as Screen },
              { icon: <TrendingUp size={24} />, title: "Trend Predictor", desc: "Stay ahead with AI-curated trend reports updated weekly from global runway data.", screen: "browse" as Screen },
            ].map(f => (
              <motion.div key={f.title} whileHover={{ y: -4 }} onClick={() => onNavigate(f.screen)}
                className="bg-white rounded-2xl p-6 cursor-pointer border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl mb-5 flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">Try it <ArrowRight size={12} /></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Shop by Category</h2>
              <p className="text-gray-500 mt-2">Curated collections from 1,200+ independent brands</p>
            </div>
            <button onClick={() => onNavigate("browse")} className="hidden md:flex items-center gap-2 text-sm font-semibold text-purple-600 hover:gap-3 transition-all">View all <ArrowRight size={16} /></button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <motion.div key={cat.name} whileHover={{ y: -4 }} onClick={() => onNavigate("browse")} className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer bg-gray-100">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7))" }} />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                  <p className="text-white/70 text-xs mt-0.5">{cat.count} items</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Trending Now</h2>
            <button onClick={() => onNavigate("browse")} className="flex items-center gap-2 text-sm font-semibold text-purple-600">See all <ArrowRight size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
            {trendingList.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, #0a0a0f 0%, #1a0a3e 100%)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>Loved by Fashion Insiders</h2>
          <p className="text-gray-400 mb-14">Join over 50,000 shoppers and 1,200 brands</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <GlassCard key={t.name} className="p-6 bg-white/5 border-white/10 text-left">
                <StarRating rating={t.rating} />
                <p className="text-gray-300 text-sm leading-relaxed my-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-purple-500" />
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white, transparent 40%), radial-gradient(circle at 80% 20%, white, transparent 40%)" }} />
            <div className="relative">
              <h2 className="text-4xl font-black text-white mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>Launch Your Fashion Brand</h2>
              <p className="text-purple-200 text-lg mb-8 max-w-xl mx-auto">Set up your store in minutes, use AI to write listings, and reach thousands of fashion-forward customers.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={() => onNavigate("register")} className="px-8 py-4 rounded-2xl bg-white font-bold text-purple-700 text-base hover:shadow-xl hover:shadow-purple-900/30 transition-all">Start Selling Free</button>
                <button onClick={() => onNavigate("vendor-dashboard")} className="px-8 py-4 rounded-2xl border-2 border-white/30 font-bold text-white text-base hover:bg-white/10 transition-all">View Vendor Demo</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-12" style={{ fontFamily: "'Clash Display', sans-serif" }}>Frequently Asked</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-semibold text-gray-900 hover:text-purple-700 transition-colors">
                  {faq.q}
                  <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ml-4 ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === i && <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="font-black text-white text-xl mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>TRENDSPROUT</div>
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
              ["Company", [
                { label: "About", route: "about" }, 
                { label: "Blog", route: "blog" }, 
                { label: "Careers", route: "careers" }, 
                { label: "Press", route: "press" }
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
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">© 2026 TRENDSPROUT. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <button onClick={() => onNavigate("privacy")} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => onNavigate("terms")} className="hover:text-white transition-colors">Terms</button>
              <button onClick={() => onNavigate("cookies")} className="hover:text-white transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
