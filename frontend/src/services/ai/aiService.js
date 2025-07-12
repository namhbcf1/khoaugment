/**
 * AI Service
 * Handles all AI-related API operations
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS';
import apiClient from '../api/apiClient';

/**
 * AI Service Class
 * Manages all AI operations
 */
class AIService {
  /**
   * Get customer segmentation
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Customer segmentation data
   */
  async getCustomerSegmentation(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI.CUSTOMER_SEGMENTATION, { params });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching customer segmentation:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải phân khúc khách hàng'
      );
    }
  }

  /**
   * Get demand forecasting
   * @param {Object} params - Query parameters
   * @param {string} params.product_id - Product ID (optional)
   * @param {string} params.category_id - Category ID (optional)
   * @param {string} params.start_date - Start date
   * @param {string} params.end_date - End date
   * @param {string} params.granularity - Granularity (day, week, month)
   * @returns {Promise<Object>} Demand forecasting data
   */
  async getDemandForecasting(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI.DEMAND_FORECASTING, { params });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching demand forecasting:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải dự báo nhu cầu'
      );
    }
  }

  /**
   * Get price optimization
   * @param {string|number} productId - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Price optimization data
   */
  async getPriceOptimization(productId, params = {}) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.AI.PRICE_OPTIMIZATION}/${productId}`, { params });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching price optimization for product #${productId}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải tối ưu hóa giá'
      );
    }
  }

  /**
   * Get product recommendations
   * @param {Object} params - Query parameters
   * @param {string} params.user_id - User ID (optional)
   * @param {string} params.product_id - Product ID (optional)
   * @param {Array} params.cart_items - Cart items (optional)
   * @param {number} params.limit - Number of recommendations to return
   * @returns {Promise<Object>} Product recommendations data
   */
  async getProductRecommendations(params = {}) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AI.PRODUCT_RECOMMENDATION, params);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching product recommendations:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải đề xuất sản phẩm'
      );
    }
  }

  /**
   * Get cross-sell recommendations
   * @param {Array} cartItems - Cart items
   * @param {number} limit - Number of recommendations to return
   * @returns {Promise<Object>} Cross-sell recommendations data
   */
  async getCrossSellRecommendations(cartItems, limit = 5) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AI.CROSS_SELL, {
        cart_items: cartItems,
        limit
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching cross-sell recommendations:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải đề xuất bán kèm'
      );
    }
  }

  /**
   * Get up-sell recommendations
   * @param {Array} cartItems - Cart items
   * @param {number} limit - Number of recommendations to return
   * @returns {Promise<Object>} Up-sell recommendations data
   */
  async getUpSellRecommendations(cartItems, limit = 5) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AI.UPSELL, {
        cart_items: cartItems,
        limit
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching up-sell recommendations:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải đề xuất nâng cấp'
      );
    }
  }

  /**
   * Get anomaly detection
   * @param {Object} params - Query parameters
   * @param {string} params.start_date - Start date
   * @param {string} params.end_date - End date
   * @param {string} params.type - Anomaly type (sales, inventory, etc.)
   * @returns {Promise<Object>} Anomaly detection data
   */
  async getAnomalyDetection(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI.ANOMALY_DETECTION, { params });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching anomaly detection:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải phát hiện bất thường'
      );
    }
  }

  /**
   * Get customer lifetime value
   * @param {string|number} customerId - Customer ID
   * @returns {Promise<Object>} Customer lifetime value data
   */
  async getCustomerLifetimeValue(customerId) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.AI.CUSTOMER_LIFETIME_VALUE}/${customerId}`);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching customer lifetime value for customer #${customerId}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải giá trị vòng đời khách hàng'
      );
    }
  }

  /**
   * Get churn prediction
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Churn prediction data
   */
  async getChurnPrediction(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI.CHURN_PREDICTION, { params });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching churn prediction:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải dự đoán khách hàng rời bỏ'
      );
    }
  }

  /**
   * Get inventory optimization
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Inventory optimization data
   */
  async getInventoryOptimization(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AI.INVENTORY_OPTIMIZATION, { params });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching inventory optimization:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải tối ưu hóa tồn kho'
      );
    }
  }
}

// Create and export singleton instance
const aiService = new AIService();
export default aiService; 