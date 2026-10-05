import { useState, useEffect } from "react";
import {
  User, Settings, LogOut, Check, Lock, Mail, Phone, MapPin, 
  ChevronLeft, Trash2, Key, Store, Calendar, CreditCard,
  FileText, ShieldCheck, Sparkles, AlertCircle, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
    Screen, purple, purpleLight, purpleDark, 
    Badge, PrimaryBtn, GhostBtn, Input, Navbar
} from '../../components/shared';
import { useAuth } from '../../context/AuthContext';

export function ProfileSettingsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user, isAuthenticated } = useAuth();
  
  // Tab state: "buyer-profile", "vendor-profile", "security", "danger"
  const [activeTab, setActiveTab] = useState<"buyer" | "vendor" | "security" | "danger">(
    user?.role === "vendor" ? "vendor" : "buyer"
  );
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Buyer / Customer Profile State
  const [buyerName, setBuyerName] = useState(() => {
    return localStorage.getItem("ts_profile_name") || user?.name || user?.username || "";
  });
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");
  const [buyerPhone, setBuyerPhone] = useState(() => localStorage.getItem("ts_buyer_phone") || user?.phone || "");
  const [buyerDob, setBuyerDob] = useState(() => localStorage.getItem("ts_buyer_dob") || "");
  const [buyerIdType, setBuyerIdType] = useState(() => localStorage.getItem("ts_buyer_id_type") || "National ID (NIC)");
  const [buyerIdNumber, setBuyerIdNumber] = useState(() => localStorage.getItem("ts_buyer_id_num") || "");
  const [buyerGender, setBuyerGender] = useState(() => localStorage.getItem("ts_buyer_gender") || "Male");
  const [buyerAddress, setBuyerAddress] = useState(() => localStorage.getItem("ts_buyer_address") || "");
  const [buyerCity, setBuyerCity] = useState(() => localStorage.getItem("ts_buyer_city") || "");

  // Vendor / Store Profile State
  const [vendorStoreName, setVendorStoreName] = useState(() => localStorage.getItem("ts_vendor_store_name") || user?.vendorStore?.storeName || "");
  const [vendorTagline, setVendorTagline] = useState(() => localStorage.getItem("ts_vendor_tagline") || "");
  const [vendorOwnerName, setVendorOwnerName] = useState(() => localStorage.getItem("ts_vendor_owner_name") || buyerName || "");
  const [vendorOwnerDob, setVendorOwnerDob] = useState(() => localStorage.getItem("ts_vendor_owner_dob") || "");
  const [vendorOwnerId, setVendorOwnerId] = useState(() => localStorage.getItem("ts_vendor_owner_id") || "");
  const [vendorBrn, setVendorBrn] = useState(() => localStorage.getItem("ts_vendor_brn") || "");
  const [vendorTaxId, setVendorTaxId] = useState(() => localStorage.getItem("ts_vendor_tax_id") || "");
  const [vendorBusinessEmail, setVendorBusinessEmail] = useState(() => localStorage.getItem("ts_vendor_biz_email") || "");
  const [vendorPhone, setVendorPhone] = useState(() => localStorage.getItem("ts_vendor_phone") || "");
  const [vendorBankName, setVendorBankName] = useState(() => localStorage.getItem("ts_vendor_bank") || "");
  const [vendorBranch, setVendorBranch] = useState(() => localStorage.getItem("ts_vendor_branch") || "");
  const [vendorAccountNum, setVendorAccountNum] = useState(() => localStorage.getItem("ts_vendor_acc") || "");
  const [vendorAccountName, setVendorAccountName] = useState(() => localStorage.getItem("ts_vendor_acc_name") || "");

  const handleResetAllData = () => {
    if (window.confirm("Are you sure you want to wipe all locally saved account & vendor mock data and start completely fresh?")) {
      const tsKeys = [
        'ts_user',
        'ts_token',
        'ts_profile_name',
        'ts_buyer_dob',
        'ts_buyer_id_type',
        'ts_buyer_id_num',
        'ts_buyer_phone',
        'ts_buyer_gender',
        'ts_buyer_address',
        'ts_buyer_city',
        'ts_vendor_store_name',
        'ts_vendor_tagline',
        'ts_vendor_owner_name',
        'ts_vendor_owner_dob',
        'ts_vendor_owner_id',
        'ts_vendor_brn',
        'ts_vendor_tax_id',
        'ts_vendor_biz_email',
        'ts_vendor_phone',
        'ts_vendor_bank',
        'ts_vendor_branch',
        'ts_vendor_acc',
        'ts_vendor_acc_name',
        'ts_vendor_products',
        'ts_last_order',
        'ts_wishlist',
        'ts_cart',
      ];
      tsKeys.forEach(k => localStorage.removeItem(k));
      window.location.href = "/home";
    }
  };

  const handleSaveBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ts_profile_name", buyerName);
    localStorage.setItem("ts_buyer_phone", buyerPhone);
    localStorage.setItem("ts_buyer_dob", buyerDob);
    localStorage.setItem("ts_buyer_id_type", buyerIdType);
    localStorage.setItem("ts_buyer_id_num", buyerIdNumber);
    localStorage.setItem("ts_buyer_gender", buyerGender);
    localStorage.setItem("ts_buyer_address", buyerAddress);
    localStorage.setItem("ts_buyer_city", buyerCity);
    
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ts_vendor_store_name", vendorStoreName);
    localStorage.setItem("ts_vendor_tagline", vendorTagline);
    localStorage.setItem("ts_vendor_owner_name", vendorOwnerName);
    localStorage.setItem("ts_vendor_owner_dob", vendorOwnerDob);
    localStorage.setItem("ts_vendor_owner_id", vendorOwnerId);
    localStorage.setItem("ts_vendor_brn", vendorBrn);
    localStorage.setItem("ts_vendor_tax_id", vendorTaxId);
    localStorage.setItem("ts_vendor_biz_email", vendorBusinessEmail);
    localStorage.setItem("ts_vendor_phone", vendorPhone);
    localStorage.setItem("ts_vendor_bank", vendorBankName);
    localStorage.setItem("ts_vendor_branch", vendorBranch);
    localStorage.setItem("ts_vendor_acc", vendorAccountNum);
    localStorage.setItem("ts_vendor_acc_name", vendorAccountName);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="profile-settings" onNavigate={onNavigate} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <button onClick={() => onNavigate("profile")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-purple-600 transition-colors mb-6 cursor-pointer">
          <ChevronLeft size={16} />
          Back to Profile Overview
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Profile & Identity Settings
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage personal identity, National ID verification, delivery details, and brand store profiles.
            </p>
          </div>
          {savedSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Check size={16} /> Changes Saved Successfully
            </motion.div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm">
          <button 
            onClick={() => setActiveTab("buyer")}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "buyer" ? "bg-purple-600 text-white shadow-md shadow-purple-500/25" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"}`}
          >
            <User size={15} />
            <span>Buyer / Customer Profile</span>
          </button>

          <button 
            onClick={() => setActiveTab("vendor")}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "vendor" ? "bg-purple-600 text-white shadow-md shadow-purple-500/25" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"}`}
          >
            <Store size={15} />
            <span>Brand / Vendor Profile</span>
          </button>

          <button 
            onClick={() => setActiveTab("security")}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "security" ? "bg-purple-600 text-white shadow-md shadow-purple-500/25" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"}`}
          >
            <Lock size={15} />
            <span>Security</span>
          </button>

          <button 
            onClick={() => setActiveTab("danger")}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "danger" ? "bg-red-500 text-white shadow-md shadow-red-500/25" : "text-gray-600 hover:text-red-600 hover:bg-red-50/50"}`}
          >
            <Trash2 size={15} />
            <span>Delete Account</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/80 p-6 sm:p-8 shadow-xl shadow-purple-950/5">
          
          {/* 1. Buyer / Customer Profile */}
          {activeTab === "buyer" && (
            <form onSubmit={handleSaveBuyer} className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Personal & Identity Information</h3>
                  <p className="text-xs text-gray-400">Used for customer account, order deliveries, and AI silhouette profiling.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} /> ID Verified
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Full Name / Profile Name</label>
                  <input 
                    type="text" 
                    value={buyerName} 
                    onChange={e => setBuyerName(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={buyerEmail} 
                    onChange={e => setBuyerEmail(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-100/70 py-3 px-4 text-sm font-medium text-gray-600 focus:outline-none cursor-not-allowed" 
                    disabled
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Date of Birth</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={buyerDob} 
                      onChange={e => setBuyerDob(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Gender</label>
                  <select 
                    value={buyerGender} 
                    onChange={e => setBuyerGender(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">ID Document Type</label>
                  <select 
                    value={buyerIdType} 
                    onChange={e => setBuyerIdType(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  >
                    <option value="National ID (NIC)">National Identity Card (NIC)</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">ID / NIC Card Number</label>
                  <input 
                    type="text" 
                    value={buyerIdNumber} 
                    onChange={e => setBuyerIdNumber(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                    placeholder="e.g. 200013904521 or 952134567V"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Contact Phone Number</label>
                  <input 
                    type="tel" 
                    value={buyerPhone} 
                    onChange={e => setBuyerPhone(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                    placeholder="+94 7X XXX XXXX"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">City / Region</label>
                  <input 
                    type="text" 
                    value={buyerCity} 
                    onChange={e => setBuyerCity(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                    placeholder="Colombo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Primary Delivery Address</label>
                <textarea 
                  value={buyerAddress} 
                  onChange={e => setBuyerAddress(e.target.value)} 
                  rows={2}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all resize-none" 
                  placeholder="Street address, building / apartment number"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <PrimaryBtn type="submit" className="!py-3.5 !px-8 !rounded-2xl !shadow-lg !shadow-purple-500/20">
                  Save Buyer Details
                </PrimaryBtn>
              </div>
            </form>
          )}

          {/* 2. Brand / Vendor Profile */}
          {activeTab === "vendor" && (
            <form onSubmit={handleSaveVendor} className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Brand & Vendor Business Identity</h3>
                  <p className="text-xs text-gray-400">Official vendor verification, payout routing, and storefront profile.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                  <Building2 size={14} /> Registered Vendor
                </div>
              </div>

              {/* Storefront Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Vendor Store / Brand Name</label>
                  <input 
                    type="text" 
                    value={vendorStoreName} 
                    onChange={e => setVendorStoreName(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                    placeholder="Brand / Label Name"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Business Contact Email</label>
                  <input 
                    type="email" 
                    value={vendorBusinessEmail} 
                    onChange={e => setVendorBusinessEmail(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                    placeholder="sales@yourbrand.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Brand Tagline & Short Bio</label>
                <input 
                  type="text" 
                  value={vendorTagline} 
                  onChange={e => setVendorTagline(e.target.value)} 
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                  placeholder="e.g. Sustainable luxury silk and evening couture"
                  required
                />
              </div>

              {/* Owner & Legal Identity */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-3">Owner Legal Identity & Verification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Owner Full Name</label>
                    <input 
                      type="text" 
                      value={vendorOwnerName} 
                      onChange={e => setVendorOwnerName(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                      placeholder="Owner Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Owner Date of Birth</label>
                    <input 
                      type="date" 
                      value={vendorOwnerDob} 
                      onChange={e => setVendorOwnerDob(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Owner NIC / ID Card Number</label>
                    <input 
                      type="text" 
                      value={vendorOwnerId} 
                      onChange={e => setVendorOwnerId(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                      placeholder="NIC / Passport"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business Registration & Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Business Registration No. (BRN)</label>
                  <input 
                    type="text" 
                    value={vendorBrn} 
                    onChange={e => setVendorBrn(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                    placeholder="PV-XXXX-XXXXX"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Tax Identification Number (TIN)</label>
                  <input 
                    type="text" 
                    value={vendorTaxId} 
                    onChange={e => setVendorTaxId(e.target.value)} 
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                    placeholder="TIN-XXXXX"
                  />
                </div>
              </div>

              {/* Bank Payout Details */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-3">PayHere & Direct Bank Settlement Account</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Bank Name</label>
                    <input 
                      type="text" 
                      value={vendorBankName} 
                      onChange={e => setVendorBankName(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                      placeholder="e.g. Commercial Bank, Sampath Bank"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Branch Name</label>
                    <input 
                      type="text" 
                      value={vendorBranch} 
                      onChange={e => setVendorBranch(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                      placeholder="Branch"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Account Number</label>
                    <input 
                      type="text" 
                      value={vendorAccountNum} 
                      onChange={e => setVendorAccountNum(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                      placeholder="Account No"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Account Holder Name</label>
                    <input 
                      type="text" 
                      value={vendorAccountName} 
                      onChange={e => setVendorAccountName(e.target.value)} 
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-3 px-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all" 
                      placeholder="As per bank passbook"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <PrimaryBtn type="submit" className="!py-3.5 !px-8 !rounded-2xl !shadow-lg !shadow-purple-500/20">
                  Save Vendor Profile
                </PrimaryBtn>
              </div>
            </form>
          )}

          {/* 3. Security */}
          {activeTab === "security" && (
            <div className="flex flex-col gap-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Security & Credentials</h3>
                <p className="text-xs text-gray-400">Update your account password and security credentials.</p>
              </div>

              <div className="flex flex-col gap-4 max-w-md">
                <Input label="Current password" type="password" placeholder="••••••••" icon={<Lock size={16} />} />
                <Input label="New password" type="password" placeholder="Min. 8 characters" icon={<Lock size={16} />} />
                <Input label="Confirm new password" type="password" placeholder="Match new password" icon={<Lock size={16} />} />
                
                <PrimaryBtn className="w-full !py-3.5 !rounded-2xl mt-2" icon={<Key size={16} />}>
                  Update Password
                </PrimaryBtn>
              </div>

              <div className="mt-4 p-5 bg-purple-50/60 border border-purple-100 rounded-2xl">
                <p className="text-sm font-bold text-gray-900 mb-1">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-gray-500 mb-4">Add biometric or SMS OTP confirmation for all orders and vendor payouts.</p>
                <GhostBtn className="!py-2 !px-4 !text-xs !rounded-xl">Enable 2FA Verification</GhostBtn>
              </div>
            </div>
          )}

          {/* 4. Danger Zone */}
          {activeTab === "danger" && (
            <div className="space-y-8">
              <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200">
                <h3 className="text-base font-bold text-purple-900 mb-1 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-600" />
                  Wipe All Local Mock / Demo Data (Fresh Start)
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  Clears all pre-saved demo account info, old test vendor details, mock NICs, and saved localStorage session data so you can test on a 100% clean slate.
                </p>
                <button
                  type="button"
                  onClick={handleResetAllData}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  Clear All Data & Start Fresh
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-red-600 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-500 mb-6">
                  This will permanently delete your account, order history, saved addresses, and vendor credentials. This action cannot be undone.
                </p>
                <div className="flex flex-col gap-4 max-w-md">
                  <Input label="Confirm your password" type="password" placeholder="Enter password to confirm" icon={<Lock size={16} />} />
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" id="confirm-delete" className="mt-0.5 accent-red-600" />
                    <label htmlFor="confirm-delete" className="text-xs text-gray-600">I understand this action is permanent and irreversible.</label>
                  </div>
                  <button onClick={() => { handleResetAllData(); }} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-bold text-sm bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all cursor-pointer">
                    <Trash2 size={16} /> Delete My Account Permanently
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
