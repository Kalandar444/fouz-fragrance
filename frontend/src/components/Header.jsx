import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Phone, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InstagramIcon from './InstagramIcon';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function Header() {
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Brands', path: '/brands' },
    { name: 'Best Sellers', path: '/best-sellers' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Exclusive', path: '/exclusive' },
  ];

  const mobileNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop All Perfumes', path: '/shop' },
    { name: 'Brands', path: '/brands' },
    { name: 'Best Sellers', path: '/best-sellers' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Exclusive', path: '/exclusive' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-100 transition-all">
      {/* Announcement Bar */}
      {settings.announcement_active && (
        <div className="bg-[#121212] text-[#F3EAD8] text-[11px] md:text-xs py-2 px-4 text-center tracking-wider font-light">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Globe className="w-3.5 h-3.5 text-gold-400 shrink-0 inline-block" />
            <span>{settings.announcement_text}</span>
          </div>
        </div>
      )}

      {/* Logo Row — 3 columns: logo left | name center | icons right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-20 md:h-24">

          {/* LEFT: Logo image */}
          <div className="flex items-center">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-charcoal hover:text-gold-600 transition-colors lg:hidden mr-1"
              aria-label="Open Navigation Menu"
              id="mobile-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center group py-1">
              <img
                src={settings.logo_url || '/fouz_logo.jpg'}
                alt={settings.business_name}
                className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fouz_logo.jpg';
                }}
              />
            </Link>
          </div>

          {/* CENTER: Business name */}
          <div className="flex justify-center items-center">
            <Link to="/" className="text-center group flex flex-col items-center">
              <span className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.14em] text-charcoal group-hover:text-gold-700 transition-colors whitespace-nowrap">
                {(settings.business_name || 'Fouz Fragrance').replace(/✨/g, '').trim()}
              </span>
              {/* Tagline */}
              <span className="text-[9px] md:text-[11px] uppercase tracking-[0.24em] text-stone-400 font-medium mt-1.5 hidden sm:block whitespace-nowrap">
                {settings.tagline || 'Premium Perfumes | Lasting Impressions'}
              </span>
            </Link>
          </div>


          {/* RIGHT: Search & Cart icons */}
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-stone-600 hover:text-gold-600 transition-colors"
              aria-label="Search Fragrances"
              id="header-search-btn"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-600 hover:text-gold-600 transition-colors"
              aria-label="Shopping Cart"
              id="header-cart-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-gold-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Desktop Nav Row */}
      <div className="hidden lg:block border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-10 h-11">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `text-[13px] tracking-wide font-normal transition-colors py-1 relative ${
                    isActive
                      ? 'text-charcoal font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-charcoal'
                      : 'text-stone-500 hover:text-charcoal'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Expandable Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#FAF9F7] border-t border-b border-stone-200"
          >
            <div className="max-w-4xl mx-auto px-4 py-4">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by perfume name, brand, notes (e.g., Oud, Rose, Amber, Frederic Malle)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-24 py-3 bg-white border border-stone-300 rounded-sm text-sm text-charcoal focus:outline-none focus:border-gold-600 placeholder:text-stone-400"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-2 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-wider font-medium rounded-sm transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                  <img
                    src={settings.logo_url || '/fouz_logo.jpg'}
                    alt={settings.business_name}
                    className="h-14 w-auto object-contain"
                  />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-charcoal"
                    aria-label="Close Navigation Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5">
                  <form onSubmit={handleSearchSubmit} className="mb-6">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search perfumes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm text-charcoal focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </form>

                  <div className="space-y-1">
                    {mobileNavLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `block px-3 py-2.5 rounded text-xs uppercase tracking-[0.18em] font-medium transition-colors ${
                            isActive
                              ? 'bg-stone-100 text-gold-700 font-semibold'
                              : 'text-stone-700 hover:bg-stone-50 hover:text-gold-600'
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-5 border-t border-stone-100 bg-stone-50 text-xs text-stone-600 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <span>Gold Souk, Dubai, UAE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <a href={`tel:${settings.phone}`} className="hover:underline">
                    {settings.phone}
                  </a>
                </div>
                <div className="pt-2 space-y-2">
                  <a
                    href={`https://wa.me/${settings.whatsapp}?text=Hello%20Fouz%20Fragrance`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 bg-[#25D366] text-white rounded font-medium"
                  >
                    Chat on WhatsApp
                  </a>
                  {settings.instagram_url && (
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border border-pink-200 text-stone-800 rounded font-medium text-xs hover:border-pink-400 transition-colors"
                    >
                      <InstagramIcon className="w-4 h-4 text-pink-500" />
                      <span>Follow on Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
