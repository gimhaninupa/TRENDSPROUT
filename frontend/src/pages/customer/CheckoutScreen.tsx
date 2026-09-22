import { useState } from "react";
import {
  CreditCard, Lock, Mail, Phone, MapPin, ChevronRight, Info
} from "lucide-react";
import { 
  Screen, purple, lkr, 
  PrimaryBtn, Input, Navbar 
} from '../../components/shared';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function CheckoutScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { cartItems, subtotal, discountAmount, shippingAmount, finalTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<"address" | "payment">("address");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("Sophia");
  const [lastName, setLastName] = useState("Laurent");
  const [email, setEmail] = useState(user?.email || "sophia@trendsprout.com");
  const [phone, setPhone] = useState(user?.phone || "+94 77 123 4567");
  const [street, setStreet] = useState("45/2 Galle Road, Bambalapitiya");
  const [city, setCity] = useState("Colombo");
  const [state, setState] = useState("Western");
  const [zip, setZip] = useState("00400");
  const [paymentMethod, setPaymentMethod] = useState("Card");

  // Payment Details State
  const [cardHolder, setCardHolder] = useState("Sophia Laurent");
  const [cardNumber, setCardNumber] = useState("4532 8920 1849 8821");
  const [cardExpiry, setCardExpiry] = useState("10/28");
  const [cardCvv, setCardCvv] = useState("842");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [slipFile, setSlipFile] = useState<string | null>(null);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    if (raw.startsWith('4')) setCardBrand('Visa');
    else if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) setCardBrand('Mastercard');
    else if (/^3[47]/.test(raw)) setCardBrand('Amex');
    else setCardBrand('Card');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
    }
    setCardExpiry(val);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file.name);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    const trackingNum = 'TS-LK-' + Math.floor(100000 + Math.random() * 900000);
    const rawCard = cardNumber.replace(/\s+/g, '');
    const cardLast4 = rawCard.slice(-4) || '8821';

    const orderPayload = {
      items: cartItems.map(i => ({
        product: i.productId.startsWith('p') ? undefined : i.productId,
        name: i.name,
        price: i.price,
        quantity: i.qty,
        size: i.size,
        color: i.color,
        image: i.image,
        brand: i.brand,
      })),
      totalAmount: finalTotal,
      shippingAddress: {
        street,
        city,
        state,
        zipCode: zip,
        country: 'Sri Lanka',
      },
      paymentMethod,
      paymentDetails: {
        cardLast4,
        cardBrand,
        slipUrl: slipFile || '',
      },
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      trackingNumber: trackingNum,
    };

    let createdOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    let resolvedTracking = trackingNum;

    try {
      if (user?._id) {
        const res = await api.createOrder({
          ...orderPayload,
          clearCart: true,
        });
        if (res.data?._id) {
          createdOrderId = res.data._id;
          resolvedTracking = res.data.trackingNumber || trackingNum;
        }
      }
    } catch {
      // Graceful fallback for offline/demo operation
    }

    // Save comprehensive order & payment snapshot for PaymentScreen & Tracking
    localStorage.setItem('ts_last_order', JSON.stringify({
      orderId: createdOrderId,
      trackingNumber: resolvedTracking,
      totalAmount: finalTotal,
      subtotal,
      discountAmount,
      shippingAmount,
      email,
      customerName: `${firstName} ${lastName}`,
      phone,
      shippingAddress: { street, city, state, zipCode: zip, country: 'Sri Lanka' },
      items: cartItems,
      paymentMethod,
      cardDetails: {
        cardNumber: rawCard,
        cardHolder,
        expiry: cardExpiry,
        cvv: cardCvv,
        cardBrand,
        cardLast4,
      },
      slipFile,
      date: new Date().toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date().toISOString(),
    }));

    clearCart();
    setIsSubmitting(false);
    onNavigate("payment");
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar current="checkout" onNavigate={onNavigate} role="customer" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-10">
          {["Address", "Payment", "Confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 || (i === 1 && step === "payment") ? "text-white" : "bg-gray-200 text-gray-500"}`}
                style={i === 0 || (i === 1 && step === "payment") ? { background: purple } : {}}>{i + 1}</div>
              <span className={`text-sm font-medium ${i === 0 || (i === 1 && step === "payment") ? "text-purple-700" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <ChevronRight size={14} className="text-gray-300 ml-2" />}
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {step === "address" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin size={18} className="text-purple-600" />
                  Delivery Address (Sri Lanka)
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">First name</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Last name</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Phone number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Street address</label>
                    <input type="text" value={street} onChange={e => setStreet(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Province</label>
                      <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Postal Code</label>
                      <input type="text" value={zip} onChange={e => setZip(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <PrimaryBtn onClick={() => setStep("payment")} className="w-full !py-4 !rounded-2xl mt-2">Continue to Payment</PrimaryBtn>
                </div>
              </div>
            )}
            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-gray-900">Payment Method</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Choose your preferred settlement method</p>
                  </div>
                  <button onClick={() => setStep("address")} className="text-xs text-purple-600 font-semibold hover:underline">← Edit Address</button>
                </div>
                <div className="flex gap-3 mb-6">
                  {["Card", "Bank Transfer", "COD"].map((m) => (
                    <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${paymentMethod === m ? "border-purple-500 text-purple-700 bg-purple-50 shadow-sm" : "border-gray-200 text-gray-500 hover:border-purple-200"}`}>
                      {m === "Card" && <CreditCard size={16} />}
                      {m}
                    </button>
                  ))}
                </div>
                {paymentMethod === "Card" ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Cardholder name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={e => setCardHolder(e.target.value)}
                        placeholder="Sophia Laurent"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Card number</label>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">{cardBrand}</span>
                      </div>
                      <div className="relative">
                        <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 8920 1849 8821"
                          maxLength={19}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Expiry date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">CVV <Info size={12} className="text-gray-400" /></label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.slice(0, 4))}
                          placeholder="842"
                          maxLength={4}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Testing Hint:</strong> Use card ending in <strong>0002</strong> to simulate 3D Secure bank decline and failure recovery.</span>
                    </div>
                  </div>
                ) : paymentMethod === "Bank Transfer" ? (
                  <div className="flex flex-col gap-3">
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 leading-relaxed">
                      <p className="font-bold text-sm mb-1 text-purple-950">Commercial Bank of Ceylon PLC</p>
                      <p><strong>Account Name:</strong> TrendSprout Holdings (Pvt) Ltd</p>
                      <p><strong>Account Number:</strong> 1000 2938 47</p>
                      <p><strong>Branch:</strong> Colombo 03 (Corporate)</p>
                      <p className="text-purple-700 mt-2">Attach or upload your online banking transfer confirmation / ATM receipt below.</p>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-purple-400 transition-all bg-gray-50">
                      <input
                        type="file"
                        id="slipUpload"
                        accept="image/*,.pdf"
                        onChange={handleSlipChange}
                        className="hidden"
                      />
                      <label htmlFor="slipUpload" className="cursor-pointer flex flex-col items-center">
                        <span className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                          {slipFile ? `Attached: ${slipFile}` : "Click to upload transfer slip (JPG, PNG, PDF)"}
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">Maximum file size 5MB</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                    <p className="font-semibold text-gray-900 mb-1 text-sm">Cash on Delivery (COD)</p>
                    <p>Pay upon parcel handover by our verified courier rider across Sri Lanka. Please have exact change ready in Sri Lankan Rupees (LKR).</p>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl my-4">
                  <Lock size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500">256-bit SSL Gateway Encrypted & 3D Secure 2.2 Compliant.</span>
                </div>
                <PrimaryBtn onClick={handlePlaceOrder} className="w-full !py-4 !rounded-2xl mt-2" icon={<Lock size={16} />}>
                  {isSubmitting ? "Authorizing Order..." : `Confirm & Authorize ${lkr(finalTotal)}`}
                </PrimaryBtn>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary ({cartItems.length})</h3>
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.brand} · Qty {item.qty} ({item.size})</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{lkr(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{lkr(subtotal)}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium"><span>Promo Discount</span><span>-{lkr(discountAmount)}</span></div>
                )}
                <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span className="text-green-600">{shippingAmount === 0 ? "Free" : lkr(shippingAmount)}</span></div>
                <div className="flex justify-between font-black text-gray-900 text-lg border-t border-gray-100 pt-3 mt-1"><span>Total</span><span>{lkr(finalTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
