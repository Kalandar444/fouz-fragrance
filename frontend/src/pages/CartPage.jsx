import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartCount, cartSubtotal } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const freeThreshold = parseFloat(settings.free_shipping_threshold) || 300;
  const standardFee = parseFloat(settings.standard_shipping_fee) || 25;
  const currency = settings.currency || 'AED';

  const isFreeShipping = cartSubtotal >= freeThreshold;
  const shippingFee = isFreeShipping ? 0 : standardFee;
  const totalAmount = cartSubtotal + shippingFee;
  const amountToFree = Math.max(0, freeThreshold - cartSubtotal);

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center py-20">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400 mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-3xl text-charcoal font-light mb-3">Your Cart is Empty</h1>
          <p className="text-sm text-stone-500 font-light mb-8">
            Explore our curated catalogue of niche perfumes and discover an unforgettable olfactory signature.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-luxury font-semibold rounded shadow transition-colors"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8">
          <Link to="/" className="hover:text-gold-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal font-medium">Shopping Cart</span>
        </nav>

        <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-light mb-8">
          Your Fragrance Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Items Table / List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Free Delivery Bar */}
            <div className="p-4 bg-[#FAF8F5] border border-stone-200 rounded">
              <div className="flex justify-between text-xs text-stone-700 font-medium mb-1.5">
                {amountToFree > 0 ? (
                  <span>
                    Add <strong className="text-gold-700">{amountToFree.toFixed(2)} {currency}</strong> more to qualify for <strong>FREE Delivery across UAE</strong>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold">
                    ✨ Congratulations! Your order qualifies for Complimentary UAE Delivery!
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cartSubtotal / freeThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cart Table */}
            <div className="border border-stone-200 rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#FAF9F7] border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4 text-center">Quantity</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                  {cartItems.map((item) => (
                    <tr key={`${item.product_id}-${item.variant_id}`} className="hover:bg-stone-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image || '/fouz_logo.jpg'}
                            alt={item.name}
                            className="w-16 h-16 object-contain p-1 bg-white border border-stone-200 rounded flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/fouz_logo.jpg';
                            }}
                          />
                          <div>
                            {item.brand && (
                              <p className="text-[10px] uppercase tracking-wider text-gold-700 font-bold">
                                {item.brand}
                              </p>
                            )}
                            <h3 className="font-serif font-medium text-charcoal hover:text-gold-700 transition-colors">
                              <Link to={`/products/${item.slug}`}>{item.name}</Link>
                            </h3>
                            <span className="text-xs text-stone-400">{item.variant_title}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <div className="inline-flex items-center border border-stone-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                            className="p-1.5 text-stone-500 hover:text-charcoal"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 font-semibold text-charcoal text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                            className="p-1.5 text-stone-500 hover:text-charcoal"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-right font-medium text-stone-600">
                        {item.price.toFixed(2)} {currency}
                      </td>

                      <td className="p-4 text-right font-bold text-charcoal">
                        {(item.price * item.quantity).toFixed(2)} {currency}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => removeFromCart(item.product_id, item.variant_id)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/shop"
                className="text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-gold-700 flex items-center gap-1.5"
              >
                &larr; Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-stone-400 hover:text-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-[#FAF9F7] border border-stone-200 p-6 rounded space-y-4">
              <h2 className="font-serif text-lg font-medium text-charcoal pb-3 border-b border-stone-200">
                Order Summary
              </h2>

              <div className="flex justify-between text-xs text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal">{cartSubtotal.toFixed(2)} {currency}</span>
              </div>

              <div className="flex justify-between text-xs text-stone-600">
                <span>UAE Delivery Charges</span>
                <span className="font-semibold text-charcoal">
                  {isFreeShipping ? 'FREE' : `${shippingFee.toFixed(2)} ${currency}`}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-charcoal">Total Amount Due</span>
                <span className="font-serif text-2xl font-bold text-gold-700">
                  {totalAmount.toFixed(2)} <span className="text-xs font-normal text-stone-500">{currency}</span>
                </span>
              </div>

              <div className="py-2.5 px-3 bg-white border border-stone-200 rounded text-xs text-stone-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-600 flex-shrink-0" />
                <span>Payment collected via <strong>Cash on Delivery</strong> across UAE.</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                id="cart-proceed-checkout-btn"
                className="w-full py-4 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-luxury font-semibold rounded shadow transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to Guest Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
