import { useState, useEffect, useRef } from "react";
import {
  Search, ChevronDown, Grid, List, Camera, Upload, X,
  Sparkles, CheckCircle2, RefreshCw, Sliders, ArrowRight
} from "lucide-react";
import { 
    Screen, purple, purpleLight, lkr, 
    products, StarRating, PrimaryBtn, GhostBtn, ProductCard, Navbar
} from '../../components/shared';
import api from '../../services/api';

export function BrowseScreen({ onNavigate, isSearch = false }: { onNavigate: (s: Screen) => void; isSearch?: boolean }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeFilters, setActiveFilters] = useState<string[]>(["All"]);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState("Trending");
  const filters = ["All", "Dresses", "Blazers", "Knitwear", "Pants", "Skirts", "Bags"];
  const [priceRange, setPriceRange] = useState([0, 99000]);
  const [searchTerm, setSearchTerm] = useState(isSearch ? "Silk dress" : "");
  const [allProducts, setAllProducts] = useState<any[]>(() => {
    try {
      const vendorSaved = localStorage.getItem('ts_vendor_products');
      const vendorItems = vendorSaved ? JSON.parse(vendorSaved) : [];
      return [...vendorItems, ...products];
    } catch {
      return products;
    }
  });

  useEffect(() => {
    let isMounted = true;
    api.getProducts()
      .then(res => {
        if (isMounted && res?.data && res.data.length > 0) {
          const formatted = res.data.map(item => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice || Math.round(item.price * 1.25),
            brand: item.brand || 'Aura Label',
            tag: item.tag || 'New',
            rating: item.rating || 4.9,
            reviews: item.reviewsCount || 18,
            image: item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
            category: item.category?.name || item.category || 'Dresses',
            description: item.description,
            sizes: item.sizes || ['S', 'M', 'L'],
            colors: item.colors || ['Black', 'Ivory'],
          }));
          
          // Merge with custom vendor products if any
          const vendorSaved = localStorage.getItem('ts_vendor_products');
          const vendorItems = vendorSaved ? JSON.parse(vendorSaved) : [];
          setAllProducts([...vendorItems, ...formatted]);
        }
      })
      .catch(err => {
        console.warn('Using local catalog fallback:', err.message);
      });

    return () => { isMounted = false; };
  }, []);

  // Visual Search Drop & Crop States (Future Scope Improvement #3)
  const [visualSearchOpen, setVisualSearchOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cropBox, setCropBox] = useState({ x: 75, y: 30, width: 180, height: 160 });
  const [isSearchingVisual, setIsSearchingVisual] = useState(false);
  const [visualResults, setVisualResults] = useState<any[] | null>(null);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [isDraggingRoi, setIsDraggingRoi] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const sampleVisualImages = [
    { label: "Summer Slip Dress", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80" },
    { label: "Wool Blazer Look", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80" },
    { label: "Denim & Streetwear", url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" }
  ];

  const handleVisualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setVisualResults(null);
      setDetectedCategory(null);
      setCropBox({ x: 75, y: 30, width: 180, height: 160 });
    };
    reader.readAsDataURL(file);
  };

  // Drag handlers for Region of Interest
  const handleRoiMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingRoi(true);
    setDragOffset({
      x: e.clientX - cropBox.x,
      y: e.clientY - cropBox.y,
    });
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRoi || !cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(rect.width - cropBox.width, e.clientX - rect.left - (cropBox.width / 2)));
    const newY = Math.max(0, Math.min(rect.height - cropBox.height, e.clientY - rect.top - (cropBox.height / 2)));
    setCropBox(prev => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
  };

  const handleContainerMouseUp = () => {
    setIsDraggingRoi(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!cropContainerRef.current) return;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const newX = Math.max(0, Math.min(rect.width - cropBox.width, clickX - (cropBox.width / 2)));
    const newY = Math.max(0, Math.min(rect.height - cropBox.height, clickY - (cropBox.height / 2)));
    setCropBox(prev => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
  };

  // Touch drag support
  const handleRoiTouchMove = (e: React.TouchEvent) => {
    if (!cropContainerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cropContainerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(rect.width - cropBox.width, touch.clientX - rect.left - (cropBox.width / 2)));
    const newY = Math.max(0, Math.min(rect.height - cropBox.height, touch.clientY - rect.top - (cropBox.height / 2)));
    setCropBox(prev => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
  };

  // Preset ROI helpers
  const applyPreset = (preset: "top" | "full" | "bottom" | "accessory") => {
    if (preset === "top") {
      setCropBox({ x: 60, y: 20, width: 200, height: 140 });
    } else if (preset === "full") {
      setCropBox({ x: 40, y: 15, width: 240, height: 290 });
    } else if (preset === "bottom") {
      setCropBox({ x: 60, y: 160, width: 200, height: 140 });
    } else if (preset === "accessory") {
      setCropBox({ x: 140, y: 220, width: 130, height: 100 });
    }
  };

  const executeVisualSearch = async () => {
    if (!uploadedImage) return;
    setIsSearchingVisual(true);
    try {
      const containerW = cropContainerRef.current?.clientWidth || 320;
      const containerH = cropContainerRef.current?.clientHeight || 320;
      const res = await api.visualSearch(uploadedImage, {
        x: cropBox.x,
        y: cropBox.y,
        w: cropBox.width,
        h: cropBox.height,
        containerW,
        containerH
      });
      if (res && res.matches) {
        setVisualResults(res.matches);
        setDetectedCategory(res.detectedCategory || "Matched Apparel");
      }
    } catch (err) {
      console.warn("Visual search offline fallback:", err);
    } finally {
      setIsSearchingVisual(false);
    }
  };

  const filteredProducts = allProducts.filter(p => {
    const matchesCategory = activeFilters.includes("All") || activeFilters.some(f => 
      p.category?.toLowerCase() === f.toLowerCase() || 
      p.name?.toLowerCase().includes(f.toLowerCase())
    );
    const matchesSearch = !searchTerm.trim() || 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];

    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="browse" onNavigate={onNavigate} role="customer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        
        {/* Search & Visual Search Header Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-32 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-sm" 
              placeholder="Search garments, textures, designers…" 
            />
            <button
              onClick={() => setVisualSearchOpen(true)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Camera size={14} />
              <span>Drop & Crop</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setVisualSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-bold shadow-sm hover:shadow hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>AI Visual Search</span>
            </button>
          </div>
        </div>

        {/* Visual Search Modal */}
        {visualSearchOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <Camera size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Visual Search with Drop & Crop</h3>
                    <p className="text-xs text-gray-500">Upload any fashion photo or street-style shot to find identical or similar pieces</p>
                  </div>
                </div>
                <button 
                  onClick={() => setVisualSearchOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="py-5 overflow-y-auto flex-1 flex flex-col gap-5">
                {!uploadedImage ? (
                  <div className="flex flex-col gap-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-purple-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-purple-50/40 hover:bg-purple-50 cursor-pointer transition-all group text-center"
                    >
                      <Upload size={32} className="text-purple-400 group-hover:text-purple-600 mb-2 transition-colors" />
                      <p className="font-semibold text-gray-800 text-sm mb-1">Click to upload or drag & drop a fashion photo</p>
                      <p className="text-xs text-gray-400">Supports PNG, JPG, WebP up to 15MB</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Or test with a sample lookbook shot:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {sampleVisualImages.map(sample => (
                          <div 
                            key={sample.label}
                            onClick={() => {
                              setUploadedImage(sample.url);
                              setVisualResults(null);
                            }}
                            className="group cursor-pointer rounded-xl border border-gray-200 overflow-hidden hover:border-purple-500 transition-all relative"
                          >
                            <img src={sample.url} alt={sample.label} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                              <span className="text-[11px] font-medium text-white">{sample.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="grid md:grid-cols-2 gap-5 items-start">
                      {/* Interactive Crop Frame Container */}
                      <div className="flex flex-col gap-2">
                        <div 
                          ref={cropContainerRef}
                          onClick={handleContainerClick}
                          onMouseMove={handleContainerMouseMove}
                          onMouseUp={handleContainerMouseUp}
                          onMouseLeave={handleContainerMouseUp}
                          onTouchMove={handleRoiTouchMove}
                          onTouchEnd={handleContainerMouseUp}
                          className="relative rounded-2xl overflow-hidden bg-gray-950 aspect-square flex items-center justify-center select-none cursor-crosshair border border-gray-800 shadow-inner group"
                        >
                          <img 
                            src={uploadedImage} 
                            alt="Uploaded sample" 
                            className="w-full h-full object-contain pointer-events-none" 
                            draggable={false}
                          />
                          
                          {/* Visual Crop Box Overlay with Drag Support */}
                          <div 
                            onMouseDown={handleRoiMouseDown}
                            className={`absolute border-2 border-dashed rounded-xl flex flex-col justify-between p-2 shadow-2xl transition-shadow ${
                              isDraggingRoi 
                                ? 'border-amber-400 bg-purple-600/35 cursor-grabbing shadow-purple-500/50' 
                                : 'border-purple-400 bg-purple-600/20 hover:bg-purple-600/30 cursor-grab hover:border-purple-300'
                            }`}
                            style={{
                              left: `${cropBox.x}px`,
                              top: `${cropBox.y}px`,
                              width: `${cropBox.width}px`,
                              height: `${cropBox.height}px`,
                            }}
                          >
                            <div className="flex items-center justify-between pointer-events-none">
                              <span className="px-2 py-0.5 bg-purple-900/90 text-white rounded text-[10px] font-bold shadow-sm tracking-wide">
                                🎯 Drag to Move ROI
                              </span>
                              <span className="text-[9px] text-purple-200 font-mono bg-black/60 px-1 rounded">
                                {cropBox.width}×{cropBox.height}
                              </span>
                            </div>

                            <div className="flex justify-center pointer-events-none">
                              <div className="w-8 h-1 bg-white/70 rounded-full animate-pulse" />
                            </div>

                            <div className="text-[9px] text-purple-200 text-center font-medium pointer-events-none">
                              Click or drag over garment
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-500 text-center">
                          💡 <span className="font-semibold text-gray-700">Tip:</span> Click anywhere or drag the purple box directly to isolate specific clothes!
                        </p>
                      </div>

                      {/* Controls & Presets */}
                      <div className="flex flex-col gap-3.5">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">Quick Garment Presets</h4>
                          <p className="text-xs text-gray-500 mb-2.5">Click a quick target or fine-tune manually:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => applyPreset("top")}
                              className="px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              🧥 Tops & Blazers
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPreset("full")}
                              className="px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              👗 Full Dresses / Outerwear
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPreset("bottom")}
                              className="px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              👖 Trousers & Pants
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPreset("accessory")}
                              className="px-3 py-2 rounded-xl text-xs font-semibold border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              👜 Bags & Accessories
                            </button>
                          </div>
                        </div>
                        
                        {/* Sliders for Pixel-Perfect Adjustment */}
                        <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="text-xs text-gray-600 font-medium flex justify-between">
                            <span>Crop Frame Size</span>
                            <span className="font-bold text-purple-700">{cropBox.width}px</span>
                          </label>
                          <input 
                            type="range" 
                            min={90} 
                            max={280} 
                            value={cropBox.width} 
                            onChange={(e) => {
                              const sz = Number(e.target.value);
                              setCropBox(prev => ({ ...prev, width: sz, height: sz }));
                            }} 
                            className="accent-purple-600"
                          />

                          <div className="grid grid-cols-2 gap-3 mt-1 pt-2 border-t border-gray-200/60">
                            <div>
                              <label className="text-[11px] text-gray-500 font-medium flex justify-between">
                                <span>Vertical (Y)</span>
                                <span>{cropBox.y}px</span>
                              </label>
                              <input 
                                type="range" 
                                min={0} 
                                max={260} 
                                value={cropBox.y} 
                                onChange={(e) => setCropBox(prev => ({ ...prev, y: Number(e.target.value) }))} 
                                className="w-full accent-purple-600"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-gray-500 font-medium flex justify-between">
                                <span>Horizontal (X)</span>
                                <span>{cropBox.x}px</span>
                              </label>
                              <input 
                                type="range" 
                                min={0} 
                                max={260} 
                                value={cropBox.x} 
                                onChange={(e) => setCropBox(prev => ({ ...prev, x: Number(e.target.value) }))} 
                                className="w-full accent-purple-600"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { setUploadedImage(null); setVisualResults(null); setDetectedCategory(null); }}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            Change Photo
                          </button>
                          <button
                            onClick={executeVisualSearch}
                            disabled={isSearchingVisual}
                            className="flex-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-200 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isSearchingVisual ? (
                              <>
                                <RefreshCw size={13} className="animate-spin" />
                                <span>Extracting Visual Features…</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={13} />
                                <span>Search Isolated Region</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Matched Results Grid */}
                    {visualResults && (
                      <div className="mt-2 border-t border-gray-100 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                              Top Catalog Matches ({visualResults.length})
                            </span>
                            {detectedCategory && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800">
                                {detectedCategory}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Deep ROI Feature Matching Active
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {visualResults.map(item => (
                            <div 
                              key={item.id}
                              onClick={() => {
                                setVisualSearchOpen(false);
                                onNavigate("product-detail");
                              }}
                              className="p-2 rounded-xl border border-gray-100 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer bg-white group"
                            >
                              <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100 relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 text-white rounded text-[9px] font-bold">
                                  {Math.round(item.similarity * 100)}% match
                                </span>
                              </div>
                              <p className="text-[10px] text-purple-600 font-semibold">{item.brand}</p>
                              <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs font-extrabold text-gray-800 mt-1">{lkr(item.price)}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{item.matchReason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleVisualUpload} 
                className="hidden" 
              />
            </div>
          </div>
        )}

        {/* Regular Browse Content */}
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Filters</h3>
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</h4>
                {filters.map(f => (
                  <label key={f} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={activeFilters.includes(f)} 
                      onChange={() => setActiveFilters(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f])} 
                      className="accent-purple-600" 
                    />
                    <span className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">{f}</span>
                  </label>
                ))}
              </div>
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Price</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700">LKR {priceRange[0].toLocaleString()}</div>
                  <span className="text-gray-400 text-xs">–</span>
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700">LKR {priceRange[1].toLocaleString()}</div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Brands</h4>
                {["Atelier Nord", "Maison Éclat", "Studio Voss", "Nordic Thread", "Aura Label", "Nouveau Collective"].map(b => (
                  <label key={b} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                    <input type="checkbox" className="accent-purple-600" />
                    <span className="text-sm text-gray-600">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Catalog View */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-2 flex-wrap">
                {filters.map(f => (
                  <button 
                    key={f} 
                    onClick={() => setActiveFilters(p => p.includes(f) ? p.filter(x => x !== f) : [f])}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      activeFilters.includes(f) ? "border-purple-500 text-white" : "border-gray-200 text-gray-600 bg-white hover:border-purple-300"
                    }`}
                    style={activeFilters.includes(f) ? { background: purple } : {}}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setSortOpen(!sortOpen)} 
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:border-purple-300 transition-all cursor-pointer"
                  >
                    {sort} <ChevronDown size={12} />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2 w-36">
                      {["Trending", "Newest", "Price ↑", "Price ↓", "Top Rated"].map(o => (
                        <button 
                          key={o} 
                          onClick={() => { setSort(o); setSortOpen(false); }} 
                          className="block w-full px-4 py-2 text-xs text-left text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setView("grid")} 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${view === "grid" ? "text-white" : "text-gray-400 bg-white border border-gray-200 hover:border-purple-300"}`} 
                  style={view === "grid" ? { background: purple } : {}}
                >
                  <Grid size={14} />
                </button>
                <button 
                  onClick={() => setView("list")} 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${view === "list" ? "text-white" : "text-gray-400 bg-white border border-gray-200 hover:border-purple-300"}`} 
                  style={view === "list" ? { background: purple } : {}}
                >
                  <List size={14} />
                </button>
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredProducts.map(p => (
                  <div key={p.id} onClick={() => onNavigate("product-detail")} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-5 cursor-pointer hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30 transition-all">
                    <img src={p.image} alt={p.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-purple-600 font-medium mb-1">{p.brand}</p>
                      <h3 className="font-semibold text-gray-900 mb-2">{p.name}</h3>
                      <StarRating rating={p.rating} />
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="font-bold text-gray-900">{lkr(p.price)}</span>
                        <span className="text-xs text-gray-400 line-through">{lkr(p.originalPrice)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                      <PrimaryBtn onClick={e => e.stopPropagation()} className="!py-2 !px-4 !text-xs">Add to Cart</PrimaryBtn>
                      <GhostBtn onClick={e => { e.stopPropagation(); onNavigate("product-detail"); }} className="!py-2 !px-4 !text-xs">View</GhostBtn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default BrowseScreen;
