import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, X, ChevronRight, Layers } from 'lucide-react';
import { getBrands } from '../api/client';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');

  useEffect(() => {
    window.scrollTo(0, 0);
    getBrands()
      .then((res) => {
        const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
        // Sort alphabetically A-Z
        const sorted = [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setBrands(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Compute available alphabet letters from brands
  const alphabet = useMemo(() => {
    const letters = new Set();
    brands.forEach((b) => {
      const firstChar = (b.name || '').trim().charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      } else if (firstChar) {
        letters.add('#');
      }
    });
    const sortedLetters = Array.from(letters).filter((l) => l !== '#').sort();
    if (letters.has('#')) sortedLetters.push('#');
    return ['ALL', ...sortedLetters];
  }, [brands]);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const name = (b.name || '').toLowerCase();
      const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      if (selectedLetter === 'ALL') return true;

      const firstChar = (b.name || '').trim().charAt(0).toUpperCase();
      if (selectedLetter === '#') {
        return !/[A-Z]/.test(firstChar);
      }
      return firstChar === selectedLetter;
    });
  }, [brands, searchTerm, selectedLetter]);

  return (
    <div className="bg-[#FAF9F7] min-h-screen py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg border border-stone-200/80 p-5 sm:p-8 mb-6 sm:mb-8 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-50 text-gold-700 text-[10px] sm:text-xs uppercase tracking-luxury font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-gold-600" />
                <span>Niche Perfume Houses</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-normal text-charcoal tracking-tight">
                Brands & Perfume Houses
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 sm:mt-1.5 font-light">
                Explore our curated portfolio of <span className="font-medium text-charcoal">{brands.length || '700+'}</span> authentic luxury perfume houses from Dubai and across the globe.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search brands by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value && selectedLetter !== 'ALL') {
                    setSelectedLetter('ALL');
                  }
                }}
                className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-md text-xs sm:text-sm text-charcoal placeholder-stone-400 focus:outline-none focus:border-gold-500 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-charcoal"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Alphabet Quick Jump Pill Bar (Mobile Horizontally Scrollable) */}
          <div className="mt-5 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
              {alphabet.map((letter) => {
                const isActive = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => {
                      setSelectedLetter(letter);
                      setSearchTerm('');
                    }}
                    className={`flex-shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-charcoal text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-charcoal'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-500 mb-4 px-1">
          <span>
            Showing <strong className="text-charcoal font-semibold">{filteredBrands.length}</strong> {filteredBrands.length === 1 ? 'brand' : 'brands'}
            {selectedLetter !== 'ALL' && ` starting with "${selectedLetter}"`}
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
          {(searchTerm || selectedLetter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLetter('ALL');
              }}
              className="text-gold-700 hover:underline font-medium text-[11px] uppercase tracking-wider"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Brands Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-stone-200/80 p-4 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-[1/1] skeleton-shimmer" />
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="bg-white rounded-lg border border-stone-200 p-8 sm:p-12 text-center my-6">
            <Layers className="w-10 h-10 text-gold-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg sm:text-xl text-charcoal mb-1">No Brands Found</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-5">
              We couldn't find any brand matching {searchTerm ? `"${searchTerm}"` : `letter "${selectedLetter}"`}.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLetter('ALL');
              }}
              className="px-5 py-2 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-gold-600 transition-colors"
            >
              Show All Brands
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
            {filteredBrands.map((brand) => {
              const hasImage = Boolean(brand.logo || brand.image_url);
              const initials = (brand.name || '')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'F';

              return (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.slug}`}
                  className="group bg-white rounded-lg border border-stone-200/80 hover:border-gold-400 hover:shadow-md p-3 sm:p-4.5 flex flex-col items-center justify-between transition-all duration-200 text-center relative overflow-hidden min-h-[140px] sm:min-h-[170px]"
                >
                  {/* Top: Logo or Monogram */}
                  <div className="w-full flex-1 flex items-center justify-center p-1.5">
                    {hasImage ? (
                      <img
                        src={brand.logo || brand.image_url}
                        alt={brand.name}
                        loading="lazy"
                        className="max-h-14 sm:max-h-16 max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.parentElement?.querySelector('.monogram-fallback');
                          if (fb) fb.classList.remove('hidden');
                        }}
                      />
                    ) : null}

                    {/* Elegant Monogram fallback if image doesn't exist or fails */}
                    <div
                      className={`monogram-fallback ${hasImage ? 'hidden' : 'flex'} w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF9F7] border border-stone-200/80 items-center justify-center text-charcoal font-serif font-semibold text-sm sm:text-base group-hover:bg-gold-50 group-hover:border-gold-300 group-hover:text-gold-700 transition-colors shadow-2xs`}
                    >
                      {initials}
                    </div>
                  </div>

                  {/* Bottom: Brand Name & Arrow */}
                  <div className="w-full pt-2 border-t border-stone-100 flex items-center justify-center gap-1">
                    <span className="font-serif text-xs sm:text-sm font-medium text-charcoal group-hover:text-gold-700 transition-colors truncate">
                      {brand.name}
                    </span>
                    <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-gold-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
