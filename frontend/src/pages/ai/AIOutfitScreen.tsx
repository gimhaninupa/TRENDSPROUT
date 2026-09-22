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
import { useCart } from '../../context/CartContext';

export function AIOutfitScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { addToCart } = useCart();
  const [occasion, setOccasion] = useState("Rooftop Dinner");
  const [styleVibe, setStyleVibe] = useState("Editorial");
  const [budget, setBudget] = useState("LKR 66K–165K");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [outfits, setOutfits] = useState<any[]>([]);

  const generate = () => { 
    setGenerating(true); 
    setTimeout(() => { 
      setGenerating(false); 
      setGenerated(true); 

      // Expanded Catalog Access
      const pLinen = products[0];      // Linen Slip Dress (8,500)
      const pBlazer = products[1];     // Wool Blazer (14,500)
      const pBag = products[2];        // Leather Crossbody (9,500)
      const pLeggings = products[3];   // Gym Leggings (4,200)
      const pDenim = products[4];      // Denim Jacket (7,800)
      const pSneakers = products[5];   // Vegan Sneakers (11,200)
      const pCardigan = products[6];   // Cashmere Cardigan (6,900)
      const pTrench = products[7];     // City Trench Coat (19,500)
      const pSatin = products[8];      // Satin Party Dress (12,500)
      const pTrousers = products[9];   // Pleated Trousers (9,200)
      const pBoxyTee = products[10];   // Heavyweight Boxy Tee (3,800)
      const pOxford = products[11];    // Oxford Button-Down (5,800)
      const pCargos = products[12];    // Utility Cargo Pants (8,200)
      const pNecklace = products[13];  // Gold Link Necklace (4,500)

      let curatedLooks: any[] = [];

      // ─── 1. WEEKEND BRUNCH ──────────────────────────────────────────────────
      if (occasion === "Weekend Brunch") {
        if (styleVibe === "Streetwear") {
          curatedLooks = [
            {
              name: `Urban Streetwear Brunch`,
              total: pBoxyTee.price + pCargos.price + pSneakers.price,
              items: [pBoxyTee, pCargos, pSneakers],
            },
            {
              name: `Oversized Denim & Cargo Duo`,
              total: pDenim.price + pCargos.price + pBag.price,
              items: [pDenim, pCargos, pBag],
            },
            {
              name: `Minimalist Athleisure Fit`,
              total: pLeggings.price + pBoxyTee.price + pSneakers.price,
              items: [pLeggings, pBoxyTee, pSneakers],
            }
          ];
        } else if (styleVibe === "Classic") {
          curatedLooks = [
            {
              name: `Classic Oxford & Trousers`,
              total: pOxford.price + pTrousers.price + pSneakers.price,
              items: [pOxford, pTrousers, pSneakers],
            },
            {
              name: `Cardigan Drape Brunch Ensemble`,
              total: pCardigan.price + pTrousers.price + pBag.price,
              items: [pCardigan, pTrousers, pBag],
            },
            {
              name: `Breezy Linen & Cardigan`,
              total: pLinen.price + pCardigan.price,
              items: [pLinen, pCardigan],
            }
          ];
        } else {
          curatedLooks = [
            {
              name: `Café Linen Slip & Denim Layer`,
              total: pLinen.price + pDenim.price + pBag.price,
              items: [pLinen, pDenim, pBag],
            },
            {
              name: `Pleated Trousers & Boxy Knit`,
              total: pTrousers.price + pCardigan.price + pSneakers.price,
              items: [pTrousers, pCardigan, pSneakers],
            },
            {
              name: `Cozy Cashmere Coffee Run`,
              total: pCardigan.price + pLeggings.price + pSneakers.price,
              items: [pCardigan, pLeggings, pSneakers],
            }
          ];
        }
      } 
      // ─── 2. WORK MEETING ────────────────────────────────────────────────────
      else if (occasion === "Work Meeting") {
        if (styleVibe === "Classic" || styleVibe === "Minimal") {
          curatedLooks = [
            {
              name: `Executive Oxford & Pleated Trousers`,
              total: pOxford.price + pTrousers.price + pBag.price,
              items: [pOxford, pTrousers, pBag],
            },
            {
              name: `Tailored Wool Blazer Power Suit`,
              total: pBlazer.price + pTrousers.price + pBag.price,
              items: [pBlazer, pTrousers, pBag],
            },
            {
              name: `Structured City Trench & Oxford`,
              total: pTrench.price + pOxford.price + pTrousers.price,
              items: [pTrench, pOxford, pTrousers],
            }
          ];
        } else {
          curatedLooks = [
            {
              name: `Contemporary Editorial Suiting`,
              total: pBlazer.price + pTrousers.price + pNecklace.price,
              items: [pBlazer, pTrousers, pNecklace],
            },
            {
              name: `Modern Executive Trench Layer`,
              total: pTrench.price + pLinen.price + pBag.price,
              items: [pTrench, pLinen, pBag],
            },
            {
              name: `Creative Friday Tailoring`,
              total: pBlazer.price + pDenim.price + pSneakers.price,
              items: [pBlazer, pDenim, pSneakers],
            }
          ];
        }
      } 
      // ─── 3. GALLERY OPENING ─────────────────────────────────────────────────
      else if (occasion === "Gallery Opening") {
        curatedLooks = [
          {
            name: `Architectural Trench & Pleated Fit`,
            total: pTrench.price + pTrousers.price + pNecklace.price,
            items: [pTrench, pTrousers, pNecklace],
          },
          {
            name: `Sculptural Satin & Wool Blazer`,
            total: pSatin.price + pBlazer.price + pNecklace.price,
            items: [pSatin, pBlazer, pNecklace],
          },
          {
            name: `Avant-Garde Utility Silhouette`,
            total: pBlazer.price + pCargos.price + pSneakers.price,
            items: [pBlazer, pCargos, pSneakers],
          }
        ];
      } 
      // ─── 4. DATE NIGHT ──────────────────────────────────────────────────────
      else if (occasion === "Date Night") {
        curatedLooks = [
          {
            name: `Romantic Satin Cowl & Gold Links`,
            total: pSatin.price + pNecklace.price + pBag.price,
            items: [pSatin, pNecklace, pBag],
          },
          {
            name: `Draped Linen Slip & Wool Blazer`,
            total: pLinen.price + pBlazer.price + pBag.price,
            items: [pLinen, pBlazer, pBag],
          },
          {
            name: `Chic Evening Slip & Trench`,
            total: pSatin.price + pTrench.price,
            items: [pSatin, pTrench],
          }
        ];
      } 
      // ─── 5. ROOFTOP DINNER ──────────────────────────────────────────────────
      else {
        curatedLooks = [
          {
            name: `Luxe Satin Cowl Cocktail Dress`,
            total: pSatin.price + pBlazer.price + pNecklace.price,
            items: [pSatin, pBlazer, pNecklace],
          },
          {
            name: `Sunset Linen Slip & Gold Accent`,
            total: pLinen.price + pBag.price + pNecklace.price,
            items: [pLinen, pBag, pNecklace],
          },
          {
            name: `Contemporary Island Trench Fit`,
            total: pTrench.price + pTrousers.price + pBag.price,
            items: [pTrench, pTrousers, pBag],
          }
        ];
      }

      setOutfits(curatedLooks);
    }, 1400); 
  };

  const handleAddAll = (items: any[]) => {
    items.forEach(item => {
      addToCart(item, 1, 'M', 'Default');
    });
    onNavigate("cart");
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="ai-outfit" onNavigate={onNavigate} role="customer" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4" style={{ background: purpleLight, color: purple }}><Wand2 size={12} />AI Outfit Generator</div>
          <h1 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>Build Your Perfect Look</h1>
          <p className="text-gray-500 max-w-md mx-auto">Tell our AI your occasion and style and it'll assemble complete outfits from the best of our catalog.</p>
        </div>
        {!generated && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 p-8">
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-3">Occasion</label>
                <div className="flex flex-wrap gap-2">
                  {["Rooftop Dinner", "Work Meeting", "Weekend Brunch", "Gallery Opening", "Date Night"].map(o => (
                    <button key={o} onClick={() => setOccasion(o)} className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ${occasion === o ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:border-purple-300"}`} style={occasion === o ? { background: purple } : {}}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-3">Style Vibe</label>
                <div className="flex flex-wrap gap-2">
                  {["Minimal", "Editorial", "Bold", "Classic", "Streetwear"].map(s => (
                    <button key={s} onClick={() => setStyleVibe(s)} className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ${styleVibe === s ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:border-purple-300"}`} style={styleVibe === s ? { background: purple } : {}}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-3">Budget</label>
                <div className="flex gap-2">
                  {["Under LKR 66K", "LKR 66K–165K", "LKR 165K+", "No limit"].map(b => (
                    <button key={b} onClick={() => setBudget(b)} className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all cursor-pointer ${budget === b ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:border-purple-300"}`} style={budget === b ? { background: purple } : {}}>{b}</button>
                  ))}
                </div>
              </div>
              <PrimaryBtn onClick={generate} className="w-full !py-4 !rounded-2xl !text-base" icon={<Sparkles size={18} />}>
                {generating ? "Generating Outfits…" : "Generate Outfits"}
              </PrimaryBtn>
            </div>
          </div>
        )}
        {generating && (
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: purpleLight }}>
              <Sparkles size={28} className="animate-pulse" style={{ color: purple }} />
            </div>
            <p className="text-gray-500 text-sm">Analyzing your style and curating the perfect looks…</p>
            <div className="w-64 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
              <div className="h-full rounded-full animate-pulse" style={{ width: "60%", background: purple }} />
            </div>
          </div>
        )}
        {generated && !generating && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">3 outfits for <span className="text-purple-700">{occasion}</span></h2>
              <button onClick={() => setGenerated(false)} className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:underline"><RefreshCw size={14} />Regenerate</button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {outfits.map((outfit, i) => (
                <div key={outfit.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/30 transition-all group">
                  <div className="grid grid-cols-3 h-44">
                    {outfit.items.map((item, j) => (
                      <div key={j} className="relative overflow-hidden"><img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                    ))}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{outfit.name}</h3>
                      <span className="text-lg font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{lkr(outfit.total)}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 mb-4">
                      {outfit.items.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-500"><span className="truncate mr-2">{item.name}</span><span className="font-medium text-gray-700 flex-shrink-0">{lkr(item.price)}</span></div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-purple-300 transition-all flex items-center justify-center gap-1"><Bookmark size={12} />Save</button>
                      <PrimaryBtn onClick={() => handleAddAll(outfit.items)} className="flex-1 !py-2.5 !text-xs !rounded-xl cursor-pointer" icon={<ShoppingCart size={12} />}>Add All</PrimaryBtn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
