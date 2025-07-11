/**
 * Order Management Service
 * Real backend integration for order operations
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS.js';
import { apiClient } from './apiClient.js';

/**
 * Order Service Class
 * Handles all order-related API calls
 */
class OrderService {
  /**
   * Get all orders with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Order status filter
   * @param {string} params.customer_id - Customer ID filter
   * @param {string} params.date_from - Start date filter
   * @param {string} params.date_to - End date filter
   * @param {string} params.sort - Sort field
   * @param {string} params.order - Sort order (asc/desc)
   * @returns {Promise<Object>} Orders list with pagination
   */
  async getOrders(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
          summary: response.data.summary,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get orders');
      }
    } catch (error) {
      console.error('Get orders error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy danh sách đơn hàng'
      );
    }
  }

  /**
   * Get order by ID
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId));
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get order');
      }
    } catch (error) {
      console.error('Get order error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy thông tin đơn hàng'
      );
    }
  }

  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @param {Array} orderData.items - Order items
   * @param {Object} orderData.customer - Customer information
   * @param {Object} orderData.payment - Payment information
   * @param {Object} orderData.shipping - Shipping information
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi tạo đơn hàng'
      );
    }
  }

  /**
   * Update order
   * @param {string|number} orderId - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  async updateOrder(orderId, orderData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.UPDATE(orderId), orderData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Update order error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi cập nhật đơn hàng'
      );
    }
  }

  /**
   * Cancel order
   * @param {string|number} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelOrder(orderId, reason) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.CANCEL(orderId), {
        reason
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi hủy đơn hàng'
      );
    }
  }

  /**
   * Process refund for order
   * @param {string|number} orderId - Order ID
   * @param {Object} refundData - Refund data
   * @param {number} refundData.amount - Refund amount
   * @param {string} refundData.reason - Refund reason
   * @param {Array} refundData.items - Items to refund
   * @returns {Promise<Object>} Refund response
   */
  async refundOrder(orderId, refundData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.REFUND(orderId), refundData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund order error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi hoàn tiền đơn hàng'
      );
    }
  }

  /**
   * Print order receipt
   * @param {string|number} orderId - Order ID
   * @param {Object} options - Print options
   * @returns {Promise<Object>} Print response
   */
  async printReceipt(orderId, options = {}) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.PRINT_RECEIPT(orderId), options);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to print receipt');
      }
    } catch (error) {
      console.error('Print receipt error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi in hóa đơn'
      );
    }
  }

  /**
   * Get order payment status
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(orderId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.PAYMENT_STATUS(orderId));
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get payment status');
      }
    } catch (error) {
      console.error('Get payment status error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy trạng thái thanh toán'
      );
    }
  }

  /**
   * Update delivery status
   * @param {string|number} orderId - Order ID
   * @param {Object} deliveryData - Delivery data
   * @param {string} deliveryData.status - Delivery status
   * @param {string} deliveryData.tracking_number - Tracking number
   * @param {string} deliveryData.notes - Delivery notes
   * @returns {Promise<Object>} Delivery update response
   */
  async updateDeliveryStatus(orderId, deliveryData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.DELIVERY_STATUS(orderId), deliveryData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to update delivery status');
      }
    } catch (error) {
      console.error('Update delivery status error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi cập nhật trạng thái giao hàng'
      );
    }
  }

  /**
   * Calculate order total
   * @param {Array} items - Order items
   * @param {Object} discounts - Applied discounts
   * @param {Object} shipping - Shipping information
   * @returns {Promise<Object>} Order total calculation
   */
  async calculateOrderTotal(items, discounts = {}, shipping = {}) {
    try {
      const response = await apiClient.post('/orders/calculate-total', {
        items,
        discounts,
        shipping
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to calculate order total');
      }
    } catch (error) {
      console.error('Calculate order total error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi tính tổng đơn hàng'
      );
    }
  }

  /**
   * Get order statistics
   * @param {Object} filters - Date and other filters
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStatistics(filters = {}) {
    try {
      const response = await apiClient.get('/orders/statistics', { params: filters });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get order statistics');
      }
    } catch (error) {
      console.error('Get order statistics error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy thống kê đơn hàng'
      );
    }
  }
}

// Create and export singleton instance
const orderService = new OrderService();
export default orderService;
