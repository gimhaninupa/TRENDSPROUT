import { useState, useEffect } from "react";
import {
  Package, ArrowRight, Truck, ShoppingBag, Clock, CheckCircle2
} from "lucide-react";
import { 
    Screen, purple, lkr, 
    Badge, PrimaryBtn, Navbar
} from '../../components/shared';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function OrdersScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('ts_last_order');
      if (stored) {
        const order = JSON.parse(stored);
        return [
          {
            id: order.orderId || '#TS-LK-842910',
            trackingNumber: order.trackingNumber || 'TS-LK-842910',
            status: 'Processing',
            date: order.date || 'Today',
            items: order.items?.length || 1,
            total: order.totalAmount || 23000,
            img: order.items?.[0]?.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
          },
          {
            id: '#TS-LK-519283',
            trackingNumber: 'TS-LK-519283',
            status: 'Delivered',
            date: '3 days ago',
            items: 2,
            total: 18700,
            img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80',
          }
        ];
      }
    } catch {}
    return [
      {
        id: '#TS-LK-842910',
        trackingNumber: 'TS-LK-842910',
        status: 'Shipping',
        date: 'Yesterday',
        items: 1,
        total: 8500,
        img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: '#TS-LK-519283',
        trackingNumber: 'TS-LK-519283',
        status: 'Delivered',
        date: 'Jul 18, 2026',
        items: 2,
        total: 18700,
        img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80',
      }
    ];
  });

  useEffect(() => {
    if (isAuthenticated) {
      api.getMyOrders()
        .then(res => {
          if (res?.data && res.data.length > 0) {
            const formatted = res.data.map((o: any) => ({
              id: o.trackingNumber ? `#${o.trackingNumber}` : `#TS-LK-${o._id.slice(-6)}`,
              trackingNumber: o.trackingNumber || `TS-LK-${o._id.slice(-6)}`,
              status: o.orderStatus || 'Processing',
              date: new Date(o.createdAt).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' }),
              items: o.items?.length || 1,
              total: o.totalAmount,
              img: o.items?.[0]?.product?.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
            }));
            setOrders(formatted);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleTrack = (trackingNumber: string) => {
    localStorage.setItem('ts_search_tracking', trackingNumber);
    onNavigate("tracking");
  };

  const filteredOrders = orders.filter(o => {
    if (filter === "All") return true;
    if (filter === "Active") return o.status === "Processing" || o.status === "Shipping";
    if (filter === "Delivered") return o.status === "Delivered";
    if (filter === "Cancelled") return o.status === "Cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="orders" onNavigate={onNavigate} role="customer" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time status updates and order tracking</p>
          </div>
          <button 
            onClick={() => onNavigate("browse")} 
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline"
          >
            Continue Shopping <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          {["All", "Active", "Delivered", "Cancelled"].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${filter === f ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white hover:border-purple-300"}`} 
              style={filter === f ? { background: purple } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Package size={44} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 text-base mb-1">No {filter !== "All" ? filter.toLowerCase() : ""} orders found</h3>
            <p className="text-xs text-gray-400 mb-6">You don't have any orders in this category yet.</p>
            <PrimaryBtn onClick={() => onNavigate("browse")} className="!py-2.5 !px-6 !text-xs">
              Explore The Catalog
            </PrimaryBtn>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-gray-900 text-sm">{order.id}</span>
                      <Badge variant={order.status === "Delivered" ? "green" : order.status === "Shipping" ? "purple" : "amber"}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.date} · {order.items} item{order.items > 1 ? "s" : ""} · <span className="font-bold text-gray-800">{lkr(order.total)}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTrack(order.trackingNumber)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Truck size={14} /> Track Order <ArrowRight size={12} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <img src={order.img} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                  {order.items > 1 && (
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                      +{order.items - 1}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default OrdersScreen;

