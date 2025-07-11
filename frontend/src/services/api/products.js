/**
 * PRODUCTION Products API - Real database operations
 * Trường Phát Computer Hòa Bình
 */

import axios from 'axios';

const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'https://khoaugment-api.namhbcf1.workers.dev';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const productsAPI = {
  /**
   * Get all products with pagination and filters
   */
  getProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Products API Error:', error);
      throw error;
    }
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Product API Error:', error);
      throw error;
    }
  },

  /**
   * Create new product
   */
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Create Product API Error:', error);
      throw error;
    }
  },

  /**
   * Update existing product
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Update Product API Error:', error);
      throw error;
    }
  },

  /**
   * Delete product
   */
  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete Product API Error:', error);
      throw error;
    }
  },

  /**
   * Get product categories
   */
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Categories API Error:', error);
      throw error;
    }
  },

  /**
   * Search products by barcode
   */
  searchByBarcode: async (barcode) => {
    try {
      const response = await apiClient.get(`/products/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      console.error('Barcode Search API Error:', error);
      throw error;
    }
  },

  /**
   * Get low stock products
   */
  getLowStockProducts: async () => {
    try {
      const response = await apiClient.get('/products/low-stock');
      return response.data;
    } catch (error) {
      console.error('Low Stock API Error:', error);
      throw error;
    }
  }
};

export default productsAPI;