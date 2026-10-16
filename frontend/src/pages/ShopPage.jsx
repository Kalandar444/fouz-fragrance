import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ArrowUpDown, Sparkles, RotateCcw } from 'lucide-react';
import { getProducts, getBrands, getCategories } from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || 'newest');
  
  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const mainGridRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      getBrands().catch(() => ({ data: [] })),
      getCategories().catch(() => ({ data: [] })),
    ]).then(([brandRes, catRes]) => {
      setBrands(Array.isArray(brandRes?.data) ? brandRes.data : []);
      setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
    });
  }, []);

  const fetchProducts = (targetPage = 1) => {
    setLoading(true);
    const params = {
      brand: selectedBrand || undefined,
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      in_stock: inStockOnly ? 'true' : undefined,
      ordering: ordering,
      page: targetPage,
      page_size: pageSize,
    };

    getProducts(params)
      .then((res) => {
        if (res?.data && res.data.results) {
          setProducts(res.data.results);
          setTotalCount(res.data.count || 0);
          setTotalPages(res.data.total_pages || 1);
          setPage(res.data.current_page || targetPage);
        } else if (Array.isArray(res?.data)) {
          setProducts(res.data);
          setTotalCount(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
          setPage(targetPage);
        } else {
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  // Fetch products when filters or search change
  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [selectedBrand, selectedCategory, searchQuery, minPrice, maxPrice, inStockOnly, ordering]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchProducts(newPage);
    if (mainGridRef.current) {
      mainGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  // Sync filters from URL whenever searchParams change
  useEffect(() => {
    setSelectedBrand(searchParams.get('brand') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('search') || '');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setInStockOnly(searchParams.get('in_stock') === 'true');
    setOrdering(searchParams.get('ordering') || 'newest');
  }, [searchParams]);

  const handleCategoryChange = (catSlug) => {
    setSelectedCategory(catSlug);
    const nextParams = new URLSearchParams(searchParams);
    if (catSlug) {
      nextParams.set('category', catSlug);
    } else {
      nextParams.delete('category');
    }
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const handleBrandChange = (brandSlug) => {
    setSelectedBrand(brandSlug);
    const nextParams = new URLSearchParams(searchParams);
    if (brandSlug) {
      nextParams.set('brand', brandSlug);
    } else {
      nextParams.delete('brand');
    }
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSelectedBrand('');
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setOrdering('newest');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    selectedBrand || selectedCategory || searchQuery || minPrice || maxPrice || inStockOnly
  );

  const activeCategory = categories.find((c) => c.slug === selectedCategory);
  const activeBrand = brands.find((b) => b.slug === selectedBrand);

  const pageTitle = activeCategory 
    ? activeCategory.name 
    : activeBrand 
      ? activeBrand.name 
      : 'Shop All Perfumes';

  const pageSubtitle = activeCategory?.description || (
    activeCategory 
      ? `Explore our curated selection of ${activeCategory.name} fragrances.` 
      : activeBrand
        ? `Discover signature luxury fragrances by ${activeBrand.name}.`
        : 'Browse our full repertoire of authentic niche perfumes, extraits, and opulent fragrance elixirs.'
  );

  return (
    <div className="bg-white min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            {activeCategory ? 'Fragrance Category' : activeBrand ? 'Brand Collection' : 'Complete Fragrance Catalogue'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-light mt-1 mb-3">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            {pageSubtitle}
          </p>
        </div>

        {/* Top Controls Bar */}
        <div className="bg-[#FAF9F7] border border-stone-200 p-4 rounded mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-stone-50"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            <span className="text-xs text-stone-500 font-medium">
              Showing <strong>{products.length}</strong> of <strong>{totalCount}</strong> fragrances
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-red-600 transition-colors mr-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full sm:w-auto bg-white border border-stone-200 rounded text-xs px-3 py-2 text-charcoal focus:outline-none focus:border-gold-500"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price_asc">Sort: Price Low to High</option>
                <option value="price_desc">Sort: Price High to Low</option>
                <option value="name_asc">Sort: Alphabetical A to Z</option>
              </select>
            </div>
          </div>
        </div>


        {/* Content Area: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-[#FAF9F7] border border-stone-100 p-6 rounded">
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search name, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Brands Filter */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-200 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.slug}>
                      {b.name} ({b.products_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  Fragrance Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-200 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c.products_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  Price Range (AED)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-gold-500"
                  />
                  <span className="text-stone-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Availability Filter */}
              <div className="pt-2 border-t border-stone-200">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-stone-300 text-gold-600 focus:ring-gold-500"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-6 w-full py-2 bg-stone-200 hover:bg-stone-300 text-charcoal text-xs uppercase tracking-wider font-semibold rounded transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid Area */}
          <main ref={mainGridRef} className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="aspect-[3/4] skeleton-shimmer rounded" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-[#FAF9F7] rounded border border-stone-100 p-8">
                <p className="font-serif text-xl text-charcoal mb-2">No fragrances match your criteria</p>
                <p className="text-xs text-stone-500 mb-6">
                  Try clearing your filters or searching for another fragrance house or note.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  itemName="Fragrances"
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-white shadow-xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <h3 className="font-serif text-lg font-medium text-charcoal">Filter Fragrances</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-2">
                  Price (AED)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>
              </div>

              {/* In Stock */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-gold-600"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    handleResetFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="w-full py-2.5 bg-stone-100 text-stone-700 text-xs uppercase tracking-wider font-semibold rounded"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
