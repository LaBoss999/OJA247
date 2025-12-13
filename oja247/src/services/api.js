import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists (for authenticated routes)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Business API calls
export const getAllBusinesses = () => axiosInstance.get('/api/businesses');
export const getBusinessById = (id) => axiosInstance.get(`/api/businesses/${id}`);
export const createBusiness = (businessData) => axiosInstance.post('/api/businesses', businessData);
export const updateBusiness = (id, businessData) => axiosInstance.put(`/api/businesses/${id}`, businessData);
export const deleteBusiness = (id) => axiosInstance.delete(`/api/businesses/${id}`);

// Product API calls
export const getAllProducts = () => axiosInstance.get('/api/products');
export const getProductsByBusiness = (businessId) => axiosInstance.get(`/api/products/business/${businessId}`);
export const createProduct = (productData) => axiosInstance.post('/api/products', productData);
export const updateProduct = (id, productData) => axiosInstance.put(`/api/products/${id}`, productData);
export const deleteProduct = (id) => axiosInstance.delete(`/api/products/${id}`);

// Auth API calls
export const login = (credentials) => axiosInstance.post('/api/auth/login', credentials);
export const register = (userData) => axiosInstance.post('/api/auth/register', userData);
export const verifyToken = () => axiosInstance.get('/api/auth/verify');

// Upload API calls
export const uploadImage = (formData) => {
  return axiosInstance.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Admin API calls
export const getAdminStats = () => axiosInstance.get('/api/admin/stats');
export const getAllUsers = () => axiosInstance.get('/api/admin/users');

export default axiosInstance;