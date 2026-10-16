import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Search } from 'lucide-react';
import { getCollections } from '../api/client';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    getCollections()
      .then((res) => setCollections(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCollections = collections.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white min-h-screen py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-50 border border-gold-300 text-gold-800 text-[11px] uppercase tracking-luxury font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Curated Brand Anthologies</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-light">
            Perfume Collections
          </h1>
          <p className="text-sm text-stone-500 mt-3 font-light leading-relaxed">
            Explore our complete portfolio of over 170 world-renowned luxury perfume houses, rare artisanal collections, and signature fragrances.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search collections & brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-sm text-sm text-charcoal focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          <div className="mt-4 text-xs text-stone-400">
            Showing {filteredCollections.length} of {collections.length} collections
          </div>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[4/3] skeleton-shimmer rounded-sm" />
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-charcoal">No collections found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-5 py-2 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-gold-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCollections.map((col) => (
              <Link
                key={col.id}
                to={`/collections/${col.slug}`}
                className="group relative rounded-sm overflow-hidden aspect-[4/3] bg-stone-900 shadow-sm hover:shadow-xl transition-all duration-300 flex items-end p-5"
              >
                {/* Background image */}
                <div className="absolute inset-0 z-0 bg-stone-900">
                  <img
                    src={col.image || 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=900'}
                    alt={col.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=900';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>

                {/* Text */}
                <div className="relative z-10 text-white w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] uppercase tracking-luxury text-gold-400 font-bold">
                      Collection
                    </span>
                    <span className="text-[11px] text-stone-300 font-light">
                      {col.products_count ? `${col.products_count} Fragrances` : 'Curated'}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-light tracking-wide text-white group-hover:text-gold-300 transition-colors line-clamp-1">
                    {col.title}
                  </h3>

                  {col.description && (
                    <p className="text-[11px] text-stone-300 mt-1 line-clamp-2 font-light leading-relaxed">
                      {col.description}
                    </p>
                  )}

                  <div className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-semibold text-gold-400 group-hover:text-white transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
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
