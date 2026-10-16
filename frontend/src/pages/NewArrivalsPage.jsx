import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowUpDown } from 'lucide-react';
import { getProducts } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState('newest');
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getProducts({
      new_arrivals: 'true',
      ordering: ordering,
      search: search || undefined,
      in_stock: inStockOnly ? 'true' : undefined,
    })
      .then((res) => {
        const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
        setProducts(arr);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [ordering, inStockOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    getProducts({
      new_arrivals: 'true',
      ordering: ordering,
      search: search || undefined,
      in_stock: inStockOnly ? 'true' : undefined,
    })
      .then((res) => {
        const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
        setProducts(arr);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-50 border border-gold-300 text-gold-800 text-[11px] uppercase tracking-luxury font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Freshly Arrived</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-light">
            New Arrivals
          </h1>
          <p className="text-sm text-stone-500 mt-3 font-light leading-relaxed">
            The latest creations to grace our Gold Souk boutique. Experience the newest olfactory narratives from pioneering niche master perfumers.
          </p>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="bg-[#FAF9F7] border border-stone-100 p-4 rounded mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search new arrivals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded text-xs focus:outline-none focus:border-gold-500"
            />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square skeleton-shimmer rounded" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-lg text-charcoal mb-2">No new arrivals found</p>
            <p className="text-xs text-stone-500">Check back soon as new perfumes arrive regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
