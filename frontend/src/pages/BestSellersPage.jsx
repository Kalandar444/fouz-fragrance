import React, { useState, useEffect, useRef } from 'react';
import { Award, ArrowUpDown, Search } from 'lucide-react';
import { getProducts } from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function BestSellersPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState('newest');
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const gridTopRef = useRef(null);

  const fetchProducts = (targetPage = 1) => {
    setLoading(true);
    getProducts({
      best_sellers: 'true',
      ordering: ordering,
      search: search || undefined,
      in_stock: inStockOnly ? 'true' : undefined,
      page: targetPage,
      page_size: pageSize,
    })
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
        console.error('Error fetching best sellers:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [ordering, inStockOnly]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchProducts(newPage);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1);
  };

  return (
    <div className="bg-white min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-50 border border-gold-300 text-gold-800 text-[11px] uppercase tracking-luxury font-semibold mb-3">
            <Award className="w-3.5 h-3.5 text-gold-600" />
            <span>UAE Favorites</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-light">
            Best Sellers
          </h1>
          <p className="text-sm text-stone-500 mt-3 font-light leading-relaxed">
            Our most revered and requested fragrances across Dubai and the Emirates, celebrated for their unforgettable sillage, complex development, and all-day staying power.
          </p>
          {totalCount > 0 && (
            <div className="mt-3 text-xs text-gold-700 font-medium">
              Curated collection of {totalCount.toLocaleString()} iconic perfumes
            </div>
          )}
        </div>

        {/* Filters & Sorting Bar */}
        <div ref={gridTopRef} className="bg-[#FAF9F7] border border-stone-100 p-4 rounded mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search best sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-gold-500 text-charcoal"
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
                className="bg-white border border-stone-200 rounded text-xs px-3 py-2 text-charcoal focus:outline-none focus:border-gold-500"
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
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="aspect-[3/4] skeleton-shimmer rounded" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-lg text-charcoal mb-2">No best seller products found</p>
            <p className="text-xs text-stone-500">Try adjusting your search or filters.</p>
            {search && (
              <button
                onClick={() => { setSearch(''); fetchProducts(1); }}
                className="mt-4 px-4 py-2 bg-charcoal text-white text-xs uppercase tracking-wider rounded font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              itemName="Best Sellers"
            />
          </>
        )}
      </div>
    </div>
  );
}
