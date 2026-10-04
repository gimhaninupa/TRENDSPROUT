import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, Sparkles, ArrowRight, AlertCircle, ShoppingBag, Store } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { purple, PrimaryBtn, GhostBtn } from './shared';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign In to Continue",
  subtitle = "Please log in or create an account to add items to your bag and start shopping."
}) => {
  const { login, register, googleLogin, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const username = `${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}` || 'shopper';
      await register({
        username,
        email,
        password,
        role,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setSubmitting(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No credential received from Google");
      }
      await googleLogin(credentialResponse.credential, role);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Header Banner */}
          <div className="relative p-6 pb-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20">
              <ShoppingBag size={20} className="text-purple-200" />
            </div>
            <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              {title}
            </h3>
            <p className="text-xs text-purple-200 mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="p-6">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-in */}
            <div className="mb-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In failed")}
                useOneTap={false}
                shape="pill"
                theme="outline"
                size="large"
                text={tab === 'login' ? 'signin_with' : 'signup_with'}
              />
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">or with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="shopper@example.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {submitting ? "Signing In…" : "Sign In & Add to Bag"}
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Kasun"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Perera"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="kasun@example.com"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        role === 'customer' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-200'
                      }`}
                    >
                      <User size={13} /> Shopper
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('vendor')}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        role === 'vendor' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-200'
                      }`}
                    >
                      <Store size={13} /> Fashion Vendor
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {submitting ? "Creating Account…" : "Create Account & Continue"}
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
