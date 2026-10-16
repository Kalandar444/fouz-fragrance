import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast } = useCart();

  return (
    <div className="fixed top-24 right-4 z-50 pointer-events-none max-w-sm w-full px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center p-4 rounded shadow-xl border ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : toast.type === 'info'
                ? 'bg-stone-50 border-stone-200 text-stone-900'
                : 'bg-white border-gold-400 text-charcoal'
            }`}
          >
            <div className="mr-3 flex-shrink-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-stone-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-gold-600" />
              )}
            </div>
            <div className="text-sm font-medium flex-1">{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
