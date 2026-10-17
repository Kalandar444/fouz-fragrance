import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../api/client';

const defaultSettings = {
  business_name: "Fouz Fragrance",
  tagline: "Premium perfumes | Lasting impressions",
  location: "UAE 🇦🇪",
  phone: "+971 54 4540097",
  whatsapp: "971544540097",
  address: "Gold souk, Dubai, United Arab Emirates",
  email: "fouzfragrance02@gmail.com",
  instagram_url: "https://www.instagram.com/fouzfragrance.ae?xtok=MTJ1cGozNDJnYmxzOQ==",
  currency: "AED",
  free_shipping_threshold: 300,
  standard_shipping_fee: 25,
  announcement_text: "Worldwide Delivery Available | 100% Authentic Luxury Niche Fragrances",
  announcement_active: true,
  logo_url: "/fouz_logo.jpg",
  hero_title: "Artisanal Elegance in Every Note",
  hero_subtitle: "Discover an extraordinary curation of the world’s most prestigious niche perfumes, crafted with rare essences and timeless mastery. Worldwide Delivery Available.",
  hero_button_text: "Explore Catalogue",
  hero_button_link: "/shop",
  hero_image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1600",
};

const SettingsContext = createContext({ settings: defaultSettings, loading: false });

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.data) {
          setSettings((prev) => ({
            ...prev,
            ...res.data,
            business_name: (res.data.business_name || 'Fouz Fragrance').replace(/✨/g, '').trim(),
            // Fallback logo if none uploaded in admin
            logo_url: res.data.logo_url || '/fouz_logo.jpg',
          }));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch backend settings, using defaults:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  return ctx && ctx.settings ? ctx : { settings: defaultSettings, loading: false };
};
