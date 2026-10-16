import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartCount,
    cartSubtotal,
  } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const freeThreshold = parseFloat(settings.free_shipping_threshold) || 300;
  const currency = settings.currency || 'AED';
  const amountNeeded = Math.max(0, freeThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeThreshold) * 100);

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleGoToCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold-600" />
                  <h2 className="font-serif text-lg font-medium tracking-wide text-charcoal">
                    Shopping Cart ({cartCount})
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-charcoal transition-colors rounded-full hover:bg-stone-200/50"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Delivery Bar */}
              <div className="px-5 py-3 bg-[#FAF8F5] border-b border-stone-100">
                <div className="text-xs text-stone-700 font-medium mb-1.5 flex justify-between">
                  {amountNeeded > 0 ? (
                    <span>
                      Add <strong className="text-gold-700">{amountNeeded.toFixed(2)} {currency}</strong> more for{' '}
                      <strong>FREE UAE Delivery</strong>
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      ✨ You've unlocked Complimentary UAE Delivery!
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="font-serif text-lg text-charcoal mb-2">Your fragrance cart is empty</p>
                    <p className="text-xs text-stone-500 max-w-xs mb-6">
                      Explore our curated catalogue of fine niche perfumes and discover your signature scent.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/shop');
                      }}
                      className="px-6 py-2.5 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-widest font-medium transition-colors"
                    >
                      Explore Catalogue
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={`${item.product_id}-${item.variant_id}`} className="py-4 flex gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 bg-stone-50 rounded border border-stone-100 flex-shrink-0 p-1 flex items-center justify-center">
                        <img
                          src={item.image || '/fouz_logo.jpg'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/fouz_logo.jpg';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              {item.brand && (
                                <p className="text-[10px] uppercase tracking-wider text-gold-700 font-semibold">
                                  {item.brand}
                                </p>
                              )}
                              <h4 className="font-serif text-sm font-medium text-charcoal line-clamp-1">
                                {item.name}
                              </h4>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product_id, item.variant_id)}
                              className="text-stone-300 hover:text-red-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{item.variant_title}</p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity control */}
                          <div className="flex items-center border border-stone-200 rounded">
                            <button
                              onClick={() =>
                                updateQuantity(item.product_id, item.variant_id, item.quantity - 1)
                              }
                              className="p-1 text-stone-500 hover:text-charcoal hover:bg-stone-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-medium text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product_id, item.variant_id, item.quantity + 1)
                              }
                              className="p-1 text-stone-500 hover:text-charcoal hover:bg-stone-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="text-sm font-bold text-charcoal">
                              {(item.price * item.quantity).toFixed(2)} {currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-stone-100 bg-stone-50/70 space-y-3">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-charcoal text-base">
                      {cartSubtotal.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>UAE Delivery</span>
                    <span>
                      {amountNeeded === 0
                        ? 'FREE'
                        : `${parseFloat(settings.standard_shipping_fee || 25).toFixed(2)} ${currency}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 py-1.5 px-3 bg-white border border-stone-200 rounded text-[11px] text-stone-600">
                    <ShieldCheck className="w-4 h-4 text-gold-600 flex-shrink-0" />
                    <span>Pay with <strong>Cash on Delivery</strong> across all UAE Emirates</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={handleGoToCart}
                      className="w-full py-3 border border-charcoal text-charcoal hover:bg-stone-100 text-xs uppercase tracking-widest font-medium transition-colors text-center"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={handleGoToCheckout}
                      id="drawer-checkout-btn"
                      className="w-full py-3 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-widest font-medium transition-colors text-center flex items-center justify-center gap-1.5"
                    >
                      Checkout <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
