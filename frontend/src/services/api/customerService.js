/**
 * Customer Service
 * Handles all customer-related API operations
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS';
import apiClient from './apiClient';

/**
 * Customer Service Class
 * Manages all customer operations
 */
class CustomerService {
  /**
   * Get all customers with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.sort_by - Sort field
   * @param {string} params.sort_dir - Sort direction (asc/desc)
   * @returns {Promise<Object>} Customers data with pagination
   */
  async getCustomers(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.LIST, { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải danh sách khách hàng'
      );
    }
  }

  /**
   * Get customer by ID
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  async getCustomerById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching customer #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải thông tin khách hàng'
      );
    }
  }

  /**
   * Create new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer data
   */
  async createCustomer(customerData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CUSTOMERS.CREATE, customerData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tạo khách hàng'
      );
    }
  }

  /**
   * Update customer
   * @param {string|number} id - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise<Object>} Updated customer data
   */
  async updateCustomer(id, customerData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CUSTOMERS.UPDATE(id), customerData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error updating customer #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi cập nhật khách hàng'
      );
    }
  }

  /**
   * Delete customer
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteCustomer(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CUSTOMERS.DELETE(id));
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error deleting customer #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xóa khách hàng'
      );
    }
  }

  /**
   * Search customers
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Search results
   */
  async searchCustomers(query, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.SEARCH, { 
        params: { 
          query,
          ...params
        } 
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error searching customers:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tìm kiếm khách hàng'
      );
    }
  }

  /**
   * Get customer loyalty information
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} Loyalty data
   */
  async getCustomerLoyalty(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.LOYALTY(id));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching loyalty for customer #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải thông tin tích điểm'
      );
    }
  }

  /**
   * Get customer loyalty history
   * @param {string|number} id - Customer ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Loyalty history data
   */
  async getCustomerLoyaltyHistory(id, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.LOYALTY_HISTORY(id), { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching loyalty history for customer #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải lịch sử tích điểm'
      );
    }
  }

  /**
   * Add loyalty points to customer
   * @param {string|number} id - Customer ID
   * @param {Object} pointsData - Points data
   * @param {number} pointsData.points - Points to add
   * @param {string} pointsData.reason - Reason for adding points
   * @returns {Promise<Object>} Updated loyalty data
   */
  async addLoyaltyPoints(id, pointsData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CUSTOMERS.ADD_POINTS(id), pointsData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error adding points for customer #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi thêm điểm tích lũy'
      );
    }
  }

  /**
   * Redeem loyalty points
   * @param {string|number} id - Customer ID
   * @param {Object} redeemData - Redeem data
   * @param {number} redeemData.points - Points to redeem
   * @param {string} redeemData.reward_id - Reward ID
   * @returns {Promise<Object>} Updated loyalty data
   */
  async redeemLoyaltyPoints(id, redeemData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CUSTOMERS.REDEEM_POINTS(id), redeemData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error redeeming points for customer #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi đổi điểm tích lũy'
      );
    }
  }

  /**
   * Get customer analytics
   * @param {string|number} id - Customer ID
   * @returns {Promise<Object>} Customer analytics data
   */
  async getCustomerAnalytics(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.ANALYTICS(id));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching analytics for customer #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải phân tích khách hàng'
      );
    }
  }

  /**
   * Get customer segments
   * @returns {Promise<Object>} Customer segments data
   */
  async getCustomerSegments() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.SEGMENTS);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải phân khúc khách hàng'
      );
    }
  }
}

// Create and export singleton instance
const customerService = new CustomerService();
export default customerService; 