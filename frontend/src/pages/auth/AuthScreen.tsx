import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag, Search, Heart, User, Menu, X, ChevronRight, Star, Zap,
  Sparkles, TrendingUp, Package, BarChart2, Users, Settings, LogOut,
  ArrowRight, Check, ShoppingCart, Bell, MessageSquare, Eye, Edit3,
  Upload, Truck, CreditCard, Lock, Mail, Phone, MapPin, Grid, List,
  Filter, ChevronDown, Plus, Minus, Trash2, RefreshCw, AlertCircle,
  CheckCircle, Clock, Store, Bot, Wand2, Image, Tag, DollarSign,
  Activity, PieChart, FileText, Shield, ChevronLeft, Home, Layers,
  Camera, Share2, Bookmark, ThumbsUp, MoreHorizontal, Send, Mic,
  Palette, Layout, Globe, Download, ToggleLeft, Key, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from "recharts";
import { Link, useNavigate } from 'react-router-dom';
import { 
    Screen, purple, purpleLight, purpleDark, lkr, 
    products, categories, testimonials, analyticsData, pieData, vendorProducts, chatMessages, faqs,
    Badge, StarRating, PrimaryBtn, GhostBtn, Input, GlassCard, ProductCard, Navbar, VendorSidebar, FloatingNav, QuickNav
} from '../../components/shared';

import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export function AuthScreen({ mode, onNavigate }: { mode: "login" | "register" | "otp" | "forgot-password"; onNavigate: (s: Screen) => void }) {
  const { login, register, googleLogin, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"customer" | "vendor">("customer");
  const [error, setError] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtp = (val: string, i: number) => {
    const next = [...otpValues]; next[i] = val.slice(-1);
    setOtpValues(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleLogin = async () => {
    setError("");
    try {
      const user = await login(email, password);
      if (user?.role === 'vendor') {
        onNavigate("vendor-dashboard");
      } else if (user?.role === 'admin') {
        onNavigate("admin-dashboard");
      } else {
        onNavigate("customer-dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No credential received from Google");
      }
      const user = await googleLogin(credentialResponse.credential, selectedRole);
      if (user?.role === 'vendor') {
        onNavigate("vendor-dashboard");
      } else if (user?.role === 'admin') {
        onNavigate("admin-dashboard");
      } else {
        onNavigate("customer-dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
    }
  };

  const handleRegister = async () => {
    setError("");
    try {
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}` || 'shopper';
      await register({
        username,
        email,
        password,
        role: selectedRole,
      });
      onNavigate("otp");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: `linear-gradient(135deg, #0a0a0f 0%, #1a0a3e 100%)` }}>
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" alt="Fashion" className="absolute inset-0 w-full h-full object-cover opacity-35" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <button onClick={() => onNavigate("home")} className="font-black text-white text-2xl" style={{ fontFamily: "'Clash Display', sans-serif" }}>TRENDSPROUT</button>
          <div>
            <h2 className="text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>Your style,<br />elevated by AI.</h2>
            <p className="text-purple-300 text-lg">Join 50,000+ shoppers discovering fashion's future.</p>
            <div className="flex gap-4 mt-8">
              {testimonials.slice(0, 2).map(t => (
                <GlassCard key={t.name} className="p-4 bg-white/5 border-white/10 flex-1">
                  <StarRating rating={t.rating} />
                  <p className="text-gray-300 text-xs mt-2 leading-relaxed">"{t.text.slice(0, 80)}..."</p>
                  <div className="flex items-center gap-2 mt-3">
                    <img src={t.avatar} alt={t.name} className="w-6 h-6 rounded-full" />
                    <span className="text-gray-400 text-xs font-medium">{t.name}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <button onClick={() => onNavigate("home")} className="flex items-center gap-1.5 text-xs text-gray-400 mb-8 hover:text-purple-600 transition-colors"><ChevronLeft size={14} />Back to site</button>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {mode === "login" && (
            <>
              <h1 className="text-3xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Welcome back</h1>
              <p className="text-gray-500 text-sm mb-6">Sign in to your TRENDSPROUT account</p>

              {/* Google Fast One-Tap & Button */}
              <div className="mb-5 flex flex-col items-center">
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google login could not be initialized")}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="signin_with"
                    width="320"
                  />
                </div>
                <div className="relative flex items-center gap-3 w-full my-5">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">or email sign in</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email or Username</label>
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div className="flex justify-end"><button onClick={() => onNavigate("forgot-password")} className="text-xs font-medium text-purple-600 hover:underline">Forgot password?</button></div>
                <PrimaryBtn onClick={handleLogin} className="w-full !py-3.5 !rounded-xl">
                  {isLoading ? "Signing in..." : "Sign In with Email"}
                </PrimaryBtn>
                
                <p className="text-center text-xs text-gray-500 mt-2">No account? <button onClick={() => onNavigate("register")} className="text-purple-600 font-semibold hover:underline">Sign up free</button></p>
              </div>
            </>
          )}
          {mode === "register" && (
            <>
              <h1 className="text-3xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Create account</h1>
              <p className="text-gray-500 text-sm mb-5">Join the AI-powered fashion revolution</p>

              {/* Role Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-semibold">
                <button
                  onClick={() => setSelectedRole("customer")}
                  className={`flex-1 py-2 rounded-lg transition-all ${selectedRole === "customer" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >
                  Shopper / Customer
                </button>
                <button
                  onClick={() => setSelectedRole("vendor")}
                  className={`flex-1 py-2 rounded-lg transition-all ${selectedRole === "vendor" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >
                  Brand / Vendor
                </button>
              </div>

              {/* Google Fast Sign Up */}
              <div className="mb-4 flex flex-col items-center">
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google signup failed")}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="signup_with"
                    width="320"
                  />
                </div>
                <div className="relative flex items-center gap-3 w-full my-4">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">or direct signup</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">First name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm text-gray-800" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Last name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm text-gray-800" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm text-gray-800" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm text-gray-800" />
                </div>
                <div className="flex items-start gap-2 mt-1">
                  <input type="checkbox" id="terms" defaultChecked className="mt-0.5 accent-purple-600" />
                  <label htmlFor="terms" className="text-[11px] text-gray-500">I agree to the <span className="text-purple-600 font-medium">Terms of Service</span> and <span className="text-purple-600 font-medium">Privacy Policy</span></label>
                </div>
                <PrimaryBtn onClick={handleRegister} className="w-full !py-3 !rounded-xl mt-1">
                  {isLoading ? "Creating..." : "Create Account"}
                </PrimaryBtn>
                <p className="text-center text-xs text-gray-500">Already have an account? <button onClick={() => onNavigate("login")} className="text-purple-600 font-semibold hover:underline">Sign in</button></p>
              </div>
            </>
          )}
          {mode === "otp" && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: purpleLight }}><Mail size={24} style={{ color: purple }} /></div>
              <h1 className="text-3xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Check your email</h1>
              <p className="text-gray-500 text-sm mb-8">We sent a 6-digit code to <span className="font-medium text-gray-700">sophia@example.com</span></p>
              <div className="flex gap-2 mb-6">
                {otpValues.map((val, i) => (
                  <input key={i} ref={el => (otpRefs.current[i] = el)} type="text" maxLength={1} value={val}
                    onChange={e => handleOtp(e.target.value, i)}
                    className="flex-1 aspect-square rounded-xl border-2 border-gray-200 text-center text-xl font-bold text-gray-900 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                ))}
              </div>
              <PrimaryBtn onClick={() => onNavigate("customer-dashboard")} className="w-full !py-3.5 !rounded-xl">Verify Code</PrimaryBtn>
              <p className="text-center text-xs text-gray-500 mt-4">Didn't get it? <button className="text-purple-600 font-semibold hover:underline">Resend in 0:45</button></p>
            </>
          )}
          {mode === "forgot-password" && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: purpleLight }}><Lock size={24} style={{ color: purple }} /></div>
              <h1 className="text-3xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Reset password</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you a reset link.</p>
              <div className="flex flex-col gap-4">
                <Input label="Email address" type="email" placeholder="you@example.com" icon={<Mail size={16} />} />
                <PrimaryBtn onClick={() => onNavigate("otp")} className="w-full !py-3.5 !rounded-xl">Send Reset Link</PrimaryBtn>
                <button onClick={() => onNavigate("login")} className="text-center text-sm font-medium text-purple-600 hover:underline">← Back to sign in</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
