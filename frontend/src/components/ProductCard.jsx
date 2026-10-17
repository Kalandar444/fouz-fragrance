import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const imageUrl = product.image || product.main_image_url || '/fouz_logo.jpg';
  const currency = product.currency || settings?.currency || 'AED';
  const price = product.price || 199;
  const originalPrice = product.compare_at_price || product.original_price || (price ? Math.round(price * 1.6) : null);
  
  // Calculate discount percent
  const discountPercent = product.discount_percent || (
    originalPrice && originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : 0
  );

  const soldCount = product.sold_count || 720;
  const soldInfo = product.sold_info || `${soldCount} sold in the last 3 months`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, null, 1, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35 }}
      className="group relative bg-white border border-stone-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      {/* Wishlist Heart Button - Matching Image */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:text-red-500 transition-colors"
        aria-label="Add to wishlist"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-stone-800'
          }`}
          strokeWidth={1.5}
        />
      </button>

      {/* Product Image Area */}
      <Link
        to={`/products/${product.slug}`}
        className="block w-full aspect-square p-4 sm:p-5 flex items-center justify-center bg-white overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/fouz_logo.jpg';
          }}
        />
      </Link>

      {/* Horizontal Divider Line - Matching Image */}
      <div className="border-b border-stone-200/60 w-full" />

      {/* Product Details Area */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Product Name with Ellipsis */}
          <h3 className="font-sans text-xs sm:text-sm font-medium text-stone-900 tracking-tight line-clamp-1 mb-2 hover:text-gold-700 transition-colors">
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Pricing Row: Current Price | Strikethrough Original Price | % Off */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            {/* Current Price */}
            <span className="font-sans text-base sm:text-lg font-bold text-stone-950 flex items-center gap-1">
              <span className="text-sm font-semibold">{currency}</span>
              <span>{price}</span>
            </span>

            {/* Original Strikethrough Price */}
            {originalPrice && originalPrice > price && (
              <span className="font-sans text-xs sm:text-sm text-stone-400 line-through">
                {currency} {originalPrice}
              </span>
            )}

            {/* Discount Percentage Badge */}
            {discountPercent > 0 && (
              <span className="text-xs sm:text-sm font-bold text-emerald-600 ml-auto sm:ml-2">
                {discountPercent} % Off
              </span>
            )}
          </div>

          {/* Social Proof Tag: Flame + "720 sold in the last 3 months" - Exact Match */}
          <div className="w-full mb-3 px-2.5 py-1.5 rounded-lg bg-[#FFF9ED] border border-[#FDE6BA] flex items-center gap-1.5 text-[11px] font-medium text-[#7A4B04]">
            <span className="text-xs">🔥</span>
            <span className="truncate">{soldInfo}</span>
          </div>
        </div>

        {/* Add to Cart Button - Matching Image */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 px-3 rounded-xl border border-stone-950 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-xs ${
            added
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-white hover:bg-stone-950 hover:text-white text-stone-950'
          }`}
        >
          <ShoppingCart className="w-4 h-4 stroke-[2]" />
          <span>{added ? 'Added to Cart!' : 'Add to cart'}</span>
        </button>
      </div>
    </motion.div>
  );
}
