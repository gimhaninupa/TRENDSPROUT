import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { AuthModal } from '../components/AuthModal';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  size: string;
  color: string;
  qty: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  finalTotal: number;
  appliedCoupon: { code: string; discountValue: number; discountType: string } | null;
  addToCart: (product: any, qty?: number, size?: string, color?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?._id || 'guest';
  const cartStorageKey = `ts_cart_${userId}`;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<{ product: any; qty: number; size: string; color: string } | null>(null);

  // User-scoped initial cart load (clean empty default)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(cartStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountValue: number; discountType: string } | null>(null);

  // When active user changes (Login / Logout / Switch Account), reload user's own cart
  useEffect(() => {
    const activeKey = `ts_cart_${user?._id || 'guest'}`;
    try {
      const saved = localStorage.getItem(activeKey);
      if (saved) {
        setCartItems(JSON.parse(saved));
      } else {
        setCartItems([]);
      }
    } catch {
      setCartItems([]);
    }
    setAppliedCoupon(null);

    // If authenticated, sync with user's MongoDB cart
    if (isAuthenticated && user?._id) {
      api.getCart()
        .then(res => {
          if (res?.data?.items && res.data.items.length > 0) {
            const dbItems: CartItem[] = res.data.items.map((item: any) => ({
              id: item._id || ('item_' + Math.random().toString(36).substring(2, 6)),
              productId: item.product?._id || item.product,
              name: item.product?.name || 'Fashion Item',
              brand: item.product?.brand || 'Sprout Brand',
              price: Number(item.product?.price || 0),
              originalPrice: item.product?.originalPrice ? Number(item.product.originalPrice) : undefined,
              image: item.product?.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
              size: item.size || 'M',
              color: item.color || 'Default',
              qty: Number(item.quantity || 1),
            }));
            setCartItems(dbItems);
            localStorage.setItem(activeKey, JSON.stringify(dbItems));
          }
        })
        .catch(() => {});
    }
  }, [user?._id, isAuthenticated]);

  // Persist current active user's cart to their own storage key
  useEffect(() => {
    const activeKey = `ts_cart_${user?._id || 'guest'}`;
    localStorage.setItem(activeKey, JSON.stringify(cartItems));
  }, [cartItems, user?._id]);

  const executeAddToCart = (product: any, qty = 1, size = 'M', color = 'Default') => {
    setCartItems((prev) => {
      const pId = product._id || product.id || String(Date.now());
      const existingIdx = prev.findIndex(
        (i) => i.productId === pId && i.size === size && i.color === color
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          qty: next[existingIdx].qty + qty,
        };
        return next;
      } else {
        const newItem: CartItem = {
          id: 'item_' + Date.now() + Math.random().toString(36).substring(2, 5),
          productId: pId,
          name: product.name,
          brand: product.brand || product.vendor?.vendorStore?.storeName || 'Sprout Collection',
          price: Number(product.price),
          originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
          image: product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
          size,
          color,
          qty,
        };
        return [...prev, newItem];
      }
    });

    // If logged in, sync with user's MongoDB cart
    if (isAuthenticated && (product._id || product.id)) {
      api.addToCart({ productId: product._id || product.id, quantity: qty, size, color }).catch(() => {});
    }
  };

  const addToCart = (product: any, qty = 1, size = 'M', color = 'Default') => {
    if (!isAuthenticated) {
      setPendingCartItem({ product, qty, size, color });
      setAuthModalOpen(true);
      return;
    }
    executeAddToCart(product, qty, size, color);
  };

  const handleAuthSuccess = () => {
    if (pendingCartItem) {
      executeAddToCart(pendingCartItem.product, pendingCartItem.qty, pendingCartItem.size, pendingCartItem.color);
      setPendingCartItem(null);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    if (isAuthenticated) {
      api.removeCartItem(itemId).catch(() => {});
    }
  };

  const updateQty = (itemId: string, qty: number) => {
    if (qty < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty } : i))
    );
    if (isAuthenticated) {
      api.updateCartItem(itemId, qty).catch(() => {});
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    const activeKey = `ts_cart_${user?._id || 'guest'}`;
    localStorage.removeItem(activeKey);
    if (isAuthenticated) {
      api.clearCart().catch(() => {});
    }
  };

  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shippingAmount = subtotal > 20000 || subtotal === 0 ? 0 : 750; // Free shipping over LKR 20,000

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingAmount);
  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);

  const applyCoupon = async (code: string) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    const cleanCode = code.toUpperCase().trim();

    try {
      const res = await api.applyCoupon(cleanCode, subtotal);
      if (res?.data) {
        setAppliedCoupon({
          code: res.data.code,
          discountValue: res.data.discountValue,
          discountType: res.data.discountType,
        });
        return { success: true, message: `Coupon applied: -LKR ${res.data.discountAmount.toLocaleString()}` };
      }
    } catch {
      // Fallback promo codes for demo
      if (cleanCode === 'TREND10') {
        setAppliedCoupon({ code: 'TREND10', discountValue: 10, discountType: 'percentage' });
        return { success: true, message: 'TREND10 applied: 10% discount!' };
      }
      if (cleanCode === 'WELCOME20') {
        setAppliedCoupon({ code: 'WELCOME20', discountValue: 20, discountType: 'percentage' });
        return { success: true, message: 'WELCOME20 applied: 20% discount!' };
      }
      if (cleanCode === 'SPROUT2500') {
        setAppliedCoupon({ code: 'SPROUT2500', discountValue: 2500, discountType: 'fixed' });
        return { success: true, message: 'SPROUT2500 applied: LKR 2,500 off!' };
      }
      return { success: false, message: 'Invalid or expired coupon code' };
    }

    return { success: false, message: 'Could not apply coupon' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        discountAmount,
        shippingAmount,
        finalTotal,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        applyCoupon,
        removeCoupon,
        authModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
