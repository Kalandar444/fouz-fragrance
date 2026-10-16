import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { createOrder, validateCart } from '../api/client';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart, cartSubtotal } = useCart();
  const { settings } = useSettings();

  // Form Fields
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    city: 'Dubai',
    state_emirate: 'Dubai',
    postal_code: '',
    delivery_instructions: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Live backend verified amounts
  const [verifiedAmounts, setVerifiedAmounts] = useState({
    subtotal: cartSubtotal,
    shipping_fee: cartSubtotal >= (settings.free_shipping_threshold || 300) ? 0 : (settings.standard_shipping_fee || 25),
    total_amount: cartSubtotal + (cartSubtotal >= (settings.free_shipping_threshold || 300) ? 0 : (settings.standard_shipping_fee || 25)),
    currency: settings.currency || 'AED',
    has_stock_error: false,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (cartItems.length > 0) {
      // Validate cart against live database
      validateCart(
        cartItems.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        }))
      )
        .then((res) => {
          if (res.data) {
            setVerifiedAmounts({
              subtotal: res.data.subtotal,
              shipping_fee: res.data.shipping_fee,
              total_amount: res.data.total_amount,
              currency: res.data.currency,
              has_stock_error: res.data.has_stock_error,
            });
          }
        })
        .catch((err) => console.error('Cart validation error:', err));
    }
  }, [cartItems, settings]);

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center py-20">
        <div className="text-center px-4">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-charcoal mb-2">No items to checkout</h2>
          <p className="text-xs text-stone-500 mb-6">Your shopping cart is empty.</p>
          <Link to="/shop" className="px-6 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded">
            Explore Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Please provide your full name.';
    }
    if (!formData.customer_phone.trim()) {
      errors.customer_phone = 'Please provide a valid UAE contact number.';
    } else if (formData.customer_phone.trim().length < 8) {
      errors.customer_phone = 'Phone number is too short.';
    }
    if (!formData.delivery_address.trim()) {
      errors.delivery_address = 'Please specify your full delivery address (street, building/villa).';
    }
    if (!formData.city.trim()) {
      errors.city = 'Please enter your city / area.';
    }
    if (formData.customer_email && !/\S+@\S+\.\S+/.test(formData.customer_email)) {
      errors.customer_email = 'Please provide a valid email format for receipt.';
    }
    return errors;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        delivery_address: formData.delivery_address.trim(),
        city: formData.city.trim(),
        state_emirate: formData.state_emirate,
        postal_code: formData.postal_code.trim(),
        delivery_instructions: formData.delivery_instructions.trim(),
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(payload);

      if (response.status === 201 && response.data?.order_reference) {
        clearCart();
        navigate(`/order-confirmation/${response.data.order_reference}`);
      } else {
        setServerError('Could not confirm your order. Please check the details and try again.');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      const errMsg =
        err.response?.data?.error ||
        (typeof err.response?.data === 'string'
          ? err.response.data
          : 'Failed to place order. Please review your address and stock availability.');
      setServerError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const emiratesList = [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
  ];

  return (
    <div className="bg-[#FAF9F7] min-h-screen py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-charcoal mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-light">
            Guest Checkout
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Complete your order with <strong>Cash on Delivery</strong> across all UAE Emirates. No advance payment or account registration required.
          </p>
        </div>

        {serverError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3 text-red-900 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Unable to process order:</strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Fields Column */}
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded p-6 sm:p-8 space-y-6">
            
            {/* Delivery Destination */}
            <div>
              <h2 className="font-serif text-lg font-medium text-charcoal pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>1. Delivery Destination (UAE)</span>
                <span className="text-[11px] font-sans uppercase tracking-widest text-gold-700 font-semibold">
                  All 7 Emirates Supported
                </span>
              </h2>

              <div className="mt-4 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Mohammed Al Mansoori"
                    className={`w-full p-2.5 bg-stone-50 border rounded text-xs text-charcoal focus:outline-none focus:border-gold-500 ${
                      formErrors.customer_name ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {formErrors.customer_name && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.customer_name}</p>
                  )}
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                      UAE Phone / WhatsApp <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +971 50 123 4567"
                      className={`w-full p-2.5 bg-stone-50 border rounded text-xs text-charcoal focus:outline-none focus:border-gold-500 ${
                        formErrors.customer_phone ? 'border-red-500' : 'border-stone-300'
                      }`}
                    />
                    {formErrors.customer_phone && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.customer_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                      Email Address <span className="text-stone-400 font-normal">(for confirmation)</span>
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      placeholder="e.g. customer@example.com"
                      className={`w-full p-2.5 bg-stone-50 border rounded text-xs text-charcoal focus:outline-none focus:border-gold-500 ${
                        formErrors.customer_email ? 'border-red-500' : 'border-stone-300'
                      }`}
                    />
                    {formErrors.customer_email && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.customer_email}</p>
                    )}
                  </div>
                </div>

                {/* Emirate & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                      Emirate <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="state_emirate"
                      value={formData.state_emirate}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                    >
                      {emiratesList.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                      City / Area <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Downtown Dubai, Deira, Jumeirah"
                      className={`w-full p-2.5 bg-stone-50 border rounded text-xs text-charcoal focus:outline-none focus:border-gold-500 ${
                        formErrors.city ? 'border-red-500' : 'border-stone-300'
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.city}</p>
                    )}
                  </div>
                </div>

                {/* Complete Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                    Street Address / Villa or Flat No. <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    placeholder="e.g. Villa 14, Al Wasl Road, near City Walk"
                    className={`w-full p-2.5 bg-stone-50 border rounded text-xs text-charcoal focus:outline-none focus:border-gold-500 ${
                      formErrors.delivery_address ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {formErrors.delivery_address && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.delivery_address}</p>
                  )}
                </div>

                {/* Delivery Instructions */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                    Delivery Instructions <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="delivery_instructions"
                    value={formData.delivery_instructions}
                    onChange={handleInputChange}
                    placeholder="e.g. Please call before arrival or leave with security"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method - Cash on Delivery Only */}
            <div className="pt-4 border-t border-stone-100">
              <h2 className="font-serif text-lg font-medium text-charcoal pb-3 border-b border-stone-100 flex items-center justify-between">
                <span>2. Payment Method</span>
                <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Cash on Delivery Only
                </span>
              </h2>

              <div className="mt-4 p-4 rounded border-2 border-gold-500 bg-[#FAF8F5] flex items-start gap-3">
                <Banknote className="w-6 h-6 text-gold-700 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-charcoal text-sm">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] uppercase font-bold text-white bg-gold-700 px-2 py-0.5 rounded">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    You do not need to enter any bank card or online payment details. Pay easily in cash to the courier representative upon receiving your package anywhere in the UAE.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Confirm Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-stone-200 rounded p-6 sm:p-8 space-y-5">
              <h2 className="font-serif text-lg font-medium text-charcoal pb-3 border-b border-stone-100">
                Order Review
              </h2>

              {/* Items in Checkout */}
              <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.product_id}-${item.variant_id}`} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || '/fouz_logo.jpg'}
                        alt={item.name}
                        className="w-12 h-12 object-contain p-1 border border-stone-200 rounded"
                      />
                      <div>
                        {item.brand && (
                          <span className="text-[10px] uppercase tracking-wider text-gold-700 font-semibold block">
                            {item.brand}
                          </span>
                        )}
                        <h4 className="font-serif font-medium text-charcoal line-clamp-1">{item.name}</h4>
                        <span className="text-stone-400">Qty: {item.quantity} • {item.variant_title}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-charcoal whitespace-nowrap">
                      {(item.price * item.quantity).toFixed(2)} {verifiedAmounts.currency}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="pt-4 border-t border-stone-200 space-y-2.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">
                    {verifiedAmounts.subtotal.toFixed(2)} {verifiedAmounts.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>UAE Delivery ({formData.state_emirate})</span>
                  <span className="font-semibold text-charcoal">
                    {verifiedAmounts.shipping_fee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `${verifiedAmounts.shipping_fee.toFixed(2)} ${verifiedAmounts.currency}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-charcoal">Total Payable on Delivery</span>
                  <span className="font-serif text-2xl font-bold text-gold-700">
                    {verifiedAmounts.total_amount.toFixed(2)} <span className="text-xs font-normal text-stone-500">{verifiedAmounts.currency}</span>
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || verifiedAmounts.has_stock_error}
                id="place-order-button"
                className="w-full py-4 bg-charcoal text-white hover:bg-gold-600 disabled:bg-stone-300 text-xs uppercase tracking-luxury font-semibold rounded shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Cash on Delivery Order</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-stone-500 text-center leading-relaxed">
                By placing your order, you agree to receive order notifications and pay the courier representative upon delivery.
              </div>
            </div>

            {/* Delivery Guarantee Card */}
            <div className="bg-white border border-stone-200 rounded p-4 text-xs text-stone-600 flex items-center gap-3">
              <Truck className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <span>
                Standard UAE dispatch within <strong>24 to 48 hours</strong> with live courier tracking.
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
