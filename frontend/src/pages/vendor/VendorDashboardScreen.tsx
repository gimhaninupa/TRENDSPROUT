import { useState, useEffect } from "react";
import {
  ShoppingBag, Star, TrendingUp, Package, Plus, Bell, ArrowRight,
  DollarSign, FileText
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
    Screen, purple, lkr, 
    Badge, VendorSidebar
} from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function VendorDashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [localProductsCount, setLocalProductsCount] = useState(0);

  const storeName = user?.vendorStore?.storeName || user?.username || "My Store";

  useEffect(() => {
    let isMounted = true;
    try {
      const saved = localStorage.getItem('ts_vendor_products');
      if (saved) {
        setLocalProductsCount(JSON.parse(saved).length);
      }
    } catch {}

    api.getVendorStats()
      .then(res => {
        if (isMounted && res?.data) {
          setStats(res.data);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const activeProducts = stats?.activeProducts || localProductsCount;
  const avgRating = stats?.avgRating || "5.0";

  const monthlyRevenueData = stats?.monthlyRevenue || [
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 0 },
    { month: "May", revenue: 0 },
    { month: "Jun", revenue: totalRevenue },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 lg:pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-dashboard" onNavigate={onNavigate} />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Vendor Dashboard</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{storeName} · Live Marketplace Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("vendor-add-product")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer" style={{ background: purple }}><Plus size={16} />Add Product</button>
            <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-purple-300 bg-white relative shrink-0">
              <Bell size={18} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: lkr(totalRevenue), change: totalRevenue > 0 ? "+100%" : "0%", icon: <DollarSign size={20} />, up: true },
            { label: "Total Orders", value: String(totalOrders), change: totalOrders > 0 ? "+100%" : "0%", icon: <ShoppingBag size={20} />, up: true },
            { label: "Active Products", value: String(activeProducts), change: `+${activeProducts}`, icon: <Package size={20} />, up: true },
            { label: "Store Rating", value: avgRating, change: "Top Tier", icon: <Star size={20} />, up: true },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">{s.icon}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.up ? "text-emerald-700 bg-emerald-100" : "text-red-600 bg-red-100"}`}>{s.change}</span>
              </div>
              <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Revenue Overview</h3>
              <button onClick={() => onNavigate("vendor-payouts")} className="text-xs font-semibold text-purple-600 flex items-center gap-1 cursor-pointer">View wallet <ArrowRight size={12} /></button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="gradVendorDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={purple} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `LKR ${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [`LKR ${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="revenue" stroke={purple} strokeWidth={2.5} fill="url(#gradVendorDash)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Store Quick Actions</h3>
              <p className="text-xs text-gray-500 mb-4">Manage catalog, process customer orders, or configure your storefront banner.</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => onNavigate("vendor-add-product")} className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer">
                <span>Add New Garment</span>
                <Plus size={14} />
              </button>
              <button onClick={() => onNavigate("vendor-orders")} className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer">
                <span>Manage Customer Orders</span>
                <ShoppingBag size={14} />
              </button>
              <button onClick={() => onNavigate("store-customization")} className="w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer">
                <span>Customize Storefront</span>
                <ArrowRight size={14} />
              </button>
              <button onClick={() => onNavigate("vendor-payouts")} className="w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer">
                <span>Request Payout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Recent Store Orders</h3>
            <button onClick={() => onNavigate("vendor-orders")} className="text-xs font-semibold text-purple-600 cursor-pointer">View all</button>
          </div>
          <div className="text-center py-8 text-xs text-gray-400">
            No pending customer orders. Incoming purchases will appear here and in your Orders tab with real-time delivery tracking.
          </div>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { icon: <FileText size={20} />, title: "AI Description Generator", desc: "Auto-write compelling product listings", screen: "vendor-ai-description" as Screen },
            { icon: <DollarSign size={20} />, title: "AI Pricing Advisor", desc: "Optimize prices with market intelligence", screen: "vendor-ai-pricing" as Screen },
            { icon: <ShoppingBag size={20} />, title: "Orders & Fulfillment", desc: "Process orders & generate packing slips", screen: "vendor-orders" as Screen },
          ].map(tool => (
            <div key={tool.title} onClick={() => onNavigate(tool.screen)} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30 transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${purple}, #9333ea)` }}>{tool.icon}</div>
              <div><p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{tool.title}</p><p className="text-xs text-gray-400">{tool.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
