import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const imageUrl = product.image || product.main_image_url || '/fouz_logo.jpg';
  const currency = product.currency || settings.currency || 'AED';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, null, 1, true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="group relative bg-white border border-stone-100 hover:border-gold-300 transition-all duration-300 flex flex-col h-full rounded-sm overflow-hidden hover:shadow-lg"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.is_exclusive && (
          <span className="bg-charcoal-dark text-gold-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
            Exclusive
          </span>
        )}
        {product.is_best_seller && (
          <span className="bg-gold-500 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
            Best Seller
          </span>
        )}
        {product.is_new_arrival && !product.is_exclusive && !product.is_best_seller && (
          <span className="bg-stone-900 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
            New
          </span>
        )}
        {product.discount_percent > 0 && (
          <span className="bg-red-700 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm">
            Save {product.discount_percent}%
          </span>
        )}
      </div>

      {/* Image Area */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-square bg-[#FAF9F7] overflow-hidden group-hover:bg-[#F5F2EB] transition-colors"
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-6 transform group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/fouz_logo.jpg';
          }}
        />

        {/* Quick actions overlay on desktop */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
          <button
            onClick={handleQuickAdd}
            id={`quick-add-${product.id}`}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-charcoal-dark text-white hover:bg-gold-600 text-xs uppercase tracking-wider font-medium rounded-sm shadow transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 text-center justify-between">
        <div>
          {/* Brand */}
          <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-gold-700 mb-1 line-clamp-1">
            {product.brand_name || 'Fouz Fragrance'}
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-sm md:text-base font-medium text-charcoal hover:text-gold-700 transition-colors line-clamp-2 min-h-[2.5rem] mb-1">
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Scent note or size */}
          <div className="text-xs text-stone-400 mb-3">
            {product.size_variant || '100ml'} {product.fragrance_family ? `• ${product.fragrance_family}` : ''}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="text-left">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-charcoal">
                {product.price} <span className="text-xs font-normal text-stone-500">{currency}</span>
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-stone-400 line-through">
                  {product.compare_at_price}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            className="md:hidden p-2 rounded-full bg-stone-100 hover:bg-gold-500 hover:text-white text-stone-700 transition-colors"
            title="Add to cart"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
