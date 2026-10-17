import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, ArrowLeft, MapPin, Calendar, Sparkles, 
  BookOpen, Feather, Search, ArrowUpDown, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { getBrandDetail } from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function BrandDetailPage() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

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
        if (res?.data?.brand) {
          setBrand(res.data.brand);
          setProducts(res.data.products || []);
          setTotalCount(res.data.count || (res.data.products ? res.data.products.length : 0));
          setTotalPages(res.data.total_pages || 1);
          setPage(res.data.current_page || targetPage);
        }
      })
      .catch((err) => {
        console.error('Failed to load brand detail:', err);
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
      <div className="bg-white border-b border-stone-200/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/" className="hover:text-gold-700 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link to="/brands" className="hover:text-gold-700 transition-colors">Brands</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-charcoal font-medium">{brand.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Section - Clean Brand Logo & Brand Name */}
      <div className="bg-stone-50/80 border-b border-stone-200/80 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8">
            
            {/* Brand Logo */}
            {brand.logo ? (
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded border border-stone-200/90 p-4 shadow-sm flex items-center justify-center flex-shrink-0 group">
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                />
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white border border-stone-200/90 rounded p-4 flex flex-col items-center justify-center text-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-8 h-8 text-gold-500 mb-2" />
                <span className="font-serif text-sm font-medium text-charcoal">{brand.name}</span>
              </div>
            )}

            {/* Brand Title & Basic Meta */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-gold-50 border border-gold-300 text-gold-800 rounded-full text-[10px] uppercase tracking-wider font-semibold">
                  Niche Perfume House
                </span>
                {brand.origin_country && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 rounded-full text-[10px] font-medium">
                    <MapPin className="w-3 h-3 text-gold-600" />
                    <span>{brand.origin_country}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 rounded-full text-[10px] font-medium">
                  <Sparkles className="w-3 h-3 text-gold-600" />
                  <span>{totalCount} {totalCount === 1 ? 'Fragrance' : 'Fragrances'}</span>
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl text-charcoal font-medium tracking-tight mb-2">
                {brand.name}
              </h1>

              {brand.fragrance_style && (
                <p className="text-xs sm:text-sm text-stone-500 font-light italic">
                  "{brand.fragrance_style}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Products Section */}
      <div ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-stone-200/80 mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-gold-800 text-[11px] uppercase tracking-wider font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
              <span>100% Authentic Guaranteed</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal font-light">
              Explore {brand.name} Fragrances
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">
              Curated collection of authentic niche perfumes from {brand.name}, available in Dubai & all 7 Emirates.
            </p>
          </div>

          <div className="text-xs text-stone-500 font-light">
            Showing <span className="font-semibold text-charcoal">{products.length}</span> of <span className="font-semibold text-charcoal">{totalCount}</span> fragrances
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-stone-200 p-4 rounded-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder={`Search ${brand.name} perfumes...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded text-xs focus:outline-none focus:border-gold-500 text-charcoal"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-gold-600 focus:ring-gold-500"
              />
              <span>In Stock Only</span>
            </label>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded text-xs px-3 py-2 text-charcoal focus:outline-none focus:border-gold-500"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
