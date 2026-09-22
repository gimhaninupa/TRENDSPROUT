import { useState, useEffect } from "react";
import {
  Heart, Share2, Plus, Minus, ShoppingCart, Truck, RefreshCw, Shield, ChevronRight, Check, Send
} from "lucide-react";
import { 
  Screen, purple, lkr, 
  products, Badge, StarRating, PrimaryBtn, Navbar, ProductCard 
} from '../../components/shared';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export function ProductDetailScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ts_selected_product');
      if (saved) {
        const prod = JSON.parse(saved);
        setSelectedProduct(prod);

        // Fetch live product details & reviews if id is available
        const prodId = prod._id || prod.id;
        if (prodId) {
          api.getProductById(prodId)
            .then(res => {
              if (res?.data) {
                setSelectedProduct((prev: any) => ({ ...prev, ...res.data }));
              }
            })
            .catch(() => {});

          api.getProductReviews(prodId)
            .then(res => {
              if (res?.data && res.data.length > 0) {
                setReviewsList(res.data);
              }
            })
            .catch(() => {});
        }
      } else {
        setSelectedProduct(products[0]);
      }
    } catch {
      setSelectedProduct(products[0]);
    }
  }, []);

  const p = selectedProduct || products[0];
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState(p?.colors?.[0] || "Default");
  const [tab, setTab] = useState("details");
  const [wished, setWished] = useState(() => {
    try {
      const savedWish = localStorage.getItem('ts_wishlist');
      const list = savedWish ? JSON.parse(savedWish) : [];
      return list.some((item: any) => item.id === (p?.id || p?._id));
    } catch {
      return false;
    }
  });
  const [added, setAdded] = useState(false);

  const availableSizes = p.sizes && p.sizes.length > 0 ? p.sizes : ["XS", "S", "M", "L", "XL"];
  const availableColors = p.colors && p.colors.length > 0 ? p.colors : ["Midnight Black", "Natural Linen"];

  const handleToggleWishlist = () => {
    try {
      const savedWish = localStorage.getItem('ts_wishlist');
      let list = savedWish ? JSON.parse(savedWish) : [];
      const prodId = p.id || p._id;
      if (wished) {
        list = list.filter((item: any) => (item.id || item._id) !== prodId);
        setWished(false);
      } else {
        list.push(p);
        setWished(true);
      }
      localStorage.setItem('ts_wishlist', JSON.stringify(list));
    } catch (e) {
      console.warn("Could not save wishlist:", e);
    }
  };

  const handleAddToCart = () => {
    addToCart(p, qty, size, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const prodId = p._id || p.id;
      await api.submitReview({
        productId: prodId,
        rating: newReviewRating,
        comment: newReviewComment.trim(),
      });
      setReviewsList(prev => [
        {
          _id: 'temp-' + Date.now(),
          user: { username: 'You' },
          rating: newReviewRating,
          comment: newReviewComment.trim(),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewReviewComment("");
    } catch {
      // Local fallback display
      setReviewsList(prev => [
        {
          _id: 'temp-' + Date.now(),
          user: { username: 'You' },
          rating: newReviewRating,
          comment: newReviewComment.trim(),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewReviewComment("");
    } finally {
      setSubmittingReview(false);
    }
  };


  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="product-detail" onNavigate={onNavigate} role="customer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <button onClick={() => onNavigate("home")} className="hover:text-purple-600 transition-colors">Home</button>
          <ChevronRight size={12} />
          <button onClick={() => onNavigate("browse")} className="hover:text-purple-600 transition-colors">Shop</button>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-medium">{p.name}</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3 w-20 flex-shrink-0">
              {[p.image, p.image].map((img, i) => (
                <div key={i} className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${i === 0 ? "border-purple-500 shadow-md shadow-purple-100" : "border-gray-200 opacity-60"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex-1 aspect-[4/5] rounded-3xl overflow-hidden bg-gray-50 shadow-xl shadow-black/5 border border-gray-100">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <button onClick={() => onNavigate("seller-store")} className="text-sm text-purple-600 font-semibold hover:underline mb-2 block">{p.brand}</button>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>{p.name}</h1>
              </div>
              <div className="flex gap-2">
                <button onClick={handleToggleWishlist} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-purple-300 hover:text-purple-600 transition-all cursor-pointer">
                  <Heart size={18} className={wished ? "fill-red-500 text-red-500" : ""} />
                </button>
                <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-purple-300 hover:text-purple-600 transition-all">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <StarRating rating={p.rating || 4.9} />
              <span className="text-sm text-gray-500 font-medium">{p.rating || 4.9} ({reviewsList.length > 0 ? reviewsList.length : (p.reviews || 24)} reviews)</span>
              <Badge variant="purple">In Stock</Badge>
            </div>
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{lkr(p.price)}</span>
              {p.originalPrice && <span className="text-xl text-gray-400 line-through">{lkr(p.originalPrice)}</span>}
              {p.originalPrice && <Badge variant="red">-{Math.round((1 - p.price / p.originalPrice) * 100)}%</Badge>}
            </div>

            {/* Colors */}
            <div className="mb-6">
              <span className="text-sm font-semibold text-gray-900 block mb-2">Color: <span className="font-normal text-gray-500">{color}</span></span>
              <div className="flex gap-2">
                {availableColors.map((c: string) => (
                  <button key={c} onClick={() => setColor(c)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${color === c ? "border-purple-500 text-purple-700 bg-purple-50" : "border-gray-200 text-gray-600 hover:border-purple-200"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">Select Size</span>
                <span className="text-xs text-purple-600 font-medium cursor-pointer hover:underline">Size Guide</span>
              </div>
              <div className="flex gap-2">
                {availableSizes.map((s: string) => (
                  <button key={s} onClick={() => setSize(s)} className={`w-12 h-12 rounded-xl text-sm font-semibold border-2 transition-all ${size === s ? "border-purple-500 text-purple-700 bg-purple-50" : "border-gray-200 text-gray-600 hover:border-purple-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"><Minus size={16} /></button>
                <span className="w-8 text-center font-semibold text-gray-900 text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"><Plus size={16} /></button>
              </div>
              <PrimaryBtn onClick={handleAddToCart} className="flex-1 !py-3.5" icon={added ? <Check size={18} /> : <ShoppingCart size={18} />}>
                {added ? "Added to Bag!" : "Add to Bag"}
              </PrimaryBtn>
              <button onClick={() => onNavigate("cart")} className="px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                View Bag
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[{ icon: <Truck size={16} />, text: "Islandwide Delivery", sub: "1-3 business days" }, { icon: <RefreshCw size={16} />, text: "Easy Exchanges", sub: "Within 14 days" }, { icon: <Shield size={16} />, text: "100% Authentic", sub: "Direct from Designer" }].map(f => (
                <div key={f.text} className="rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
                  <span className="text-purple-600 flex justify-center mb-1">{f.icon}</span>
                  <p className="text-xs font-semibold text-gray-700">{f.text}</p>
                  <p className="text-xs text-gray-400">{f.sub}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex gap-6 mb-4">
                {["details", "reviews", "shipping"].map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`text-sm font-semibold pb-2 border-b-2 capitalize transition-all ${tab === t ? "border-purple-500 text-purple-700" : "border-transparent text-gray-400 hover:text-gray-700"}`}>{t}</button>
                ))}
              </div>
              {tab === "details" && (
                <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
              )}
              {tab === "reviews" && (
                <div className="text-sm text-gray-600 space-y-4">
                  {/* Add Review Form */}
                  <form onSubmit={handleAddReview} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <span className="font-semibold text-xs text-gray-800 block mb-2">Write a Verified Customer Review</span>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setNewReviewRating(star)} 
                          className="text-amber-400 text-sm focus:outline-none"
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-gray-500 font-medium">({newReviewRating} stars)</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={newReviewComment}
                        onChange={e => setNewReviewComment(e.target.value)}
                        placeholder="Share your fit, fabric, and styling experience…"
                        className="flex-1 text-xs px-3 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400"
                      />
                      <button 
                        type="submit" 
                        disabled={submittingReview}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 flex items-center gap-1.5 transition-all"
                      >
                        <Send size={12} /> Post
                      </button>
                    </div>
                  </form>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviewsList.length > 0 ? (
                      reviewsList.map(r => (
                        <div key={r._id || r.id} className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating rating={r.rating} />
                            <span className="font-semibold text-gray-800 text-xs">{r.user?.username || 'Verified Shopper'}</span>
                          </div>
                          <p className="text-xs text-gray-600">{r.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1"><StarRating rating={5} /><span className="font-semibold text-gray-800 text-xs">Shanuka M.</span></div>
                        <p className="text-xs text-gray-600">"Exquisite tailoring and fabric feel. Received compliments all evening."</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tab === "shipping" && (
                <p className="text-sm text-gray-600 leading-relaxed">Dispatched from Colombo. Delivery across Western Province within 24-48 hours. Islandwide courier fee LKR 750 (Free for orders over LKR 20,000).</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-2xl font-black text-gray-900 mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>Complete the Look</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.slice(1, 5).map(item => (
              <ProductCard key={item.id} product={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
