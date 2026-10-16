import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Package, ArrowRight, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { getOrderDetail } from '../api/client';
import { useSettings } from '../context/SettingsContext';

export default function OrderConfirmationPage() {
  const { reference } = useParams();
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    getOrderDetail(reference)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 skeleton-shimmer rounded-full mx-auto mb-6" />
        <div className="h-8 w-64 skeleton-shimmer rounded mx-auto mb-4" />
        <div className="h-40 w-full skeleton-shimmer rounded" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-charcoal mb-4">Order Reference Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">We could not retrieve order details for #{reference}.</p>
        <Link to="/" className="px-6 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded">
          Return Home
        </Link>
      </div>
    );
  }

  const phoneNum = settings.whatsapp || '971544540097';
  const whatsappMsg = encodeURIComponent(
    `Hello Fouz Fragrance, I have placed an order with reference #${order.order_reference}. Please confirm delivery status.`
  );
  const whatsappUrl = `https://wa.me/${phoneNum}?text=${whatsappMsg}`;

  return (
    <div className="bg-[#FAF9F7] min-h-screen py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Card */}
        <div className="bg-white border border-stone-200 rounded p-6 sm:p-10 shadow-sm text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase tracking-luxury font-bold text-gold-700">
            Order Confirmed
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-medium mt-1 mb-2">
            Your order has been received.
          </h1>

          <div className="inline-block bg-[#F4F9F4] border border-[#D5EAD5] text-emerald-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded mb-6">
            💵 Payment will be collected in cash upon delivery.
          </div>

          <div className="bg-[#FAF9F7] border border-stone-200 p-4 rounded text-xs text-stone-600 inline-flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 max-w-lg mx-auto w-full">
            <div>
              <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Order Reference</span>
              <strong className="text-sm font-bold text-charcoal">{order.order_reference}</strong>
            </div>
            <div className="hidden sm:block w-px h-8 bg-stone-200" />
            <div>
              <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Status</span>
              <span className="font-semibold text-emerald-700">{order.status}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-stone-200" />
            <div>
              <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Payment</span>
              <span className="font-semibold text-charcoal">{order.payment_method}</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white border border-stone-200 rounded p-6 sm:p-8 shadow-sm space-y-6 mb-8">
          <div>
            <h2 className="font-serif text-lg font-medium text-charcoal pb-3 border-b border-stone-100">
              Purchased Fragrances
            </h2>

            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    {item.product_image_url && (
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="w-12 h-12 object-contain p-1 border border-stone-200 rounded flex-shrink-0"
                      />
                    )}
                    <div>
                      {item.brand_name && (
                        <span className="text-[10px] uppercase tracking-wider text-gold-700 font-bold block">
                          {item.brand_name}
                        </span>
                      )}
                      <h4 className="font-serif font-medium text-charcoal">{item.product_name}</h4>
                      <span className="text-stone-400 text-xs">
                        Qty: {item.quantity} {item.variant_title ? `• ${item.variant_title}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal whitespace-nowrap">
                    {parseFloat(item.subtotal).toFixed(2)} {order.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-charcoal">{parseFloat(order.subtotal).toFixed(2)} {order.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>UAE Delivery ({order.state_emirate})</span>
              <span className="font-semibold text-charcoal">
                {parseFloat(order.shipping_fee) === 0 ? 'FREE' : `${parseFloat(order.shipping_fee).toFixed(2)} ${order.currency}`}
              </span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-charcoal">Total Due on Delivery</span>
              <span className="font-serif text-2xl font-bold text-gold-700">
                {parseFloat(order.total_amount).toFixed(2)} {order.currency}
              </span>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="pt-6 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-600">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1">
                Recipient
              </span>
              <p className="font-semibold text-charcoal text-sm">{order.customer_name}</p>
              <p className="mt-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gold-600" /> {order.customer_phone}</p>
              {order.customer_email && (
                <p className="mt-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gold-600" /> {order.customer_email}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1">
                Delivery Address
              </span>
              <p className="font-medium text-charcoal flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold-600 flex-shrink-0 mt-0.5" />
                <span>
                  {order.delivery_address}<br />
                  {order.city}, {order.state_emirate}
                  {order.postal_code ? ` — ${order.postal_code}` : ''}
                </span>
              </p>
              {order.delivery_instructions && (
                <p className="mt-2 text-stone-500 italic">"{order.delivery_instructions}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-[#25D366] text-white hover:bg-[#20ba59] text-xs uppercase tracking-wider font-semibold rounded shadow transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Track via WhatsApp with Order Ref</span>
          </a>

          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-wider font-semibold rounded transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
