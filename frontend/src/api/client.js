import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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
export const getBrands = () => api.get('/brands/');
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
