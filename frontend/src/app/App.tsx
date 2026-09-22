import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { QuickNav, Screen } from '../components/shared';
import { AboutScreen } from '../pages/company/AboutScreen';
import { BlogScreen } from '../pages/company/BlogScreen';
import { CareersScreen } from '../pages/company/CareersScreen';
import { PressScreen } from '../pages/company/PressScreen';
import { PrivacyScreen } from '../pages/company/PrivacyScreen';
import { TermsScreen } from '../pages/company/TermsScreen';
import { CookiesScreen } from '../pages/company/CookiesScreen';
import { SplashScreen } from '../pages/core/SplashScreen';
import { HomeScreen } from '../pages/core/HomeScreen';
import { AuthScreen } from '../pages/auth/AuthScreen';
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { BrowseScreen } from '../pages/shop/BrowseScreen';
import { ProductDetailScreen } from '../pages/shop/ProductDetailScreen';
import { CartScreen } from '../pages/customer/CartScreen';
import { CheckoutScreen } from '../pages/customer/CheckoutScreen';
import { PaymentScreen } from '../pages/customer/PaymentScreen';
import { OrdersScreen } from '../pages/customer/OrdersScreen';
import { TrackingScreen } from '../pages/customer/TrackingScreen';
import { WishlistScreen } from '../pages/customer/WishlistScreen';
import { AIChatbotScreen } from '../pages/ai/AIChatbotScreen';
import { AIOutfitScreen } from '../pages/ai/AIOutfitScreen';
import { TextToDesignScreen } from '../pages/ai/TextToDesignScreen';
import { VendorDashboardScreen } from '../pages/vendor/VendorDashboardScreen';
import { VendorProductsScreen } from '../pages/vendor/VendorProductsScreen';
import { VendorAddProductScreen } from '../pages/vendor/VendorAddProductScreen';
import { VendorAIDescriptionScreen } from '../pages/vendor/VendorAIDescriptionScreen';
import { VendorAIPricingScreen } from '../pages/vendor/VendorAIPricingScreen';
import { VendorAnalyticsScreen } from '../pages/vendor/VendorAnalyticsScreen';
import { StoreCustomizationScreen } from '../pages/core/StoreCustomizationScreen';
import { SellerStoreScreen } from '../pages/core/SellerStoreScreen';
import { ProfileScreen } from '../pages/customer/ProfileScreen';
import { ProfileSettingsScreen } from '../pages/customer/ProfileSettingsScreen';
import { AdminDashboardScreen } from '../pages/admin/AdminDashboardScreen';
import { ErrorScreen } from '../pages/core/ErrorScreen';
import { CouponsScreen } from '../pages/customer/CouponsScreen';

const screenToPath: Record<string, string> = {
  "splash": "/",
  "home": "/home",
  "login": "/login",
  "register": "/register",
  "otp": "/otp",
  "forgot-password": "/forgot-password",
  "customer-dashboard": "/customer",
  "browse": "/browse",
  "search-results": "/search",
  "product-detail": "/product",
  "cart": "/cart",
  "checkout": "/checkout",
  "payment": "/payment",
  "orders": "/orders",
  "tracking": "/tracking",
  "wishlist": "/wishlist",
  "profile": "/profile",
  "profile-settings": "/profile/settings",
  "seller-store": "/seller",
  "coupons": "/coupons",
  "ai-chatbot": "/ai/chat",
  "ai-outfit": "/ai/outfit",
  "text-to-design": "/ai/design",
  "vendor-dashboard": "/vendor",
  "vendor-products": "/vendor/products",
  "vendor-analytics": "/vendor/analytics",
  "vendor-add-product": "/vendor/products/add",
  "vendor-ai-description": "/vendor/ai-description",
  "vendor-ai-pricing": "/vendor/ai-pricing",
  "store-customization": "/vendor/store-customization",
  "admin-dashboard": "/admin",
  "error-404": "/404",
  "error-payment": "/payment-failed",
  "about": "/about",
  "blog": "/blog",
  "careers": "/careers",
  "press": "/press",
  "privacy": "/privacy",
  "terms": "/terms",
  "cookies": "/cookies"
};

function RouterWrapper() {
  const navigate = useNavigate();
  const onNavigate = (s: Screen) => {
    const path = screenToPath[s] || '/';
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<SplashScreen onNavigate={onNavigate} />} />
          <Route path="/home" element={<HomeScreen onNavigate={onNavigate} />} />
          <Route path="/login" element={<AuthScreen mode="login" onNavigate={onNavigate} />} />
          <Route path="/register" element={<AuthScreen mode="register" onNavigate={onNavigate} />} />
          <Route path="/otp" element={<AuthScreen mode="otp" onNavigate={onNavigate} />} />
          <Route path="/forgot-password" element={<AuthScreen mode="forgot-password" onNavigate={onNavigate} />} />
          
          <Route path="/customer" element={<CustomerDashboard onNavigate={onNavigate} />} />
          <Route path="/browse" element={<BrowseScreen onNavigate={onNavigate} />} />
          <Route path="/search" element={<BrowseScreen onNavigate={onNavigate} isSearch={true} />} />
          <Route path="/product" element={<ProductDetailScreen onNavigate={onNavigate} />} />
          <Route path="/cart" element={<CartScreen onNavigate={onNavigate} />} />
          <Route path="/checkout" element={<CheckoutScreen onNavigate={onNavigate} />} />
          <Route path="/payment" element={<PaymentScreen onNavigate={onNavigate} />} />
          <Route path="/orders" element={<OrdersScreen onNavigate={onNavigate} />} />
          <Route path="/tracking" element={<TrackingScreen onNavigate={onNavigate} />} />
          <Route path="/wishlist" element={<WishlistScreen onNavigate={onNavigate} />} />
          <Route path="/profile" element={<ProfileScreen onNavigate={onNavigate} />} />
          <Route path="/profile/settings" element={<ProfileSettingsScreen onNavigate={onNavigate} />} />
          <Route path="/seller" element={<SellerStoreScreen onNavigate={onNavigate} />} />
          <Route path="/coupons" element={<CouponsScreen onNavigate={onNavigate} />} />
          
          <Route path="/ai/chat" element={<AIChatbotScreen onNavigate={onNavigate} />} />
          <Route path="/ai/outfit" element={<AIOutfitScreen onNavigate={onNavigate} />} />
          <Route path="/ai/design" element={<TextToDesignScreen onNavigate={onNavigate} />} />
          
          <Route path="/vendor" element={<VendorDashboardScreen onNavigate={onNavigate} />} />
          <Route path="/vendor/products" element={<VendorProductsScreen onNavigate={onNavigate} />} />
          <Route path="/vendor/analytics" element={<VendorAnalyticsScreen onNavigate={onNavigate} />} />
          <Route path="/vendor/products/add" element={<VendorAddProductScreen onNavigate={onNavigate} />} />
          <Route path="/vendor/ai-description" element={<VendorAIDescriptionScreen onNavigate={onNavigate} />} />
          <Route path="/vendor/ai-pricing" element={<VendorAIPricingScreen onNavigate={onNavigate} />} />
          <Route path="/vendor/store-customization" element={<StoreCustomizationScreen onNavigate={onNavigate} />} />
          
          <Route path="/admin" element={<AdminDashboardScreen onNavigate={onNavigate} />} />
          
          <Route path="/about" element={<AboutScreen onNavigate={onNavigate as any} />} />
          <Route path="/blog" element={<BlogScreen onNavigate={onNavigate as any} />} />
          <Route path="/careers" element={<CareersScreen onNavigate={onNavigate as any} />} />
          <Route path="/press" element={<PressScreen onNavigate={onNavigate as any} />} />
          <Route path="/privacy" element={<PrivacyScreen onNavigate={onNavigate as any} />} />
          <Route path="/terms" element={<TermsScreen onNavigate={onNavigate as any} />} />
          <Route path="/cookies" element={<CookiesScreen onNavigate={onNavigate as any} />} />

          <Route path="/404" element={<ErrorScreen type="404" onNavigate={onNavigate} />} />
          <Route path="/payment-failed" element={<ErrorScreen type="payment-failed" onNavigate={onNavigate} />} />
          
          {/* Fallback */}
          <Route path="*" element={<ErrorScreen type="404" onNavigate={onNavigate} />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <RouterWrapper />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
