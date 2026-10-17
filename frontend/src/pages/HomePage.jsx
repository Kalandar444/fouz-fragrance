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
    imageWeb: '/banners/banner1_web.jpg',
    imageMob: '/banners/banner1_mob.jpg',
    image: '/banners/banner1_web.jpg',
    tag: 'Niche Perfumery',
    headline: 'The Art of Luxury Fragrance',
    subtitle: 'Extraordinary niche perfumes crafted with rare essences and timeless mastery.',
    cta: 'Shop Now',
    ctaLink: '/shop',
    align: 'left',
  },
  {
    id: 2,
    imageWeb: '/banners/banner2_web.jpg',
    imageMob: '/banners/banner2_mob.jpg',
    image: '/banners/banner2_web.jpg',
    tag: 'Oriental Heritage',
    headline: 'Golden Oud & Warm Amber',
    subtitle: 'Rich, lasting trails inspired by authentic Arabian craftsmanship.',
    cta: 'Explore Oud',
    ctaLink: '/shop',
    align: 'right',
  },
  {
    id: 3,
    imageWeb: '/banners/banner3_web.jpg',
    imageMob: '/banners/banner3_mob.jpg',
    image: '/banners/banner3_web.jpg',
    tag: 'Exclusive Flacons',
    headline: 'Refined Elegance in Every Note',
    subtitle: 'Precision-crafted accords for the discerning fragrance connoisseur.',
    cta: 'Discover Brands',
    ctaLink: '/brands',
    align: 'left',
  },
  {
    id: 4,
    imageWeb: '/banners/banner4_web.jpg',
    imageMob: '/banners/banner4_mob.jpg',
    image: '/banners/banner4_web.jpg',
    tag: 'Floral & Musk',
    headline: 'Fresh, Airy & Effortlessly Chic',
    subtitle: 'Prestigious light florals and soft musks with worldwide delivery.',
    cta: 'Shop Floral',
    ctaLink: '/shop',
    align: 'right',
  },
  {
    id: 5,
    imageWeb: '/banners/banner5_web.jpg',
    imageMob: '/banners/banner5_mob.jpg',
    image: '/banners/banner5_web.jpg',
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

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40) {
      next();
      resetTimer();
    } else if (distance < -40) {
      prev();
      resetTimer();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const slide = HERO_SLIDES[current];
  const isLeft = slide.align === 'left';

  const variants = {
    enter: (dir) => ({ opacity: 0, scale: 1.02 }),
    center: { opacity: 1, scale: 1 },
    exit: (dir) => ({ opacity: 0, scale: 0.99 }),
  };

  return (
    <div className="w-full relative">
      <section
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden bg-stone-950 aspect-[1125/1050] md:aspect-[2400/544]"
      >
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
            {/* Clickable Banner Link */}
            <Link to={slide.ctaLink} className="block w-full h-full relative" aria-label={slide.headline}>
              {/* Responsive Picture: Desktop 2400x544 vs Mobile 1125x1050 like vperfumes */}
              <picture className="w-full h-full block">
                <source media="(min-width: 768px)" srcSet={slide.imageWeb} />
                <img
                  src={slide.imageMob}
                  alt={slide.headline}
                  className="w-full h-full object-cover object-center"
                  draggable={false}
                />
              </picture>

              {/* Minimal text for slides 2-5 without covering perfume visual */}
              {slide.id !== 1 && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent flex items-center pl-12 pr-6 sm:px-10 lg:px-14">
                  <div className="max-w-xs sm:max-w-sm text-left">
                    <span className="text-[9px] sm:text-xs text-gold-400 font-semibold uppercase tracking-widest block mb-1">
                      {slide.tag}
                    </span>
                    <h2 className="font-serif text-sm sm:text-2xl lg:text-3xl font-medium text-white leading-tight mb-2 sm:mb-3">
                      {slide.headline}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-stone-900 text-[10px] sm:text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-gold-400 hover:text-white transition-all shadow">
                      {slide.cta} &rarr;
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Sliding Navigation Symbols (Left & Right Arrows) - Visible on Both Mobile & Desktop */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/75 active:scale-90 text-white items-center justify-center transition-all backdrop-blur-md border border-white/30 shadow-lg"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/75 active:scale-90 text-white items-center justify-center transition-all backdrop-blur-md border border-white/30 shadow-lg"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Mobile Slide Indicator Badge */}
        <div className="flex sm:hidden absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider border border-white/20">
          {current + 1} / {HERO_SLIDES.length}
        </div>

        {/* Sleek dot indicators */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 backdrop-blur-sm border border-white/15">
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
    </div>
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
      <section className="bg-charcoal py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="py-1.5 sm:py-2">
              <p className="font-serif text-base sm:text-xl font-bold text-gold-400">100%</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60 font-medium">Authentic Guarantees</p>
            </div>
            <div className="py-1.5 sm:py-2">
              <p className="font-serif text-base sm:text-xl font-bold text-gold-400">Worldwide</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60 font-medium">Delivery Available</p>
            </div>
            <div className="py-1.5 sm:py-2">
              <p className="font-serif text-base sm:text-xl font-bold text-gold-400">Cash on Delivery</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60 font-medium">Across the UAE</p>
            </div>
            <div className="py-1.5 sm:py-2">
              <p className="font-serif text-base sm:text-xl font-bold text-gold-400">Dubai</p>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60 font-medium">Gold Souk Boutique</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Slider */}
      {/* Brands Grid Section (Exact Image 1 layout) */}
      {brands.length > 0 && (() => {
        const preferredSlugs = [
          'faiz-niche', 'dior', 'chanel', 'versace', 'tom-ford',
          'creed', 'bvlgari', 'gucci', 'burberry', 'dolce-gabbana',
          'dolce-and-gabbana', 'yves-saint-laurent', 'givenchy', 'guerlain', 'amouage', 'davidoff'
        ];
        const displayBrands = [
          ...preferredSlugs.map(s => brands.find(b => b.slug === s || b.slug.toLowerCase() === s.toLowerCase())).filter(Boolean),
          ...brands.filter(b => b.logo && !preferredSlugs.includes(b.slug))
        ].filter((brand, index, self) => self.findIndex(b => b.slug === brand.slug) === index).slice(0, 10);

        return (
          <section className="py-10 sm:py-14 md:py-20 bg-white border-b border-stone-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Brands: Single Horizontal Scroll Line on Mobile without scrollbar, 5-Column Grid on Desktop */}
              <div className="flex md:grid overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0 gap-3 sm:gap-6 md:grid-cols-5 md:gap-y-16 md:gap-x-10 items-end snap-x snap-mandatory">
                {displayBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/brands/${brand.slug}`}
                    className="group flex-shrink-0 w-24 sm:w-32 md:w-full flex flex-col items-center justify-between text-center transition-transform duration-300 hover:-translate-y-1 snap-start"
                  >
                    {/* Brand Logo Container */}
                    <div className="w-full h-16 sm:h-24 md:h-28 flex items-center justify-center p-2 mb-1.5 sm:mb-3 bg-stone-50/50 md:bg-transparent rounded-lg">
                      {(brand.logo || brand.image_url) ? (
                        <img
                          src={brand.logo || brand.image_url}
                          alt={brand.name}
                          loading="lazy"
                          className="max-h-12 sm:max-h-20 md:max-h-24 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'block';
                            }
                          }}
                        />
                      ) : null}
                      <span
                        style={{ display: (brand.logo || brand.image_url) ? 'none' : 'block' }}
                        className="font-serif text-xs sm:text-sm font-semibold text-charcoal tracking-wider"
                      >
                        {brand.name}
                      </span>
                    </div>

                    {/* Brand Name with arrow */}
                    <span className="font-serif text-[11px] sm:text-xs md:text-sm text-stone-900 group-hover:text-gold-700 transition-colors inline-flex items-center gap-1 font-medium truncate max-w-full px-1">
                      <span className="truncate">{brand.name}</span>
                      <span className="text-stone-400 group-hover:text-gold-700 group-hover:translate-x-0.5 transition-all flex-shrink-0">&rarr;</span>
                    </span>
                  </Link>
                ))}
              </div>

              {/* View all button */}
              <div className="mt-8 sm:mt-16 text-center">
                <Link
                  to="/brands"
                  className="inline-block px-7 sm:px-8 py-2.5 sm:py-3 bg-stone-950 text-white hover:bg-gold-600 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-sm"
                >
                  View all
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Exclusive Collection */}
      {exclusiveProducts.length > 0 && (
        <section className="py-10 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-luxury font-semibold text-gold-600">
                  Rare & Artisanal Formulations
                </span>
                <h2 className="font-serif text-xl sm:text-3xl md:text-4xl text-charcoal font-medium mt-1">
                  Exclusive Niche Collection
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 sm:mt-2 max-w-xl">
                  Extraordinary perfumes crafted with scarce ingredients, high-concentration extraits, and distinctive signature trails.
                </p>
              </div>
              <Link
                to="/exclusive"
                className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-gold-600 transition-colors"
              >
                View Exclusive Collection <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
              {exclusiveProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-10 sm:py-16 md:py-20 bg-[#FAF9F7] border-t border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-luxury font-semibold text-gold-600">
                  Most Beloved in the UAE
                </span>
                <h2 className="font-serif text-xl sm:text-3xl md:text-4xl text-charcoal font-medium mt-1">
                  Iconic Best Sellers
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 sm:mt-2 max-w-xl">
                  Treasured by fragrance lovers across Dubai, Abu Dhabi, and the Emirates for their sublime projection and staying power.
                </p>
              </div>
              <Link
                to="/best-sellers"
                className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-gold-600 transition-colors"
              >
                View All Best Sellers <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories / Fragrance Families Showcase */}
      {categories.length > 0 && (
        <section className="py-10 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
              <span className="text-[10px] sm:text-xs uppercase tracking-luxury font-semibold text-gold-600">
                Olfactory Families
              </span>
              <h2 className="font-serif text-xl sm:text-3xl md:text-4xl text-charcoal font-medium mt-1">
                Shop By Fragrance Category
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1.5 sm:mt-2">
                Whether you seek profound smoked oud, velvet gourmand florals, or radiant citrus blends, find your true essence.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group relative bg-[#FAF9F7] rounded overflow-hidden p-3.5 sm:p-6 text-center border border-stone-100 hover:border-gold-300 hover:shadow-md transition-all flex flex-col items-center justify-between min-h-[130px] sm:min-h-[160px]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gold-600 group-hover:scale-110 transition-transform mb-2 sm:mb-3">
                    <Gem className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xs sm:text-sm font-semibold text-charcoal group-hover:text-gold-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 sm:mt-1">
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
        <section className="py-8 sm:py-12 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="relative rounded overflow-hidden min-h-[220px] sm:min-h-[300px] flex items-end p-5 sm:p-8 bg-cover bg-center shadow"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15)), url(${banner.image || 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1000'})`,
                  }}
                >
                  <div className="relative z-10 text-white">
                    <h3 className="font-serif text-xl sm:text-2xl font-light">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-[11px] sm:text-xs text-stone-200 mt-1 max-w-md font-light leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {banner.subtitle}
                      </p>
                    )}
                    <Link
                      to={banner.button_link || "/shop"}
                      className="inline-block mt-3 sm:mt-4 px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-charcoal hover:bg-gold-500 hover:text-white text-[11px] sm:text-xs uppercase tracking-widest font-semibold transition-colors rounded-sm"
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
        <section className="py-10 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-luxury font-semibold text-gold-600">
                  Just In at Gold Souk
                </span>
                <h2 className="font-serif text-xl sm:text-3xl md:text-4xl text-charcoal font-medium mt-1">
                  New Arrivals
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 sm:mt-2 max-w-xl">
                  The latest olfactory creations freshly added to our boutique catalogue.
                </p>
              </div>
              <Link
                to="/new-arrivals"
                className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-gold-600 transition-colors"
              >
                View All New Arrivals <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Introduction Section */}
      <section className="py-12 sm:py-20 md:py-24 bg-[#FAF9F7] border-t border-stone-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-full bg-white shadow-sm border border-gold-200">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-gold-600" />
          </div>

          <span className="text-[10px] sm:text-xs uppercase tracking-luxury font-semibold text-gold-700">
            The Legacy of Fouz Fragrance
          </span>

          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-charcoal font-light mt-2 sm:mt-3 mb-4 sm:mb-6">
            Lasting Impressions from Dubai's Gold Souk
          </h2>

          <p className="text-stone-600 text-xs sm:text-base font-light leading-relaxed max-w-3xl mx-auto">
            Situated within Dubai's storied Gold Souk, Fouz Fragrance is dedicated to bringing discerning fragrance collectors the finest artistic perfumery from around the globe. Every bottle in our selection is 100% genuine, hand-inspected, and delivered with the utmost care — with Worldwide Delivery Available.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 w-full max-w-xs sm:max-w-none mx-auto">
            <Link
              to="/contact"
              className="w-full sm:w-auto px-6 py-3 bg-charcoal text-white hover:bg-gold-600 text-xs uppercase tracking-widest font-semibold transition-colors text-center"
            >
              Visit Our Boutique
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp}?text=Hello%20Fouz%20Fragrance`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 border border-stone-300 hover:border-gold-500 text-charcoal text-xs uppercase tracking-widest font-semibold transition-colors text-center"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
