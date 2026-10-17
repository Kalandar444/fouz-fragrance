import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, Truck, Globe } from 'lucide-react';
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
    <footer className="bg-[#111111] text-stone-300 border-t border-stone-800 pt-10 sm:pt-16 pb-10">
      {/* Trust Badges - Optimized for Mobile & Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14 pb-8 sm:pb-12 border-b border-stone-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6">
          
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-10 h-10 rounded-full bg-gold-950/40 border border-gold-700/40 flex items-center justify-center text-gold-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm text-white font-medium">100% Genuine Perfumes</h4>
              <p className="text-[11px] sm:text-xs text-stone-400">Curated in Dubai Gold Souk</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-10 h-10 rounded-full bg-gold-950/40 border border-gold-700/40 flex items-center justify-center text-gold-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm text-white font-medium">Cash on Delivery</h4>
              <p className="text-[11px] sm:text-xs text-stone-400">Fast COD delivery across UAE</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80">
            <div className="w-10 h-10 rounded-full bg-gold-950/40 border border-gold-700/40 flex items-center justify-center text-gold-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs sm:text-sm text-white font-medium">Worldwide Shipping</h4>
              <p className="text-[11px] sm:text-xs text-stone-400">Express delivery from Dubai</p>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
          
          {/* Brand Column */}
          <div className="space-y-3.5">
            <Link to="/" className="inline-block bg-white p-1.5 rounded shadow-sm">
              <img
                src={settings.logo_url || '/fouz_logo.jpg'}
                alt={settings.business_name}
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fouz_logo.jpg';
                }}
              />
            </Link>
            <h3 className="font-serif text-base sm:text-lg text-white font-medium tracking-wide">
              {settings.business_name}
            </h3>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gold-400 font-medium">
              {settings.tagline}
            </p>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Based in the heart of Dubai’s historic Gold Souk, Fouz Fragrance curates the world's most prestigious niche perfumes, rare extraits, and opulent fragrance masterpieces.
            </p>
          </div>

          {/* Shop Column & Information Column - 2 Columns on Mobile */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:contents">
            {/* Shop Column */}
            <div>
              <h4 className="font-serif text-xs sm:text-sm uppercase tracking-widest text-white mb-3 sm:mb-4 pb-1.5 border-b border-stone-800">
                Catalogue
              </h4>
              <ul className="space-y-2 text-xs text-stone-300">
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
                  <Link to="/best-sellers" className="hover:text-gold-400 transition-colors">
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link to="/exclusive" className="hover:text-gold-400 transition-colors">
                    Exclusive Perfumes
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
              <h4 className="font-serif text-xs sm:text-sm uppercase tracking-widest text-white mb-3 sm:mb-4 pb-1.5 border-b border-stone-800">
                Policies & Info
              </h4>
              <ul className="space-y-2 text-xs text-stone-300">
                <li>
                  <Link to="/contact" className="hover:text-gold-400 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-gold-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="hover:text-gold-400 transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link to="/returns-policy" className="hover:text-gold-400 transition-colors">
                    Returns Policy
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-gold-400 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-3 pt-2 md:pt-0">
            <h4 className="font-serif text-xs sm:text-sm uppercase tracking-widest text-white mb-3 sm:mb-4 pb-1.5 border-b border-stone-800">
              Boutique Contact
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-gold-400 transition-colors">
                  {phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
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
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-gold-400 transition-colors break-all">
                  {email}
                </a>
              </div>

              {instagram && (
                <div className="flex items-center gap-2.5 pt-1">
                  <InstagramIcon className="w-4 h-4 text-pink-400 shrink-0" />
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
        <div className="pt-6 mt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-stone-500 gap-3 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} {settings.business_name}. All rights reserved. Gold Souk, Dubai, UAE.
          </p>
          <div className="flex items-center gap-2 text-stone-400 bg-stone-900/80 px-3 py-1.5 rounded border border-stone-800">
            <span>💵 Payment:</span>
            <strong className="text-gold-400">Cash on Delivery (COD) Only</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
