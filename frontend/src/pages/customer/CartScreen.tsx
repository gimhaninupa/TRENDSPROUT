import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag, Search, Heart, User, Menu, X, ChevronRight, Star, Zap,
  Sparkles, TrendingUp, Package, BarChart2, Users, Settings, LogOut,
  ArrowRight, Check, ShoppingCart, Bell, MessageSquare, Eye, Edit3,
  Upload, Truck, CreditCard, Lock, Mail, Phone, MapPin, Grid, List,
  Filter, ChevronDown, Plus, Minus, Trash2, RefreshCw, AlertCircle,
  CheckCircle, Clock, Store, Bot, Wand2, Image, Tag, DollarSign,
  Activity, PieChart, FileText, Shield, ChevronLeft, Home, Layers,
  Camera, Share2, Bookmark, ThumbsUp, MoreHorizontal, Send, Mic,
  Palette, Layout, Globe, Download, ToggleLeft, Key, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from "recharts";
import { Link, useNavigate } from 'react-router-dom';
import { 
    Screen, purple, purpleLight, purpleDark, lkr, 
    products, categories, testimonials, analyticsData, pieData, vendorProducts, chatMessages, faqs,
    Badge, StarRating, PrimaryBtn, GhostBtn, Input, GlassCard, ProductCard, Navbar, VendorSidebar, FloatingNav, QuickNav
} from '../../components/shared';

import { useCart } from '../../context/CartContext';

export function CartScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { cartItems, removeFromCart, updateQty, subtotal, discountAmount, shippingAmount, finalTotal, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    setCouponMsg({ text: res.message, isError: !res.success });
  };

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="cart" onNavigate={onNavigate} role="customer" />
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <ShoppingCart size={64} className="text-gray-200 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Discover our curated collection of emerging fashion brands.</p>
        <PrimaryBtn onClick={() => onNavigate("browse")} className="!px-8">Start Shopping</PrimaryBtn>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="cart" onNavigate={onNavigate} role="customer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Clash Display', sans-serif" }}>Shopping Cart <span className="text-gray-400 font-normal text-xl">({cartItems.length})</span></h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5">
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-600 font-medium mb-0.5">{item.brand}</p>
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">Size: {item.size} · Color: {item.color}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-purple-600"><Minus size={12} /></button>
                      <span className="w-5 text-center text-sm font-semibold text-gray-900">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-purple-600"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"><Trash2 size={12} />Remove</button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-gray-900 text-lg" style={{ fontFamily: "'Clash Display', sans-serif" }}>{lkr(item.price * item.qty)}</div>
                  <div className="text-xs text-gray-400">{lkr(item.price)} each</div>
                </div>
              </div>
            ))}

            {/* Promo Code Input */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code (try TREND10 or WELCOME20)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button onClick={handleApplyCoupon} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: purple }}>
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs mt-2 ${couponMsg.isError ? "text-red-500" : "text-emerald-600 font-semibold"}`}>
                  {couponMsg.text}
                </p>
              )}
              {appliedCoupon && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold">
                  <span>Code '{appliedCoupon.code}' applied</span>
                  <button onClick={removeCoupon} className="text-purple-400 hover:text-purple-800"><X size={12} /></button>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-5">Order Summary</h3>
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium text-gray-900">{lkr(subtotal)}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium"><span>Promo Discount</span><span>-{lkr(discountAmount)}</span></div>
                )}
                <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className="font-medium text-green-600">{shippingAmount === 0 ? "Free" : lkr(shippingAmount)}</span></div>
              </div>
              <div className="flex justify-between font-black text-xl text-gray-900 border-t border-gray-100 pt-4 mb-6">
                <span>Total</span>
                <span>{lkr(finalTotal)}</span>
              </div>
              <PrimaryBtn onClick={() => onNavigate("checkout")} className="w-full !py-4 !rounded-2xl !text-base" icon={<CreditCard size={18} />}>Proceed to Checkout</PrimaryBtn>
              <button onClick={() => onNavigate("browse")} className="w-full mt-3 text-center text-sm text-gray-400 hover:text-purple-600 transition-colors font-medium">← Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
