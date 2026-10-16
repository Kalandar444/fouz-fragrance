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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded skeleton-shimmer" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.slug}`}
                className="group relative overflow-hidden p-7 bg-white hover:bg-stone-50/90 border border-stone-200/90 hover:border-gold-500/80 rounded-sm hover:shadow-xl hover:shadow-stone-200/60 transition-all duration-300 flex flex-col justify-between min-h-[230px]"
              >
                {/* Brand Logo — Full Card Background with Original Brand Colors */}
                {brand.logo && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full pointer-events-none select-none flex items-center justify-center p-6 overflow-hidden transition-transform duration-500 ease-out group-hover:scale-105"
                  >
                    <img
                      src={brand.logo}
                      alt=""
                      className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 transition-all duration-300"
                      onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Foreground Content */}
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between mb-2.5 gap-2">
                      <h3 className="font-serif text-xl sm:text-2xl text-charcoal group-hover:text-gold-700 transition-colors font-semibold tracking-wide">
                        {brand.name}
                      </h3>
                      <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-white/95 border border-stone-200 rounded text-stone-700 flex-shrink-0 shadow-xs">
                        {brand.products_count} {brand.products_count === 1 ? 'Fragrance' : 'Fragrances'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed mb-4 font-normal bg-white/90 p-2 rounded backdrop-blur-sm border border-stone-100/70 shadow-xs">
                      {brand.description || `Exquisite handcrafted niche fragrances from ${brand.name}, crafted with rare notes and exceptional longevity.`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200/80 bg-white/85 backdrop-blur-sm px-2 py-1.5 rounded flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-charcoal group-hover:text-gold-700 transition-colors">
                    <span>Explore Fragrances</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform text-gold-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
