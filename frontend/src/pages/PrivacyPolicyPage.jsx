import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            Data Protection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            How Fouz Fragrance respects and protects your personal delivery information.
          </p>
        </div>

        <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-600 font-light leading-relaxed space-y-6">
          <h2 className="font-serif text-xl text-charcoal font-medium">1. Information We Collect</h2>
          <p>
            When you place an order with Fouz Fragrance as a guest, we only collect the minimum information necessary to safely fulfill your fragrance delivery across the UAE: your name, contact telephone/WhatsApp number, delivery address, and optional email address.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium">2. No Payment Card Storage</h2>
          <p>
            Because Fouz Fragrance operates exclusively on a <strong>Cash on Delivery (COD)</strong> basis, we never ask for, collect, or store any credit card numbers, debit card details, bank logins, or online payment credentials.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium">3. Use of Information</h2>
          <p>
            Your information is used exclusively to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dispatch and deliver your perfume package via our licensed UAE courier partners.</li>
            <li>Send order confirmation summaries and dispatch updates via email and WhatsApp.</li>
            <li>Respond to your fragrance inquiries submitted through our contact form.</li>
          </ul>

          <h2 className="font-serif text-xl text-charcoal font-medium">4. Third-Party Confidentiality</h2>
          <p>
            We do not sell, rent, or trade your personal contact details to any third-party marketing companies. Data is shared strictly with courier logistics personnel for delivery dispatch.
          </p>

          <h2 className="font-serif text-xl text-charcoal font-medium">5. Contact Our Privacy Officer</h2>
          <p>
            For any queries concerning your data, please contact us at <strong>fouzfragrance02@gmail.com</strong> or via written communication to our Gold Souk boutique, Dubai, UAE.
          </p>
        </div>
      </div>
    </div>
  );
}
