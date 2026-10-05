import { useState, useEffect } from "react";
import {
  Sparkles, RefreshCw, ShoppingCart, Bookmark, Wand2, Plus, ShoppingBag,
  Heart, Check, ArrowRight, Sliders, Layers, Sun, Moon, Wind, Compass,
  Shirt, Scissors, Zap, ShieldCheck, Tag, Info, Share2, Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Screen, purple, purpleLight, purpleDark, lkr, 
  PrimaryBtn, GhostBtn, Navbar, Badge
} from '../../components/shared';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

// Occasion presets grouped by lifestyle category
const OCCASION_CATEGORIES = [
  {
    id: "nightlife",
    label: "Nightlife & Evening",
    icon: "🍸",
    presets: [
      "Rooftop Dinner & Cocktails",
      "VIP Club & Lounge",
      "Romantic Candlelit Date",
      "Gallery Art Opening",
      "Late Night Speakeasy"
    ]
  },
  {
    id: "work",
    label: "Work & Professional",
    icon: "💼",
    presets: [
      "Executive Boardroom Meeting",
      "Smart Casual Office",
      "Tech & Creative Pitch",
      "International Conference",
      "High-Stakes Interview"
    ]
  },
  {
    id: "resort",
    label: "Resort & Vacation",
    icon: "🏖️",
    presets: [
      "Tropical Island Getaway",
      "Beach Club Sunset Party",
      "Weekend Coastal Brunch",
      "Private Catamaran Cruise",
      "Luxury Nature Safari"
    ]
  },
  {
    id: "festive",
    label: "Festive & Ceremonies",
    icon: "💍",
    presets: [
      "Destination Wedding Guest",
      "Evening Reception Gala",
      "Engagement Cocktail Soirée",
      "Royal High-Tea Party",
      "Cultural Festive Celebration"
    ]
  },
  {
    id: "street",
    label: "Casual & Street Luxe",
    icon: "✨",
    presets: [
      "Artisan Cafe & Coffee Run",
      "Indie Music Festival",
      "City Architectural Walk",
      "Airport Luxe Travel",
      "Weekend Farmers Market"
    ]
  }
];

const STYLE_VIBES = [
  { id: "old-money", label: "Old Money / Quiet Luxury", desc: "Understated elegance, structured tailoring, bespoke feel", icon: "👑" },
  { id: "minimalist", label: "Modern Minimalist", desc: "Clean silhouettes, architectural cuts, zero clutter", icon: "📐" },
  { id: "editorial", label: "High-Fashion Editorial", desc: "Runway-inspired, avant-garde drapery, statement pieces", icon: "📸" },
  { id: "streetwear", label: "Streetwear & Urban Tech", desc: "Oversized proportions, utilitarian accents, bold attitude", icon: "🛹" },
  { id: "boho-linen", label: "Boho Resort & Pure Linen", desc: "Breezy weaves, organic textiles, relaxed coastal energy", icon: "🌿" },
  { id: "avant-garde", label: "Bold Avant-Garde", desc: "Unconventional silhouettes, high contrast, artistic energy", icon: "🎨" },
  { id: "y2k-glam", label: "Y2K Glam & Night", desc: "Glossy textures, statement hardware, electric vibrancy", icon: "⚡" },
  { id: "sport-luxe", label: "Sport Luxe & Athleisure", desc: "Performance fabrics tailored into sleek luxury streetwear", icon: "👟" }
];

const COLOR_PALETTES = [
  { id: "monochrome", label: "Monochrome & Noir", colors: ["#111827", "#4b5563", "#f3f4f6"] },
  { id: "earthy", label: "Earthy Sand & Terracotta", colors: ["#78350f", "#d97706", "#fef3c7"] },
  { id: "pastel", label: "Pastel Dream & Lilac", colors: ["#c084fc", "#93c5fd", "#fce7f3"] },
  { id: "jewel", label: "Jewel Tones (Emerald & Sapphire)", colors: ["#065f46", "#1e40af", "#831843"] },
  { id: "sunset", label: "Sunset Hues & Coral", colors: ["#e11d48", "#ea580c", "#fde047"] },
  { id: "harmonious", label: "AI Curated Palette", colors: ["#6C4DF6", "#ec4899", "#3b82f6"] }
];

const SILHOUETTES = [
  "Tailored & Structured",
  "Relaxed & Fluid Draping",
  "Oversized Contemporary",
  "Body-Contour & Sleek"
];

const BUDGET_TIERS = [
  { label: "Under LKR 25,000", range: [8000, 25000] },
  { label: "LKR 25,000 – LKR 75,000", range: [25000, 75000] },
  { label: "LKR 75,000 – LKR 150,000", range: [75000, 150000] },
  { label: "Haute Couture (No Limit)", range: [150000, 350000] }
];

// Curated library of head-to-toe high fashion assets for realistic styling
const HIGH_FASHION_POOLS = {
  tops: [
    { name: "Oversized Structured Mulberry Silk Blazer", brand: "AURA Atelier", price: 34500, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80", tag: "Main Garment", category: "Blazers" },
    { name: "Asymmetrical Draped Crepe Bodysuit", brand: "NOVA Studios", price: 18900, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", tag: "Main Garment", category: "Tops" },
    { name: "French Riviera Relaxed Linen Camp Shirt", brand: "Solace Resort", price: 16200, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80", tag: "Main Garment", category: "Shirts" },
    { name: "Sculptural Cut-Out Knit Corset", brand: "VELOUR", price: 22400, image: "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=600&q=80", tag: "Main Garment", category: "Knitwear" },
    { name: "Minimalist Italian Wool Overcoat", brand: "Atelier Studio", price: 48000, image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80", tag: "Main Garment", category: "Jackets & Coats" }
  ],
  bottoms: [
    { name: "Pleated Wide-Leg Fluid Trousers", brand: "Maison Minimal", price: 24500, image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80", tag: "Bottom Piece", category: "Pants & Trousers" },
    { name: "Bias-Cut Heavyweight Satin Midi Skirt", brand: "L'Ombre", price: 19800, image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80", tag: "Bottom Piece", category: "Skirts" },
    { name: "Tailored High-Waist Linen Bermuda Shorts", brand: "Solace Resort", price: 14500, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80", tag: "Bottom Piece", category: "Shorts" },
    { name: "Vintage Wash Japanese Selvedge Denim", brand: "Kuroki Raw", price: 28900, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80", tag: "Bottom Piece", category: "Jeans & Denim" }
  ],
  footwear: [
    { name: "Sculptural Heel Strappy Nappa Sandals", brand: "ALDO Luxe", price: 26500, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80", tag: "Footwear", category: "Footwear" },
    { name: "Polished Italian Leather Penny Loafers", brand: "Baron & Co.", price: 32000, image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80", tag: "Footwear", category: "Footwear" },
    { name: "Chunky Minimalist Leather Sneaker", brand: "STUDIO 01", price: 21500, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", tag: "Footwear", category: "Footwear" },
    { name: "Square-Toe Woven Leather Mules", brand: "Terra Craft", price: 18500, image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80", tag: "Footwear", category: "Footwear" }
  ],
  accessories: [
    { name: "Sculptural Woven Leather Crossbody Bag", brand: "CELINE Muse", price: 38000, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", tag: "Accent / Bag", category: "Bags" },
    { name: "Hammered 18K Gold Plated Statement Earrings", brand: "Aurelia Jewels", price: 11200, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80", tag: "Accent / Jewelry", category: "Accessories" },
    { name: "Beveled Acetate Blackout Sunglasses", brand: "Oculus Noir", price: 14800, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80", tag: "Accent / Eyewear", category: "Accessories" },
    { name: "Italian Vegetable-Tanned Leather Belt", brand: "Cuir Atelier", price: 9500, image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80", tag: "Accent / Leather", category: "Accessories" }
  ]
};

export function AIOutfitScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { addToCart } = useCart();
  
  // Selection states
  const [activeTab, setActiveTab] = useState("nightlife");
  const [occasion, setOccasion] = useState("Rooftop Dinner & Cocktails");
  const [customOccasion, setCustomOccasion] = useState("");
  const [styleVibe, setStyleVibe] = useState("Old Money / Quiet Luxury");
  const [colorPalette, setColorPalette] = useState("Monochrome & Noir");
  const [silhouette, setSilhouette] = useState("Tailored & Structured");
  const [budgetTier, setBudgetTier] = useState("LKR 25,000 – LKR 75,000");
  
  // Generator states
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [savedLooks, setSavedLooks] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Catalog items
  const [catalogItems, setCatalogItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const vendorSaved = localStorage.getItem('ts_vendor_products');
    const localVendorItems = vendorSaved ? JSON.parse(vendorSaved) : [];

    api.getProducts({ limit: 40 })
      .then(res => {
        if (isMounted) {
          const formatted = (res?.data || []).map((item: any) => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            brand: item.brand || item.vendor?.vendorStore?.storeName || 'TRENDSPROUT Curated',
            image: item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
            category: item.category?.name || item.category || 'Apparel',
          }));
          const combined = [...localVendorItems, ...formatted];
          const uniqueMap = new Map();
          combined.forEach(p => {
            if (p && p.id && !uniqueMap.has(p.id)) {
              uniqueMap.set(p.id, p);
            }
          });
          setCatalogItems(Array.from(uniqueMap.values()));
        }
      })
      .catch(() => {
        if (isMounted) setCatalogItems(localVendorItems);
      });

    return () => { isMounted = false; };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentOccasionLabel = customOccasion.trim() ? customOccasion : occasion;

  const generateOutfits = () => {
    setGenerating(true);
    setGenerationStep(1);

    const timer1 = setTimeout(() => setGenerationStep(2), 500);
    const timer2 = setTimeout(() => setGenerationStep(3), 1000);
    const timer3 = setTimeout(() => {
      setGenerating(false);
      setGenerated(true);

      const lookTitles = [
        { title: "Look 1: The Signature Statement", tagline: "Editorial presence with balanced proportions", accentBadge: "Runway Pick ✨" },
        { title: "Look 2: Effortless Sophistication", tagline: "Relaxed luxurious drape tailored for Sri Lankan climate", accentBadge: "100% Breathable 🌿" },
        { title: "Look 3: Contemporary Bold", tagline: "High-contrast textures with striking architectural lines", accentBadge: "Trending Now ⚡" }
      ];

      const generatedEnsembles = lookTitles.map((meta, idx) => {
        // Build 4-piece head-to-toe ensemble
        const topItem = {
          ...HIGH_FASHION_POOLS.tops[(idx * 2) % HIGH_FASHION_POOLS.tops.length],
          id: `top-${idx}-${Date.now()}`
        };
        const bottomItem = {
          ...HIGH_FASHION_POOLS.bottoms[(idx + 1) % HIGH_FASHION_POOLS.bottoms.length],
          id: `bottom-${idx}-${Date.now()}`
        };
        const footwearItem = {
          ...HIGH_FASHION_POOLS.footwear[(idx * 2 + 1) % HIGH_FASHION_POOLS.footwear.length],
          id: `footwear-${idx}-${Date.now()}`
        };
        const accessoryItem = {
          ...HIGH_FASHION_POOLS.accessories[idx % HIGH_FASHION_POOLS.accessories.length],
          id: `accessory-${idx}-${Date.now()}`
        };

        const pieces = [topItem, bottomItem, footwearItem, accessoryItem];
        const totalPrice = pieces.reduce((sum, p) => sum + p.price, 0);

        return {
          id: `ensemble-${idx}`,
          title: meta.title,
          tagline: meta.tagline,
          accentBadge: meta.accentBadge,
          occasion: currentOccasionLabel,
          styleVibe: styleVibe,
          palette: colorPalette,
          silhouette: silhouette,
          totalPrice: totalPrice,
          pieces: pieces,
          stylistRationale: `Curated specifically for ${currentOccasionLabel} with a ${styleVibe} aesthetic. The ${topItem.name.toLowerCase()} establishes a focal point, paired with ${bottomItem.name.toLowerCase()} for fluid motion. Finished with ${footwearItem.name.toLowerCase()} to anchor the silhouette.`,
          fabricNote: `Crafted from breathable, lightweight organic fibers selected for all-day thermal comfort in high-humidity tropical evenings.`,
          proTip: idx === 0 
            ? "Half-tuck the top to accentuate your waistline and highlight the sculptural accessory."
            : idx === 1 
            ? "Keep footwear unstrapped for an effortless resort drape, or roll cuffs to show jewelry accents."
            : "Layer subtle gold or silver accents to mirror the hardware on the handbag."
        };
      });

      setOutfits(generatedEnsembles);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleAddAllToCart = (ensemble: any) => {
    ensemble.pieces.forEach((piece: any) => {
      addToCart({
        id: piece.id,
        name: piece.name,
        price: piece.price,
        brand: piece.brand,
        image: piece.image,
        category: piece.category || "Fashion"
      }, 1, 'M', 'Default');
    });
    showToast(`Added 4 items from "${ensemble.title}" to your shopping bag!`);
  };

  const handleAddSinglePiece = (piece: any) => {
    addToCart({
      id: piece.id,
      name: piece.name,
      price: piece.price,
      brand: piece.brand,
      image: piece.image,
      category: piece.category || "Fashion"
    }, 1, 'M', 'Default');
    showToast(`Added "${piece.name}" to your bag`);
  };

  const toggleBookmark = (id: string) => {
    setSavedLooks(prev => {
      const nextState = !prev[id];
      showToast(nextState ? "Saved ensemble to your moodboard ✨" : "Removed look from moodboard");
      return { ...prev, [id]: nextState };
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9fe]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="ai-outfit" onNavigate={onNavigate} />

      {/* Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-md text-white text-xs font-semibold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/10"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-sm" style={{ background: purpleLight, color: purple }}>
            <Wand2 size={13} />
            <span>AI STYLING STUDIO 2.0</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            The Intelligent Outfit Ensemble Generator
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            Select an occasion or describe any custom event. Our neural stylist harmonizes color tones, fabrics, and 4-piece head-to-toe silhouettes ready to wear.
          </p>
        </div>

        {!generated && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100/80 shadow-xl shadow-purple-900/5 p-6 sm:p-10 max-w-4xl mx-auto"
          >
            {/* Step 1: Occasion Tabs & Custom Input */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-black">1</span>
                  Select Your Occasion or Event
                </label>
                <span className="text-xs text-gray-400 font-medium">Categorized or Custom</span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
                {OCCASION_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveTab(cat.id);
                      setOccasion(cat.presets[0]);
                      setCustomOccasion("");
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === cat.id && !customOccasion.trim()
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                        : "bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-700 border border-gray-100"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Presets in active category */}
              <div className="flex flex-wrap gap-2 mb-4">
                {OCCASION_CATEGORIES.find(c => c.id === activeTab)?.presets.map(pres => (
                  <button
                    key={pres}
                    onClick={() => {
                      setOccasion(pres);
                      setCustomOccasion("");
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      occasion === pres && !customOccasion.trim()
                        ? "border-purple-600 bg-purple-50/80 text-purple-700 shadow-sm"
                        : "border-gray-200/80 text-gray-600 hover:border-purple-300 hover:bg-gray-50"
                    }`}
                  >
                    {pres}
                  </button>
                ))}
              </div>

              {/* Custom type-in occasion field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Compass size={15} />
                </div>
                <input
                  type="text"
                  value={customOccasion}
                  onChange={(e) => setCustomOccasion(e.target.value)}
                  placeholder="Or type any specific occasion (e.g. 'Sunset Cocktails at Galle Fort', 'Tech Demo Day', 'Beachside Brunch')..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm bg-gray-50/80 border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-800 placeholder-gray-400"
                />
                {customOccasion && (
                  <button
                    onClick={() => setCustomOccasion("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-purple-600 hover:text-purple-800 font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Style Vibe */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-black">2</span>
                  Aesthetic & Style Vibe
                </label>
                <span className="text-xs text-gray-400 font-medium">Core fashion identity</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {STYLE_VIBES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setStyleVibe(v.label)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      styleVibe === v.label
                        ? "border-purple-600 bg-purple-50/60 shadow-md shadow-purple-500/10 ring-1 ring-purple-500"
                        : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-purple-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{v.icon}</span>
                        {styleVibe === v.label && (
                          <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">✓</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-900 leading-tight mb-1">{v.label}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{v.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Color Mood & Silhouette */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Color Palette */}
              <div>
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-black">3</span>
                  Color Harmony
                </label>
                <div className="space-y-2">
                  {COLOR_PALETTES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setColorPalette(p.label)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        colorPalette === p.label
                          ? "border-purple-600 bg-purple-50/60 text-purple-800"
                          : "border-gray-200/80 text-gray-700 hover:border-purple-200 bg-white"
                      }`}
                    >
                      <span>{p.label}</span>
                      <div className="flex items-center gap-1">
                        {p.colors.map((c, i) => (
                          <span key={i} className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" style={{ background: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Silhouette & Cut */}
              <div>
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-black">4</span>
                  Silhouette & Cut
                </label>
                <div className="space-y-2">
                  {SILHOUETTES.map(sil => (
                    <button
                      key={sil}
                      onClick={() => setSilhouette(sil)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        silhouette === sil
                          ? "border-purple-600 bg-purple-50/60 text-purple-800"
                          : "border-gray-200/80 text-gray-700 hover:border-purple-200 bg-white"
                      }`}
                    >
                      <span>{sil}</span>
                      {silhouette === sil && <span className="text-purple-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Budget Range */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-black">5</span>
                Budget Target (4-Piece Ensemble Total)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_TIERS.map(b => (
                  <button
                    key={b.label}
                    onClick={() => setBudgetTier(b.label)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      budgetTier === b.label
                        ? "border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : "border-gray-200 text-gray-600 hover:border-purple-300 bg-gray-50/50"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <PrimaryBtn
              onClick={generateOutfits}
              className="w-full !py-4 !rounded-2xl !text-base shadow-xl shadow-purple-500/25 cursor-pointer group"
              icon={<Sparkles size={19} className="group-hover:rotate-12 transition-transform" />}
            >
              Generate Head-to-Toe Outfits
            </PrimaryBtn>
          </motion.div>
        )}

        {/* Loading Animation with Progressive Steps */}
        {generating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-xl p-8"
          >
            <div className="relative w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/30">
              <Sparkles size={36} className="animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Curating {currentOccasionLabel} Looks
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              {generationStep === 1 && "Analyzing textile textures, color mood & silhouette balance..."}
              {generationStep === 2 && "Coordinating 4-piece head-to-toe pieces with accessories..."}
              {generationStep === 3 && "Synthesizing AI stylist rationale and climate adaptation notes..."}
            </p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                animate={{ width: `${generationStep * 33.3}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>
        )}

        {/* Generated Outfit Results */}
        {generated && !generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            {/* Top Bar Summary & Controls */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Generated Lookbook</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 font-medium">{styleVibe}</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Curated for: <span className="text-purple-600">{currentOccasionLabel}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">Palette: {colorPalette}</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">Silhouette: {silhouette}</span>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold">Budget: {budgetTier}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setGenerated(false)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Sliders size={14} />
                  <span>Refine Inputs</span>
                </button>
                <PrimaryBtn
                  onClick={generateOutfits}
                  className="!py-2.5 !px-4 !text-xs !rounded-xl cursor-pointer"
                  icon={<RefreshCw size={14} />}
                >
                  Regenerate
                </PrimaryBtn>
              </div>
            </div>

            {/* Complete Ensemble Cards */}
            <div className="space-y-10">
              {outfits.map((ensemble, eIdx) => (
                <div
                  key={ensemble.id}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg shadow-purple-950/5 hover:border-purple-200 transition-all"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50/40 via-white to-indigo-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-500/20">
                        0{eIdx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{ensemble.title}</h3>
                          <Badge variant="purple">{ensemble.accentBadge}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{ensemble.tagline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] text-gray-400 uppercase font-bold block">4-Piece Ensemble</span>
                        <span className="text-lg font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                          {lkr(ensemble.totalPrice)}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleBookmark(ensemble.id)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          savedLooks[ensemble.id]
                            ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/25"
                            : "border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-300 bg-white"
                        }`}
                        title="Save to Moodboard"
                      >
                        <Bookmark size={16} className={savedLooks[ensemble.id] ? "fill-white" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* 4-Piece Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {ensemble.pieces.map((piece: any, pIdx: number) => (
                        <div
                          key={piece.id}
                          className="group relative rounded-2xl border border-gray-100 bg-gray-50/50 p-3 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-gray-200">
                            <img
                              src={piece.image}
                              alt={piece.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {piece.tag}
                            </span>
                            <button
                              onClick={() => handleAddSinglePiece(piece)}
                              className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm text-purple-700 hover:bg-purple-600 hover:text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title="Add Piece to Bag"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">{piece.brand}</p>
                            <h4 className="text-xs font-bold text-gray-900 line-clamp-1 mb-1">{piece.name}</h4>
                            <p className="text-xs font-black text-gray-800" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                              {lkr(piece.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Stylist Rationale & Thermal Notes */}
                    <div className="grid md:grid-cols-3 gap-3 p-4 rounded-2xl bg-purple-50/50 border border-purple-100/80 mb-6 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                          <Scissors size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-purple-950 mb-0.5">Silhouette Harmony</p>
                          <p className="text-gray-600 leading-relaxed text-[11px]">{ensemble.stylistRationale}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                          <Wind size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950 mb-0.5">Climate & Textile Balance</p>
                          <p className="text-gray-600 leading-relaxed text-[11px]">{ensemble.fabricNote}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                          <Sparkle size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-amber-950 mb-0.5">Pro Stylist Secret</p>
                          <p className="text-gray-600 leading-relaxed text-[11px]">{ensemble.proTip}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Ready to order • 100% Islandwide Sri Lanka Express Courier</span>
                      </div>
                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <PrimaryBtn
                          onClick={() => handleAddAllToCart(ensemble)}
                          className="w-full sm:w-auto !py-3 !px-6 !text-xs !rounded-xl cursor-pointer shadow-md shadow-purple-500/20"
                          icon={<ShoppingCart size={15} />}
                        >
                          Add Entire Look to Bag ({lkr(ensemble.totalPrice)})
                        </PrimaryBtn>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
