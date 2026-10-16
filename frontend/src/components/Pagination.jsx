import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 24,
  onPageChange,
  itemName = 'Items',
}) {
  const [jumpPage, setJumpPage] = useState('');

  if (totalPages <= 1 && totalCount <= pageSize) {
    return null;
  }

  // Calculate range displayed
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPage('');
    }
  };

  return (
    <div className="mt-14 pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Count information */}
      <div className="text-xs text-stone-500 font-light order-2 sm:order-1">
        Showing <span className="font-medium text-charcoal">{startItem.toLocaleString()}</span> to{' '}
        <span className="font-medium text-charcoal">{endItem.toLocaleString()}</span> of{' '}
        <span className="font-medium text-charcoal">{totalCount.toLocaleString()}</span> {itemName}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 order-1 sm:order-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
          className="p-2 rounded border border-stone-200 text-stone-600 hover:text-charcoal hover:border-gold-500 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
          className="px-3 py-1.5 rounded border border-stone-200 text-xs font-medium text-stone-700 hover:text-charcoal hover:border-gold-500 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-xs text-stone-400 select-none">
                  •••
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[34px] h-[34px] px-2.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-charcoal text-gold-300 font-semibold shadow-xs border border-charcoal scale-105'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-gold-500 hover:text-gold-700 hover:bg-stone-50'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
          className="px-3 py-1.5 rounded border border-stone-200 text-xs font-medium text-stone-700 hover:text-charcoal hover:border-gold-500 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
          className="p-2 rounded border border-stone-200 text-stone-600 hover:text-charcoal hover:border-gold-500 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Jump Input */}
      {totalPages > 5 && (
        <form onSubmit={handleJumpSubmit} className="flex items-center gap-2 text-xs order-3">
          <span className="text-stone-400 font-light">Page</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            placeholder={String(currentPage)}
            className="w-12 px-2 py-1 bg-stone-50 border border-stone-200 rounded text-center text-xs text-charcoal focus:outline-none focus:border-gold-500"
          />
          <span className="text-stone-400 font-light">of {totalPages}</span>
          <button
            type="submit"
            className="px-2.5 py-1 bg-stone-100 hover:bg-charcoal hover:text-white border border-stone-200 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}
