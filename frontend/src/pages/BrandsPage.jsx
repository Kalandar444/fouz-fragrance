import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Sparkles } from 'lucide-react';
import { getBrands } from '../api/client';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    getBrands()
      .then((res) => setBrands(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white min-h-screen py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-50 border border-gold-300 text-gold-800 text-[11px] uppercase tracking-luxury font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Artisanal Perfume Houses</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-light">
            Luxury Fragrance Brands
          </h1>
          <p className="text-sm text-stone-500 mt-3 font-light">
            Explore our curated portfolio of world-renowned niche perfumeries and historic fragrance houses available at Fouz Fragrance.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by brand name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-sm text-sm text-charcoal focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="mt-4 text-xs text-stone-400">
            Showing {filteredBrands.length} of {brands.length} luxury perfume houses
          </div>
        </div>

        {/* Brands Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="h-36 rounded skeleton-shimmer" />
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-charcoal">No brands found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-5 py-2 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded-sm"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.slug}`}
                className="group bg-white hover:bg-stone-50/50 border border-stone-200/90 hover:border-gold-500 rounded p-4 flex flex-col items-center justify-between h-36 sm:h-40 transition-all duration-300 hover:shadow-md"
              >
                {/* Brand Logo */}
                <div className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-14 sm:max-h-16 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
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
                    className="font-serif text-sm font-semibold text-charcoal text-center tracking-wider line-clamp-2"
                  >
                    {brand.name}
                  </span>
                </div>

                {/* Brand Name & Count */}
                <div className="w-full text-center border-t border-stone-100 pt-2">
                  <h3 className="font-serif text-xs sm:text-sm text-charcoal group-hover:text-gold-700 transition-colors font-medium tracking-wide truncate">
                    {brand.name}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-light block">
                    {brand.products_count} {brand.products_count === 1 ? 'Fragrance' : 'Fragrances'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
