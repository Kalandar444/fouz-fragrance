import axios from 'axios';
import VPERFUMES_BRANDS from '../data/vperfumesBrands.json';
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
  try {
    const res = await api.get('/brands/');
    const apiBrands = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
    if (apiBrands.length >= 50) {
      return { data: apiBrands };
    }
    return { data: VPERFUMES_BRANDS };
  } catch (err) {
    console.warn('API error fetching brands, using authentic V Perfumes brands catalogue:', err);
    return { data: VPERFUMES_BRANDS };
  }
};

export const getBrandDetail = async (slug, params = {}) => {
  const cleanSlug = (slug || '').toLowerCase().trim().replace(/^\/+|\/+$/g, '');

  const getBrandFallback = () => {
    try {
      const slugLower = cleanSlug;
      // Normalize aliases
      const slugMap = {
        'christian-dior': 'dior',
        'christian': 'dior',
        'bvlgari-le-gemme': 'bvlgari',
        'bulgari': 'bvlgari',
        'dolce-and-gabbana': 'dolce-gabbana',
        'd-and-g': 'dolce-gabbana',
        'd-g': 'dolce-gabbana',
        'dandg': 'dolce-gabbana',
        'dolce': 'dolce-gabbana',
        'ysl': 'yves-saint-laurent',
        'ck': 'calvin-klein',
        'boss': 'hugo-boss',
        'jpg': 'jean-paul-gaultier',
        'ch': 'carolina-herrera',
        'tomford': 'tom-ford',
        'haramain': 'al-haramain',
      };
      let targetSlug = slugMap[slugLower] || slugLower;

      // Find brand info
      const brand = VPERFUMES_BRANDS.find(b => b.slug === targetSlug || b.slug.toLowerCase() === targetSlug) ||
        VPERFUMES_BRANDS.find(b => b.name.toLowerCase() === targetSlug.replace(/-/g, ' ')) || {
        name: cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slug: targetSlug,
        logo: '',
        image_url: '',
        description: `Explore authentic luxury perfumes by ${cleanSlug.replace(/-/g, ' ')}. 100% original UAE stock guaranteed.`,
      };

      const brandNameLower = brand.name.toLowerCase();

      // Filter products belonging to this brand
      let brandProducts = VPERFUMES_PRODUCTS.filter(p => {
        const pBrandSlug = (p.brand_slug || '').toLowerCase();
        const pBrandName = (p.brand || '').toLowerCase();
        return pBrandSlug === targetSlug ||
               pBrandSlug === slugLower ||
               pBrandName === brandNameLower ||
               pBrandName.includes(brandNameLower) ||
               brandNameLower.includes(pBrandName) ||
               (p.slug && p.slug.toLowerCase().startsWith(targetSlug));
      });

      // If still 0, try fuzzy word match on product name
      if (brandProducts.length === 0) {
        const keyword = targetSlug.split('-')[0];
        if (keyword && keyword.length > 2) {
          brandProducts = VPERFUMES_PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(keyword) || 
            p.slug.toLowerCase().includes(keyword)
          );
        }
      }

      // Apply search filter
      if (params.search) {
        const q = params.search.toLowerCase();
        brandProducts = brandProducts.filter(p => p.name.toLowerCase().includes(q));
      }

      // Apply in_stock filter
      if (params.in_stock === 'true') {
        brandProducts = brandProducts.filter(p => p.in_stock);
      }

      // Apply ordering
      if (params.ordering === 'price_asc') {
        brandProducts.sort((a, b) => a.price - b.price);
      } else if (params.ordering === 'price_desc') {
        brandProducts.sort((a, b) => b.price - a.price);
      } else if (params.ordering === 'name_asc') {
        brandProducts.sort((a, b) => a.name.localeCompare(b.name));
      }

      // Pagination
      const page = parseInt(params.page) || 1;
      const pageSize = parseInt(params.page_size) || 24;
      const totalCount = brandProducts.length;
      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const start = (page - 1) * pageSize;
      const paginated = brandProducts.slice(start, start + pageSize);

      return {
        data: {
          brand: brand,
          products: paginated,
          count: totalCount,
          total_pages: totalPages,
          current_page: page,
          page_size: pageSize,
        }
      };
    } catch (fallbackErr) {
      console.error('Brand fallback error:', fallbackErr);
      const defaultBrand = {
        name: cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        slug: cleanSlug,
        description: `Explore authentic perfumes by ${cleanSlug.replace(/-/g, ' ')}.`,
      };
      return {
        data: {
          brand: defaultBrand,
          products: VPERFUMES_PRODUCTS.slice(0, 24),
          count: 24,
          total_pages: 1,
          current_page: 1,
          page_size: 24,
        }
      };
    }
  };

  try {
    const res = await api.get(`/brands/${cleanSlug}/`, { params });
    if (res?.data?.brand && Array.isArray(res?.data?.products) && res.data.products.length > 0) {
      return res;
    }
    return getBrandFallback();
  } catch (err) {
    console.warn(`API error fetching brand ${cleanSlug}, using authentic V Perfumes products:`, err);
    return getBrandFallback();
  }
};

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
