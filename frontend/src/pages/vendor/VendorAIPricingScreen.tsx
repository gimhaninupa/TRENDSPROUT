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
import api from '../../services/api';

export function VendorAIPricingScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [yourPrice, setYourPrice] = useState("12500");
  const [prodCost, setProdCost] = useState("5500");
  const [category, setCategory] = useState("Blazers");
  const [pricingData, setPricingData] = useState<any>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await api.generateVendorPricing({
        category,
        productionCost: Number(prodCost) || 5500,
        targetMargin: 55,
      });
      if (res?.data) {
        setPricingData(res.data);
        setAnalyzed(true);
        setAnalyzing(false);
        return;
      }
    } catch {}

    const cost = Number(prodCost) || 5500;
    const suggested = Math.round((cost * 1.55) / 100) * 100;
    setPricingData({
      suggestedPrice: suggested,
      optimalDiscountPrice: Math.round((suggested * 0.9) / 100) * 100,
      competitorRange: {
        min: Math.round((suggested * 0.82) / 100) * 100,
        max: Math.round((suggested * 1.35) / 100) * 100,
      },
      estimatedGrossMargin: "55%",
      profitPerUnit: suggested - cost,
    });
    setAnalyzed(true);
    setAnalyzing(false);
  };

  const handleApplyPrice = (priceVal: number) => {
    try {
      localStorage.setItem('ts_ai_pricing', String(priceVal));
    } catch {}
    onNavigate("vendor-add-product");
  };

  const recommendedPrice = pricingData?.suggestedPrice || 12500;
  const lowPrice = pricingData?.competitorRange?.min || 9500;
  const highPrice = pricingData?.competitorRange?.max || 18500;

  return (
    <div className="min-h-screen bg-gray-50 pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-ai-pricing" onNavigate={onNavigate} />
      <div className="p-8 max-w-3xl">
        <button onClick={() => onNavigate("vendor-add-product")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 mb-6 cursor-pointer"><ChevronLeft size={14} />Back</button>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}><DollarSign size={18} /></div>
          <div><h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>AI Pricing Advisor</h1><p className="text-gray-500 text-sm">Data-driven pricing recommendations</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Your price (LKR)" placeholder="12500" value={yourPrice} onChange={e => setYourPrice(e.target.value)} />
              <Input label="Production cost (LKR)" placeholder="5500" value={prodCost} onChange={e => setProdCost(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"><option>Blazers</option><option>Dresses</option><option>Knitwear</option><option>Accessories</option></select></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Brand tier</label><select className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"><option>Emerging</option><option>Established</option><option>Luxury</option></select></div>
            </div>
            <PrimaryBtn onClick={handleAnalyze} disabled={analyzing} className="w-full !py-4 !rounded-2xl" icon={<Activity size={18} />}>{analyzing ? "Evaluating Market Pricing…" : "Analyze Pricing"}</PrimaryBtn>
          </div>
        </div>
        {analyzed && (
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5">Market Analysis</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Market Low", val: lkr(lowPrice), sub: "Budget tier" }, 
                  { label: "Recommended", val: lkr(recommendedPrice), sub: "Optimal margin", highlight: true }, 
                  { label: "Market High", val: lkr(highPrice), sub: "Luxury tier" }
                ].map(p => (
                  <div key={p.label} className={`rounded-xl p-4 text-center ${p.highlight ? "text-white" : "bg-gray-50"}`} style={p.highlight ? { background: `linear-gradient(135deg, ${purple}, #9333ea)` } : {}}>
                    <div className={`text-2xl font-black ${p.highlight ? "text-white" : "text-gray-900"}`} style={{ fontFamily: "'Clash Display', sans-serif" }}>{p.val}</div>
                    <div className={`text-xs font-semibold mt-1 ${p.highlight ? "text-purple-200" : "text-gray-500"}`}>{p.label}</div>
                    <div className={`text-xs mt-0.5 ${p.highlight ? "text-purple-300" : "text-gray-400"}`}>{p.sub}</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={[{ range: "<50K", products: 12 }, { range: "50–70K", products: 34 }, { range: "70–90K", products: 56 }, { range: "90–110K", products: 28 }, { range: ">110K", products: 14 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="products" fill={purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-3">AI Recommendation</h3>
              <div className="p-4 rounded-xl mb-4" style={{ background: purpleLight }}>
                <p className="text-sm text-purple-800 leading-relaxed">
                  Pricing at <strong>{lkr(recommendedPrice)}</strong> provides an optimal balance between market competitiveness and healthy gross margins ({pricingData?.estimatedGrossMargin || "55%"}). Estimated profit per garment: <strong>{lkr(pricingData?.profitPerUnit || (recommendedPrice - (Number(prodCost) || 5500)))}</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <PrimaryBtn onClick={() => handleApplyPrice(recommendedPrice)} className="flex-1 !py-3 cursor-pointer" icon={<Check size={16} />}>Apply {lkr(recommendedPrice)} to Product</PrimaryBtn>
                <GhostBtn onClick={() => onNavigate("vendor-add-product")} className="flex-1 !py-3 cursor-pointer">Cancel</GhostBtn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
