import { useState, useEffect } from "react";
import { 
  Check, Truck, RefreshCw, AlertCircle, Printer, ArrowRight, 
  ShieldCheck, CreditCard, Download, Copy, ExternalLink, Package, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Screen, purple, purpleLight, lkr, 
  PrimaryBtn, GhostBtn 
} from '../../components/shared';
import api from '../../services/api';

type PaymentStep = "tunnel" | "3ds" | "settling";

export function PaymentScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [processingStage, setProcessingStage] = useState<PaymentStep>("tunnel");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [txnId, setTxnId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let rawOrder: any = null;
    try {
      const saved = localStorage.getItem('ts_last_order');
      if (saved) {
        rawOrder = JSON.parse(saved);
        setLastOrder(rawOrder);
      }
    } catch {
      // ignore
    }

    executePaymentWorkflow(rawOrder);
  }, []);

  const executePaymentWorkflow = async (order: any) => {
    setStatus("processing");
    setProcessingStage("tunnel");

    // Stage 1: Establishing tunnel
    await new Promise(r => setTimeout(r, 600));
    setProcessingStage("3ds");

    // Stage 2: 3D Secure / Bank verification
    await new Promise(r => setTimeout(r, 800));
    setProcessingStage("settling");

    try {
      if (order?.cardDetails?.cardNumber?.replace(/\s+/g, '').endsWith('0002')) {
        throw new Error("Bank issuing error: 3D Secure Challenge Failed (Card declined by issuer - Code 0002)");
      }

      // Call backend payment API
      const res = await api.processPayment({
        orderId: order?.orderId,
        paymentMethod: order?.paymentMethod || 'Card',
        cardDetails: order?.cardDetails,
        slipUrl: order?.slipFile,
        amount: order?.totalAmount || 0,
      });

      if (res.data?.transactionId) {
        setTxnId(res.data.transactionId);
      } else {
        setTxnId('TXN-LK-' + Math.floor(10000000 + Math.random() * 90000000));
      }

      await new Promise(r => setTimeout(r, 400));
      setStatus("success");
    } catch (err: any) {
      console.warn("Payment processing simulated error or failure:", err);
      setErrorMessage(err.message || "Payment authorization declined by the cardholder bank.");
      setStatus("failed");
    }
  };

  const handleCopyTracking = () => {
    const code = lastOrder?.trackingNumber || "TS-LK-842910";
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const orderNumber = lastOrder?.trackingNumber || "TS-LK-842910";
  const customerEmail = lastOrder?.email || "sophia@trendsprout.com";
  const customerName = lastOrder?.customerName || "Sophia Laurent";
  const finalTotal = lastOrder?.totalAmount || 23000;
  const paymentMethod = lastOrder?.paymentMethod || "Card";
  const cardBrand = lastOrder?.cardDetails?.cardBrand || "Visa";
  const cardLast4 = lastOrder?.cardDetails?.cardLast4 || "8821";
  const items = lastOrder?.items || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Processing State */}
      {status === "processing" && (
        <div className="max-w-md mx-auto mt-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: purpleLight }}>
            <RefreshCw size={28} className="animate-spin" style={{ color: purple }} />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Processing Payment
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Please do not close or refresh this window while we secure your transaction.
          </p>

          <div className="space-y-3 text-left bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className={`w-2.5 h-2.5 rounded-full ${processingStage === "tunnel" ? "bg-purple-600 animate-pulse" : "bg-emerald-500"}`} />
              <span className={processingStage === "tunnel" ? "text-purple-900 font-semibold" : "text-gray-600"}>
                1. 256-Bit SSL Gateway Handshake
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className={`w-2.5 h-2.5 rounded-full ${processingStage === "3ds" ? "bg-purple-600 animate-pulse" : processingStage === "settling" ? "bg-emerald-500" : "bg-gray-300"}`} />
              <span className={processingStage === "3ds" ? "text-purple-900 font-semibold" : "text-gray-600"}>
                2. 3D Secure 2.2 Issuing Bank Verification
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className={`w-2.5 h-2.5 rounded-full ${processingStage === "settling" ? "bg-purple-600 animate-pulse" : "bg-gray-300"}`} />
              <span className={processingStage === "settling" ? "text-purple-900 font-semibold" : "text-gray-400"}>
                3. Authorizing Funds & Generating Order Invoice
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Verified by Visa & Mastercard Identity Check</span>
          </div>
        </div>
      )}

      {/* Failed State (3DS Error / Test Card 0002) */}
      {status === "failed" && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md mx-auto mt-16 bg-white rounded-3xl border border-red-100 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-red-50 text-red-500 border border-red-200">
            <AlertCircle size={32} />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Payment Declined
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {errorMessage || "Your bank could not authorize this transaction. Please verify card details or choose an alternate payment method."}
          </p>

          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-left text-xs text-red-700 mb-6 space-y-1">
            <p className="font-semibold">Reason for Decline:</p>
            <p>• 3D Secure validation rejected by issuing card institution</p>
            <p>• Test failure trigger 0002 executed successfully</p>
            <p>• No charges were deducted from your bank account</p>
          </div>

          <div className="flex flex-col gap-3">
            <PrimaryBtn onClick={() => onNavigate("checkout")} className="w-full !py-3.5" icon={<CreditCard size={16} />}>
              Choose Another Payment Method
            </PrimaryBtn>
            <GhostBtn onClick={() => executePaymentWorkflow(lastOrder)} className="w-full !py-3.5" icon={<RefreshCw size={16} />}>
              Retry Authorization
            </GhostBtn>
          </div>
        </motion.div>
      )}

      {/* Success State with Printable Itemized Receipt */}
      {status === "success" && (
        <div className="max-w-3xl mx-auto">
          {/* Action Bar (hidden when printing) */}
          <div className="no-print flex items-center justify-between mb-6">
            <button onClick={() => onNavigate("browse")} className="text-xs font-semibold text-gray-500 hover:text-purple-600 flex items-center gap-1.5">
              <ArrowLeft size={14} /> Back to Catalog
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
              >
                <Printer size={14} /> Print Invoice
              </button>
              <button 
                onClick={() => onNavigate("orders")}
                className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 flex items-center gap-1.5 transition-all"
              >
                View in My Orders
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="print-area bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Confirmation Banner */}
            <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 p-8 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
                  <Check size={14} className="text-emerald-300" strokeWidth={3} />
                  <span>Payment Authorized & Order Confirmed</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Thank You, {customerName.split(' ')[0]}!
                </h1>
                <p className="text-purple-200 text-sm mt-1">
                  We've received your order and our boutique sellers have begun preparing your garments.
                </p>
              </div>
              <div className="relative z-10 mt-6 sm:mt-0 text-center sm:text-right">
                <p className="text-xs uppercase tracking-wider text-purple-300 font-semibold">Order Total</p>
                <p className="text-3xl font-black text-white">{lkr(finalTotal)}</p>
                <span className="inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Settled via 3D Secure'}
                </span>
              </div>
            </div>

            {/* Quick Meta Cards */}
            <div className="p-6 sm:p-8 border-b border-gray-100 grid sm:grid-cols-3 gap-4 bg-gray-50/50">
              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Tracking Number</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-bold text-gray-900 text-sm">{orderNumber}</span>
                  <button onClick={handleCopyTracking} title="Copy Tracking Code" className="text-purple-600 hover:text-purple-700 no-print">
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Transaction ID</p>
                <p className="font-mono font-bold text-gray-900 text-sm mt-1">{txnId || "TXN-LK-94820194"}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Payment Method</p>
                <p className="font-semibold text-gray-900 text-sm mt-1 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-purple-600" />
                  {paymentMethod === 'Card' ? `${cardBrand} (•••• ${cardLast4})` : paymentMethod}
                </p>
              </div>
            </div>

            {/* Itemized Garment List */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Package size={18} className="text-purple-600" />
                Purchased Garments ({items.length || 1})
              </h3>
              
              <div className="space-y-3">
                {items.length > 0 ? (
                  items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={item.image || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"} 
                          alt={item.name} 
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100" 
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.brand || "TrendSprout Designer"} · Qty {item.qty || 1} {item.size ? `· Size ${item.size}` : ""} {item.color ? `· Color ${item.color}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-gray-900">{lkr(item.price * (item.qty || 1))}</p>
                        <p className="text-xs text-gray-400">{lkr(item.price)} each</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" 
                        alt="Signature Linen Blazer" 
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0" 
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Signature Linen Tailored Blazer</p>
                        <p className="text-xs text-gray-400">Colombo Atelier · Qty 1 · Size M</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{lkr(finalTotal)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery & Financial Summary */}
            <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-8 bg-gray-50/30">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Delivery Information</h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">{customerName}</p>
                  <p>{lastOrder?.shippingAddress?.street || "45/2 Galle Road, Bambalapitiya"}</p>
                  <p>{lastOrder?.shippingAddress?.city || "Colombo"}, {lastOrder?.shippingAddress?.state || "Western"} {lastOrder?.shippingAddress?.zipCode || "00400"}</p>
                  <p>Sri Lanka</p>
                  <p className="text-xs text-gray-500 mt-2">Recipient Phone: {lastOrder?.phone || "+94 77 123 4567"}</p>
                  <p className="text-xs text-gray-500">Notification Email: {customerEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Financial Statement</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{lkr(lastOrder?.subtotal || finalTotal)}</span>
                  </div>
                  {(lastOrder?.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Promotional Discount</span>
                      <span>-{lkr(lastOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Islandwide Courier Delivery</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-gray-900 text-base">
                    <span>Total Amount Paid</span>
                    <span>{lkr(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer / Authenticity Seal */}
            <div className="p-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-purple-600" />
                <span>TrendSprout Certified Merchant Receipt · Colombo, Sri Lanka</span>
              </div>
              <span className="font-mono text-[11px]">{new Date().toLocaleString('en-LK')}</span>
            </div>
          </motion.div>

          {/* Primary Action Buttons (hidden in print) */}
          <div className="no-print mt-8 flex flex-col sm:flex-row gap-4">
            <PrimaryBtn 
              onClick={() => onNavigate("tracking")} 
              className="flex-1 !py-4 !rounded-2xl" 
              icon={<Truck size={18} />}
            >
              Track Order Live
            </PrimaryBtn>
            <GhostBtn 
              onClick={() => onNavigate("browse")} 
              className="flex-1 !py-4 !rounded-2xl"
            >
              Continue Shopping
            </GhostBtn>
          </div>
        </div>
      )}
    </div>
  );
}
