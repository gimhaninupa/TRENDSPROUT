import { useState, useEffect } from "react";
import {
  Sparkles, RefreshCw, ShoppingCart, Bookmark, Wand2, Plus, ShoppingBag
} from "lucide-react";
import { 
    Screen, purple, purpleLight, lkr, 
    PrimaryBtn, GhostBtn, Navbar
} from '../../components/shared';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export function AIOutfitScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { addToCart } = useCart();
  const [occasion, setOccasion] = useState("Rooftop Dinner");
  const [styleVibe, setStyleVibe] = useState("Editorial");
  const [budget, setBudget] = useState("LKR 66K–165K");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const vendorSaved = localStorage.getItem('ts_vendor_products');
    const localVendorItems = vendorSaved ? JSON.parse(vendorSaved) : [];

    api.getProducts({ limit: 30 })
      .then(res => {
        if (isMounted) {
          const formatted = (res?.data || []).map((item: any) => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            brand: item.brand || item.vendor?.vendorStore?.storeName || 'Brand',
            image: item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80',
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

  const generate = () => { 
    setGenerating(true); 
    setTimeout(() => { 
      setGenerating(false); 
      setGenerated(true); 

      if (catalogItems.length === 0) {
        setOutfits([]);
        return;
      }

      const looks = [];
      const chunkSize = Math.min(3, Math.max(1, Math.floor(catalogItems.length / 3)) || 1);
      
      for (let i = 0; i < Math.min(3, catalogItems.length); i++) {
        const slice = catalogItems.slice(i * chunkSize, (i + 1) * chunkSize);
        const items = slice.length > 0 ? slice : [catalogItems[i % catalogItems.length]];
        const total = items.reduce((acc, item) => acc + (item.price || 0), 0);
        looks.push({
          name: `${styleVibe} ${occasion} Look #${i + 1}`,
          total: total,
          items: items,
        });
      }

      setOutfits(looks);
    }, 1000); 
  };

  const handleAddAll = (items: any[]) => {
    items.forEach(item => {
      addToCart(item, 1, 'M', 'Default');
    });
    onNavigate("cart");
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="ai-outfit" onNavigate={onNavigate} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4" style={{ background: purpleLight, color: purple }}><Wand2 size={12} />AI Outfit Generator</div>
          <h1 className="text-4xl font-black text-gray-900 mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>Build Your Perfect Look</h1>
          <p className="text-gray-500 max-w-md mx-auto">Tell our AI your occasion and style and it'll assemble complete outfits from the active catalog.</p>
        </div>
        {!generated && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Under LKR 20K", "LKR 20K–50K", "LKR 50K+", "No limit"].map(b => (
                    <button key={b} onClick={() => setBudget(b)} className={`py-2 px-2 rounded-xl text-xs font-medium border-2 transition-all cursor-pointer ${budget === b ? "text-white border-transparent" : "border-gray-200 text-gray-600 hover:border-purple-300"}`} style={budget === b ? { background: purple } : {}}>{b}</button>
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
            <p className="text-gray-500 text-sm">Analyzing current catalog and curating the perfect looks…</p>
            <div className="w-64 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
              <div className="h-full rounded-full animate-pulse" style={{ width: "60%", background: purple }} />
            </div>
          </div>
        )}
        {generated && !generating && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Outfits for <span className="text-purple-700">{occasion}</span></h2>
              <button onClick={() => setGenerated(false)} className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:underline"><RefreshCw size={14} />Regenerate</button>
            </div>
            {outfits.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {outfits.map((outfit, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/30 transition-all group shadow-sm">
                    <div className="grid grid-cols-2 h-44 bg-gray-50">
                      {outfit.items.map((item: any, j: number) => (
                        <div key={j} className="relative overflow-hidden"><img src={item.image || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                      ))}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900">{outfit.name}</h3>
                        <span className="text-lg font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{lkr(outfit.total)}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 mb-4">
                        {outfit.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-xs text-gray-500"><span className="truncate mr-2">{item.name}</span><span className="font-medium text-gray-700 flex-shrink-0">{lkr(item.price)}</span></div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <PrimaryBtn onClick={() => handleAddAll(outfit.items)} className="w-full !py-2.5 !text-xs !rounded-xl cursor-pointer" icon={<ShoppingCart size={12} />}>Add All to Bag</PrimaryBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <ShoppingBag size={32} className="text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Items in Catalog Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Add products as a vendor or browse once stores list new collections.</p>
                <div className="flex justify-center gap-3">
                  <PrimaryBtn onClick={() => onNavigate("vendor-add-product")} icon={<Plus size={16} />}>
                    Add Product
                  </PrimaryBtn>
                  <GhostBtn onClick={() => onNavigate("browse")}>
                    Explore Store
                  </GhostBtn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
