import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Award, ChevronRight, Gem, ChevronLeft } from 'lucide-react';
import { getBanners, getBrands, getCategories, getProducts, getCollections } from '../api/client';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

const HERO_SLIDES = [
  {
    id: 1,
    image: '/banners/banner1.jpg',
    badge: 'Niche Perfumery • Dubai Gold Souk',
    headline: 'The Art of Luxury Fragrance',
    subtitle: 'An extraordinary curation of the world’s most prestigious niche perfumes, crafted with rare essences and timeless mastery.',
    cta: 'Explore Catalogue',
    ctaLink: '/shop',
    ctaSecondary: 'Exclusive Collection',
    ctaSecondaryLink: '/exclusive',
    align: 'left',
    textDark: false,
  },
  {
    id: 2,
    image: '/banners/banner2.jpg',
    badge: 'Warm Oriental Accords',
    headline: 'Golden Warmth, Lasting Trails',
    subtitle: 'Discover our finest oud, amber, and rose compositions — rich, enveloping fragrances inspired by the Arabian heritage.',
    cta: 'Shop Oriental',
    ctaLink: '/shop',
    ctaSecondary: 'New Arrivals',
    ctaSecondaryLink: '/new-arrivals',
    align: 'right',
    textDark: false,
  },
  {
    id: 3,
    image: '/banners/banner3.jpg',
    badge: 'Minimalist Luxury',
    headline: 'Refined Elegance in Every Bottle',
    subtitle: 'Precision-crafted glass flacons housing the world’s finest accords — a collection for the discerning fragrance connoisseur.',
    cta: 'Browse Collection',
    ctaLink: '/collections',
    ctaSecondary: 'View Brands',
    ctaSecondaryLink: '/brands',
    align: 'left',
    textDark: false,
  },
  {
    id: 4,
    image: '/banners/banner4.jpg',
    badge: 'Champagne & Beige',
    headline: 'Light, Airy, Effortlessly Chic',
    subtitle: 'Fresh florals and soft musks from the world’s most prestigious fragrance houses. Worldwide Delivery Available.',
    cta: 'Shop Floral',
    ctaLink: '/shop',
    ctaSecondary: 'Best Sellers',
    ctaSecondaryLink: '/best-sellers',
    align: 'right',
    textDark: false,
  },
  {
    id: 5,
    image: '/banners/banner5.jpg',
    badge: 'Dramatic & Bold',
    headline: 'Powerful Presence, Unforgettable Sillage',
    subtitle: 'Statement fragrances with extraordinary depth — for those who command attention wherever they go.',
    cta: 'Discover Exclusives',
    ctaLink: '/exclusive',
    ctaSecondary: 'Contact Us',
    ctaSecondaryLink: '/contact',
    align: 'left',
    textDark: false,
  },
];

function HeroSlider({ settings }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const goTo = useCallback((index, dir) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    const nextIndex = (current + 1) % HERO_SLIDES.length;
    goTo(nextIndex, 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    const prevIndex = (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    goTo(prevIndex, -1);
  }, [current, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5500);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5500);
  }, [next]);

  const handleDot = (i) => {
    goTo(i, i > current ? 1 : -1);
    resetTimer();
  };

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };

  const slide = HERO_SLIDES[current];
  const isLeft = slide.align === 'left';
  const isDark = !slide.textDark;

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80, scale: 1.03 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80, scale: 0.97 }),
  };

  const textColor = isDark ? 'text-white' : 'text-charcoal';
  const subColor = isDark ? 'text-white/80' : 'text-stone-600';
  const badgeClass = isDark
    ? 'bg-white/15 border-white/30 text-white backdrop-blur-sm'
    : 'bg-white border-gold-300 text-gold-800';
  const btnPrimary = isDark
    ? 'bg-white text-charcoal hover:bg-gold-400 hover:text-white'
    : 'bg-charcoal text-white hover:bg-gold-600';
  const btnSecondary = isDark
    ? 'bg-transparent border-white/70 text-white hover:bg-white/20'
    : 'bg-white border-stone-300 hover:border-gold-600 text-charcoal';

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'min(90vh, 700px)' }}>
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <img
            src={slide.image}
            alt="Fouz Fragrance Banner"
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: isLeft
                ? 'linear-gradient(to right, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.30) 55%, transparent 100%)'
                : 'linear-gradient(to left, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.30) 55%, transparent 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Text content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16">
          <div className={`max-w-xl ${isLeft ? '' : 'ml-auto text-right'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${slide.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Badge */}
                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] uppercase tracking-widest font-semibold mb-5 ${badgeClass}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {slide.badge}
                </span>

                {/* Headline */}
                <h1 className={`font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.15] tracking-tight mb-5 ${textColor}`}>
                  {slide.headline.split('\u00a0').map((part, i, arr) =>
                    i < arr.length - 1 ? <span key={i}>{part}&nbsp;</span> : part
                  )}
                </h1>

                {/* Subtitle */}
                <p className={`text-sm sm:text-base leading-relaxed mb-8 font-light max-w-md ${isLeft ? '' : 'ml-auto'} ${subColor}`}>
                  {slide.subtitle}
                </p>

                {/* CTAs */}
                <div className={`flex flex-col sm:flex-row gap-3 ${isLeft ? '' : 'justify-end'}`}>
                  <Link
                    to={slide.ctaLink}
                    className={`px-7 py-3.5 text-xs uppercase tracking-widest font-semibold rounded-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${btnPrimary}`}
                  >
                    {slide.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={slide.ctaSecondaryLink}
                    className={`px-7 py-3.5 border text-xs uppercase tracking-widest font-semibold rounded-sm transition-all duration-300 flex items-center justify-center ${btnSecondary}`}
                  >
                    {slide.ctaSecondary}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Arrow navigation */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-2 bg-white shadow-md'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 z-20 text-white/60 text-[11px] uppercase tracking-widest font-medium">
        {String(current + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { settings } = useSettings();
  const [banners, setBanners] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [exclusiveProducts, setExclusiveProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      getBanners().catch(() => ({ data: [] })),
      getBrands().catch(() => ({ data: [] })),
      getCategories().catch(() => ({ data: [] })),
      getCollections().catch(() => ({ data: [] })),
      getProducts({ exclusive: 'true' }).catch(() => ({ data: [] })),
      getProducts({ best_sellers: 'true' }).catch(() => ({ data: [] })),
      getProducts({ new_arrivals: 'true' }).catch(() => ({ data: [] })),
    ]).then(([bannerRes, brandRes, catRes, colRes, exclRes, bestRes, newRes]) => {
      const toArr = (data) => Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      setBanners(toArr(bannerRes?.data));
      setBrands(toArr(brandRes?.data));
      setCategories(toArr(catRes?.data));
      setCollections(toArr(colRes?.data));
      setExclusiveProducts(toArr(exclRes?.data).slice(0, 8));
      setBestSellers(toArr(bestRes?.data).slice(0, 8));
      setNewArrivals(toArr(newRes?.data).slice(0, 8));
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Slider */}
      <HeroSlider settings={settings} />

      {/* Stats Bar */}
      <section className="bg-charcoal py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="py-2">
              <p className="font-serif text-lg sm:text-xl font-bold text-gold-400">100%</p>
              <p className="text-[10px] uppercase tracking-wider text-white/60 font-medium">Authentic Guarantees</p>
            </div>
            <div className="py-2">
              <p className="font-serif text-lg sm:text-xl font-bold text-gold-400">Worldwide</p>
              <p className="text-[10px] uppercase tracking-wider text-white/60 font-medium">Delivery Available</p>
            </div>
            <div className="py-2">
              <p className="font-serif text-lg sm:text-xl font-bold text-gold-400">Cash on Delivery</p>
              <p className="text-[10px] uppercase tracking-wider text-white/60 font-medium">Across the UAE</p>
            </div>
            <div className="py-2">
              <p className="font-serif text-lg sm:text-xl font-bold text-gold-400">Dubai</p>
              <p className="text-[10px] uppercase tracking-wider text-white/60 font-medium">Gold Souk Boutique</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Bar */}
      {brands.length > 0 && (
        <section className="py-12 border-b border-stone-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-[11px] uppercase tracking-luxury font-semibold text-gold-700">
                Curated Niche Houses
              </span>
              <h2 className="font-serif text-xl md:text-2xl text-charcoal font-medium mt-1">
                Shop By Prestigious Perfume Brands
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
              {brands.slice(0, 8).map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.slug}`}
                  className="group relative overflow-hidden px-4 py-2.5 rounded border border-stone-200/80 hover:border-gold-400 bg-stone-50/60 hover:bg-white text-stone-800 text-xs uppercase tracking-widest font-semibold transition-all shadow-2xs hover:shadow flex items-center gap-2.5"
                >
                  {brand.logo && (
                    <div
                      aria-hidden="true"
                      className="absolute right-0 bottom-0 translate-x-2 translate-y-2 w-16 h-16 pointer-events-none select-none opacity-20 group-hover:opacity-40 transition-opacity"
                    >
                      <img
                        src={brand.logo}
                        alt=""
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <span className="relative z-10">{brand.name}</span>
                </Link>
              ))}
              <Link
                to="/brands"
                className="px-5 py-2.5 rounded border border-charcoal bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-widest font-semibold transition-colors flex items-center"
              >
                View All Brands &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Exclusive Collection */}
      {exclusiveProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-luxury font-semibold text-gold-600">
                  Rare & Artisanal Formulations
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal font-medium mt-1">
                  Exclusive Niche Collection
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-xl">
                  Extraordinary perfumes crafted with scarce ingredients, high-concentration extraits, and distinctive signature trails.
                </p>
              </div>
              <Link
                to="/exclusive"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-gold-600 transition-colors"
              >
                View Exclusive Collection <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {exclusiveProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20 bg-[#FAF9F7] border-t border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-luxury font-semibold text-gold-600">
                  Most Beloved in the UAE
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal font-medium mt-1">
                  Iconic Best Sellers
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-xl">
                  Treasured by fragrance lovers across Dubai, Abu Dhabi, and the Emirates for their sublime projection and staying power.
                </p>
              </div>
              <Link
                to="/best-sellers"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-gold-600 transition-colors"
              >
                View All Best Sellers <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories / Fragrance Families Showcase */}
      {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-luxury font-semibold text-gold-600">
                Olfactory Families
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal font-medium mt-1">
                Shop By Fragrance Category
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-2">
                Whether you seek profound smoked oud, velvet gourmand florals, or radiant citrus blends, find your true essence.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group relative bg-[#FAF9F7] rounded overflow-hidden p-6 text-center border border-stone-100 hover:border-gold-300 hover:shadow-md transition-all flex flex-col items-center justify-between min-h-[160px]"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gold-600 group-hover:scale-110 transition-transform mb-3">
                    <Gem className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-charcoal group-hover:text-gold-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-1">
                      {cat.products_count ? `${cat.products_count} Fragrances` : 'Explore'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional Banners */}
      {banners.length > 0 && (
        <section className="py-12 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="relative rounded overflow-hidden min-h-[300px] flex items-end p-8 bg-cover bg-center shadow"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15)), url(${banner.image || 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1000'})`,
                  }}
                >
                  <div className="relative z-10 text-white">
                    <h3 className="font-serif text-2xl font-light">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-xs text-stone-200 mt-1.5 max-w-md font-light leading-relaxed">
                        {banner.subtitle}
                      </p>
                    )}
                    <Link
                      to={banner.button_link || "/shop"}
                      className="inline-block mt-4 px-5 py-2.5 bg-white text-charcoal hover:bg-gold-500 hover:text-white text-xs uppercase tracking-widest font-semibold transition-colors rounded-sm"
                    >
                      {banner.button_text || 'Discover'} &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs uppercase tracking-luxury font-semibold text-gold-600">
                  Just In at Gold Souk
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal font-medium mt-1">
                  New Arrivals
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-xl">
                  The latest olfactory creations freshly added to our boutique catalogue.
                </p>
              </div>
              <Link
                to="/new-arrivals"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-gold-600 transition-colors"
              >
                View All New Arrivals <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Introduction Section */}
      <section className="py-24 bg-[#FAF9F7] border-t border-stone-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-white shadow-sm border border-gold-200">
            <Award className="w-8 h-8 text-gold-600" />
          </div>

          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            The Legacy of Fouz Fragrance
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-light mt-3 mb-6">
            Lasting Impressions from Dubai's Gold Souk
          </h2>

          <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed max-w-3xl mx-auto">
            Situated within Dubai's storied Gold Souk, Fouz Fragrance is dedicated to bringing discerning fragrance collectors the finest artistic perfumery from around the globe. Every bottle in our selection is 100% genuine, hand-inspected, and delivered with the utmost care — with Worldwide Delivery Available.
          </p>

          <div className="mt-8 flex items-center justify-center gap-6">
            <Link
              to="/contact"
              className="px-6 py-3 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              Visit Our Boutique
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp}?text=Hello%20Fouz%20Fragrance`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-stone-300 hover:border-gold-500 text-charcoal text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
