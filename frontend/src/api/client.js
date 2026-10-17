import axios from 'axios';
import AMBERIYA_BRANDS from '../data/amberiyaBrands.json';
import VPERFUMES_PRODUCTS from '../data/vperfumesProducts.json';

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
  const amberiyaByName = new Map(AMBERIYA_BRANDS.map(b => [b.name.toLowerCase().trim(), b]));

  try {
    const res = await api.get('/brands/');
    const apiBrands = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);

    const mergedMap = new Map();
    AMBERIYA_BRANDS.forEach(b => mergedMap.set(b.slug, { ...b }));

    apiBrands.forEach(b => {
      const existing = mergedMap.get(b.slug) || amberiyaByName.get(b.name?.toLowerCase().trim());
      if (existing) {
        mergedMap.set(existing.slug, {
          ...existing,
          ...b,
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

    return { data: Array.from(mergedMap.values()) };
  } catch (err) {
    console.warn('API error fetching brands, using authentic Amberiya brand catalogue:', err);
    return { data: AMBERIYA_BRANDS };
  }
};

export const getBrandDetail = (slug, params = {}) => api.get(`/brands/${slug}/`, { params });
export const getCategories = () => api.get('/categories/');
export const getCollections = () => api.get('/collections/');
export const getCollectionDetail = (slug) => api.get(`/collections/${slug}/`);

export const getProducts = async (params = {}) => {
  const getFallbackPaginated = () => {
    let filtered = [...VPERFUMES_PRODUCTS];
    if (params.exclusive === 'true') {
      filtered = filtered.filter(p => p.is_exclusive);
    }
    if (params.best_sellers === 'true') {
      filtered = filtered.filter(p => p.is_best_seller);
    }
    if (params.new_arrivals === 'true') {
      filtered = filtered.filter(p => p.is_new_arrival);
    }
    if (params.brand) {
      filtered = filtered.filter(p => p.brand?.toLowerCase() === params.brand.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (params.in_stock === 'true') {
      filtered = filtered.filter(p => p.in_stock);
    }
    if (params.min_price) {
      filtered = filtered.filter(p => p.price >= Number(params.min_price));
    }
    if (params.max_price) {
      filtered = filtered.filter(p => p.price <= Number(params.max_price));
    }

    // Ordering
    if (params.ordering === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (params.ordering === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (params.ordering === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.page_size) || 24;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      data: {
        count: totalCount,
        total_pages: totalPages,
        current_page: page,
        page_size: pageSize,
        results: paginated,
      }
    };
  };

  try {
    const res = await api.get('/products/', { params });
    // Only accept backend response if it has been updated with the full 2537 catalog (or >= 400 for exclusives)
    const count = res?.data?.count;
    if (res?.data && res.data.results && typeof count === 'number') {
      if (params.exclusive === 'true' && count >= 100) {
        return res;
      }
      if (count >= 2000) {
        return res;
      }
    }
    return getFallbackPaginated();
  } catch (err) {
    console.warn('API error fetching products, using authentic vperfumes catalogue:', err);
    return getFallbackPaginated();
  }
};

export const getProductDetail = async (slug) => {
  try {
    const res = await api.get(`/products/${slug}/`);
    if (res?.data) return res;
  } catch (err) {
    // Check vperfumes fallback
    const found = VPERFUMES_PRODUCTS.find(p => p.slug === slug);
    if (found) {
      return { data: found };
    }
    throw err;
  }
  const found = VPERFUMES_PRODUCTS.find(p => p.slug === slug);
  if (found) {
    return { data: found };
  }
  return { data: null };
};

export const validateCart = (items) => api.post('/cart/validate/', { items });
export const createOrder = (orderData) => api.post('/orders/create/', orderData);
export const getOrderDetail = (reference) => api.get(`/orders/${reference}/`);
export const submitContact = (contactData) => api.post('/contact/', contactData);

export default api;
