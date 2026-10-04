import { useState, useEffect } from "react";
import {
  CreditCard, DollarSign, ArrowUpRight, Clock, CheckCircle2,
  AlertCircle, Building2, ChevronLeft, RefreshCw, Plus, X,
  ShieldCheck, FileText, TrendingUp, HelpCircle, Send, Check
} from "lucide-react";
import { 
  Screen, purple, purpleLight, lkr, 
  VendorSidebar, PrimaryBtn, GhostBtn 
} from '../../components/shared';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function VendorPayoutsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payout Request Modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState("");

  // Bank Details Modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankName, setBankName] = useState("Commercial Bank of Ceylon");
  const [accountName, setAccountName] = useState(user?.username || "Store Owner");
  const [accountNumber, setAccountNumber] = useState("8004592011");
  const [branch, setBranch] = useState("Colombo 03");
  const [isSavingBank, setIsSavingBank] = useState(false);

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVendorWallet();
      if (res?.data) {
        setWalletData(res.data);
        if (res.data.bankDetails) {
          setBankName(res.data.bankDetails.bankName || "Commercial Bank of Ceylon");
          setAccountName(res.data.bankDetails.accountName || user?.username || "Store Owner");
          setAccountNumber(res.data.bankDetails.accountNumber || "8004592011");
          setBranch(res.data.bankDetails.branch || "Colombo 03");
        }
      }
    } catch {
      // Fallback empty state
      setWalletData({
        grossSales: 0,
        totalPlatformFee: 0,
        netEarnings: 0,
        pendingEarnings: 0,
        availableBalance: 0,
        totalPaidOut: 0,
        bankDetails: {
          bankName: "",
          accountName: user?.username || "",
          accountNumber: "",
          branch: "",
        },
        soldItems: [],
        payouts: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      await api.updateVendorStore({
        bankDetails: {
          bankName,
          accountName,
          accountNumber,
          branch,
        }
      });
      setShowBankModal(false);
      fetchWallet();
    } catch {
      setShowBankModal(false);
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (!amountNum || amountNum < 500) {
      alert("Minimum withdrawal amount is LKR 500");
      return;
    }
    if (amountNum > (walletData?.availableBalance || 0)) {
      alert(`Requested amount exceeds your available balance of LKR ${(walletData?.availableBalance || 0).toLocaleString()}`);
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await api.requestVendorPayout(amountNum, {
        bankName,
        accountName,
        accountNumber,
        branch,
      });
      setPayoutSuccessMsg(res.message || "Payout request submitted! Transfer will be initiated.");
      setPayoutAmount("");
      fetchWallet();
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutSuccessMsg("");
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Could not submit payout request");
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const availableBal = walletData?.availableBalance || 0;
  const pendingBal = walletData?.pendingEarnings || 0;
  const lifetimeGross = walletData?.grossSales || 0;
  const platformFeeTotal = walletData?.totalPlatformFee || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 lg:pt-0 lg:pl-60" style={{ fontFamily: "'Inter', sans-serif" }}>
      <VendorSidebar current="vendor-payouts" onNavigate={onNavigate} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
              <ShieldCheck size={14} /> Multi-Vendor Split Accounting
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Earnings & Payout Wallet
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Automated 10% commission deductions, order breakdowns & direct bank disbursements
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchWallet}
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-purple-600 transition-all cursor-pointer shadow-sm"
              title="Refresh Wallet"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-purple-600" : ""} />
            </button>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ArrowUpRight size={16} />
              <span>Request Payout</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Wallet Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Card 1: Available for Payout */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">Available For Payout</span>
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <DollarSign size={16} />
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-black mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {lkr(availableBal)}
            </div>
            <div className="flex items-center justify-between text-xs text-purple-200 pt-3 border-t border-white/10">
              <span>Ready for Bank Transfer</span>
              <button onClick={() => setShowPayoutModal(true)} className="font-bold underline text-white hover:text-purple-200 cursor-pointer">
                Withdraw →
              </button>
            </div>
          </div>

          {/* Card 2: Pending Settlement */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending Escrow</span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {lkr(pendingBal)}
            </div>
            <p className="text-xs text-gray-400 pt-3 border-t border-gray-100">
              Orders in transit / awaiting customer delivery confirmation
            </p>
          </div>

          {/* Card 3: Lifetime Gross Sales */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Lifetime Gross Sales</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {lkr(lifetimeGross)}
            </div>
            <p className="text-xs text-gray-400 pt-3 border-t border-gray-100">
              Total checkout value from your store items
            </p>
          </div>

          {/* Card 4: Platform Fee (10%) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Marketplace Commission</span>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                10%
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {lkr(platformFeeTotal)}
            </div>
            <p className="text-xs text-gray-400 pt-3 border-t border-gray-100">
              Standard 10% fee covering hosting, AI tools & gateways
            </p>
          </div>
        </div>

        {/* Bank Account Details Banner Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Settlement Bank Account (Sri Lanka)</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-gray-800">{bankName}</span> · Branch: {branch} · Account: <span className="font-mono font-semibold">{accountNumber}</span> ({accountName})
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBankModal(true)}
              className="px-4 py-2 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer self-start sm:self-auto"
            >
              Update Bank Details
            </button>
          </div>
        </div>

        {/* Two Columns: Sold Items Commission Ledger & Payout History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Product Sales & Split Ledger (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Multi-Vendor Sales & Commission Ledger</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time split accounting per product sold through customer checkouts</p>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1">
                {walletData?.soldItems && walletData.soldItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 pt-3.5 first:pt-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 p-1 shrink-0">
                      <img src={item.image} alt={item.productName} className="w-full h-full object-contain rounded-xl" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 truncate">{item.productName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Order #{item.trackingNumber || item.orderId?.slice(-6)} · Qty {item.quantity}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>Sale: <strong>{lkr(item.grossTotal)}</strong></span>
                        <span className="text-red-500">Fee (-10%): <strong>-{lkr(item.platformFee)}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs uppercase font-bold text-gray-400 block">Net Payout</span>
                      <span className="text-sm font-black text-emerald-600">{lkr(item.netPayout)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Payouts History (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Disbursement History</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Direct bank transfer payout records</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 divide-y divide-gray-100">
                {walletData?.payouts && walletData.payouts.map((p: any) => (
                  <div key={p._id} className="pt-3.5 first:pt-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-gray-900">{lkr(p.amount)}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        p.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Ref: <span className="font-mono font-semibold text-gray-700">{p.referenceNumber || 'PAY-REF-PENDING'}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {p.bankDetails?.bankName} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <ArrowUpRight size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Request Bank Payout</h4>
                  <p className="text-xs text-gray-400">Withdraw available store earnings to your bank</p>
                </div>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {payoutSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900">{payoutSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl">
                  <span className="text-xs text-purple-700 block font-medium">Available Balance</span>
                  <span className="text-xl font-black text-purple-950 mt-0.5 block">{lkr(availableBal)}</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    Withdrawal Amount (LKR)
                  </label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                    placeholder={`e.g. ${Math.min(25000, availableBal || 10000)}`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm font-semibold text-gray-900 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>Minimum: LKR 500</span>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(String(availableBal))}
                      className="text-purple-600 font-bold hover:underline cursor-pointer"
                    >
                      Withdraw Max
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
                  <p className="font-bold text-gray-800 mb-0.5">Transfer To:</p>
                  <p>{bankName} · {accountNumber} ({accountName})</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <PrimaryBtn
                    type="submit"
                    disabled={isSubmittingPayout}
                    className="flex-1 !py-3.5 !rounded-xl shadow-md font-bold"
                  >
                    {isSubmittingPayout ? "Submitting..." : "Confirm & Submit Request"}
                  </PrimaryBtn>
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Settlement Bank Account</h4>
                  <p className="text-xs text-gray-400">Configure your Sri Lankan bank account for payouts</p>
                </div>
              </div>
              <button
                onClick={() => setShowBankModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Bank Name</label>
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-sm font-medium text-gray-800"
                >
                  {[
                    "Commercial Bank of Ceylon",
                    "Sampath Bank",
                    "Hatton National Bank (HNB)",
                    "Bank of Ceylon (BOC)",
                    "People's Bank",
                    "Nations Trust Bank (NTB)",
                    "Seylan Bank",
                    "DFCC Bank",
                  ].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. Kasun Perera"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="8004592011"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    placeholder="Colombo 03"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <PrimaryBtn
                  type="submit"
                  disabled={isSavingBank}
                  className="flex-1 !py-3.5 !rounded-xl shadow-md font-bold"
                >
                  {isSavingBank ? "Saving..." : "Save Bank Details"}
                </PrimaryBtn>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorPayoutsScreen;
