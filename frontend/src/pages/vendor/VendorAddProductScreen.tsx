import { useState, useEffect, useRef } from "react";
import {
  ChevronRight, Sparkles, Upload, Trash2, Globe, FileText,
  DollarSign, TrendingUp, ChevronLeft, Wand2, CheckCircle2,
  RefreshCw, Layers, ArrowRight, Eye
} from "lucide-react";
import { 
    Screen, purple, purpleLight,
    PrimaryBtn, GhostBtn, Input, VendorSidebar
} from '../../components/shared';
import api from '../../services/api';

export function VendorAddProductScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Blazers");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("20");
  const [sku, setSku] = useState("ALB-001");
  
  // Images state
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80"
  ]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovedSuccess, setBgRemovedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Check if an AI generated description or pricing exists in session
  useEffect(() => {
    try {
      const aiDesc = localStorage.getItem('ts_ai_generated_desc');
      if (aiDesc && !desc) {
        setDesc(aiDesc);
        localStorage.removeItem('ts_ai_generated_desc');
      }
      const aiPrice = localStorage.getItem('ts_ai_pricing');
      if (aiPrice) {
        setPrice(aiPrice);
        localStorage.removeItem('ts_ai_pricing');
      }
    } catch {}
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        setImages(prev => [...prev, dataUri]);
        setSelectedImageIndex(images.length);
        setBgRemovedSuccess(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!images[selectedImageIndex]) return;
    setIsRemovingBg(true);
    try {
      const activeImage = images[selectedImageIndex];
      const res = await api.removeBackground(activeImage);
      if (res && res.imageUrl) {
        setImages(prev => {
          const next = [...prev];
          next[selectedImageIndex] = res.imageUrl;
          return next;
        });
        setBgRemovedSuccess(true);
      }
    } catch (err) {
      console.error("Background removal error:", err);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handlePublishProduct = async () => {
    if (!title.trim() || !price) {
      alert("Please enter product name and price.");
      return;
    }

    setIsPublishing(true);
    const newProduct = {
      id: 'vp-' + Date.now(),
      name: title.trim(),
      description: desc.trim() || "Modern runway design crafted with sustainable luxury fabrics.",
      category: category || "Blazers",
      price: Number(price) || 12500,
      originalPrice: comparePrice ? Number(comparePrice) : Math.round((Number(price) || 12500) * 1.25),
      stock: Number(stock) || 20,
      sku: sku || ('SKU-' + Math.floor(1000 + Math.random() * 9000)),
      brand: "Atelier Nord",
      tag: "New",
      rating: 5.0,
      reviewsCount: 0,
      image: images[0] || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80",
      images: images,
      sizes: ["S", "M", "L"],
      colors: ["Midnight Black", "Natural Ivory"],
    };

    try {
      await api.createVendorProduct(newProduct);
    } catch (err) {
      console.warn("API product create offline fallback:", err);
    }

    // Persist to vendor products catalog
    try {
      const saved = localStorage.getItem('ts_vendor_products');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newProduct);
      localStorage.setItem('ts_vendor_products', JSON.stringify(list));
    } catch {}

    setIsPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => {
      onNavigate("vendor-products");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-add-product" onNavigate={onNavigate} />
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => onNavigate("vendor-products")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 transition-colors">
            <ChevronLeft size={14} />Products
          </button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-sm font-medium text-gray-700">Add New Product</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Product Information */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-5 text-base">Product Information</h3>
              <div className="flex flex-col gap-4">
                <Input 
                  label="Product name" 
                  placeholder="e.g. Oversized Linen Blazer" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <button 
                      onClick={() => onNavigate("vendor-ai-description")} 
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline"
                    >
                      <Sparkles size={12} />Generate with AI
                    </button>
                  </div>
                  <textarea 
                    value={desc} 
                    onChange={e => setDesc(e.target.value)} 
                    rows={5}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none transition-all"
                    placeholder="Write a compelling product description or click Generate with AI…" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)} 
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 focus:outline-none focus:border-purple-400"
                    >
                      {["Blazers", "Dresses", "Pants", "Knitwear", "Skirts", "Bags", "Accessories"].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <Input 
                    label="SKU" 
                    placeholder="ALB-001" 
                    value={sku} 
                    onChange={e => setSku(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-5 text-base">Pricing & Stock (LKR)</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input 
                  label="Price (LKR)" 
                  placeholder="8500" 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                />
                <Input 
                  label="Compare at (LKR)" 
                  placeholder="10500" 
                  value={comparePrice} 
                  onChange={e => setComparePrice(e.target.value)} 
                />
                <Input 
                  label="Stock Quantity" 
                  placeholder="24" 
                  value={stock} 
                  onChange={e => setStock(e.target.value)} 
                />
              </div>
              <div className="mt-4 flex items-center justify-between p-4 bg-purple-50/60 rounded-xl border border-purple-100">
                <div>
                  <p className="text-sm font-semibold text-purple-950">AI Pricing Advisor</p>
                  <p className="text-xs text-purple-700">Real-time dynamic price recommendation based on Sri Lankan e-commerce trends</p>
                </div>
                <button 
                  onClick={() => onNavigate("vendor-ai-pricing")} 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95" 
                  style={{ background: purple }}
                >
                  <Sparkles size={13} />Suggest Price
                </button>
              </div>
            </div>

            {/* Product Media & AI Image Studio (Future Scope Improvement #1) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Product Visuals & AI Studio</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Upload photos and use AI to automatically extract background for e-commerce catalog standards</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  disabled={isRemovingBg || images.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isRemovingBg ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>U²-Net Removing BG...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={13} />
                      <span>AI Remove Background</span>
                    </>
                  )}
                </button>
              </div>

              {bgRemovedSuccess && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>AI Background Removal Complete: Photo now has an isolated, transparent background optimized for high conversion.</span>
                </div>
              )}

              {/* Gallery Grid */}
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedImageIndex(i)}
                    className={`aspect-square rounded-xl overflow-hidden relative group cursor-pointer border-2 transition-all bg-gray-50 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:10px_10px] flex items-center justify-center p-1 ${
                      selectedImageIndex === i ? 'border-purple-600 ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Product preview ${i + 1}`} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setImages(prev => prev.filter((_, idx) => idx !== i));
                          if (selectedImageIndex >= i && selectedImageIndex > 0) setSelectedImageIndex(selectedImageIndex - 1);
                        }} 
                        className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
                >
                  <Upload size={22} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                  <span className="text-xs text-gray-500 group-hover:text-purple-700 font-medium mt-1.5 transition-colors">Upload Image</span>
                </div>
              </div>

              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </div>
          </div>

          {/* Right Column / Actions */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Publish Status</h3>
              <div className="flex flex-col gap-3">
                <PrimaryBtn 
                  onClick={handlePublishProduct} 
                  disabled={isPublishing}
                  className="w-full !py-3.5 shadow-sm hover:shadow" 
                  icon={publishSuccess ? <CheckCircle2 size={16} /> : <Globe size={16} />}
                >
                  {publishSuccess ? "Published to Store!" : isPublishing ? "Publishing…" : "Publish to Store"}
                </PrimaryBtn>
                <GhostBtn onClick={() => onNavigate("vendor-products")} className="w-full !py-3.5">
                  Save as Draft
                </GhostBtn>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Vendor AI Suite</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "AI Copywriter (Descriptions)", icon: <FileText size={14} />, screen: "vendor-ai-description" as Screen },
                  { label: "AI Pricing Optimization", icon: <DollarSign size={14} />, screen: "vendor-ai-pricing" as Screen },
                  { label: "Trend & Fit Analytics", icon: <TrendingUp size={14} />, screen: "vendor-analytics" as Screen },
                ].map(t => (
                  <button 
                    key={t.label} 
                    onClick={() => onNavigate(t.screen)} 
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-100 text-xs font-medium text-gray-700 hover:border-purple-200 hover:text-purple-700 hover:bg-purple-50 transition-all text-left"
                  >
                    <span className="text-purple-600">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Available Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map(s => (
                  <label key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs cursor-pointer hover:border-purple-300">
                    <input type="checkbox" defaultChecked={["S", "M", "L"].includes(s)} className="accent-purple-600" />
                    <span className="text-gray-800 font-medium">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default VendorAddProductScreen;
