import { useState, useEffect } from "react";
import {
  Search, Plus, Trash2, Edit3, Eye, Package
} from "lucide-react";
import { 
    Screen, purple, lkr, 
    products, vendorProducts,
    Badge, PrimaryBtn, VendorSidebar
} from '../../components/shared';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function VendorProductsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [items, setItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ts_vendor_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      api.getVendorProducts()
        .then(res => {
          if (res?.data) {
            const formatted = res.data.map((p: any) => {
              const rawImgs = Array.isArray(p.images) && p.images.length > 0 
                ? p.images 
                : (p.image ? [p.image] : []);
              return {
                id: p._id || p.id,
                _id: p._id || p.id,
                name: p.name,
                sku: p.sku || `VP-${String(p._id || p.id).slice(-4)}`,
                stock: p.stock ?? 0,
                price: p.price,
                sales: p.salesCount || 0,
                status: p.stock > 10 ? 'Active' : p.stock > 0 ? 'Low Stock' : 'Out of Stock',
                image: rawImgs[0] || p.image || '',
                images: rawImgs,
                brand: p.brand,
                category: p.category?.name || p.category,
                description: p.description,
              };
            });

            // Merge with local newly created products
            const saved = localStorage.getItem('ts_vendor_products');
            const vendorSaved = saved ? JSON.parse(saved) : [];

            const seenIds = new Set<string>();
            const seenNames = new Set<string>();
            const uniqueList: any[] = [];

            formatted.forEach((p: any) => {
              const pId = String(p.id || p._id || '');
              const pName = (p.name || '').trim().toLowerCase();
              if (pId) seenIds.add(pId);
              if (pName) seenNames.add(pName);
              uniqueList.push(p);
            });

            vendorSaved.forEach((p: any) => {
              const pId = String(p.id || p._id || '');
              const pName = (p.name || '').trim().toLowerCase();
              const isDuplicate = (pId && seenIds.has(pId)) || (pName && seenNames.has(pName));
              if (!isDuplicate) {
                if (pId) seenIds.add(pId);
                if (pName) seenNames.add(pName);
                const rawImgs = Array.isArray(p.images) && p.images.length > 0 
                  ? p.images 
                  : (p.image ? [p.image] : []);
                uniqueList.push({
                  ...p,
                  id: p.id || p._id,
                  _id: p._id || p.id,
                  images: rawImgs,
                  image: rawImgs[0] || p.image || '',
                  sku: p.sku || `VP-${String(p._id || p.id || Date.now()).slice(-4)}`,
                  status: (p.stock || 20) > 10 ? 'Active' : (p.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock',
                });
              }
            });

            setItems(uniqueList);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to remove this product from your catalog?")) {
      setItems(prev => {
        const next = prev.filter(i => i.id !== id);
        try {
          const saved = localStorage.getItem('ts_vendor_products');
          if (saved) {
            const list = JSON.parse(saved).filter((i: any) => i.id !== id);
            localStorage.setItem('ts_vendor_products', JSON.stringify(list));
          }
        } catch {}
        return next;
      });
    }
  };

  const filteredItems = items.filter(p => {
    const matchesSearch = !searchTerm.trim() || 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 lg:pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-products" onNavigate={onNavigate} />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>Products</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your store catalog, pricing, and live inventory</p>
          </div>
          <PrimaryBtn onClick={() => onNavigate("vendor-add-product")} icon={<Plus size={16} />}>Add Product</PrimaryBtn>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-purple-400" 
                placeholder="Search products or SKU…" 
              />
            </div>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 focus:outline-none focus:border-purple-400 cursor-pointer self-start sm:self-auto"
            >
              <option value="All">All status</option>
              <option value="Active">Active</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-xs text-gray-400 font-semibold border-b border-gray-100 bg-gray-50/50">
                  {["Product", "SKU", "Stock", "Price", "Sales", "Status", "Actions"].map(h => <th key={h} className="text-left px-5 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                      <Package size={22} />
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-1">No products in your catalog</div>
                    <p className="text-xs text-gray-500 mb-4">Start listing your apparel items, setting AI-assisted prices, and generating descriptions.</p>
                    <PrimaryBtn onClick={() => onNavigate("vendor-add-product")} icon={<Plus size={14} />} className="!py-2 !px-4 !text-xs mx-auto">
                      Add Product
                    </PrimaryBtn>
                  </td>
                </tr>
              ) : (
                filteredItems.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                        <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{p.stock}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{lkr(p.price)}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{p.sales || 0}</td>
                    <td className="px-5 py-4"><Badge variant={p.status === "Active" ? "green" : p.status === "Low Stock" ? "amber" : "red"}>{p.status}</Badge></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            try {
                              localStorage.setItem('ts_selected_product', JSON.stringify(p));
                              onNavigate("product-detail");
                            } catch {}
                          }} 
                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition-all cursor-pointer"
                          title="View live product"
                        >
                          <Eye size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-all cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}

