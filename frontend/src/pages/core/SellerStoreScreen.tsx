import { useState, useEffect } from "react";
import {
  Star, MessageSquare, Plus, ShoppingBag, Store, Search,
  ArrowLeft, ArrowRight, CheckCircle, ShieldCheck, Sparkles, Filter
} from "lucide-react";
import { 
    Screen, purple, purpleLight, lkr,
    ProductCard, Navbar, PrimaryBtn, GhostBtn
} from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function SellerStoreScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user } = useAuth();
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [brandSearch, setBrandSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Load registered vendors and products from API
    Promise.all([
      api.getVendors().catch(() => ({ data: [] })),
      api.getProducts().catch(() => ({ data: [] }))
    ]).then(([vRes, pRes]) => {
      if (!isMounted) return;

      const apiProducts = (pRes?.data || []).map((item: any) => {
        const rawImages = Array.isArray(item.images) && item.images.length > 0 
          ? item.images 
          : (item.image ? [item.image] : []);
        return {
          id: item._id || item.id,
          _id: item._id || item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice || Math.round(item.price * 1.25),
          brand: item.brand || item.vendor?.vendorStore?.storeName || 'Independent Label',
          rating: item.rating || 5.0,
          image: rawImages[0] || item.image || '',
          images: rawImages,
          category: item.category?.name || item.category || 'Apparel',
          description: item.description,
        };
      });

      // Combine with local vendor products if any
      let localVendorItems: any[] = [];
      try {
        const vendorSaved = localStorage.getItem('ts_vendor_products');
        if (vendorSaved) localVendorItems = JSON.parse(vendorSaved);
      } catch {}

      const seenIds = new Set<string>();
      const seenNames = new Set<string>();
      const uniqueList: any[] = [];

      apiProducts.forEach((p: any) => {
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

      setAllProducts(uniqueList);

      // Extract unique brands from products + vendors
      const apiVendors = vRes?.data || [];
      const brandMap = new Map<string, any>();

      // 1. Add registered vendors from DB
      apiVendors.forEach((v: any) => {
        const storeName = v.vendorStore?.storeName || v.username;
        if (storeName) {
          brandMap.set(storeName.toLowerCase(), {
            id: v._id,
            name: storeName,
            desc: v.vendorStore?.storeDescription || "Contemporary designs and curated essentials.",
            banner: v.vendorStore?.bannerImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
            logo: v.vendorStore?.logoImage || "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=200&h=200&q=80",
            isVerified: v.isVerified ?? true,
            rating: 5.0,
            sustainable: true
          });
        }
      });

      // 2. Add any active brands from products that might not be in vendor list
      finalProds.forEach((p: any) => {
        if (p.brand && !brandMap.has(p.brand.toLowerCase())) {
          brandMap.set(p.brand.toLowerCase(), {
            id: 'brand_' + p.brand.toLowerCase().replace(/\s+/g, '_'),
            name: p.brand,
            desc: "Original apparel collections and curated fashion pieces.",
            banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
            logo: p.image || "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=200&h=200&q=80",
            isVerified: true,
            rating: 5.0,
            sustainable: true
          });
        }
      });

      // 3. If current user is a vendor and has store info
      if (user?.vendorStore?.storeName && !brandMap.has(user.vendorStore.storeName.toLowerCase())) {
        brandMap.set(user.vendorStore.storeName.toLowerCase(), {
          id: user._id || 'user_store',
          name: user.vendorStore.storeName,
          desc: user.vendorStore.storeDescription || "Refined essentials and sustainable apparel.",
          banner: user.vendorStore.bannerImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
          logo: user.vendorStore.logoImage || "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=200&h=200&q=80",
          isVerified: true,
          rating: 5.0,
          sustainable: true
        });
      }

      setVendorsList(Array.from(brandMap.values()));
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [user]);

  // Filtered brands for Cards view
  const filteredBrands = vendorsList.filter(b => 
    !brandSearch || 
    b.name.toLowerCase().includes(brandSearch.toLowerCase()) || 
    b.desc.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Products for the selected brand
  const brandProducts = selectedBrand 
    ? allProducts.filter(p => p.brand?.toLowerCase() === selectedBrand.name?.toLowerCase())
    : [];

  const filteredBrandProducts = brandProducts.filter(p => {
    if (selectedCategory === "All") return true;
    const cat = (typeof p.category === 'string' ? p.category : p.category?.name || '').toLowerCase();
    return cat.includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="seller-store" onNavigate={onNavigate} />

      <div className="pt-28">
        {/* VIEW 1: DEDICATED SINGLE BRAND STORE VIEW */}
        {selectedBrand ? (
          <div>
            {/* Store Banner */}
            <div className="relative h-72 lg:h-80 overflow-hidden bg-gray-900">
              <img src={selectedBrand.banner} alt={selectedBrand.name} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              
              {/* Back to All Brands Button */}
              <div className="absolute top-6 left-4 sm:left-8 z-10">
                <button
                  onClick={() => { setSelectedBrand(null); setSelectedCategory("All"); }}
                  className="px-4 py-2 rounded-xl bg-black/50 hover:bg-black/75 text-white backdrop-blur-md text-xs font-bold transition-all flex items-center gap-2 border border-white/20 shadow-lg cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to All Brands
                </button>
              </div>

              {/* Brand Store Bio */}
              <div className="absolute bottom-6 left-4 sm:left-8 right-4 flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white overflow-hidden flex-shrink-0 bg-white shadow-2xl">
                  <img src={selectedBrand.logo} alt={selectedBrand.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-4xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                      {selectedBrand.name}
                    </h1>
                    {selectedBrand.isVerified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Verified Brand
                      </span>
                    )}
                  </div>
                  <p className="text-white/85 text-xs sm:text-sm max-w-2xl line-clamp-2">{selectedBrand.desc}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] sm:text-xs text-white/80">
                    <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />5.0 Store Rating</span>
                    <span>🌿 Sustainable Practices</span>
                    <span>• {brandProducts.length} Created Items</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Catalog Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {["All", "Dresses", "Blazers", "Outerwear", "Accessories", "T-Shirts", "Pants"].map(f => (
                    <button 
                      key={f} 
                      onClick={() => setSelectedCategory(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all cursor-pointer ${
                        selectedCategory === f ? "text-white border-transparent shadow-md shadow-purple-500/20" : "border-gray-200 text-gray-600 bg-white hover:border-purple-300"
                      }`} 
                      style={selectedCategory === f ? { background: purple } : {}}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button onClick={() => onNavigate("ai-chatbot")} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-purple-200 text-xs sm:text-sm font-semibold text-purple-700 bg-white hover:bg-purple-50 transition-all cursor-pointer">
                  <MessageSquare size={14} /> Message Brand Stylist
                </button>
              </div>

              {filteredBrandProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredBrandProducts.map(p => (
                    <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    No items in this category
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                    {selectedBrand.name} has not published items under "{selectedCategory}" yet. Explore other categories or all brands.
                  </p>
                  <div className="flex justify-center gap-3">
                    <GhostBtn onClick={() => setSelectedCategory("All")}>
                      View All {selectedBrand.name} Items ({brandProducts.length})
                    </GhostBtn>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VIEW 2: ALL BRANDS DIRECTORY (CARDS VIEW) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-purple-200 bg-purple-50 text-purple-700">
                  <Store size={13} /> Verified Fashion Houses & Boutiques
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Discover Designer Brands
                </h1>
                <p className="text-sm text-gray-500 mt-2 max-w-xl">
                  Explore curated collections from independent designers, sustainable fashion studios, and authentic Sri Lankan artisans.
                </p>
              </div>

              {/* Search Brand Input */}
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search brand or aesthetic…"
                  value={brandSearch}
                  onChange={e => setBrandSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Brand Cards Grid */}
            {filteredBrands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrands.map(brand => {
                  const brandItemsCount = allProducts.filter(p => p.brand?.toLowerCase() === brand.name?.toLowerCase()).length;
                  return (
                    <div
                      key={brand.id || brand.name}
                      onClick={() => { setSelectedBrand(brand); setSelectedCategory("All"); }}
                      className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-purple-900/10 hover:border-purple-200 transition-all duration-300 cursor-pointer flex flex-col"
                    >
                      {/* Brand Banner */}
                      <div className="relative h-40 overflow-hidden bg-gray-900">
                        <img
                          src={brand.banner}
                          alt={brand.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Verified badge */}
                        {brand.isVerified && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle size={12} /> Verified
                          </div>
                        )}

                        {/* Store Avatar Logo */}
                        <div className="absolute -bottom-5 left-6 w-14 h-14 rounded-2xl border-2 border-white overflow-hidden bg-white shadow-xl">
                          <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                        </div>
                      </div>

                      {/* Brand Details */}
                      <div className="pt-8 p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                              {brand.name}
                            </h3>
                            <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold">
                              {brandItemsCount} {brandItemsCount === 1 ? 'Item' : 'Items'}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                            {brand.desc}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                            <Star size={13} className="fill-amber-400" />
                            <span>5.0 Store Rating</span>
                          </div>
                          <span className="text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Explore Store <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Store size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  No Brands Found
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  {brandSearch 
                    ? `No registered brand matched "${brandSearch}". Try searching for another brand name.`
                    : "No fashion brands have onboarded yet. You can register your label through the Vendor Portal."}
                </p>
                <div className="flex justify-center gap-3">
                  {brandSearch ? (
                    <GhostBtn onClick={() => setBrandSearch("")}>
                      Clear Search
                    </GhostBtn>
                  ) : (
                    <PrimaryBtn onClick={() => onNavigate("register")} icon={<Plus size={16} />}>
                      Register as Vendor
                    </PrimaryBtn>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default SellerStoreScreen;
