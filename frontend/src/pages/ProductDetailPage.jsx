import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, MessageCircle, ShieldCheck, Truck, Check, Sparkles, Minus, Plus, Flame } from 'lucide-react';
import { getProductDetail } from '../api/client';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSettings();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setQuantity(1);
    getProductDetail(slug)
      .then((res) => {
        const prod = res.data;
        setProduct(prod);
        setSelectedImage(prod.image || prod.main_image_url || '/fouz_logo.jpg');
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        } else {
          setSelectedVariant(null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square skeleton-shimmer rounded" />
          <div className="space-y-4">
            <div className="h-6 w-32 skeleton-shimmer rounded" />
            <div className="h-10 w-3/4 skeleton-shimmer rounded" />
            <div className="h-8 w-24 skeleton-shimmer rounded" />
            <div className="h-32 w-full skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-charcoal mb-4">Fragrance Not Found</h2>
        <Link to="/shop" className="px-6 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(product.price);
  const currentComparePrice = selectedVariant?.compare_at_price || product.compare_at_price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isInStock = currentStock > 0;
  const currency = product.currency || settings.currency || 'AED';

  // Gallery images list: primary image + additional gallery images
  const allImages = [
    product.image || product.main_image_url || '/fouz_logo.jpg',
    ...(product.images || []).map((img) => img.image_url),
  ].filter(Boolean);

  const handleAddToCart = (openDrawer = true) => {
    if (!isInStock) return;
    addToCart(product, selectedVariant, quantity, openDrawer);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isInStock) return;
    addToCart(product, selectedVariant, quantity, false);
    navigate('/checkout');
  };

  // WhatsApp Enquiry URL with product name
  const whatsappNum = settings.whatsapp || '971544540097';
  const enquiryMessage = encodeURIComponent(
    `Hello Fouz Fragrance, I am interested in ${product.name}. Please share more details.`
  );
  const whatsappEnquiryUrl = `https://wa.me/${whatsappNum}?text=${enquiryMessage}`;

  return (
    <div className="bg-white min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-gold-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link to="/shop" className="hover:text-gold-700">Catalogue</Link>
          {product.brand && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <Link to={`/brands/${product.brand.slug}`} className="hover:text-gold-700">
                {product.brand.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-charcoal font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Main Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-[#FAF9F7] rounded border border-stone-100 overflow-hidden p-8 flex items-center justify-center relative">
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain transform hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fouz_logo.jpg';
                }}
              />
              {product.is_exclusive && (
                <span className="absolute top-4 left-4 bg-charcoal text-gold-400 text-xs uppercase tracking-widest font-bold px-3 py-1 rounded">
                  Exclusive
                </span>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded border p-1 bg-[#FAF9F7] flex-shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-gold-600 ring-1 ring-gold-600'
                        : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Purchase Section */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Brand */}
              {product.brand && (
                <Link
                  to={`/brands/${product.brand.slug}`}
                  className="inline-block text-xs uppercase tracking-luxury font-bold text-gold-700 hover:text-charcoal transition-colors mb-2"
                >
                  {product.brand.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-medium leading-tight mb-3">
                {product.name}
              </h1>

              {/* Fragrance Family */}
              {product.fragrance_family && (
                <div className="text-xs text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>{product.fragrance_family}</span>
                </div>
              )}

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-stone-100">
                <span className="font-serif text-3xl font-bold text-charcoal">
                  {currentPrice.toFixed(2)} <span className="text-base font-normal text-stone-500">{currency}</span>
                </span>
                {currentComparePrice && (
                  <span className="text-base text-stone-400 line-through">
                    {parseFloat(currentComparePrice).toFixed(2)} {currency}
                  </span>
                )}
                {product.discount_percent > 0 && (
                  <span className="bg-red-50 text-red-700 border border-red-200 text-xs uppercase font-bold px-2 py-0.5 rounded">
                    Save {product.discount_percent}%
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6 flex items-center gap-2 text-xs">
                {isInStock ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded">
                    <Check className="w-3.5 h-3.5" /> In Stock & Ready for UAE Dispatch ({currentStock} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded">
                    Temporarily Out of Stock
                  </span>
                )}
              </div>

              {/* Variant / Size Options */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2.5">
                    Select Size / Volume
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold border transition-all ${
                          selectedVariant?.id === v.id
                            ? 'bg-charcoal text-white border-charcoal shadow-sm'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-gold-500'
                        }`}
                      >
                        {v.title} — {parseFloat(v.price).toFixed(2)} {currency}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Purchase Actions */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-4">
                  {/* Qty Box */}
                  <div className="flex items-center border border-stone-300 rounded overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-3 text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-charcoal select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      disabled={quantity >= currentStock}
                      className="p-3 text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    disabled={!isInStock}
                    id="product-add-to-cart-btn"
                    className="flex-1 py-3.5 px-6 bg-charcoal text-white hover:bg-gold-600 disabled:bg-stone-300 text-xs uppercase tracking-luxury font-semibold rounded shadow transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{addedAnimation ? 'Added to Cart ✓' : 'Add to Cart'}</span>
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  id="product-buy-now-btn"
                  className="w-full py-3.5 px-6 bg-gold-600 hover:bg-gold-700 text-white disabled:bg-stone-300 text-xs uppercase tracking-luxury font-semibold rounded shadow transition-all flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>Buy Now with Cash on Delivery</span>
                </button>

                {/* WhatsApp Product Enquiry */}
                <a
                  href={whatsappEnquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs uppercase tracking-wider font-semibold rounded transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Inquire on WhatsApp about this Perfume</span>
                </a>
              </div>

              {/* Guarantees Box */}
              <div className="bg-[#FAF9F7] border border-stone-200/60 p-4 rounded text-xs text-stone-600 space-y-2 mb-8">
                <div className="flex items-center gap-2 font-medium text-charcoal">
                  <Truck className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <span>Cash on Delivery across all 7 UAE Emirates</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-charcoal">
                  <ShieldCheck className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <span>100% Guaranteed Genuine & Authentic Niche Fragrance</span>
                </div>
              </div>

              {/* Fragrance Olfactory Notes */}
              {(product.fragrance_notes_top || product.fragrance_notes_heart || product.fragrance_notes_base) && (
                <div className="mb-8 pt-6 border-t border-stone-200">
                  <h3 className="font-serif text-lg font-medium text-charcoal mb-4">
                    Olfactory Pyramid
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {product.fragrance_notes_top && (
                      <div className="bg-[#FAF8F5] p-3.5 rounded border border-stone-100">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gold-700 block mb-1">
                          Top Notes
                        </span>
                        <p className="text-xs text-stone-700 font-medium">{product.fragrance_notes_top}</p>
                      </div>
                    )}
                    {product.fragrance_notes_heart && (
                      <div className="bg-[#FAF8F5] p-3.5 rounded border border-stone-100">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gold-700 block mb-1">
                          Heart Notes
                        </span>
                        <p className="text-xs text-stone-700 font-medium">{product.fragrance_notes_heart}</p>
                      </div>
                    )}
                    {product.fragrance_notes_base && (
                      <div className="bg-[#FAF8F5] p-3.5 rounded border border-stone-100">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gold-700 block mb-1">
                          Base Notes
                        </span>
                        <p className="text-xs text-stone-700 font-medium">{product.fragrance_notes_base}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="pt-6 border-t border-stone-200">
                <h3 className="font-serif text-lg font-medium text-charcoal mb-2">
                  Fragrance Narrative
                </h3>
                <div className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.related_products && product.related_products.length > 0 && (
          <section className="mt-20 pt-12 border-t border-stone-200">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
                You May Also Appreciate
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-medium mt-1">
                Related Fragrance Masterpieces
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {product.related_products.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
