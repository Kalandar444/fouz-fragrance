import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Are all perfumes at Fouz Fragrance 100% genuine and authentic?",
      a: "Yes, without exception. Fouz Fragrance sources directly from authorized regional distributors and master perfumers. Every bottle is 100% authentic, sealed in its original luxury packaging, and quality-inspected at our Gold Souk Dubai boutique."
    },
    {
      q: "How does Cash on Delivery (COD) work?",
      a: "When you place an order on our website, you do not need to pay anything online. Our courier partner will deliver your order directly to your doorstep anywhere in the UAE, and you hand the exact payment in UAE Dirhams (AED) to the courier upon delivery."
    },
    {
      q: "What are your delivery charges and timelines across the UAE?",
      a: "We offer Complimentary (FREE) Delivery across all 7 UAE Emirates on orders above AED 300. For orders under AED 300, a standard flat fee of AED 25 applies. Deliveries in Dubai typically arrive within 24 hours, while deliveries to Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, and UAQ take 24–48 hours."
    },
    {
      q: "Can I inspect the package before paying the courier?",
      a: "You may verify the outer shipping package and ensure that the order label matches your details before handing over payment. For hygiene and product safety reasons, perfumes cannot be unsealed or tested before payment."
    },
    {
      q: "Can I receive fragrance recommendations before purchasing?",
      a: "Absolutely! Our fragrance consultants are available on WhatsApp (+971 54 4540097) to guide you through scent profiles, note pyramids, longevity, and seasonal recommendations tailored to your taste."
    },
    {
      q: "What should I do if I need to change my delivery address or time?",
      a: "Please message our boutique on WhatsApp (+971 54 4540097) with your Order Reference Number as soon as possible, and we will update your courier dispatch instructions."
    }
  ];

  return (
    <div className="bg-white min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-gold-600 mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            Frequently Asked Questions
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
            Questions & Answers
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            Everything you need to know about purchasing luxury niche fragrances with Fouz Fragrance.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-stone-200 rounded overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full text-left p-5 bg-[#FAF9F7] flex items-center justify-between text-sm sm:text-base font-serif font-medium text-charcoal hover:text-gold-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 transform transition-transform ${
                    openIndex === index ? 'rotate-180 text-gold-600' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="p-5 bg-white text-xs sm:text-sm text-stone-600 font-light leading-relaxed border-t border-stone-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 p-8 bg-[#FAF8F5] border border-gold-200 rounded text-center">
          <h3 className="font-serif text-lg text-charcoal font-medium">Still have questions?</h3>
          <p className="text-xs text-stone-500 mt-1 mb-4">
            Our boutique specialists in Gold Souk Dubai are available daily on WhatsApp.
          </p>
          <a
            href="https://wa.me/971544540097?text=Hello%20Fouz%20Fragrance,%20I%20have%20a%20question"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-widest font-semibold rounded transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
