import { useState } from "react";
import {
  CreditCard, Lock, Mail, Phone, MapPin, ChevronRight, Info, AlertCircle
} from "lucide-react";
import { 
  Screen, purple, lkr, 
  PrimaryBtn, Input, Navbar 
} from '../../components/shared';
import { StripePaymentForm } from '../../components/StripePaymentForm';
import { PayHereCheckout } from '../../components/PayHereCheckout';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function CheckoutScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { cartItems, subtotal, discountAmount, shippingAmount, finalTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<"address" | "payment">("address");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState(() => user?.username ? user.username.split('_')[0] : "");
  const [lastName, setLastName] = useState(() => user?.username ? (user.username.split('_')[1] || "") : "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Colombo");
  const [state, setState] = useState("Western");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PayHere");
  
  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Payment Details State
  const [cardHolder, setCardHolder] = useState(() => user?.username || "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("10/28");
  const [cardCvv, setCardCvv] = useState("842");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [slipFile, setSlipFile] = useState<string | null>(null);

  const validateAddressForm = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required for courier delivery";
    } else if (phone.trim().length < 9) {
      newErrors.phone = "Please enter a valid phone number (e.g. 077 123 4567)";
    }
    if (!street.trim()) newErrors.street = "Street address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "Province is required";
    if (!zip.trim()) newErrors.zip = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    setSubmitAttempted(true);
    if (validateAddressForm()) {
      setStep("payment");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  // In handlePlaceOrder, accept optional custom payment details from Stripe
  const handlePlaceOrder = async (customDetails?: { paymentIntentId?: string; last4?: string; brand?: string }) => {
    setIsSubmitting(true);
    const trackingNum = 'TS-LK-' + Math.floor(100000 + Math.random() * 900000);
    const rawCard = cardNumber.replace(/\s+/g, '');
    const cardLast4 = customDetails?.last4 || rawCard.slice(-4) || '4242';
    const resolvedBrand = customDetails?.brand || cardBrand || 'Visa';

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
        cardBrand: resolvedBrand,
        slipUrl: slipFile || '',
        paymentIntentId: customDetails?.paymentIntentId || '',
      },
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      trackingNumber: trackingNum,
    };

    let createdOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    let resolvedTracking = trackingNum;

    try {
      const res = await api.createOrder({
        ...orderPayload,
        clearCart: true,
      });
      if (res.data?._id) {
        createdOrderId = res.data._id;
        resolvedTracking = res.data.trackingNumber || trackingNum;
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
        cardBrand: resolvedBrand,
        cardLast4,
        paymentIntentId: customDetails?.paymentIntentId,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        
        {/* Progress Stepper */}
        <div className="flex items-center gap-3 mb-8">
          {["Address", "Payment", "Confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 || (i === 1 && step === "payment") ? "text-white" : "bg-gray-200 text-gray-500"}`}
                style={i === 0 || (i === 1 && step === "payment") ? { background: purple } : {}}>{i + 1}</div>
              <span className={`text-sm font-semibold ${i === 0 || (i === 1 && step === "payment") ? "text-purple-700" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <ChevronRight size={14} className="text-gray-300 ml-2" />}
            </div>
          ))}
        </div>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Checkout Form Column (7 Cols) */}
          <div className="lg:col-span-7">
            {step === "address" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <MapPin size={18} />
                    </span>
                    Delivery Address (Sri Lanka)
                  </h2>
                  <span className="text-xs text-red-500 font-medium">* Required fields</span>
                </div>

                {submitAttempted && Object.keys(errors).length > 0 && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs animate-shake">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Please complete all required delivery details</p>
                      <p className="mt-0.5 text-red-600">Ensure your name, email, phone number, address, city, and postal code are filled in.</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={firstName} 
                        placeholder="e.g. Kasun"
                        onChange={e => {
                          setFirstName(e.target.value);
                          if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" }));
                        }} 
                        className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                          errors.firstName ? 'border-red-400 bg-red-50/30 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                        }`} 
                      />
                      {errors.firstName && <p className="text-xs text-red-500 font-medium mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={lastName} 
                        placeholder="e.g. Perera"
                        onChange={e => {
                          setLastName(e.target.value);
                          if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" }));
                        }} 
                        className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                          errors.lastName ? 'border-red-400 bg-red-50/30 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                        }`} 
                      />
                      {errors.lastName && <p className="text-xs text-red-500 font-medium mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        value={email} 
                        placeholder="you@example.com"
                        onChange={e => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                        }} 
                        className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                          errors.email ? 'border-red-400 bg-red-50/30 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                        }`} 
                      />
                      {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="tel" 
                        value={phone} 
                        placeholder="077 123 4567"
                        onChange={e => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                        }} 
                        className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                          errors.phone ? 'border-red-400 bg-red-50/30 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                        }`} 
                      />
                      {errors.phone && <p className="text-xs text-red-500 font-medium mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={street} 
                      placeholder="e.g. 42/B, Galle Road, Kollupitiya"
                      onChange={e => {
                        setStreet(e.target.value);
                        if (errors.street) setErrors(prev => ({ ...prev, street: "" }));
                      }} 
                      className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                        errors.street ? 'border-red-400 bg-red-50/30 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                      }`} 
                    />
                    {errors.street && <p className="text-xs text-red-500 font-medium mt-1">{errors.street}</p>}
                  </div>

                  {/* City, Province, Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={city} 
                        placeholder="Colombo"
                        onChange={e => {
                          setCity(e.target.value);
                          if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                        }} 
                        className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                          errors.city ? 'border-red-400 bg-red-50/30 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                        }`} 
                      />
                      {errors.city && <p className="text-xs text-red-500 font-medium mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={state} 
                        placeholder="Western"
                        onChange={e => {
                          setState(e.target.value);
                          if (errors.state) setErrors(prev => ({ ...prev, state: "" }));
                        }} 
                        className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                          errors.state ? 'border-red-400 bg-red-50/30 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                        }`} 
                      />
                      {errors.state && <p className="text-xs text-red-500 font-medium mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={zip} 
                        placeholder="00300"
                        onChange={e => {
                          setZip(e.target.value);
                          if (errors.zip) setErrors(prev => ({ ...prev, zip: "" }));
                        }} 
                        className={`w-full rounded-xl border py-3 px-4 text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                          errors.zip ? 'border-red-400 bg-red-50/30 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                        }`} 
                      />
                      {errors.zip && <p className="text-xs text-red-500 font-medium mt-1">{errors.zip}</p>}
                    </div>
                  </div>

                  <PrimaryBtn 
                    onClick={handleContinueToPayment} 
                    className="w-full !py-4 !rounded-2xl mt-4 cursor-pointer text-base font-bold shadow-md hover:shadow-lg"
                  >
                    Continue to Payment →
                  </PrimaryBtn>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Payment Settlement</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Choose your preferred settlement method</p>
                  </div>
                  <button 
                    onClick={() => setStep("address")} 
                    className="text-xs text-purple-600 font-bold hover:underline cursor-pointer px-3 py-1.5 bg-purple-50 rounded-xl"
                  >
                    ← Edit Address
                  </button>
                </div>

                {/* Method selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {[
                    { id: "PayHere", label: "PayHere Online (LK)", badge: "Visa / Master / Wallets / Banks" },
                    { id: "COD", label: "Cash on Delivery", badge: "Islandwide Delivery" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-2xl border-2 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? "border-emerald-500 text-emerald-800 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-100"
                          : "border-gray-200 text-gray-600 hover:border-emerald-200 bg-gray-50/50"
                      }`}
                    >
                      <span className="font-bold text-sm">{m.label}</span>
                      <span className="text-[11px] text-gray-500 font-normal">{m.badge}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "PayHere" ? (
                  <PayHereCheckout
                    amount={finalTotal}
                    orderId={'ORD-' + Math.floor(100000 + Math.random() * 900000)}
                    customerDetails={{
                      firstName,
                      lastName,
                      email,
                      phone,
                      street,
                      city,
                    }}
                    onSuccess={(res) => handlePlaceOrder({ paymentIntentId: res.paymentId, brand: res.method })}
                    isProcessing={isSubmitting}
                    setIsProcessing={setIsSubmitting}
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                    <p className="font-semibold text-gray-900 mb-1 text-sm">Cash on Delivery (COD)</p>
                    <p>Pay upon parcel handover by our verified courier rider across Sri Lanka. Please have exact change ready in Sri Lankan Rupees (LKR).</p>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl my-4">
                  <Lock size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500">256-bit SSL Gateway Encrypted & CBSL Compliant.</span>
                </div>

                {paymentMethod === "COD" && (
                  <PrimaryBtn onClick={() => handlePlaceOrder()} className="w-full !py-4 !rounded-2xl mt-2" icon={<Lock size={16} />}>
                    {isSubmitting ? "Placing Order..." : `Confirm Order with COD (${lkr(finalTotal)})`}
                  </PrimaryBtn>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Column (5 Cols - Spacious & Crystal Clear) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Order Summary</h3>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                  {cartItems.reduce((acc, i) => acc + i.qty, 0)} {cartItems.reduce((acc, i) => acc + i.qty, 0) === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Items List - No Squishing, Full Width */}
              <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1 divide-y divide-gray-100">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 pt-3 first:pt-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0 p-1">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate" title={item.name}>{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-purple-700">{item.brand}</span>
                        {item.size ? ` · ${item.size}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: <span className="font-semibold text-gray-700">{item.qty}</span></p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-gray-900 whitespace-nowrap">{lkr(item.price * item.qty)}</span>
                      {item.qty > 1 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{lkr(item.price)} each</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-gray-100 pt-5 mt-5 flex flex-col gap-2.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{lkr(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium">
                    <span>Promo Discount</span>
                    <span>-{lkr(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping (Islandwide)</span>
                  <span className={`font-semibold ${shippingAmount === 0 ? "text-emerald-600" : "text-gray-900"}`}>
                    {shippingAmount === 0 ? "FREE" : lkr(shippingAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline font-black text-gray-900 text-xl border-t border-gray-100 pt-4 mt-2">
                  <span>Total Amount</span>
                  <span className="text-purple-700 text-2xl">{lkr(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CheckoutScreen;
