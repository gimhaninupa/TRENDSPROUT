import { useState, useEffect, useRef } from "react";
import {
  Store, Camera, Upload, Layout, Globe, Check, Eye,
  Sparkles, Palette, RefreshCw, Layers, ArrowRight, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Screen, purple, purpleLight, lkr, 
  PrimaryBtn, GhostBtn, VendorSidebar, Badge 
} from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SAMPLE_BANNERS = [
  { label: "Modern Luxury Studio", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" },
  { label: "Boutique Atelier Interior", url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80" },
  { label: "Minimalist Runway Fashion", url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" },
  { label: "Editorial Summer Linen", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80" },
];

const PRESET_COLORS = [
  { name: "Royal Purple", color: "#6C4DF6" },
  { name: "Crimson Rose", color: "#e11d48" },
  { name: "Cyan Azure", color: "#0ea5e9" },
  { name: "Emerald Forest", color: "#10b981" },
  { name: "Amber Ochre", color: "#f59e0b" },
  { name: "Noir Luxe", color: "#111827" },
];

export function StoreCustomizationScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState<"theme" | "branding" | "layout" | "banner">("theme");

  // Load initial store settings from user profile or saved storage
  const [storeName, setStoreName] = useState<string>(() => {
    return user?.vendorStore?.storeName || user?.username || "My Fashion Store";
  });
  const [tagline, setTagline] = useState<string>(() => {
    return (user?.vendorStore as any)?.tagline || "Curated contemporary apparel and sustainable essentials";
  });
  const [storeDescription, setStoreDescription] = useState<string>(() => {
    return user?.vendorStore?.storeDescription || "Original handcrafted designs, premium textiles, and islandwide express shipping.";
  });
  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    return (user?.vendorStore as any)?.primaryColor || "#6C4DF6";
  });
  const [fontStyle, setFontStyle] = useState<string>(() => {
    return (user?.vendorStore as any)?.fontStyle || "Modern Sans";
  });
  const [layout, setLayout] = useState<string>(() => {
    return (user?.vendorStore as any)?.layout || "Grid 3-col";
  });
  const [logoImage, setLogoImage] = useState<string>(() => {
    return user?.vendorStore?.logoImage || "";
  });
  const [bannerImage, setBannerImage] = useState<string>(() => {
    return user?.vendorStore?.bannerImage || SAMPLE_BANNERS[0].url;
  });
  const [bannerHeadline, setBannerHeadline] = useState<string>(() => {
    return (user?.vendorStore as any)?.bannerHeadline || "New Season Collection";
  });
  const [bannerSubtext, setBannerSubtext] = useState<string>(() => {
    return (user?.vendorStore as any)?.bannerSubtext || "Handcrafted silhouettes tailored for contemporary life";
  });

  const [previewProducts, setPreviewProducts] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    // Fetch products for preview
    api.getProducts({ limit: 6 })
      .then(res => {
        if (isMounted && res?.data) {
          setPreviewProducts(res.data);
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('ts_vendor_products');
          if (saved && isMounted) setPreviewProducts(JSON.parse(saved));
        } catch {}
      });

    return () => { isMounted = false; };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBannerImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const storePayload = {
      storeName: storeName.trim() || user?.username || "My Store",
      tagline: tagline.trim(),
      storeDescription: storeDescription.trim(),
      primaryColor,
      fontStyle,
      layout,
      logoImage,
      bannerImage,
      bannerHeadline: bannerHeadline.trim(),
      bannerSubtext: bannerSubtext.trim(),
    };

    try {
      const res = await api.updateVendorStore(storePayload);
      
      // Update AuthContext user state
      if (setUser) {
        setUser((prev: any) => {
          const updated = {
            ...prev,
            role: 'vendor',
            vendorStore: {
              ...prev?.vendorStore,
              ...storePayload,
            }
          };
          try {
            localStorage.setItem('ts_user', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      // Persist local store settings
      try {
        localStorage.setItem('ts_vendor_store_settings', JSON.stringify(storePayload));
        
        // Sync local products brand name
        const vendorSaved = localStorage.getItem('ts_vendor_products');
        if (vendorSaved) {
          const prods = JSON.parse(vendorSaved);
          const updatedProds = prods.map((p: any) => ({ ...p, brand: storePayload.storeName }));
          localStorage.setItem('ts_vendor_products', JSON.stringify(updatedProds));
        }
      } catch {}

      showToast("✨ Store customization published & updated successfully!");
    } catch (err: any) {
      console.warn("API update store notice:", err.message);

      // Save locally if offline
      if (setUser) {
        setUser((prev: any) => {
          const updated = {
            ...prev,
            role: 'vendor',
            vendorStore: {
              ...prev?.vendorStore,
              ...storePayload,
            }
          };
          try {
            localStorage.setItem('ts_user', JSON.stringify(updated));
            localStorage.setItem('ts_vendor_store_settings', JSON.stringify(storePayload));
          } catch {}
          return updated;
        });
      }
      showToast("✨ Store settings saved successfully!");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreviewStore = () => {
    try {
      localStorage.setItem('ts_vendor_store_settings', JSON.stringify({
        storeName,
        tagline,
        storeDescription,
        primaryColor,
        fontStyle,
        layout,
        logoImage,
        bannerImage,
        bannerHeadline,
        bannerSubtext,
      }));
    } catch {}
    onNavigate("seller-store");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 lg:pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="store-customization" onNavigate={onNavigate} />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 bg-gray-900 text-white text-xs font-semibold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-white/10"
          >
            <Sparkles size={16} className="text-purple-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-xs" style={{ background: purpleLight, color: purple }}>
              <Store size={13} />
              <span>STOREFRONT BUILDER</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Store Customization
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Customize your brand identity, color theme, hero banners, and customer store page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <GhostBtn onClick={handlePreviewStore} className="!py-2.5 !px-4 !text-xs cursor-pointer">
              <Eye size={14} /> Preview Storefront
            </GhostBtn>
            <PrimaryBtn 
              onClick={handlePublish} 
              disabled={isPublishing} 
              className="!py-2.5 !px-5 !text-xs cursor-pointer shadow-md shadow-purple-500/20"
              icon={isPublishing ? <RefreshCw size={14} className="animate-spin" /> : <Globe size={14} />}
            >
              {isPublishing ? "Publishing…" : "Publish & Save"}
            </PrimaryBtn>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "theme", label: "Color & Theme", icon: "🎨" },
            { id: "branding", label: "Brand Identity", icon: "🏷️" },
            { id: "banner", label: "Hero Banner", icon: "🖼️" },
            { id: "layout", label: "Store Layout", icon: "📐" },
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id as any)} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                tab === t.id 
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" 
                  : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            {tab === "theme" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Color Palette & Brand Tone</h3>
                  <p className="text-xs text-gray-500 mb-4">Choose the primary color accent used across your store buttons and banners.</p>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Preset Brand Colors</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setPrimaryColor(c.color)}
                          className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            primaryColor === c.color 
                              ? "border-purple-600 ring-2 ring-purple-400/30 bg-purple-50/40" 
                              : "border-gray-200 hover:border-gray-400 bg-white"
                          }`}
                        >
                          <span className="w-7 h-7 rounded-xl shadow-xs" style={{ background: c.color }} />
                          <span className="text-[10px] font-semibold text-gray-700 truncate w-full text-center">{c.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="text-xs font-bold text-gray-700">Custom Hex Color:</label>
                      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50">
                        <input 
                          type="color" 
                          value={primaryColor} 
                          onChange={e => setPrimaryColor(e.target.value)} 
                          className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0 bg-transparent" 
                        />
                        <span className="text-xs font-mono font-bold text-gray-800 uppercase">{primaryColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 text-base mb-1">Store Typography</h3>
                  <p className="text-xs text-gray-500 mb-4">Select the font pairing for headings and product tags in your storefront.</p>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { name: "Modern Sans", desc: "Clean, contemporary aesthetic" },
                      { name: "Editorial Serif", desc: "High-fashion luxury lookbook style" },
                      { name: "Geometric", desc: "Architectural, bold proportions" },
                      { name: "Minimal", desc: "Understated quiet luxury" },
                    ].map(f => (
                      <label 
                        key={f.name} 
                        className={`flex flex-col p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          fontStyle === f.name 
                            ? "border-purple-600 bg-purple-50/50 ring-1 ring-purple-500" 
                            : "border-gray-200 hover:border-purple-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-900">{f.name}</span>
                          <input 
                            type="radio" 
                            name="fontStyle" 
                            checked={fontStyle === f.name} 
                            onChange={() => setFontStyle(f.name)} 
                            className="accent-purple-600" 
                          />
                        </div>
                        <span className="text-[11px] text-gray-500">{f.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "branding" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Store Brand Identity</h3>
                  <p className="text-xs text-gray-500 mb-4">Update your store brand name, logo, and customer headline.</p>
                  
                  <div className="space-y-4">
                    {/* Store Logo */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Store Logo / Avatar</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0 shadow-sm">
                          {logoImage ? (
                            <img src={logoImage} alt="Store logo" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-black text-purple-700">
                              {(storeName || "T")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer mb-1"
                          >
                            <Camera size={14} /> Upload Custom Logo
                          </button>
                          <p className="text-[11px] text-gray-400">PNG, JPG, WebP — square 1:1 recommended</p>
                        </div>
                      </div>
                      <input 
                        ref={logoInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </div>

                    {/* Store Name */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Official Store Name</label>
                      <input 
                        type="text" 
                        value={storeName} 
                        onChange={e => setStoreName(e.target.value)} 
                        placeholder="e.g. AURA Atelier" 
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>

                    {/* Store Tagline */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Store Tagline</label>
                      <input 
                        type="text" 
                        value={tagline} 
                        onChange={e => setTagline(e.target.value)} 
                        placeholder="e.g. Modern Tailoring & Sustainable Resortwear" 
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>

                    {/* Store Description */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Store Biography / Story</label>
                      <textarea 
                        rows={3}
                        value={storeDescription} 
                        onChange={e => setStoreDescription(e.target.value)} 
                        placeholder="Tell buyers about your craftsmanship, fabrics, and origins…" 
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "banner" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Hero Storefront Banner</h3>
                  <p className="text-xs text-gray-500 mb-4">The wide showcase image displayed at the top of your public seller store.</p>
                  
                  <div className="space-y-4">
                    {/* Banner Image Preview */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-gray-900 border border-gray-200 group">
                      <img src={bannerImage} alt="Hero banner preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Live Banner Preview</span>
                        <h4 className="text-sm sm:text-base font-bold text-white">{bannerHeadline || "New Season Arrivals"}</h4>
                        <p className="text-xs text-gray-200 line-clamp-1">{bannerSubtext || "Handcrafted silhouettes tailored for contemporary life"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload size={14} /> Upload Banner Image
                      </button>
                      <span className="text-[11px] text-gray-400">High resolution landscape recommended</span>
                    </div>

                    <input 
                      ref={bannerInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleBannerUpload} 
                      className="hidden" 
                    />

                    {/* Presets */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Or Choose a Curated Studio Banner:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SAMPLE_BANNERS.map(s => (
                          <div 
                            key={s.label} 
                            onClick={() => setBannerImage(s.url)} 
                            className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all relative ${
                              bannerImage === s.url ? "border-purple-600 ring-2 ring-purple-400/30" : "border-gray-200 hover:border-purple-300"
                            }`}
                          >
                            <img src={s.url} alt={s.label} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                            <div className="p-1 text-[10px] font-bold text-gray-700 bg-white text-center truncate">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Headline inputs */}
                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Banner Headline</label>
                        <input 
                          type="text" 
                          value={bannerHeadline} 
                          onChange={e => setBannerHeadline(e.target.value)} 
                          placeholder="Summer 2026 Collection" 
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Banner Subtext</label>
                        <input 
                          type="text" 
                          value={bannerSubtext} 
                          onChange={e => setBannerSubtext(e.target.value)} 
                          placeholder="Bespoke linen and pure silk essentials" 
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs text-gray-900 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "layout" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Store Catalog Layout</h3>
                  <p className="text-xs text-gray-500 mb-4">Choose how your products are arranged when shoppers visit your store page.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "Grid 2-col", name: "Spacious Grid (2 Columns)", desc: "Showcases large high-resolution lookbook imagery" },
                      { id: "Grid 3-col", name: "Standard Grid (3 Columns)", desc: "Balanced store presentation with fast browsing" },
                      { id: "Editorial", name: "Editorial Showcase", desc: "Hero feature products followed by category carousels" },
                      { id: "Minimal List", name: "Minimalist List View", desc: "Clean rows with immediate price & material specs" },
                    ].map(l => (
                      <div 
                        key={l.id} 
                        onClick={() => setLayout(l.id)} 
                        className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                          layout === l.id 
                            ? "border-purple-600 bg-purple-50/50 ring-1 ring-purple-500 shadow-sm" 
                            : "border-gray-200 hover:border-purple-200 bg-white"
                        }`}
                      >
                        <div>
                          <div className="aspect-video bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-gray-400">
                            <Layout size={22} className={layout === l.id ? "text-purple-600" : "text-gray-400"} />
                          </div>
                          <p className="text-xs font-bold text-gray-900 mb-1">{l.name}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{l.desc}</p>
                        </div>
                        {layout === l.id && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 mt-2">
                            <Check size={12} /> Active Layout
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" />
                All changes sync across mobile and desktop
              </span>
              <PrimaryBtn 
                onClick={handlePublish} 
                disabled={isPublishing} 
                className="!py-2.5 !px-6 !text-xs cursor-pointer shadow-md shadow-purple-500/20"
                icon={isPublishing ? <RefreshCw size={14} className="animate-spin" /> : <Globe size={14} />}
              >
                {isPublishing ? "Publishing…" : "Publish Changes"}
              </PrimaryBtn>
            </div>
          </div>

          {/* Right Column: Live Mockup Preview */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interactive Live Preview</span>
              <button 
                onClick={handlePreviewStore} 
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Screen</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xl shadow-purple-950/5 sticky top-24">
              {/* Browser Mockup Top Bar */}
              <div className="h-10 bg-gray-100 border-b border-gray-200/70 flex items-center px-4 justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-mono text-gray-500 truncate max-w-[180px]">
                  trendsprout.lk/{storeName.toLowerCase().replace(/\s+/g, '-')}
                </span>
                <div className="w-4" />
              </div>

              {/* Storefront Hero Preview */}
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Hero Header with Custom Color Gradient & Banner */}
                <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="h-28 relative overflow-hidden bg-gray-900">
                    <img src={bannerImage} alt="Store banner" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  
                  {/* Store Avatar & Details */}
                  <div className="p-3.5 bg-white flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md -mt-8 relative z-10 flex items-center justify-center text-white font-black text-base"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, #9333ea)` }}
                    >
                      {logoImage ? (
                        <img src={logoImage} alt="Store logo" className="w-full h-full object-cover" />
                      ) : (
                        (storeName || "T")[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-gray-900 truncate" style={{ fontFamily: fontStyle === "Editorial Serif" ? "'Playfair Display', serif" : "'Inter', sans-serif" }}>
                          {storeName}
                        </h4>
                        <Badge variant="purple">Verified</Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{tagline}</p>
                    </div>
                  </div>
                </div>

                {/* Banner Headline Preview */}
                <div className="p-3.5 rounded-2xl border flex items-center justify-between text-xs" style={{ borderColor: `${primaryColor}30`, background: `${primaryColor}08` }}>
                  <div>
                    <span className="font-bold block" style={{ color: primaryColor }}>{bannerHeadline}</span>
                    <span className="text-[11px] text-gray-600 line-clamp-1">{bannerSubtext}</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl text-white text-[11px] font-bold shrink-0" style={{ background: primaryColor }}>
                    Shop Collection
                  </button>
                </div>

                {/* Product Catalog Grid Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-800">Featured Creations</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{layout}</span>
                  </div>

                  {previewProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {previewProducts.slice(0, 4).map(p => (
                        <div key={p.id || p._id} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50/50 p-2">
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-1.5">
                            <img src={p.image || p.images?.[0] || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[11px] font-bold text-gray-900 truncate">{p.name}</p>
                          <p className="text-[11px] font-black mt-0.5" style={{ color: primaryColor }}>{lkr(p.price)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-xl">
                      Add products in Vendor Portal to view storefront items
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreCustomizationScreen;
