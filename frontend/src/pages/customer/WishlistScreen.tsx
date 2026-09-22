import { useState, useEffect } from "react";
import {
  Heart, X, ShoppingCart, ArrowRight
} from "lucide-react";
import { 
    Screen, purple, lkr, 
    products, PrimaryBtn, ProductCard, Navbar
} from '../../components/shared';
import { useCart } from '../../context/CartContext';

export function WishlistScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { addToCart } = useCart();
  const [items, setItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ts_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [products[0], products[1]];
  });

  const handleRemove = (productId: string) => {
    setItems(prev => {
      const next = prev.filter(i => (i.id || i._id) !== productId);
      localStorage.setItem('ts_wishlist', JSON.stringify(next));
      return next;
    });
  };

  const handleMoveAllToCart = () => {
    items.forEach(item => {
      addToCart(item, 1, item.sizes?.[0] || 'M', item.colors?.[0] || 'Default');
    });
    setItems([]);
    localStorage.removeItem('ts_wishlist');
    onNavigate("cart");
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="wishlist" onNavigate={onNavigate} role="customer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              My Wishlist <span className="text-gray-400 font-normal text-xl">({items.length})</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Saved pieces and curated looks</p>
          </div>
          {items.length > 0 && (
            <PrimaryBtn onClick={handleMoveAllToCart} className="!py-2.5 !px-5 !text-sm" icon={<ShoppingCart size={14} />}>
              Move All to Bag
            </PrimaryBtn>
          )}
        </div>
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <Heart size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">Your wishlist is empty</h3>
            <p className="text-gray-400 text-sm mb-6">Explore our latest designer drops and save what catches your eye.</p>
            <PrimaryBtn onClick={() => onNavigate("browse")} className="!py-3 !px-6 !text-xs" icon={<ArrowRight size={14} />}>
              Discover Products
            </PrimaryBtn>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map(p => (
              <div key={p.id || p._id} className="relative group">
                <ProductCard product={p} onNavigate={onNavigate} />
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemove(p.id || p._id); }} 
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all z-10 cursor-pointer"
                  title="Remove from wishlist"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default WishlistScreen;
