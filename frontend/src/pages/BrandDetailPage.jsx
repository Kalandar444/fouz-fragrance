import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, ArrowLeft, MapPin, Calendar, Sparkles, 
  BookOpen, Feather, Search, ArrowUpDown, ShieldCheck, CheckCircle2,
  Award, Clock, Truck
} from 'lucide-react';
import { getBrandDetail } from '../api/client';
import { getBrandContent } from '../data/brandStories';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function BrandDetailPage() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  const [showFullStory, setShowFullStory] = useState(false);

  // Filter and sorting states
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ordering, setOrdering] = useState('newest');

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const productSectionRef = useRef(null);

  // Fetch brand detail and products
  const fetchBrandData = (targetPage = 1, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setProductsLoading(true);
    }

    const params = {
      search: search || undefined,
      in_stock: inStockOnly ? 'true' : undefined,
      ordering: ordering,
      page: targetPage,
      page_size: pageSize,
    };

    getBrandDetail(slug, params)
      .then((res) => {
        const brandData = res?.data?.brand || {
          name: (slug || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug: slug,
          description: `Discover luxury signature fragrances by ${(slug || '').replace(/-/g, ' ')}. 100% original UAE stock.`,
        };
        setBrand(brandData);
        setProducts(res?.data?.products || []);
        setTotalCount(res?.data?.count || (res?.data?.products ? res.data.products.length : 0));
        setTotalPages(res?.data?.total_pages || 1);
        setPage(res?.data?.current_page || targetPage);
      })
      .catch((err) => {
        console.error('Failed to load brand detail:', err);
        const cleanName = (slug || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setBrand({
          name: cleanName,
          slug: slug,
          description: `Discover luxury signature fragrances by ${cleanName}. 100% original UAE stock.`,
        });
      })
      .finally(() => {
        setLoading(false);
        setProductsLoading(false);
      });
  };

  // Initial load when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setSearch('');
    setInStockOnly(false);
    setOrdering('newest');
    setPage(1);
    setShowFullStory(false);
    fetchBrandData(1, true);
  }, [slug]);

  // Refetch when filters or sorting change
  useEffect(() => {
    if (!loading) {
      setPage(1);
      fetchBrandData(1, false);
    }
  }, [ordering, inStockOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBrandData(1, false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchBrandData(newPage, false);
    if (productSectionRef.current) {
      productSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-36 skeleton-shimmer rounded mb-8" />
          <div className="h-64 w-full skeleton-shimmer rounded-sm mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 skeleton-shimmer rounded" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] skeleton-shimmer rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl text-charcoal mb-4">Fragrance Brand Not Found</h2>
        <p className="text-sm text-stone-500 mb-6">
          The requested perfume house could not be found or may have been renamed.
        </p>
        <Link
          to="/brands"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-gold-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Brands</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F7] min-h-screen pb-20">
      
      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-stone-200/80 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-stone-500 overflow-x-auto no-scrollbar">
            <Link to="/" className="hover:text-gold-700 transition-colors whitespace-nowrap">Home</Link>
            <ChevronRight className="w-3 h-3 text-stone-400 flex-shrink-0" />
            <Link to="/brands" className="hover:text-gold-700 transition-colors whitespace-nowrap">Brands</Link>
            <ChevronRight className="w-3 h-3 text-stone-400 flex-shrink-0" />
            <span className="text-charcoal font-medium truncate">{brand.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Section - Clean Brand Logo & Description Content (Simple & Elegant) */}
      {(() => {
        const brandStory = getBrandContent(brand);
        const descriptionText = brandStory?.description || brand.description || `Discover the exclusive fragrance collection by ${brand.name}, crafted with rare notes and exceptional longevity. Available across UAE with Cash on Delivery.`;
        return (
          <div className="bg-white border-b border-stone-200/80 py-5 sm:py-10">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-8">
                
                {/* On mobile: Logo and Heading side-by-side in a horizontal row */}
                <div className="flex items-center gap-3.5 sm:gap-6 w-full sm:w-auto">
                  {/* Brand Logo with fallback */}
                  <div className="w-16 h-16 sm:w-36 sm:h-36 bg-white rounded-lg border border-stone-200/90 p-2 sm:p-4 shadow-2xs flex items-center justify-center flex-shrink-0 group">
                    {(brand.logo || brand.image_url) ? (
                      <img
                        src={brand.logo || brand.image_url}
                        alt={`${brand.name} logo`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
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
                      className="font-serif text-xs sm:text-sm font-semibold text-charcoal text-center"
                    >
                      {brand.name}
                    </span>
                  </div>

                  {/* Brand Heading for mobile (right beside the logo) */}
                  <div className="sm:hidden flex-1 text-left">
                    <h1 className="font-serif text-2xl text-charcoal font-medium tracking-tight leading-tight">
                      {brand.name}
                    </h1>
                    <span className="text-[10px] uppercase tracking-luxury text-gold-600 font-semibold block mt-0.5">
                      UAE Niche Collection
                    </span>
                  </div>
                </div>

                {/* Right Side / Below: Brand Name (desktop only) & Content */}
                <div className="text-left flex-1 w-full">
                  <h1 className="hidden sm:block font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-medium tracking-tight mb-1.5 sm:mb-2">
                    {brand.name}
                  </h1>

                  <p className={`text-xs sm:text-sm text-stone-600 font-normal leading-relaxed max-w-4xl ${!showFullStory ? 'line-clamp-3 sm:line-clamp-none' : ''}`}>
                    {descriptionText}
                  </p>

                  {brandStory?.history && (
                    <p className={`text-xs sm:text-sm text-stone-500 font-light leading-relaxed max-w-4xl mt-1.5 sm:mt-2 ${!showFullStory ? 'hidden sm:block' : 'block'}`}>
                      {brandStory.history}
                    </p>
                  )}

                  {(brandStory?.history || (descriptionText && descriptionText.length > 180)) && (
                    <button
                      onClick={() => setShowFullStory(!showFullStory)}
                      className="mt-2 text-[11px] font-semibold text-gold-700 hover:text-gold-900 uppercase tracking-wider inline-flex items-center gap-1 sm:hidden"
                    >
                      <span>{showFullStory ? 'Show Less' : 'Read Brand Story'}</span>
                      <ChevronRight className={`w-3 h-3 transition-transform ${showFullStory ? '-rotate-90' : 'rotate-90'}`} />
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. Products Section */}
      <div ref={productSectionRef} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-10">
        
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-5 border-b border-stone-200/80 mb-4 sm:mb-6">
          <div className="flex items-baseline gap-2">
            <h2 className="font-serif text-lg sm:text-2xl text-charcoal font-medium">
              Fragrances
            </h2>
            <span className="text-xs text-stone-500 font-light">
              ({totalCount})
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-gold-800 text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
            <ShieldCheck className="w-3 h-3 text-gold-600" />
            <span className="hidden xs:inline">100% Authentic UAE Stock</span>
            <span className="xs:hidden">Authentic UAE</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-stone-200 p-3 sm:p-4 rounded-md mb-6 sm:mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder={`Search ${brand.name} perfumes...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-gold-500 text-charcoal"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          </form>

          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
            <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-gold-600 focus:ring-gold-500 w-3.5 h-3.5"
              />
              <span>In Stock Only</span>
            </label>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded text-xs px-2.5 py-1.5 text-charcoal focus:outline-none focus:border-gold-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] skeleton-shimmer rounded" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200/90 rounded p-8">
            <Sparkles className="w-10 h-10 text-gold-400 mx-auto mb-3" />
            <h3 className="font-serif text-xl text-charcoal mb-2">No Fragrances Found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
              {search 
                ? `No fragrances matched "${search}" for ${brand.name}. Try adjusting your search term or clearing filters.`
                : `We are currently replenishing our vault with more fragrances from ${brand.name}. Please check back shortly.`
              }
            </p>
            {search ? (
              <button
                onClick={() => { setSearch(''); fetchBrandData(1, false); }}
                className="px-5 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-gold-600 transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <Link
                to="/shop"
                className="inline-block px-6 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-gold-600 transition-colors"
              >
                Browse Complete Catalogue
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              itemName={`${brand.name} Fragrances`}
            />
          </>
        )}

      </div>
    </div>
  );
}
