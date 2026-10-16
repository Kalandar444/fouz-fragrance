import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            Terms of Service
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
            Terms and Conditions
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            Operating terms for Fouz Fragrance boutique, Gold Souk Dubai, United Arab Emirates.
          </p>
        </div>

        <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-600 font-light leading-relaxed space-y-6">
          <h2 className="font-serif text-xl text-charcoal font-medium">1. Overview</h2>
          <p>
            This website is operated by <strong>Fouz Fragrance</strong>, established in the Gold Souk, Dubai, UAE. Throughout the site, the terms "we", "us", and "our" refer to Fouz Fragrance. By visiting our site and purchasing our products, you agree to be bound by these terms.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium">2. Cash on Delivery Terms</h2>
          <p>
            By submitting an order on our platform, you acknowledge and agree that:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You have placed a genuine, binding order to receive delivery at your designated UAE address.</li>
            <li>You will be present or have an authorized representative present to receive the delivery and provide full payment in cash (AED) to the courier.</li>
            <li>Repeated refusal of orders upon arrival without valid cause may result in suspension of courier dispatch services to that address or phone number.</li>
          </ul>

          <h2 className="font-serif text-xl text-charcoal font-medium">3. Product Descriptions and Authenticity</h2>
          <p>
            All products displayed on Fouz Fragrance are guaranteed authentic luxury fragrances. We make every effort to display true descriptions, prices, olfactory pyramids, and imagery. In the event of a pricing or stock anomaly, we reserve the right to cancel or amend orders with prior customer notification.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium">4. UAE Governing Law</h2>
          <p>
            These terms and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the Emirate of Dubai and the federal laws of the United Arab Emirates.
          </p>
        </div>
      </div>
    </div>
  );
}
