import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Toast from './components/Toast';

// Pages
import HomePage from './pages/HomePage';
import BrandsPage from './pages/BrandsPage';
import BrandDetailPage from './pages/BrandDetailPage';
import ExclusivePage from './pages/ExclusivePage';
import BestSellersPage from './pages/BestSellersPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnsPolicyPage from './pages/ReturnsPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-white text-charcoal font-sans selection:bg-gold-500 selection:text-white">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Storefront Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/brands/:slug" element={<BrandDetailPage />} />
                <Route path="/exclusive" element={<ExclusivePage />} />
                <Route path="/best-sellers" element={<BestSellersPage />} />
                <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                <Route path="/collections" element={<Navigate to="/brands" replace />} />
                <Route path="/collections/:slug" element={<BrandDetailPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />

                {/* E-commerce & Checkout */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:reference" element={<OrderConfirmationPage />} />

                {/* Customer Support & Policies */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* 404 Fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
            <FloatingWhatsApp />
            <Toast />
          </div>
        </BrowserRouter>
      </CartProvider>
    </SettingsProvider>
  );
}
