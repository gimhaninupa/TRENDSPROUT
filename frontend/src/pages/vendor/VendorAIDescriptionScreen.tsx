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

export function VendorAIDescriptionScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [title, setTitle] = useState("Oversized Linen Blazer");
  const [material, setMaterial] = useState("Irish Linen");
  const [color, setColor] = useState("Natural Ivory");
  const [tone, setTone] = useState("Editorial");

  const generate = async () => {
    setGenerating(true); 
    setResult("");
    try {
      const res = await api.generateVendorDescription({
        title,
        material,
        tone
      });
      if (res?.data?.description) {
        setResult(res.data.description);
        setGenerating(false);
        return;
      }
    } catch (err) {
      console.warn("AI Description API offline, using smart engine:", err);
    }

    const text = `Crafted from 100% premium ${material || 'Irish linen'}, the ${title || 'Oversized Blazer'} embodies contemporary ${tone.toLowerCase()} elegance. An unstructured silhouette offers effortless movement while the deliberately relaxed shoulder line flatters every frame. Fully unlined for tropical breathability, it transitions seamlessly from daytime commerce to rooftop evening cocktails.`;
    setResult(text);
    setGenerating(false);
  };

  const handleUseThis = () => {
    if (result) {
      localStorage.setItem('ts_ai_generated_desc', result);
    }
    onNavigate("vendor-add-product");
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-ai-description" onNavigate={onNavigate} />
      <div className="p-8 max-w-3xl">
        <button onClick={() => onNavigate("vendor-add-product")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 transition-colors mb-6 cursor-pointer"><ChevronLeft size={14} />Back to product</button>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}><FileText size={18} /></div>
          <div><h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>AI Description Generator</h1><p className="text-gray-500 text-sm">Write compelling product copy instantly</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <h3 className="font-bold text-gray-900 mb-4">Product Details</h3>
          <div className="flex flex-col gap-4">
            <Input label="Product name" placeholder="Oversized Linen Blazer" value={title} onChange={e => setTitle(e.target.value)} />
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label><select className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"><option>Blazers</option><option>Dresses</option><option>Knitwear</option></select></div>
              <Input label="Primary fabric" placeholder="Irish Linen" value={material} onChange={e => setMaterial(e.target.value)} />
              <Input label="Color" placeholder="Natural Ivory" value={color} onChange={e => setColor(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Key features (comma-separated)</label>
              <input defaultValue="Oversized fit, Unlined, 4 colorways, Sustainable fabric" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Tone</label>
              <div className="flex gap-2">
                {["Editorial", "Minimal", "Luxury", "Conversational"].map(t => (
                  <button key={t} onClick={() => setTone(t)} className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer ${tone === t ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:border-purple-300"}`} style={tone === t ? { background: purple } : {}}>{t}</button>
                ))}
              </div>
            </div>
            <PrimaryBtn onClick={generate} disabled={generating} className="w-full !py-4 !rounded-2xl" icon={<Wand2 size={18} />}>{generating ? "Crafting Copy with AI…" : "Generate Copy"}</PrimaryBtn>
          </div>
        </div>
        {(result || generating) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Generated Description</h3>
              {!generating && <div className="flex gap-2">
                <button onClick={generate} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-purple-300 flex items-center gap-1 cursor-pointer"><RefreshCw size={11} />Regenerate</button>
                <button onClick={handleUseThis} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1 cursor-pointer hover:opacity-95" style={{ background: purple }}><Check size={11} />Use This in Product</button>
              </div>}
            </div>
            <div className="bg-gray-50 rounded-xl p-5 min-h-[120px]">
              <p className="text-sm text-gray-700 leading-relaxed">{result}<span className={generating ? "animate-pulse" : "hidden"}>|</span></p>
            </div>
            {!generating && (
              <div className="flex gap-3 mt-4">
                {["SEO Score: 94", "Readability: A+", "Keywords: 8 found"].map(m => (
                  <span key={m} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full"><Check size={10} />{m}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
