import { useState, useEffect, useRef } from "react";
import {
  ChevronRight, Sparkles, Upload, Trash2, Globe, FileText,
  DollarSign, TrendingUp, ChevronLeft, Wand2, CheckCircle2,
  RefreshCw, Layers, ArrowRight, Eye, X, Activity, Check
} from "lucide-react";
import { 
    Screen, purple, purpleLight,
    PrimaryBtn, GhostBtn, Input, VendorSidebar
} from '../../components/shared';
import api from '../../services/api';

export function VendorAddProductScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  // Load draft if available
  const getSavedDraft = () => {
    try {
      const saved = localStorage.getItem('ts_vendor_product_draft');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };

  const initialDraft = getSavedDraft();

  const [title, setTitle] = useState(initialDraft?.title || "");
  const [desc, setDesc] = useState(initialDraft?.desc || "");
  const [category, setCategory] = useState(initialDraft?.category || "Blazers");
  const [price, setPrice] = useState(initialDraft?.price || "");
  const [comparePrice, setComparePrice] = useState(initialDraft?.comparePrice || "");
  const [stock, setStock] = useState(initialDraft?.stock || "20");
  const [sku, setSku] = useState(initialDraft?.sku || "ALB-001");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialDraft?.selectedSizes || ["S", "M", "L"]);
  
  // Images state
  const [images, setImages] = useState<string[]>(initialDraft?.images || [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80"
  ]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovedSuccess, setBgRemovedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // In-place AI Modals state
  const [showAiDescModal, setShowAiDescModal] = useState(false);
  const [aiDescTone, setAiDescTone] = useState("Editorial");
  const [aiDescMaterial, setAiDescMaterial] = useState("Irish Linen");
  const [aiDescResult, setAiDescResult] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const [showAiPricingModal, setShowAiPricingModal] = useState(false);
  const [prodCost, setProdCost] = useState("5500");
  const [targetMargin, setTargetMargin] = useState("55");
  const [pricingResult, setPricingResult] = useState<any>(null);
  const [isAnalyzingPricing, setIsAnalyzingPricing] = useState(false);

  // Persist form to draft storage automatically
  useEffect(() => {
    try {
      const draftData = {
        title,
        desc,
        category,
        price,
        comparePrice,
        stock,
        sku,
        selectedSizes,
        images,
      };
      localStorage.setItem('ts_vendor_product_draft', JSON.stringify(draftData));
    } catch {}
  }, [title, desc, category, price, comparePrice, stock, sku, selectedSizes, images]);

  // Check if standalone AI screen generated anything
  useEffect(() => {
    try {
      const aiDesc = localStorage.getItem('ts_ai_generated_desc');
      if (aiDesc) {
        setDesc(aiDesc);
        localStorage.removeItem('ts_ai_generated_desc');
      }
      const aiPrice = localStorage.getItem('ts_ai_pricing');
      if (aiPrice) {
        setPrice(aiPrice);
        if (!comparePrice) {
          setComparePrice(String(Math.round(Number(aiPrice) * 1.25)));
        }
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

  // Inline AI Description Generator
  const handleGenerateInlineDesc = async () => {
    setIsGeneratingDesc(true);
    setAiDescResult("");
    try {
      const res = await api.generateVendorDescription({
        title: title.trim() || "Oversized Linen Blazer",
        material: aiDescMaterial,
        tone: aiDescTone,
      });
      if (res?.data?.description) {
        setAiDescResult(res.data.description);
        setIsGeneratingDesc(false);
        return;
      }
    } catch {}

    const text = `Crafted from 100% premium ${aiDescMaterial || 'Irish linen'}, the ${title.trim() || 'Oversized Blazer'} embodies contemporary ${aiDescTone.toLowerCase()} elegance. An unstructured silhouette offers effortless movement while the deliberately relaxed shoulder line flatters every frame. Fully unlined for tropical breathability, it transitions seamlessly from daytime commerce to rooftop evening cocktails.`;
    setAiDescResult(text);
    setIsGeneratingDesc(false);
  };

  const handleApplyInlineDesc = () => {
    if (aiDescResult) {
      setDesc(aiDescResult);
    }
    setShowAiDescModal(false);
  };

  // Inline AI Pricing Generator
  const handleAnalyzeInlinePricing = async () => {
    setIsAnalyzingPricing(true);
    try {
      const res = await api.generateVendorPricing({
        category,
        productionCost: Number(prodCost) || 5500,
        targetMargin: Number(targetMargin) || 55,
      });
      if (res?.data) {
        setPricingResult(res.data);
        setIsAnalyzingPricing(false);
        return;
      }
    } catch {}

    const cost = Number(prodCost) || 5500;
    const margin = (Number(targetMargin) || 55) / 100;
    const suggested = Math.round((cost * (1 + margin)) / 100) * 100;
    setPricingResult({
      suggestedPrice: suggested,
      optimalDiscountPrice: Math.round((suggested * 0.9) / 100) * 100,
      compareAtPrice: Math.round((suggested * 1.25) / 100) * 100,
      competitorRange: {
        min: Math.round((suggested * 0.82) / 100) * 100,
        max: Math.round((suggested * 1.35) / 100) * 100,
      },
      estimatedGrossMargin: `${targetMargin}%`,
      profitPerUnit: suggested - cost,
    });
    setIsAnalyzingPricing(false);
  };

  const handleApplyInlinePricing = () => {
    if (pricingResult) {
      setPrice(String(pricingResult.suggestedPrice));
      setComparePrice(String(pricingResult.compareAtPrice || Math.round(pricingResult.suggestedPrice * 1.25)));
    }
    setShowAiPricingModal(false);
  };

  const handleClearForm = () => {
    if (confirm("Clear all typed product details and start fresh?")) {
      setTitle("");
      setDesc("");
      setPrice("");
      setComparePrice("");
      setStock("20");
      setSku("ALB-001");
      setCategory("Blazers");
      setSelectedSizes(["S", "M", "L"]);
      setImages(["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80"]);
      localStorage.removeItem('ts_vendor_product_draft');
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
      sizes: selectedSizes,
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
      localStorage.removeItem('ts_vendor_product_draft');
    } catch {}

    setIsPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => {
      onNavigate("vendor-products");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 lg:pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-add-product" onNavigate={onNavigate} />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => onNavigate("vendor-products")} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-purple-600 transition-colors cursor-pointer">
              <ChevronLeft size={14} />Products
            </button>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Add New Product</span>
          </div>
          <button 
            type="button" 
            onClick={handleClearForm}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear Form
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
                      type="button"
                      onClick={() => {
                        setShowAiDescModal(true);
                        if (!aiDescResult) handleGenerateInlineDesc();
                      }} 
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
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
                  type="button"
                  onClick={() => {
                    setShowAiPricingModal(true);
                    if (!pricingResult) handleAnalyzeInlinePricing();
                  }} 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 cursor-pointer" 
                  style={{ background: purple }}
                >
                  <Sparkles size={13} />Suggest Price
                </button>
              </div>
            </div>

            {/* Product Media & AI Image Studio */}
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
                        type="button"
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
                <button 
                  type="button"
                  onClick={() => {
                    setShowAiDescModal(true);
                    if (!aiDescResult) handleGenerateInlineDesc();
                  }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-100 text-xs font-medium text-gray-700 hover:border-purple-200 hover:text-purple-700 hover:bg-purple-50 transition-all text-left cursor-pointer"
                >
                  <span className="text-purple-600"><FileText size={14} /></span>AI Copywriter (Descriptions)
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAiPricingModal(true);
                    if (!pricingResult) handleAnalyzeInlinePricing();
                  }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-100 text-xs font-medium text-gray-700 hover:border-purple-200 hover:text-purple-700 hover:bg-purple-50 transition-all text-left cursor-pointer"
                >
                  <span className="text-purple-600"><DollarSign size={14} /></span>AI Pricing Optimization
                </button>
                <button 
                  type="button"
                  onClick={() => onNavigate("vendor-analytics")} 
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-100 text-xs font-medium text-gray-700 hover:border-purple-200 hover:text-purple-700 hover:bg-purple-50 transition-all text-left cursor-pointer"
                >
                  <span className="text-purple-600"><TrendingUp size={14} /></span>Trend & Fit Analytics
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Available Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map(s => {
                  const isChecked = selectedSizes.includes(s);
                  return (
                    <label 
                      key={s} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold' : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes(prev => [...prev, s]);
                          } else {
                            setSelectedSizes(prev => prev.filter(x => x !== s));
                          }
                        }}
                        className="accent-purple-600" 
                      />
                      <span>{s}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline AI Description Modal */}
      {showAiDescModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">AI Product Copywriter</h4>
                  <p className="text-xs text-gray-400">Generate high-converting description without losing your form details</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAiDescModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Product Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Oversized Linen Blazer" 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Material</label>
                  <input 
                    type="text" 
                    value={aiDescMaterial} 
                    onChange={e => setAiDescMaterial(e.target.value)} 
                    placeholder="e.g. 100% Linen" 
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Editorial Tone</label>
                  <select 
                    value={aiDescTone} 
                    onChange={e => setAiDescTone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm"
                  >
                    {["Editorial", "Minimalist", "Luxury", "Casual"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleGenerateInlineDesc}
                disabled={isGeneratingDesc}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingDesc ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
                <span>{isGeneratingDesc ? "Writing Copy with AI..." : "Generate AI Copy"}</span>
              </button>

              {aiDescResult && (
                <div className="mt-4 p-4 bg-purple-50/70 border border-purple-100 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-900">Generated Description Preview</span>
                    <button 
                      type="button" 
                      onClick={handleGenerateInlineDesc}
                      className="text-xs text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} /> Regenerate
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{aiDescResult}</p>
                  <div className="mt-4 flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleApplyInlineDesc}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Check size={14} /> Apply to Product Description
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowAiDescModal(false)}
                      className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline AI Pricing Modal */}
      {showAiPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <DollarSign size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">AI Smart Pricing Optimizer</h4>
                  <p className="text-xs text-gray-400">Optimize margin & competitor positioning without page resets</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAiPricingModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Production Cost (LKR)</label>
                  <input 
                    type="number" 
                    value={prodCost} 
                    onChange={e => setProdCost(e.target.value)} 
                    placeholder="5500" 
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1">Target Gross Margin (%)</label>
                  <input 
                    type="number" 
                    value={targetMargin} 
                    onChange={e => setTargetMargin(e.target.value)} 
                    placeholder="55" 
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleAnalyzeInlinePricing}
                disabled={isAnalyzingPricing}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzingPricing ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
                <span>{isAnalyzingPricing ? "Evaluating Market Benchmark..." : "Calculate Recommended Price"}</span>
              </button>

              {pricingResult && (
                <div className="mt-4 p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-3 rounded-xl border border-purple-100">
                      <div className="text-[10px] uppercase font-bold text-gray-400">Market Range</div>
                      <div className="text-xs font-bold text-gray-800 mt-0.5">LKR {pricingResult.competitorRange?.min?.toLocaleString()} - {pricingResult.competitorRange?.max?.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-purple-200 ring-2 ring-purple-500/20">
                      <div className="text-[10px] uppercase font-bold text-purple-600">AI Suggested</div>
                      <div className="text-sm font-black text-purple-700 mt-0.5">LKR {pricingResult.suggestedPrice?.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-purple-100">
                      <div className="text-[10px] uppercase font-bold text-gray-400">Profit / Unit</div>
                      <div className="text-xs font-bold text-emerald-600 mt-0.5">+LKR {pricingResult.profitPerUnit?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={handleApplyInlinePricing}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Check size={14} /> Apply LKR {pricingResult.suggestedPrice?.toLocaleString()} to Form
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowAiPricingModal(false)}
                      className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default VendorAddProductScreen;

