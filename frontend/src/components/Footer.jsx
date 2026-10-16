import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, Truck, Clock, Globe } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  const phone = settings.phone || '+971 54 4540097';
  const whatsapp = settings.whatsapp || '971544540097';
  const email = settings.email || 'fouzfragrance02@gmail.com';
  const address = settings.address || 'Gold souk, Dubai, United Arab Emirates';
  const instagram = settings.instagram_url || 'https://www.instagram.com/fouzfragrance.ae?xtok=MTJ1cGozNDJnYmxzOQ==';

  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  return (
    <footer className="bg-[#111111] text-stone-300 border-t border-stone-800 pt-16 pb-12">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-gold-900/60 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm text-white font-medium">100% Genuine Perfumes</h4>
              <p className="text-xs text-stone-400">Authentic niche fragrances curated in Dubai</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-gold-900/60 flex items-center justify-center text-gold-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm text-white font-medium">Cash on Delivery</h4>
              <p className="text-xs text-stone-400">Reliable COD delivery across the UAE</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-gold-900/60 flex items-center justify-center text-gold-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-sm text-white font-medium">Worldwide Delivery Available</h4>
              <p className="text-xs text-stone-400">Express courier shipping from Dubai to all global destinations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-block bg-white p-2 rounded-sm shadow">
              <img
                src={settings.logo_url || '/fouz_logo.jpg'}
                alt={settings.business_name}
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fouz_logo.jpg';
                }}
              />
            </Link>
            <h3 className="font-serif text-lg text-white font-medium tracking-wide">
              {settings.business_name}
            </h3>
            <p className="text-xs uppercase tracking-widest text-gold-400 font-medium">
              {settings.tagline}
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Based in the heart of Dubai’s historic Gold Souk, Fouz Fragrance curates the world's most prestigious niche perfumes, rare extraits, and opulent fragrance masterpieces.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-white mb-5 pb-2 border-b border-stone-800">
              Fragrance Catalogue
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/brands" className="hover:text-gold-400 transition-colors">
                  Shop by Brands
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold-400 transition-colors">
                  All Fragrances
                </Link>
              </li>
              <li>
                <Link to="/exclusive" className="hover:text-gold-400 transition-colors">
                  Exclusive Formulations
                </Link>
              </li>
              <li>
                <Link to="/best-sellers" className="hover:text-gold-400 transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-gold-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-white mb-5 pb-2 border-b border-stone-800">
              Information & Policies
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-gold-400 transition-colors">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-gold-400 transition-colors">
                  Shipping & UAE Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-gold-400 transition-colors">
                  Returns & Refunds Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold-400 transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-white mb-5 pb-2 border-b border-stone-800">
              Boutique Contact
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-gold-400 transition-colors">
                  {phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                <a
                  href={`https://wa.me/${whatsapp}?text=Hello%20Fouz%20Fragrance`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                >
                  WhatsApp Consultation
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-gold-400 transition-colors break-all">
                  {email}
                </a>
              </div>

              {instagram && (
                <div className="flex items-center gap-2.5 pt-2">
                  <InstagramIcon className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-400 transition-colors inline-flex items-center gap-1.5 text-xs"
                    title="Follow on Instagram"
                  >
                    <span>Follow on Instagram</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright & Payment notice */}
        <div className="pt-8 mt-8 border-t border-stone-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} {settings.business_name}. All rights reserved. Gold Souk, Dubai, UAE.
          </p>
          <div className="flex items-center gap-2 text-stone-400 bg-stone-900/80 px-3 py-1.5 rounded border border-stone-800">
            <span>💵 Payment Accepted:</span>
            <strong className="text-gold-400">Cash on Delivery (COD) Only</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
