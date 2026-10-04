import { useState, useEffect } from "react";
import {
  Star, MessageSquare, Plus, ShoppingBag
} from "lucide-react";
import { 
    Screen, purple, 
    ProductCard, Navbar, PrimaryBtn
} from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function SellerStoreScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user } = useAuth();
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const storeInfo = user?.vendorStore?.storeName ? {
    name: user.vendorStore.storeName,
    desc: user.vendorStore.storeDescription || "Contemporary designs and curated essentials.",
    banner: user.vendorStore.bannerImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
    logo: user.vendorStore.logoImage || "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=200&h=200&q=80",
  } : {
    name: "My Fashion Store",
    desc: "Refined essentials and sustainable apparel for the considered wardrobe.",
    banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
    logo: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=200&h=200&q=80",
  };

  useEffect(() => {
    let isMounted = true;
    const vendorSaved = localStorage.getItem('ts_vendor_products');
    const localVendorItems = vendorSaved ? JSON.parse(vendorSaved) : [];

    api.getProducts({ brand: storeInfo.name })
      .then(res => {
        if (isMounted) {
          const apiItems = (res?.data || []).map((item: any) => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice || Math.round(item.price * 1.25),
            brand: storeInfo.name,
            rating: item.rating || 5.0,
            image: item.images?.[0] || item.image || '',
            category: item.category?.name || item.category || 'Apparel',
          }));

          const combined = [...localVendorItems, ...apiItems];
          const uniqueMap = new Map();
          combined.forEach(p => {
            if (p && p.id && !uniqueMap.has(p.id)) {
              uniqueMap.set(p.id, p);
            }
          });
          setStoreProducts(Array.from(uniqueMap.values()));
        }
      })
      .catch(() => {
        if (isMounted) {
          setStoreProducts(localVendorItems);
        }
      });

    return () => { isMounted = false; };
  }, [storeInfo.name]);

  const filteredProducts = storeProducts.filter(p => {
    if (selectedCategory === "All") return true;
    const cat = (typeof p.category === 'string' ? p.category : p.category?.name || '').toLowerCase();
    return cat.includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="seller-store" onNavigate={onNavigate} />
      <div className="pt-16">
        <div className="relative h-72 overflow-hidden">
          <img src={storeInfo.banner} alt="Store banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7))" }} />
          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white overflow-hidden flex-shrink-0 bg-white shadow-xl">
              <img src={storeInfo.logo} alt="Brand logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>{storeInfo.name}</h1>
              <p className="text-white/80 text-xs sm:text-sm">{storeInfo.desc}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] sm:text-xs text-white/75">
                <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />5.0 Rating</span>
                <span>✓ Verified Brand</span>
                <span>🌿 Sustainable</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {["All", "Dresses", "Blazers", "Outerwear", "Accessories", "T-Shirts"].map(f => (
                <button 
                  key={f} 
                  onClick={() => setSelectedCategory(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all cursor-pointer ${selectedCategory === f ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:border-purple-300"}`} 
                  style={selectedCategory === f ? { background: purple } : {}}
                >
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => onNavigate("ai-chatbot")} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-purple-200 text-xs sm:text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-all cursor-pointer">
              <MessageSquare size={14} />Message Brand
            </button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 p-8">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>No items listed yet in this store</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">This seller has not published items in this category yet. Add products via the Vendor Portal.</p>
              <div className="flex justify-center">
                <PrimaryBtn onClick={() => onNavigate("vendor-add-product")} icon={<Plus size={16} />}>
                  Add Products to Store
                </PrimaryBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
