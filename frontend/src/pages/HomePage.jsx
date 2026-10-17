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
    tag: 'Niche Perfumery',
    headline: 'The Art of Luxury Fragrance',
    subtitle: 'Extraordinary niche perfumes crafted with rare essences and timeless mastery.',
    cta: 'Shop Now',
    ctaLink: '/shop',
    align: 'left',
  },
  {
    id: 2,
    image: '/banners/banner2.jpg',
    tag: 'Oriental Heritage',
    headline: 'Golden Oud & Warm Amber',
    subtitle: 'Rich, lasting trails inspired by authentic Arabian craftsmanship.',
    cta: 'Explore Oud',
    ctaLink: '/shop',
    align: 'right',
  },
  {
    id: 3,
    image: '/banners/banner3.jpg',
    tag: 'Exclusive Flacons',
    headline: 'Refined Elegance in Every Note',
    subtitle: 'Precision-crafted accords for the discerning fragrance connoisseur.',
    cta: 'Discover Brands',
    ctaLink: '/brands',
    align: 'left',
  },
  {
    id: 4,
    image: '/banners/banner4.jpg',
    tag: 'Floral & Musk',
    headline: 'Fresh, Airy & Effortlessly Chic',
    subtitle: 'Prestigious light florals and soft musks with worldwide delivery.',
    cta: 'Shop Floral',
    ctaLink: '/shop',
    align: 'right',
  },
  {
    id: 5,
    image: '/banners/banner5.jpg',
    tag: 'Signature Scent',
    headline: 'Unforgettable Presence & Sillage',
    subtitle: 'Statement fragrances with depth that command attention wherever you go.',
    cta: 'Explore Exclusives',
    ctaLink: '/exclusive',
    align: 'left',
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

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    prev();
    resetTimer();
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    next();
    resetTimer();
  };

  const slide = HERO_SLIDES[current];
  const isLeft = slide.align === 'left';

  const variants = {
    enter: (dir) => ({ opacity: 0, scale: 1.02 }),
    center: { opacity: 1, scale: 1 },
    exit: (dir) => ({ opacity: 0, scale: 0.99 }),
  };

  return (
    <section className="relative w-full overflow-hidden bg-stone-950 h-[200px] xs:h-[230px] sm:h-[300px] md:h-[380px] lg:h-[440px] xl:h-[480px]">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <img
            src={slide.image}
            alt="Fouz Fragrance Banner"
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
          {/* Subtle gradient overlay to keep perfume visuals crisp while text remains readable */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isLeft
                ? 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0.05) 100%)'
                : 'linear-gradient(to left, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0.05) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Clean minimal text overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto w-full px-5 sm:px-10 lg:px-16">
          <div className={`max-w-[260px] xs:max-w-xs sm:max-w-md md:max-w-lg ${isLeft ? '' : 'ml-auto text-right'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${slide.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {/* Subtle Tag */}
                <span className="inline-block text-[9px] xs:text-[10px] sm:text-xs text-gold-400 tracking-widest uppercase font-semibold mb-1 sm:mb-1.5">
                  {slide.tag}
                </span>

                {/* Clean, readable headline */}
                <h1 className="font-serif text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-normal text-white leading-tight tracking-tight mb-1 sm:mb-2">
                  {slide.headline}
                </h1>

                {/* Subtitle - hidden on mobile so screen is never cluttered, crisp on tablet/desktop */}
                <p className={`hidden sm:block text-xs md:text-sm text-stone-200/90 font-light leading-relaxed mb-3 sm:mb-4 max-w-sm ${isLeft ? '' : 'ml-auto'}`}>
                  {slide.subtitle}
                </p>

                {/* Single sleek CTA button */}
                <div className={`flex ${isLeft ? '' : 'justify-end'} pt-1 sm:pt-0`}>
                  <Link
                    to={slide.ctaLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-wider font-semibold rounded bg-white text-stone-900 hover:bg-gold-400 hover:text-white transition-all duration-200 shadow"
                  >
                    <span>{slide.cta}</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Arrow navigation - subtle, hidden on mobile */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {/* Sleek dot indicators */}
      <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-200 rounded-full ${
              i === current
                ? 'w-5 sm:w-7 h-1 sm:h-1.5 bg-white shadow'
                : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
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

      {/* Brands Slider */}
      {brands.length > 0 && (
        <section className="py-10 md:py-14 border-b border-stone-100 bg-stone-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 md:mb-8 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-luxury font-semibold text-gold-700">
                  Curated Niche Houses
                </span>
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-charcoal font-medium mt-1">
                  Shop By Prestigious Perfume Brands
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/brands"
                  className="text-xs uppercase tracking-widest font-semibold text-charcoal hover:text-gold-700 transition-colors inline-flex items-center gap-1.5 mr-2"
                >
                  <span>View All Brands</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const el = document.getElementById('brands-slider-track');
                      if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                    }}
                    aria-label="Previous brands"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-stone-200 text-charcoal hover:border-gold-500 hover:text-gold-700 flex items-center justify-center transition-all shadow-2xs hover:shadow"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('brands-slider-track');
                      if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                    }}
                    aria-label="Next brands"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-stone-200 text-charcoal hover:border-gold-500 hover:text-gold-700 flex items-center justify-center transition-all shadow-2xs hover:shadow"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal sliding track */}
            <div
              id="brands-slider-track"
              className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.slug}`}
                  className="group flex-shrink-0 w-36 sm:w-44 h-28 sm:h-32 bg-white rounded border border-stone-200/90 hover:border-gold-500 hover:shadow-lg transition-all duration-300 p-3 flex flex-col items-center justify-between"
                >
                  <div className="flex-1 w-full flex items-center justify-center p-1 overflow-hidden">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-12 sm:max-h-14 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'block';
                          }
                        }}
                      />
                    ) : null}
                    <span
                      style={{ display: brand.logo ? 'none' : 'block' }}
                      className="font-serif text-xs sm:text-sm font-semibold text-charcoal text-center tracking-wider line-clamp-2"
                    >
                      {brand.name}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-stone-600 font-serif tracking-wider font-medium text-center line-clamp-1 group-hover:text-gold-700 transition-colors border-t border-stone-100 pt-1.5 w-full">
                    {brand.name}
                  </span>
                </Link>
              ))}
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
