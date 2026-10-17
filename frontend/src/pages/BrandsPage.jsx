import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getBrands } from '../api/client';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    getBrands()
      .then((res) => {
        const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
        // Sort alphabetically A-Z matching Image 2
        const sorted = [...raw].sort((a, b) => a.name.localeCompare(b.name));
        setBrands(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Matching Image 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-stone-900 tracking-tight">
              Brands
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 font-light">
              Explore our curated portfolio of {brands.length > 0 ? brands.length : 'luxury'} niche perfume houses
            </p>
          </div>

          {/* Minimal Search Input */}
          <div className="w-full sm:w-72 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50/70 border border-stone-200 rounded-sm text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Brands Grid - Exact Image 2 5-column seamless layout */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6 sm:gap-x-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="w-full h-24 bg-stone-100 rounded-sm" />
                <div className="w-24 h-4 bg-stone-100 rounded-sm" />
              </div>
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-lg text-stone-800">No brands found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-6 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-gold-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 sm:gap-y-16 gap-x-6 sm:gap-x-10 items-end">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.slug}`}
                className="group flex flex-col items-start sm:items-center text-left sm:text-center transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Brand Logo Container */}
                <div className="w-full h-24 sm:h-28 flex items-center justify-start sm:justify-center p-2 mb-3">
                  {(brand.logo || brand.image_url) ? (
                    <img
                      src={brand.logo || brand.image_url}
                      alt={brand.name}
                      loading="lazy"
                      className="max-h-20 sm:max-h-24 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
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
                    className="font-serif text-sm font-semibold text-stone-900 tracking-wider"
                  >
                    {brand.name}
                  </span>
                </div>

                {/* Brand Name with arrow */}
                <span className="font-serif text-xs sm:text-sm text-stone-900 group-hover:text-gold-700 transition-colors inline-flex items-center gap-1 font-medium">
                  <span>{brand.name}</span>
                  <span className="text-stone-400 group-hover:text-gold-700 group-hover:translate-x-0.5 transition-all">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
