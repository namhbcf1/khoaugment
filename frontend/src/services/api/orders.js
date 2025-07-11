/**
 * PRODUCTION Orders API - Real database operations
 * Trường Phát Computer Hòa Bình
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://khoaugment-api.namhbcf1.workers.dev';

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

const ordersAPI = {
  /**
   * Get all orders with pagination and filters
   */
  getOrders: async (params = {}) => {
    try {
      const response = await apiClient.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Orders API Error:', error);
      throw error;
    }
  },

  /**
   * Get single order by ID
   */
  getOrder: async (id) => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Order API Error:', error);
      throw error;
    }
  },

  /**
   * Create new order (POS checkout)
   */
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Create Order API Error:', error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update Order Status API Error:', error);
      throw error;
    }
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id, reason) => {
    try {
      const response = await apiClient.patch(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Cancel Order API Error:', error);
      throw error;
    }
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (period = 'today') => {
    try {
      const response = await apiClient.get(`/orders/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Order Stats API Error:', error);
      throw error;
    }
  },

  /**
   * Process payment for order
   */
  processPayment: async (orderId, paymentData) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Process Payment API Error:', error);
      throw error;
    }
  },

  /**
   * Get order receipt data
   */
  getReceipt: async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}/receipt`);
      return response.data;
    } catch (error) {
      console.error('Get Receipt API Error:', error);
      throw error;
    }
  }
};

export default ordersAPI;