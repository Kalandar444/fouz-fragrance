import axios from 'axios';
import AMBERIYA_BRANDS from '../data/amberiyaBrands.json';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : 'https://fouz-fragrance-backend.onrender.com/api'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const getSettings = () => api.get('/settings/');
export const getBanners = () => api.get('/banners/');

export const getBrands = async () => {
  const amberiyaBySlug = new Map(AMBERIYA_BRANDS.map(b => [b.slug, b]));
  const amberiyaByName = new Map(AMBERIYA_BRANDS.map(b => [b.name.toLowerCase().trim(), b]));

  try {
    const res = await api.get('/brands/');
    const apiBrands = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);

    // Merge: start with all 198 authentic Amberiya brands
    const mergedMap = new Map();
    AMBERIYA_BRANDS.forEach(b => mergedMap.set(b.slug, { ...b }));

    // Overlay API brands data (like products_count, custom fields, etc.)
    apiBrands.forEach(b => {
      const existing = mergedMap.get(b.slug) || amberiyaByName.get(b.name?.toLowerCase().trim());
      if (existing) {
        mergedMap.set(existing.slug, {
          ...existing,
          ...b,
          // Always ensure high-res logo from amberiya if backend logo is empty
          logo: b.logo || existing.logo,
          image_url: b.image_url || existing.image_url || existing.logo,
        });
      } else {
        const matched = amberiyaByName.get(b.name?.toLowerCase().trim());
        mergedMap.set(b.slug, {
          ...b,
          logo: b.logo || matched?.logo || '',
          image_url: b.image_url || matched?.image_url || matched?.logo || '',
        });
      }
    });

    const finalBrands = Array.from(mergedMap.values());
    return { data: finalBrands };
  } catch (err) {
    console.warn('API error fetching brands, using authentic Amberiya brand catalogue:', err);
    return { data: AMBERIYA_BRANDS };
  }
};

export const getBrandDetail = (slug, params = {}) => api.get(`/brands/${slug}/`, { params });
export const getCategories = () => api.get('/categories/');
export const getCollections = () => api.get('/collections/');
export const getCollectionDetail = (slug) => api.get(`/collections/${slug}/`);
export const getProducts = (params = {}) => api.get('/products/', { params });
export const getProductDetail = (slug) => api.get(`/products/${slug}/`);
export const validateCart = (items) => api.post('/cart/validate/', { items });
export const createOrder = (orderData) => api.post('/orders/create/', orderData);
export const getOrderDetail = (reference) => api.get(`/orders/${reference}/`);
export const submitContact = (contactData) => api.post('/contact/', contactData);

export default api;
