import { useState, useEffect } from "react";
import {
  ShoppingBag, Package, Truck, CheckCircle2, Clock, Search,
  Filter, ChevronDown, Printer, Eye, Phone, MapPin, Mail,
  ArrowRight, Check, AlertCircle, RefreshCw, X, ExternalLink
} from "lucide-react";
import { 
  Screen, purple, lkr, 
  Badge, VendorSidebar
} from '../../components/shared';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface VendorOrderItem {
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface VendorOrder {
  _id: string;
  trackingNumber: string;
  customer: {
    username: string;
    email: string;
    phone: string;
    address: string;
  };
  items: VendorOrderItem[];
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  orderStatus: string;
  createdAt: string;
}

export function VendorOrdersScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<VendorOrder[]>(() => {
    try {
      const saved = localStorage.getItem('ts_vendor_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [filter, setFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeName = user?.vendorStore?.storeName || user?.username || "Vendor Store";

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVendorOrders();
      if (res?.data && Array.isArray(res.data)) {
        setOrders(res.data);
        localStorage.setItem('ts_vendor_orders', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn("Could not fetch vendor orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      await api.updateVendorOrderStatus(orderId, newStatus);
    } catch {}

    const updated = orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o);
    setOrders(updated);
    localStorage.setItem('ts_vendor_orders', JSON.stringify(updated));
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
    setTimeout(() => setIsUpdating(null), 300);
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "All" || order.orderStatus.toLowerCase() === filter.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      order.trackingNumber.toLowerCase().includes(query) ||
      order.customer.username.toLowerCase().includes(query) ||
      order.items.some(i => i.name.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const totalOrders = orders.length;
  const processingCount = orders.filter(o => o.orderStatus === "Processing").length;
  const shippedCount = orders.filter(o => o.orderStatus === "Shipped").length;
  const deliveredCount = orders.filter(o => o.orderStatus === "Delivered").length;
  const totalVendorRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Processing":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80"><Clock size={12} className="animate-spin" /> Processing</span>;
      case "Shipped":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80"><Truck size={12} /> Shipped & In Transit</span>;
      case "Delivered":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80"><CheckCircle2 size={12} /> Delivered</span>;
      case "Cancelled":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/80"><X size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 lg:pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-orders" onNavigate={onNavigate} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Store Orders & Fulfillment</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">{totalOrders} Orders</span>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">Manage incoming customer purchases, packing slips, and Sri Lanka courier dispatches for {storeName}.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchOrders} 
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm hover:border-purple-300 hover:text-purple-700 transition-all cursor-pointer"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button 
              onClick={() => onNavigate("vendor-products")} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer" 
              style={{ background: purple }}
            >
              <Package size={16} /> Manage Catalog
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400"><ShoppingBag size={20} /></span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-purple-700 bg-purple-50">Total</span>
            </div>
            <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{totalOrders}</div>
            <div className="text-xs text-gray-400 mt-0.5">All Customer Orders</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-500"><Clock size={20} /></span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-amber-700 bg-amber-50">Pending</span>
            </div>
            <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{processingCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">Needs Dispatch / Packing</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-500"><Truck size={20} /></span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-blue-700 bg-blue-50">In Transit</span>
            </div>
            <div className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>{shippedCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">With Islandwide Courier</div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-500"><CheckCircle2 size={20} /></span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50">Delivered</span>
            </div>
            <div className="text-2xl font-black text-emerald-600" style={{ fontFamily: "'Clash Display', sans-serif" }}>{lkr(totalVendorRevenue)}</div>
            <div className="text-xs text-gray-400 mt-0.5">Total Sales Revenue</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filter === tab
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                style={filter === tab ? { background: purple } : {}}
              >
                {tab === "All" ? `All (${orders.length})` : tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search order ID, buyer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all text-gray-900"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500 text-xs max-w-md mx-auto mb-6">
              {searchQuery ? `No orders matched "${searchQuery}". Try searching with a different tracking code or buyer name.` : "You don't have any orders in this status category right now."}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="px-4 py-2 bg-purple-50 text-purple-700 text-xs font-semibold rounded-xl hover:bg-purple-100 transition-colors">
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div 
                key={order._id} 
                className="bg-white rounded-3xl border border-gray-100 p-5 lg:p-6 shadow-sm hover:border-purple-200 hover:shadow-md transition-all"
              >
                {/* Order Top Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-black text-sm text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                      {order.trackingNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {order.paymentStatus} · {order.paymentMethod || 'PayHere'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.orderStatus)}
                  </div>
                </div>

                {/* Main Order Body */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                  {/* Customer Information */}
                  <div className="lg:col-span-4 bg-gray-50/70 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Customer & Shipping Details</div>
                      <div className="font-bold text-sm text-gray-900 mb-1">{order.customer.username}</div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-gray-400 shrink-0" />
                          <span className="truncate">{order.customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-gray-400 shrink-0" />
                          <span>{order.customer.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 pt-1">
                          <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="text-gray-700 leading-relaxed">{order.customer.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purchased Items */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Items ({order.items.length})</div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3.5 p-2.5 rounded-xl border border-gray-100 bg-white">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=150&q=80"} 
                          alt={item.name} 
                          className="w-12 h-14 object-cover rounded-lg bg-gray-100 shrink-0 border border-gray-200" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-gray-900 truncate">{item.name}</div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                            {item.size && <span className="bg-gray-100 px-1.5 py-0.5 rounded font-semibold text-gray-700">Size: {item.size}</span>}
                            {item.color && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{item.color}</span>}
                            <span>Qty: <b>{item.quantity}</b></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xs text-gray-900">{lkr(item.price * item.quantity)}</div>
                          <div className="text-[10px] text-gray-400">{lkr(item.price)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action & Status Controls */}
                  <div className="lg:col-span-3 flex flex-col justify-between p-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Order Total</div>
                      <div className="text-xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                        {lkr(order.totalAmount)}
                      </div>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Net Vendor Settlement: {lkr(Math.round(order.totalAmount * 0.90))}</p>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="text-[11px] font-bold text-gray-600">Update Fulfillment:</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {order.orderStatus === "Processing" && (
                          <button
                            disabled={isUpdating === order._id}
                            onClick={() => handleUpdateStatus(order._id, "Shipped")}
                            className="w-full py-2 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer col-span-2"
                          >
                            <Truck size={13} /> Mark as Shipped
                          </button>
                        )}
                        {order.orderStatus === "Shipped" && (
                          <button
                            disabled={isUpdating === order._id}
                            onClick={() => handleUpdateStatus(order._id, "Delivered")}
                            className="w-full py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer col-span-2"
                          >
                            <CheckCircle2 size={13} /> Mark Delivered
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowSlipModal(true);
                          }}
                          className="py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Printer size={12} /> Packing Slip
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('ts_search_tracking', order.trackingNumber);
                            onNavigate("tracking");
                          }}
                          className="py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={12} /> Live Track
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Packing Slip & Invoice Modal */}
      {showSlipModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: purple }}>TS</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">TRENDSPROUT Packing Slip</h3>
                  <p className="text-xs text-gray-500">Order #{selectedOrder.trackingNumber}</p>
                </div>
              </div>
              <button onClick={() => setShowSlipModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div>
                <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Shipped From:</span>
                <p className="font-bold text-gray-900">{storeName}</p>
                <p className="text-gray-600">TRENDSPROUT Verified Fashion Merchant</p>
                <p className="text-gray-600">Sri Lanka Courier Hub</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1">Deliver To:</span>
                <p className="font-bold text-gray-900">{selectedOrder.customer.username}</p>
                <p className="text-gray-600">{selectedOrder.customer.phone}</p>
                <p className="text-gray-600">{selectedOrder.customer.address}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider mb-3">Package Items</h4>
              <table className="w-full text-xs text-left">
                <thead className="border-b border-gray-200 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="pb-2">Item Description</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedOrder.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2.5">
                        <div className="font-semibold text-gray-900">{it.name}</div>
                        <div className="text-[11px] text-gray-400">Size: {it.size || 'M'} · Color: {it.color || 'Standard'}</div>
                      </td>
                      <td className="py-2.5 text-center font-bold text-gray-800">{it.quantity}</td>
                      <td className="py-2.5 text-right text-gray-600">{lkr(it.price)}</td>
                      <td className="py-2.5 text-right font-bold text-gray-900">{lkr(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Payment: <span className="font-semibold text-emerald-600">{selectedOrder.paymentStatus} ({selectedOrder.paymentMethod || 'Card'})</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Total Declared Value:</span>
                <span className="text-lg font-black text-gray-900">{lkr(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button 
                onClick={() => window.print()} 
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Printer size={14} /> Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
