import React from 'react';
import { Truck, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function ShippingPolicyPage() {
  const { settings } = useSettings();

  return (
    <div className="bg-white min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            UAE Fulfillment
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
            Shipping & UAE Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            Fast, secure, and temperature-controlled courier delivery across all seven Emirates.
          </p>
        </div>

        <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-600 font-light leading-relaxed space-y-6">
          <div className="p-6 bg-[#FAF9F7] border border-stone-200 rounded grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <strong className="block text-charcoal font-semibold text-sm">Dubai</strong>
              <span>Same-day or next-day dispatch (within 24 hours)</span>
            </div>
            <div>
              <strong className="block text-charcoal font-semibold text-sm">Other Emirates</strong>
              <span>Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, UAQ (24–48 hours)</span>
            </div>
            <div>
              <strong className="block text-charcoal font-semibold text-sm">Complimentary Threshold</strong>
              <span>Free delivery on orders AED {settings.free_shipping_threshold || 300}+</span>
            </div>
          </div>

          <h2 className="font-serif text-xl text-charcoal font-medium pt-4">1. Delivery Coverage Area</h2>
          <p>
            Fouz Fragrance exclusively serves customers across the United Arab Emirates. We fulfill and dispatch orders directly from our Gold Souk boutique in Dubai to residential, corporate, and hotel addresses across:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dubai</li>
            <li>Abu Dhabi & Al Ain</li>
            <li>Sharjah</li>
            <li>Ajman</li>
            <li>Ras Al Khaimah</li>
            <li>Fujairah</li>
            <li>Umm Al Quwain</li>
          </ul>

          <h2 className="font-serif text-xl text-charcoal font-medium pt-4">2. Shipping Charges</h2>
          <p>
            • Orders of <strong>AED {settings.free_shipping_threshold || 300} or more</strong>: Complimentary (FREE) Delivery across all UAE Emirates.<br />
            • Orders under <strong>AED {settings.free_shipping_threshold || 300}</strong>: Flat delivery fee of <strong>AED {settings.standard_shipping_fee || 25}</strong> applied at checkout.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium pt-4">3. Payment by Cash on Delivery</h2>
          <p>
            All deliveries are processed on a Cash on Delivery (COD) basis. Our courier partner will present your packaged order along with the official delivery manifest. Payment must be made in UAE Dirhams (AED) cash.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium pt-4">4. Order Tracking & Communication</h2>
          <p>
            Upon placing an order, you will receive a unique order reference code (e.g., <code>FF-20261014-XXXX</code>). If you provide an email address, an automated receipt is dispatched immediately. Our courier will contact you via phone call or WhatsApp prior to arrival.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium pt-4">5. Fragrance Packaging Integrity</h2>
          <p>
            Perfumes are delicate artistic creations sensitive to heat and impact. All bottles dispatched from Fouz Fragrance are cushioned with shock-absorbent luxury packaging to ensure pristine arrival at your doorstep.
          </p>
        </div>
      </div>
    </div>
  );
}
