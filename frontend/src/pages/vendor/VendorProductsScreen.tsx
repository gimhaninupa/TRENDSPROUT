import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Trash2, Edit3, Eye, Package, X, Upload, Check, Sparkles, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
    Screen, purple, purpleLight, lkr, 
    products, vendorProducts,
    Badge, PrimaryBtn, GhostBtn, VendorSidebar
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

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editStock, setEditStock] = useState("20");
  const [editCategory, setEditCategory] = useState("Dresses");
  const [editDescription, setEditDescription] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSizes, setEditSizes] = useState<string[]>(["S", "M", "L"]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;

    // Load initial local products first
    const loadLocal = () => {
      try {
        const saved = localStorage.getItem('ts_vendor_products');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    };

    const initialLocal = loadLocal();
    if (initialLocal.length > 0 && items.length === 0) {
      setItems(initialLocal);
    }

    api.getVendorProducts()
      .then(res => {
        if (!isMounted) return;
        const formatted = (res?.data || []).map((p: any) => {
          if (!p) return null;
          const rawImgs = Array.isArray(p.images) && p.images.length > 0 
            ? p.images 
            : (p.image ? [p.image] : []);
          return {
            id: p._id || p.id,
            _id: p._id || p.id,
            name: p.name || 'Untitled Product',
            sku: p.sku || `VP-${String(p._id || p.id || '').slice(-4) || '001'}`,
            stock: Number(p.stock) ?? 0,
            price: Number(p.price) || 0,
            originalPrice: Number(p.originalPrice) || Math.round((Number(p.price) || 0) * 1.25),
            sales: Number(p.salesCount) || 0,
            status: (Number(p.stock) || 0) > 10 ? 'Active' : (Number(p.stock) || 0) > 0 ? 'Low Stock' : 'Out of Stock',
            image: rawImgs[0] || p.image || '',
            images: rawImgs,
            brand: p.brand || 'Independent Brand',
            category: typeof p.category === 'string' ? p.category : p.category?.name || 'Apparel',
            description: p.description || '',
            sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L'],
          };
        }).filter(Boolean);

        // Merge with local newly created products
        const vendorSaved = loadLocal();

        const seenIds = new Set<string>();
        const seenNames = new Set<string>();
        const uniqueList: any[] = [];

        formatted.forEach((p: any) => {
          if (!p) return;
          const pId = String(p.id || p._id || '');
          const pName = String(p.name || '').trim().toLowerCase();
          if (pId) seenIds.add(pId);
          if (pName) seenNames.add(pName);
          uniqueList.push(p);
        });

        vendorSaved.forEach((p: any) => {
          if (!p) return;
          const pId = String(p.id || p._id || '');
          const pName = String(p.name || '').trim().toLowerCase();
          const isDuplicate = (pId && seenIds.has(pId)) || (pName && seenNames.has(pName));
          if (!isDuplicate) {
            if (pId) seenIds.add(pId);
            if (pName) seenNames.add(pName);
            const rawImgs = Array.isArray(p.images) && p.images.length > 0 
              ? p.images 
              : (p.image ? [p.image] : []);
            uniqueList.push({
              ...p,
              id: p.id || p._id || 'vp-' + Date.now(),
              _id: p._id || p.id || 'vp-' + Date.now(),
              name: p.name || 'Untitled Product',
              price: Number(p.price) || 0,
              originalPrice: Number(p.originalPrice) || Math.round((Number(p.price) || 0) * 1.25),
              images: rawImgs,
              image: rawImgs[0] || p.image || '',
              sku: p.sku || `VP-${String(p._id || p.id || Date.now()).slice(-4)}`,
              status: (Number(p.stock) || 20) > 10 ? 'Active' : (Number(p.stock) || 0) > 0 ? 'Low Stock' : 'Out of Stock',
              sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L'],
            });
          }
        });

        setItems(uniqueList);
      })
      .catch(() => {
        if (isMounted) {
          setItems(loadLocal());
        }
      });

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setEditName(p.name || "");
    setEditPrice(String(p.price || ""));
    setEditOriginalPrice(String(p.originalPrice || Math.round(Number(p.price || 0) * 1.25)));
    setEditStock(String(p.stock ?? 20));
    setEditCategory(typeof p.category === 'string' ? p.category : p.category?.name || "Dresses");
    setEditDescription(p.description || "");
    const rawImgs = Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : (p.image ? [p.image] : []);
    setEditImages(rawImgs);
    setEditSizes(Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ["S", "M", "L"]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        setEditImages(prev => [...prev, dataUri]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (s: string) => {
    setEditSizes(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim() || !editPrice) return;
    setIsSavingEdit(true);

    const updatedData = {
      name: editName.trim(),
      price: Number(editPrice),
      originalPrice: editOriginalPrice ? Number(editOriginalPrice) : Math.round(Number(editPrice) * 1.25),
      stock: Number(editStock) || 0,
      category: editCategory,
      description: editDescription.trim(),
      images: editImages.length > 0 ? editImages : [editingProduct.image || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"],
      image: editImages[0] || editingProduct.image || '',
      sizes: editSizes.length > 0 ? editSizes : ["S", "M", "L"],
      status: (Number(editStock) || 0) > 10 ? 'Active' : (Number(editStock) || 0) > 0 ? 'Low Stock' : 'Out of Stock'
    };

    // Update in backend
    try {
      const prodId = editingProduct._id || editingProduct.id;
      if (prodId && !String(prodId).startsWith('vp-')) {
        await api.updateVendorProduct(prodId, updatedData).catch(() => {});
      }
    } catch (err) {
      console.warn("API update note:", err);
    }

    // Update in local state and localStorage
    const pId = editingProduct.id || editingProduct._id;
    setItems(prev => prev.map(item => (item.id === pId || item._id === pId) ? { ...item, ...updatedData } : item));

    try {
      const saved = localStorage.getItem('ts_vendor_products');
      if (saved) {
        const list = JSON.parse(saved);
        const updatedList = list.map((item: any) => (item.id === pId || item._id === pId) ? { ...item, ...updatedData } : item);
        localStorage.setItem('ts_vendor_products', JSON.stringify(updatedList));
      }
    } catch {}

    setIsSavingEdit(false);
    setEditingProduct(null);
    showToast("Product updated successfully! ✨");
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to remove this product from your catalog?")) {
      // Delete from backend
      if (id && !String(id).startsWith('vp-')) {
        api.deleteVendorProduct(id).catch(() => {});
      }
      setItems(prev => {
        const next = prev.filter(i => i.id !== id && i._id !== id);
        try {
          const saved = localStorage.getItem('ts_vendor_products');
          if (saved) {
            const list = JSON.parse(saved).filter((i: any) => i.id !== id && i._id !== id);
            localStorage.setItem('ts_vendor_products', JSON.stringify(list));
          }
        } catch {}
        return next;
      });
      showToast("Product removed from catalog");
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

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-md text-white text-xs font-semibold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/10"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block leading-tight">{p.name}</span>
                          <span className="text-[11px] text-purple-600 font-medium">{p.category || 'Apparel'}</span>
                        </div>
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
                          onClick={() => handleOpenEdit(p)} 
                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-purple-100 hover:text-purple-600 transition-all cursor-pointer"
                          title="Edit product"
                        >
                          <Edit3 size={13} />
                        </button>
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
                          <Eye size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-all cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 size={13} />
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

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-white to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Edit Product</h3>
                    <p className="text-xs text-gray-500">Update pricing, inventory, images & description</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Product Name */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Product Title / Name *</label>
                  <input 
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all font-medium text-gray-900"
                    placeholder="e.g. Sage Green Pleated Midi Dress"
                  />
                </div>

                {/* Price, Compare Price & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Price (LKR) *</label>
                    <input 
                      type="number"
                      required
                      min={0}
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all font-bold text-gray-900"
                      placeholder="8500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Compare Price (LKR)</label>
                    <input 
                      type="number"
                      min={0}
                      value={editOriginalPrice}
                      onChange={e => setEditOriginalPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-500"
                      placeholder="10625"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Stock Units</label>
                    <input 
                      type="number"
                      min={0}
                      value={editStock}
                      onChange={e => setEditStock(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all font-medium text-gray-900"
                      placeholder="20"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500 bg-white font-medium text-gray-800"
                  >
                    {[
                      "Dresses", "T-Shirts", "Shirts", "Blazers", "Jackets & Coats",
                      "Knitwear", "Hoodies & Sweats", "Pants & Trousers", "Jeans & Denim",
                      "Skirts", "Shorts", "Footwear", "Bags", "Accessories"
                    ].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sizes */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map(s => {
                      const isSelected = editSizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Images Gallery */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-700">Product Images</label>
                    <span className="text-[11px] text-gray-400">{editImages.length} image{editImages.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-2">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            MAIN
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 text-purple-700 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Upload size={16} />
                      <span className="text-[10px] font-bold">Add Image</span>
                    </button>
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Product Description</label>
                  <textarea 
                    rows={3}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-gray-800 leading-relaxed"
                    placeholder="Describe garment fabrics, silhouette drape, and care instructions…"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-gray-100 flex gap-3">
                  <GhostBtn
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 !py-2.5 !text-xs cursor-pointer"
                  >
                    Cancel
                  </GhostBtn>
                  <PrimaryBtn
                    type="submit"
                    disabled={isSavingEdit}
                    className="flex-1 !py-2.5 !text-xs cursor-pointer shadow-md shadow-purple-500/20"
                    icon={isSavingEdit ? <span className="animate-spin">⌛</span> : <Check size={14} />}
                  >
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </PrimaryBtn>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VendorProductsScreen;

