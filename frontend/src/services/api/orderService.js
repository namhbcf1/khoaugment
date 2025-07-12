/**
 * Order Service
 * Handles all order-related API operations
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS';
import cashDrawerService from '../hardware/cashDrawer';
import printerService from '../hardware/printerService';
import apiClient from './apiClient';

/**
 * Order Service Class
 * Manages all order operations
 */
class OrderService {
  /**
   * Get all orders with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Order status filter
   * @param {string} params.start_date - Start date filter (YYYY-MM-DD)
   * @param {string} params.end_date - End date filter (YYYY-MM-DD)
   * @param {string} params.search - Search term
   * @param {string} params.sort_by - Sort field
   * @param {string} params.sort_dir - Sort direction (asc/desc)
   * @returns {Promise<Object>} Orders data with pagination
   */
  async getOrders(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải danh sách đơn hàng'
      );
    }
  }

  /**
   * Get order by ID
   * @param {string|number} id - Order ID
   * @returns {Promise<Object>} Order data
   */
  async getOrderById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching order #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải thông tin đơn hàng'
      );
    }
  }

  /**
   * Get order items
   * @param {string|number} orderId - Order ID
   * @returns {Promise<Object>} Order items data
   */
  async getOrderItems(orderId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.ITEMS(orderId));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching items for order #${orderId}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải thông tin sản phẩm trong đơn hàng'
      );
    }
  }

  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order data
   */
  async createOrder(orderData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tạo đơn hàng'
      );
    }
  }

  /**
   * Update order
   * @param {string|number} id - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} Updated order data
   */
  async updateOrder(id, orderData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.UPDATE(id), orderData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error updating order #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi cập nhật đơn hàng'
      );
    }
  }

  /**
   * Update order status
   * @param {string|number} id - Order ID
   * @param {string} status - New status
   * @param {string} note - Status change note
   * @returns {Promise<Object>} Updated order data
   */
  async updateOrderStatus(id, status, note = '') {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), {
        status,
        note
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error updating status for order #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng'
      );
    }
  }

  /**
   * Cancel order
   * @param {string|number} id - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancelled order data
   */
  async cancelOrder(id, reason = '') {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.CANCEL(id), { reason });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error cancelling order #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi hủy đơn hàng'
      );
    }
  }

  /**
   * Process refund for order
   * @param {string|number} id - Order ID
   * @param {Object} refundData - Refund data
   * @param {Array} refundData.items - Items to refund
   * @param {number} refundData.amount - Refund amount
   * @param {string} refundData.reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  async refundOrder(id, refundData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORDERS.REFUND(id), refundData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error processing refund for order #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi hoàn tiền đơn hàng'
      );
    }
  }

  /**
   * Generate invoice for order
   * @param {string|number} id - Order ID
   * @returns {Promise<Object>} Invoice data
   */
  async generateInvoice(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.GENERATE_INVOICE(id));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error generating invoice for order #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tạo hóa đơn'
      );
    }
  }

  /**
   * Get order statistics
   * @param {Object} params - Query parameters
   * @param {string} params.period - Period (daily, weekly, monthly, yearly)
   * @param {string} params.start_date - Start date filter (YYYY-MM-DD)
   * @param {string} params.end_date - End date filter (YYYY-MM-DD)
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStatistics(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.STATISTICS, { params });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải thống kê đơn hàng'
      );
    }
  }

  /**
   * Get customer order history
   * @param {string|number} customerId - Customer ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Customer order history
   */
  async getCustomerOrderHistory(customerId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.CUSTOMER_HISTORY(customerId), { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching order history for customer #${customerId}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải lịch sử đơn hàng của khách hàng'
      );
    }
  }

  /**
   * Get daily orders
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Daily orders data
   */
  async getDailyOrders(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORDERS.DAILY, { params });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching daily orders:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải đơn hàng trong ngày'
      );
    }
  }

  /**
   * Process POS order with payment and receipt printing
   * @param {Object} orderData - Order data
   * @param {Object} paymentData - Payment data
   * @param {boolean} printReceipt - Whether to print receipt
   * @param {boolean} openCashDrawer - Whether to open cash drawer
   * @returns {Promise<Object>} Processed order result
   */
  async processPOSOrder(orderData, paymentData, printReceipt = true, openCashDrawer = true) {
    try {
      // Create order
      const orderResponse = await this.createOrder(orderData);
      const order = orderResponse.data;
      
      // Process payment
      const paymentResponse = await apiClient.post(API_ENDPOINTS.PAYMENTS.PROCESS, {
        order_id: order.id,
        ...paymentData
      });
      
      // Open cash drawer for cash payments
      if (openCashDrawer && paymentData.payment_method === 'cash') {
        try {
          await cashDrawerService.openDrawer();
        } catch (drawerError) {
          console.error('Error opening cash drawer:', drawerError);
          // Continue even if drawer fails
        }
      }
      
      // Print receipt if requested
      if (printReceipt) {
        try {
          await this.printOrderReceipt(order.id);
        } catch (printError) {
          console.error('Error printing receipt:', printError);
          // Continue even if printing fails
        }
      }
      
      return {
        success: true,
        order: order,
        payment: paymentResponse.data.data,
        message: 'Đơn hàng đã được xử lý thành công'
      };
    } catch (error) {
      console.error('Error processing POS order:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xử lý đơn hàng POS'
      );
    }
  }

  /**
   * Print order receipt
   * @param {string|number} orderId - Order ID
   * @returns {Promise<boolean>} Print success
   */
  async printOrderReceipt(orderId) {
    try {
      // Get order details
      const orderResponse = await this.getOrderById(orderId);
      const order = orderResponse.data;
      
      // Get order items
      const itemsResponse = await this.getOrderItems(orderId);
      const items = itemsResponse.data;
      
      // Format receipt data
      const receiptData = {
        storeName: 'Trường Phát Computer',
        address: '123 Lê Lợi, Hòa Bình',
        orderNumber: order.order_number || order.id,
        date: new Date(order.created_at).toLocaleString('vi-VN'),
        cashier: order.cashier_name || 'Nhân viên bán hàng',
        items: items.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          subtotal: item.total_price
        })),
        subtotal: order.subtotal,
        tax: order.tax_amount,
        total: order.total_amount,
        paymentMethod: this.formatPaymentMethod(order.payment_method),
        customer: order.customer ? {
          name: order.customer.name,
          phone: order.customer.phone
        } : null,
        change: order.change_amount
      };
      
      // Print receipt
      return await printerService.printReceipt(receiptData);
    } catch (error) {
      console.error(`Error printing receipt for order #${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Format payment method for display
   * @param {string} method - Payment method code
   * @returns {string} Formatted payment method
   */
  formatPaymentMethod(method) {
    const methods = {
      'cash': 'Tiền mặt',
      'card': 'Thẻ tín dụng/ghi nợ',
      'bank_transfer': 'Chuyển khoản',
      'vnpay': 'VNPay',
      'momo': 'MoMo',
      'zalopay': 'ZaloPay',
      'credit': 'Công nợ'
    };
    
    return methods[method] || method;
  }
}

// Create and export singleton instance
const orderService = new OrderService();
export default orderService;
