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

// Comprehensive verified store product catalog across all categories
const VERIFIED_STORE_CATALOG = [
  // Dresses & Hero pieces
  { id: "sp-dr-1", name: "Sage Green Pleated Midi Dress", brand: "Nadun Manawadu", price: 8500, originalPrice: 10625, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80", category: "Dresses", tag: "Main Garment", vibes: ["boho-linen", "minimalist", "old-money"], occasions: ["dinner", "beach", "resort", "cocktails", "date", "brunch"], colors: ["earthy", "pastel", "harmonious"] },
  { id: "sp-dr-2", name: "Backless Halter Silk Slip Dress", brand: "AURA Atelier", price: 24500, originalPrice: 29500, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80", category: "Dresses", tag: "Main Garment", vibes: ["editorial", "y2k-glam", "old-money"], occasions: ["nightlife", "dinner", "cocktails", "gala", "date"], colors: ["monochrome", "sunset", "jewel"] },
  { id: "sp-dr-3", name: "Tiered Pure Organic Linen Sun Dress", brand: "Solace Resort", price: 17500, originalPrice: 21800, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80", category: "Dresses", tag: "Main Garment", vibes: ["boho-linen", "minimalist"], occasions: ["resort", "beach", "brunch", "vacation", "casual"], colors: ["earthy", "pastel"] },
  { id: "sp-dr-4", name: "Structured Crepe Cocktail Mini Dress", brand: "VELOUR Studios", price: 22000, originalPrice: 27500, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80", category: "Dresses", tag: "Main Garment", vibes: ["avant-garde", "y2k-glam", "editorial"], occasions: ["nightlife", "party", "club", "opening", "speakeasy"], colors: ["monochrome", "jewel", "sunset"] },

  // Tops & Blazers
  { id: "sp-tp-1", name: "Oversized Structured Mulberry Silk Blazer", brand: "AURA Atelier", price: 34500, originalPrice: 42000, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80", category: "Blazers", tag: "Main Garment", vibes: ["old-money", "minimalist", "editorial"], occasions: ["work", "meeting", "nightlife", "dinner", "conference"], colors: ["monochrome", "earthy"] },
  { id: "sp-tp-2", name: "French Riviera Relaxed Linen Camp Shirt", brand: "Solace Resort", price: 14500, originalPrice: 18000, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80", category: "Shirts", tag: "Top Piece", vibes: ["boho-linen", "minimalist", "old-money"], occasions: ["beach", "resort", "brunch", "casual", "vacation", "dinner"], colors: ["earthy", "pastel", "monochrome"] },
  { id: "sp-tp-3", name: "Asymmetrical Draped Crepe Bodysuit", brand: "NOVA Studios", price: 16800, originalPrice: 21000, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", category: "Tops", tag: "Top Piece", vibes: ["editorial", "y2k-glam", "avant-garde"], occasions: ["nightlife", "club", "cocktails", "date"], colors: ["monochrome", "sunset", "jewel"] },
  { id: "sp-tp-4", name: "Sculptural Cut-Out Knit Corset", brand: "VELOUR", price: 18900, originalPrice: 23600, image: "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=600&q=80", category: "Knitwear", tag: "Top Piece", vibes: ["avant-garde", "y2k-glam", "streetwear"], occasions: ["party", "nightlife", "festival", "club"], colors: ["monochrome", "jewel", "sunset"] },
  { id: "sp-tp-5", name: "Heavyweight Boxy Drop-Shoulder Tee", brand: "STUDIO 01", price: 7800, originalPrice: 9750, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80", category: "T-Shirts", tag: "Top Piece", vibes: ["streetwear", "sport-luxe", "minimalist"], occasions: ["street", "casual", "coffee", "travel", "brunch"], colors: ["monochrome", "earthy"] },

  // Bottoms
  { id: "sp-bt-1", name: "Pleated Wide-Leg Fluid Trousers", brand: "Maison Minimal", price: 21500, originalPrice: 26800, image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80", category: "Pants & Trousers", tag: "Bottom Piece", vibes: ["minimalist", "old-money", "editorial"], occasions: ["work", "meeting", "dinner", "cocktails", "interview"], colors: ["monochrome", "earthy", "pastel"] },
  { id: "sp-bt-2", name: "Bias-Cut Heavyweight Satin Midi Skirt", brand: "L'Ombre", price: 18500, originalPrice: 23000, image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80", category: "Skirts", tag: "Bottom Piece", vibes: ["editorial", "old-money", "y2k-glam"], occasions: ["dinner", "date", "nightlife", "cocktails", "beach"], colors: ["monochrome", "pastel", "sunset", "jewel"] },
  { id: "sp-bt-3", name: "Tailored High-Waist Linen Bermuda Shorts", brand: "Solace Resort", price: 13200, originalPrice: 16500, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80", category: "Shorts", tag: "Bottom Piece", vibes: ["boho-linen", "minimalist", "sport-luxe"], occasions: ["beach", "resort", "brunch", "vacation", "casual"], colors: ["earthy", "pastel", "monochrome"] },
  { id: "sp-bt-4", name: "Vintage Wash Japanese Selvedge Denim", brand: "Kuroki Raw", price: 24900, originalPrice: 31000, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80", category: "Jeans & Denim", tag: "Bottom Piece", vibes: ["streetwear", "sport-luxe", "avant-garde"], occasions: ["street", "casual", "festival", "travel"], colors: ["monochrome", "earthy"] },

  // Footwear
  { id: "sp-ft-1", name: "Sculptural Strappy Nappa Leather Sandals", brand: "ALDO Luxe", price: 22500, originalPrice: 28000, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80", category: "Footwear", tag: "Footwear", vibes: ["editorial", "old-money", "boho-linen", "y2k-glam"], occasions: ["dinner", "beach", "cocktails", "resort", "date", "wedding"], colors: ["earthy", "monochrome", "sunset"] },
  { id: "sp-ft-2", name: "Polished Italian Calfskin Penny Loafers", brand: "Baron & Co.", price: 28000, originalPrice: 35000, image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80", category: "Footwear", tag: "Footwear", vibes: ["old-money", "minimalist"], occasions: ["work", "meeting", "interview", "dinner", "conference"], colors: ["monochrome", "earthy"] },
  { id: "sp-ft-3", name: "Square-Toe Woven Leather Slides", brand: "Terra Craft", price: 16500, originalPrice: 20600, image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80", category: "Footwear", tag: "Footwear", vibes: ["boho-linen", "minimalist"], occasions: ["beach", "resort", "brunch", "vacation", "casual"], colors: ["earthy", "pastel", "monochrome"] },
  { id: "sp-ft-4", name: "Chunky Minimalist Leather Sneaker", brand: "STUDIO 01", price: 19800, originalPrice: 24750, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", category: "Footwear", tag: "Footwear", vibes: ["streetwear", "sport-luxe", "avant-garde"], occasions: ["street", "travel", "casual", "festival"], colors: ["monochrome", "earthy"] },

  // Accessories & Bags
  { id: "sp-ac-1", name: "Sculptural Woven Leather Crossbody Bag", brand: "CELINE Muse", price: 29000, originalPrice: 36000, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", category: "Bags", tag: "Accent / Bag", vibes: ["old-money", "minimalist", "editorial", "boho-linen"], occasions: ["dinner", "beach", "resort", "cocktails", "brunch"], colors: ["earthy", "monochrome", "sunset"] },
  { id: "sp-ac-2", name: "Hammered 18K Gold Plated Statement Earrings", brand: "Aurelia Jewels", price: 9500, originalPrice: 12000, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80", category: "Accessories", tag: "Accent / Jewelry", vibes: ["old-money", "editorial", "y2k-glam", "boho-linen"], occasions: ["dinner", "cocktails", "party", "date", "wedding"], colors: ["earthy", "sunset", "jewel", "monochrome"] },
  { id: "sp-ac-3", name: "Beveled Acetate Blackout Sunglasses", brand: "Oculus Noir", price: 12500, originalPrice: 15600, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80", category: "Accessories", tag: "Accent / Eyewear", vibes: ["streetwear", "minimalist", "sport-luxe", "boho-linen"], occasions: ["beach", "resort", "brunch", "travel", "street"], colors: ["monochrome", "earthy"] },
  { id: "sp-ac-4", name: "Italian Vegetable-Tanned Leather Belt", brand: "Cuir Atelier", price: 8200, originalPrice: 10250, image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80", category: "Accessories", tag: "Accent / Leather", vibes: ["old-money", "minimalist", "work"], occasions: ["work", "meeting", "casual", "interview"], colors: ["earthy", "monochrome"] }
];

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

  // Catalog items (live database products + local vendor products)
  const [catalogItems, setCatalogItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const vendorSaved = localStorage.getItem('ts_vendor_products');
    const localVendorItems = vendorSaved ? JSON.parse(vendorSaved) : [];

    api.getProducts({ limit: 50 })
      .then(res => {
        if (isMounted) {
          const formatted = (res?.data || []).map((item: any) => {
            const rawImages = Array.isArray(item.images) && item.images.length > 0 
              ? item.images 
              : (item.image ? [item.image] : []);
            return {
              id: item._id || item.id,
              _id: item._id || item.id,
              name: item.name,
              price: item.price,
              originalPrice: item.originalPrice || Math.round(item.price * 1.25),
              brand: item.brand || item.vendor?.vendorStore?.storeName || 'Independent Brand',
              image: rawImages[0] || item.image || '',
              images: rawImages,
              category: item.category?.name || item.category || 'Apparel',
              description: item.description,
            };
          });

          const seenIds = new Set<string>();
          const seenNames = new Set<string>();
          const uniqueList: any[] = [];

          formatted.forEach((p: any) => {
            const pId = String(p.id || p._id || '');
            const pNameBrand = `${(p.name || '').trim().toLowerCase()}___${(p.brand || '').trim().toLowerCase()}`;
            if (pId) seenIds.add(pId);
            if (pNameBrand !== '___') seenNames.add(pNameBrand);
            uniqueList.push(p);
          });

          localVendorItems.forEach((p: any) => {
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

          setCatalogItems(uniqueList);
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

  // Intelligent Outfit Generation Engine that analyzes real user inputs & matches site catalog items
  const generateOutfits = () => {
    setGenerating(true);
    setGenerationStep(1);

    const timer1 = setTimeout(() => setGenerationStep(2), 400);
    const timer2 = setTimeout(() => setGenerationStep(3), 850);
    const timer3 = setTimeout(() => {
      setGenerating(false);
      setGenerated(true);

      // 1. Merge live catalog items + verified site catalog items
      const allAvailablePool: any[] = [...catalogItems, ...VERIFIED_STORE_CATALOG];

      // Deduplicate pool
      const poolMap = new Map<string, any>();
      allAvailablePool.forEach(item => {
        const key = (item._id || item.id || item.name).toLowerCase();
        if (!poolMap.has(key)) poolMap.set(key, item);
      });
      const unifiedPool = Array.from(poolMap.values());

      // Helper to classify into styling categories
      const dresses = unifiedPool.filter(p => {
        const cat = (p.category?.name || p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return cat.includes('dress') || name.includes('dress') || name.includes('slip') || name.includes('gown') || name.includes('jumpsuit');
      });

      const tops = unifiedPool.filter(p => {
        const cat = (p.category?.name || p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (cat.includes('shirt') || cat.includes('blazer') || cat.includes('jacket') || cat.includes('knit') || cat.includes('hoodie') || cat.includes('top') || name.includes('shirt') || name.includes('blazer') || name.includes('bodysuit') || name.includes('tee') || name.includes('corset')) && !dresses.includes(p);
      });

      const bottoms = unifiedPool.filter(p => {
        const cat = (p.category?.name || p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (cat.includes('pant') || cat.includes('trouser') || cat.includes('skirt') || cat.includes('short') || cat.includes('jean') || cat.includes('denim') || name.includes('trouser') || name.includes('skirt') || name.includes('short') || name.includes('pant') || name.includes('denim')) && !dresses.includes(p);
      });

      const footwear = unifiedPool.filter(p => {
        const cat = (p.category?.name || p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return cat.includes('footwear') || cat.includes('shoe') || name.includes('sandal') || name.includes('loafer') || name.includes('slide') || name.includes('sneaker') || name.includes('heel') || name.includes('mule');
      });

      const accessories = unifiedPool.filter(p => {
        const cat = (p.category?.name || p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return cat.includes('bag') || cat.includes('access') || name.includes('bag') || name.includes('earring') || name.includes('sunglass') || name.includes('belt') || name.includes('jewelry');
      });

      // Normalize search query tokens from occasion, vibe, color, silhouette
      const queryText = `${currentOccasionLabel} ${styleVibe} ${colorPalette} ${silhouette}`.toLowerCase();
      const keywords = queryText.split(/[\s,–/&]+/).filter(w => w.length > 2);

      // Dynamic scoring function
      const scoreItem = (item: any) => {
        let score = 0;
        const text = `${item.name} ${item.brand} ${item.category} ${item.description || ''} ${(item.vibes || []).join(' ')} ${(item.occasions || []).join(' ')} ${(item.colors || []).join(' ')}`.toLowerCase();
        
        keywords.forEach(kw => {
          if (text.includes(kw)) score += 5;
        });

        // Specific contextual bonuses
        if (queryText.includes("beach") || queryText.includes("resort") || queryText.includes("tropical")) {
          if (text.includes("linen") || text.includes("pleat") || text.includes("sand") || text.includes("woven") || text.includes("breeze") || text.includes("slip") || text.includes("dress")) score += 8;
        }
        if (queryText.includes("dinner") || queryText.includes("night") || queryText.includes("cocktail") || queryText.includes("lounge")) {
          if (text.includes("silk") || text.includes("satin") || text.includes("blazer") || text.includes("crepe") || text.includes("gold") || text.includes("dress") || text.includes("noir")) score += 8;
        }
        if (queryText.includes("work") || queryText.includes("meeting") || queryText.includes("office")) {
          if (text.includes("tailored") || text.includes("trouser") || text.includes("blazer") || text.includes("loafer") || text.includes("belt")) score += 8;
        }

        // Slight random jitter so identical requests can offer fresh combinations
        return score + Math.random() * 2;
      };

      const sortCategory = (arr: any[]) => [...arr].sort((a, b) => scoreItem(b) - scoreItem(a));

      const sortedDresses = sortCategory(dresses.length > 0 ? dresses : VERIFIED_STORE_CATALOG.slice(0, 4));
      const sortedTops = sortCategory(tops.length > 0 ? tops : VERIFIED_STORE_CATALOG.slice(4, 9));
      const sortedBottoms = sortCategory(bottoms.length > 0 ? bottoms : VERIFIED_STORE_CATALOG.slice(9, 13));
      const sortedFootwear = sortCategory(footwear.length > 0 ? footwear : VERIFIED_STORE_CATALOG.slice(13, 17));
      const sortedAccs = sortCategory(accessories.length > 0 ? accessories : VERIFIED_STORE_CATALOG.slice(17, 21));

      // Build 3 customized thematic looks according to user's inputs
      const isBeachOrResort = queryText.includes("beach") || queryText.includes("resort") || queryText.includes("vacation") || queryText.includes("coastal");
      const isNightDinner = queryText.includes("dinner") || queryText.includes("night") || queryText.includes("cocktail") || queryText.includes("date");
      const isWorkOrFormal = queryText.includes("work") || queryText.includes("meeting") || queryText.includes("executive") || queryText.includes("conference");

      const look1Title = isBeachOrResort 
        ? "Look 1: Coastal Sunset Elegance" 
        : isWorkOrFormal 
        ? "Look 1: Executive Architectural Power" 
        : isNightDinner 
        ? "Look 1: Twilight Speakeasy Allure" 
        : "Look 1: The Signature Statement";

      const look2Title = isBeachOrResort 
        ? "Look 2: Pure Breathable Resort Linen" 
        : isWorkOrFormal 
        ? "Look 2: Contemporary Smart Casual" 
        : isNightDinner 
        ? "Look 2: Effortless Fluid Silk Drape" 
        : "Look 2: Relaxed Tropical Luxury";

      const look3Title = isBeachOrResort 
        ? "Look 3: High-Contrast Oceanfront Glow" 
        : isWorkOrFormal 
        ? "Look 3: The Boardroom Modernist" 
        : isNightDinner 
        ? "Look 3: Statement Noir & Gold Glam" 
        : "Look 3: Bold Avant-Garde Edge";

      const generatedEnsembles = [
        // Look 1: Featuring top matching Dress or Top+Bottom
        (() => {
          const useDress = (sortedDresses.length > 0 && (isBeachOrResort || isNightDinner || Math.random() > 0.4));
          const p1 = useDress ? { ...sortedDresses[0], tag: "Hero Garment" } : { ...sortedTops[0], tag: "Top Piece" };
          const p2 = useDress ? { ...sortedAccs[0], tag: "Accent / Bag" } : { ...sortedBottoms[0], tag: "Bottom Piece" };
          const p3 = { ...sortedFootwear[0 % sortedFootwear.length], tag: "Footwear" };
          const p4 = useDress ? { ...sortedAccs[1 % sortedAccs.length], tag: "Jewelry / Accent" } : { ...sortedAccs[0 % sortedAccs.length], tag: "Accent / Bag" };
          const pieces = [p1, p2, p3, p4];
          const totalPrice = pieces.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
          return {
            id: `ensemble-1-${Date.now()}`,
            title: look1Title,
            tagline: `Curated specifically for ${currentOccasionLabel} with a ${styleVibe} aesthetic`,
            accentBadge: isBeachOrResort ? "Beach Ready 🏖️" : isNightDinner ? "Sunset Pick ✨" : "Runway Pick 👑",
            occasion: currentOccasionLabel,
            styleVibe: styleVibe,
            palette: colorPalette,
            silhouette: silhouette,
            totalPrice: totalPrice,
            pieces: pieces,
            stylistRationale: `Harmonized for ${currentOccasionLabel}. The ${p1.name} commands attention with a refined ${silhouette.toLowerCase()} silhouette, complemented with ${p3.name} for effortless movement.`,
            fabricNote: `Selected for optimal breathability and luxury hand-feel in Sri Lanka's tropical evening climate.`,
            proTip: `Pair with delicate hardware to echo the accents in the ${p4.name}.`
          };
        })(),

        // Look 2: Featuring separates with focus on breezy linen/cotton drape
        (() => {
          const p1 = { ...sortedTops[1 % sortedTops.length], tag: "Top Piece" };
          const p2 = { ...sortedBottoms[1 % sortedBottoms.length], tag: "Bottom Piece" };
          const p3 = { ...sortedFootwear[1 % sortedFootwear.length], tag: "Footwear" };
          const p4 = { ...sortedAccs[2 % sortedAccs.length], tag: "Accent / Accessory" };
          const pieces = [p1, p2, p3, p4];
          const totalPrice = pieces.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
          return {
            id: `ensemble-2-${Date.now()}`,
            title: look2Title,
            tagline: `Fluid lightweight textures customized for ${currentOccasionLabel}`,
            accentBadge: "100% Breathable 🌿",
            occasion: currentOccasionLabel,
            styleVibe: styleVibe,
            palette: colorPalette,
            silhouette: silhouette,
            totalPrice: totalPrice,
            pieces: pieces,
            stylistRationale: `Balances ${styleVibe} refinement with fluid relaxed lines. The ${p1.name} pairs seamlessly with ${p2.name} to elongate proportions while remaining completely climate-adaptive.`,
            fabricNote: `Crafted from natural organic weaves that offer unhindered airflow and thermal comfort.`,
            proTip: `Roll cuffs or leave the top relaxed to accentuate the clean silhouette of the ${p3.name}.`
          };
        })(),

        // Look 3: Bold Statement or Evening Alternative
        (() => {
          const p1 = sortedDresses.length > 1 ? { ...sortedDresses[1], tag: "Hero Garment" } : { ...sortedTops[2 % sortedTops.length], tag: "Top Piece" };
          const p2 = sortedDresses.length > 1 ? { ...sortedAccs[3 % sortedAccs.length], tag: "Accent / Leather" } : { ...sortedBottoms[2 % sortedBottoms.length], tag: "Bottom Piece" };
          const p3 = { ...sortedFootwear[2 % sortedFootwear.length], tag: "Footwear" };
          const p4 = { ...sortedAccs[0 % sortedAccs.length], tag: "Accent / Bag" };
          const pieces = [p1, p2, p3, p4];
          const totalPrice = pieces.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
          return {
            id: `ensemble-3-${Date.now()}`,
            title: look3Title,
            tagline: `High-impact styling with rich textures and modern hardware`,
            accentBadge: "Trending Now ⚡",
            occasion: currentOccasionLabel,
            styleVibe: styleVibe,
            palette: colorPalette,
            silhouette: silhouette,
            totalPrice: totalPrice,
            pieces: pieces,
            stylistRationale: `Elevates ${currentOccasionLabel} into a memorable fashion moment. The rich tones of the ${p1.name} create sharp contrast with ${p4.name}.`,
            fabricNote: `High-grade satin and tailored finishes that hold their architectural structure effortlessly.`,
            proTip: `Wear minimal secondary jewelry to let the focal silhouette and footwear shine.`
          };
        })()
      ];

      setOutfits(generatedEnsembles);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleAddAllToCart = (ensemble: any) => {
    ensemble.pieces.forEach((piece: any) => {
      addToCart({
        id: piece.id || piece._id,
        _id: piece._id || piece.id,
        name: piece.name,
        price: piece.price,
        originalPrice: piece.originalPrice || Math.round(piece.price * 1.25),
        brand: piece.brand,
        image: piece.image || piece.images?.[0] || '',
        images: piece.images || [piece.image],
        category: piece.category || "Fashion"
      }, 1, 'M', 'Default');
    });
    showToast(`Added 4 items from "${ensemble.title}" to your shopping bag!`);
  };

  const handleAddSinglePiece = (piece: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart({
      id: piece.id || piece._id,
      _id: piece._id || piece.id,
      name: piece.name,
      price: piece.price,
      originalPrice: piece.originalPrice || Math.round(piece.price * 1.25),
      brand: piece.brand,
      image: piece.image || piece.images?.[0] || '',
      images: piece.images || [piece.image],
      category: piece.category || "Fashion"
    }, 1, 'M', 'Default');
    showToast(`Added "${piece.name}" to your bag`);
  };

  const handleOpenProductDetail = (piece: any) => {
    try {
      const rawImgs = Array.isArray(piece.images) && piece.images.length > 0 
        ? piece.images 
        : (piece.image ? [piece.image] : []);
      localStorage.setItem('ts_selected_product', JSON.stringify({
        ...piece,
        id: piece.id || piece._id,
        _id: piece._id || piece.id,
        images: rawImgs,
        image: rawImgs[0] || piece.image || '',
      }));
    } catch {}
    onNavigate("product-detail");
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
                          key={piece.id || `${piece.name}-${pIdx}`}
                          onClick={() => handleOpenProductDetail(piece)}
                          className="group relative rounded-2xl border border-gray-100 bg-gray-50/50 p-3 hover:bg-white hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer"
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
                              onClick={(e) => handleAddSinglePiece(piece, e)}
                              className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-purple-600 hover:text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                              title="Add Piece to Bag"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">{piece.brand}</p>
                            <h4 className="text-xs font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-purple-700 transition-colors">{piece.name}</h4>
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
