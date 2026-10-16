import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getCollectionDetail } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function CollectionDetailPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getCollectionDetail(slug)
      .then((res) => {
        setCollection(res.data.collection);
        setProducts(res.data.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="h-10 w-48 mx-auto skeleton-shimmer rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square skeleton-shimmer rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-charcoal mb-4">Collection Not Found</h2>
        <Link to="/collections" className="px-6 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded">
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8">
          <Link to="/" className="hover:text-gold-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/collections" className="hover:text-gold-700">Collections</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal font-medium">{collection.title}</span>
        </nav>

        {/* Collection Header */}
        <div className="bg-[#FAF9F7] border border-stone-100 p-8 md:p-12 rounded mb-12 text-center max-w-4xl mx-auto">
          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            Curated Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-light mt-2 mb-4">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto font-light">
              {collection.description}
            </p>
          )}
          <div className="mt-6 text-xs text-stone-500">
            {products.length} {products.length === 1 ? 'fragrance' : 'fragrances'} in this collection
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-charcoal mb-4">No fragrances in this collection at present.</p>
            <Link to="/shop" className="px-6 py-2.5 bg-charcoal text-white text-xs uppercase tracking-wider font-semibold rounded">
              Explore All Fragrances
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
