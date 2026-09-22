import { useState, useEffect } from "react";
import {
  Truck, Check, ChevronLeft, Search, Package
} from "lucide-react";
import { 
  Screen, purple, lkr, 
  Badge, Navbar 
} from '../../components/shared';
import api from '../../services/api';

export function TrackingScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);

  useEffect(() => {
    try {
      const explicitTrack = localStorage.getItem('ts_search_tracking');
      const saved = localStorage.getItem('ts_last_order');
      const order = saved ? JSON.parse(saved) : null;
      if (order) setLastOrder(order);

      const code = explicitTrack || order?.trackingNumber || "";
      if (code) {
        setSearchInput(code);
        api.trackOrder(code)
          .then(res => {
            if (res?.data) setTrackingData(res.data);
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    try {
      const res = await api.trackOrder(searchInput.trim());
      if (res?.data) {
        setTrackingData(res.data);
      }
    } catch {
      // Default demo timeline
    }
  };

  const trackingCode = trackingData?.trackingNumber || lastOrder?.trackingNumber || "TS-LK-842910";
  const placedDate = lastOrder?.date || "Jul 22, 2026";
  const items = trackingData?.items || lastOrder?.items || [
    {
      name: "Linen Slip Dress",
      brand: "Aura Label",
      price: 8500,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80",
      size: "M",
    },
    {
      name: "Oversized Wool Blazer",
      brand: "Nouveau Collective",
      price: 14500,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&q=80",
      size: "L",
    }
  ];

  const steps = [
    { label: "Order Placed & Verified", date: placedDate + ", 10:14 AM", done: true },
    { label: "Prepared & Quality Checked", date: "Within 12 hours", done: true },
    { label: "Dispatched to Courier Hub", date: "In Transit", done: true, current: true },
    { label: "Out for Delivery", date: "Expected in 1-2 Days", done: false },
    { label: "Delivered", date: "Colombo & Suburbs", done: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="tracking" onNavigate={onNavigate} role="customer" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <button onClick={() => onNavigate("orders")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 transition-colors mb-6"><ChevronLeft size={14} />Back to orders</button>
        
        {/* Search tracking bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Track with order code (e.g. TS-LK-842910)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
          <button onClick={handleSearch} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: purple }}>
            Track
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="font-mono font-bold text-gray-900 text-lg">{trackingCode}</div>
              <p className="text-sm text-gray-400">Domestic Delivery · Sri Lanka</p>
            </div>
            <Badge variant="purple">In Transit</Badge>
          </div>
          <div className="bg-purple-50/60 rounded-xl p-4 flex items-center gap-3 mb-6 border border-purple-100">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: purple }}>
              <Truck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Koombiyo Courier Express</p>
              <p className="text-xs text-purple-700">Estimated delivery: Within 48 Hours</p>
            </div>
          </div>
          <div className="space-y-0 pl-2">
            {steps.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "text-white" : step.current ? "border-2 border-purple-500 bg-white" : "bg-gray-100"}`}
                    style={step.done ? { background: purple } : {}}>
                    {step.done ? <Check size={14} strokeWidth={3} /> : step.current ? <div className="w-3 h-3 rounded-full" style={{ background: purple }} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                  </div>
                  {i < steps.length - 1 && <div className={`w-0.5 flex-1 my-1 ${step.done ? "" : "bg-gray-200"}`} style={step.done ? { background: purple } : {}} />}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-semibold ${step.done || step.current ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                  <p className="text-xs text-gray-400">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 font-bold text-gray-900 mb-4">
            <Package size={18} className="text-purple-600" />
            <span>Items in this consignment ({items.length})</span>
          </div>
          {items.map((p: any, idx: number) => (
            <div key={p.id || idx} className="flex gap-3 mb-3 last:mb-0">
              <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.brand} {p.size ? `· Size ${p.size}` : ''} {p.qty ? `· Qty ${p.qty}` : ''}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{lkr(p.price || 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
