import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function FloatingWhatsApp() {
  const { settings } = useSettings();
  const [showTooltip, setShowTooltip] = useState(true);

  const phoneNum = settings.whatsapp || '971544540097';
  const defaultMsg = encodeURIComponent(
    "Hello Fouz Fragrance, I would like to inquire about your luxury perfume collection."
  );
  const whatsappUrl = `https://wa.me/${phoneNum}?text=${defaultMsg}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end flex-col space-y-2 pointer-events-auto">
      {showTooltip && (
        <div className="bg-white border border-stone-200 text-charcoal px-4 py-2.5 rounded-lg shadow-lg text-xs max-w-xs flex items-center justify-between space-x-2 animate-bounce">
          <span>Need help selecting a fragrance? Chat with us!</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-stone-400 hover:text-stone-700"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba59] transition-all transform hover:scale-105 active:scale-95 duration-200"
        aria-label="Chat on WhatsApp"
        id="floating-whatsapp-btn"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
        </span>
      </a>
    </div>
  );
}
