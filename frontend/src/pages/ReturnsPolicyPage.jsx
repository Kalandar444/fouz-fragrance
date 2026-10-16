import React from 'react';

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            Customer Assurance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
            Returns & Refunds Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            Our commitment to quality, authenticity, and consumer protection in the UAE.
          </p>
        </div>

        <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-600 font-light leading-relaxed space-y-6">
          <h2 className="font-serif text-xl text-charcoal font-medium">1. Fragrance Hygiene and Safety Regulations</h2>
          <p>
            Due to international hygiene standards and UAE consumer protection guidelines regarding cosmetics and personal fragrances, perfume bottles that have been unsealed, opened, or sprayed cannot be returned or refunded once accepted from the courier.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium">2. Unopened & Pristine Returns</h2>
          <p>
            You may request an exchange or return within <strong>3 days</strong> of receiving your delivery, provided the perfume remains in its original, sealed cellophane wrapping, untouched packaging, with all security tags and serial numbers intact.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium">3. Damaged or Defective Items</h2>
          <p>
            In the unlikely event that your perfume arrives with transit damage, atomiser defect, or leakage:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Notify us within <strong>24 hours</strong> of delivery via WhatsApp at <strong>+971 54 4540097</strong> or email at <strong>fouzfragrance02@gmail.com</strong>.</li>
            <li>Provide clear photographs or video showing the outer package, batch code, and the issue.</li>
            <li>We will promptly dispatch an identical replacement at zero additional delivery charge.</li>
          </ul>

          <h2 className="font-serif text-xl text-charcoal font-medium">4. Cash on Delivery Refunds</h2>
          <p>
            Where an approved return is processed for an order paid via Cash on Delivery, the refund amount (excluding original courier delivery fees) will be processed via bank transfer to the customer’s UAE bank account or provided as a boutique credit voucher.
          </p>
        </div>
      </div>
    </div>
  );
}
