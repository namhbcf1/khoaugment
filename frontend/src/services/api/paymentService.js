/**
 * Payment Service
 * Handles all payment-related API operations
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS';
import apiClient from './apiClient';

/**
 * Payment Service Class
 * Manages all payment operations
 */
class PaymentService {
  /**
   * Process a payment
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.payment_method - Payment method (cash, card, vnpay, momo, zalopay, bank_transfer)
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.order_id - Order ID (optional)
   * @param {Object} paymentData.customer - Customer data (optional)
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.PROCESS, paymentData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xử lý thanh toán'
      );
    }
  }

  /**
   * Verify a payment
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(transactionId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.VERIFY(transactionId));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error verifying payment ${transactionId}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xác minh thanh toán'
      );
    }
  }

  /**
   * Process a refund
   * @param {string} transactionId - Transaction ID
   * @param {Object} refundData - Refund data
   * @param {number} refundData.amount - Refund amount
   * @param {string} refundData.reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(transactionId, refundData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.REFUND(transactionId), refundData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error processing refund for ${transactionId}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi hoàn tiền'
      );
    }
  }

  /**
   * Get available payment methods
   * @returns {Promise<Object>} Payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.METHODS);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải phương thức thanh toán'
      );
    }
  }

  /**
   * Get payment history
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Payment history
   */
  async getPaymentHistory(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.HISTORY, { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải lịch sử thanh toán'
      );
    }
  }

  /**
   * Get transaction details
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Transaction details
   */
  async getTransaction(transactionId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.TRANSACTION(transactionId));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching transaction ${transactionId}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải thông tin giao dịch'
      );
    }
  }

  /**
   * Process VNPay payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment URL and information
   */
  async processVNPayPayment(paymentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.VNPAY, paymentData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error processing VNPay payment:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xử lý thanh toán VNPay'
      );
    }
  }

  /**
   * Process MoMo payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment URL and information
   */
  async processMoMoPayment(paymentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.MOMO, paymentData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error processing MoMo payment:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xử lý thanh toán MoMo'
      );
    }
  }

  /**
   * Process ZaloPay payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment URL and information
   */
  async processZaloPayPayment(paymentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.ZALOPAY, paymentData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error processing ZaloPay payment:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xử lý thanh toán ZaloPay'
      );
    }
  }
}

// Create and export singleton instance
const paymentService = new PaymentService();
export default paymentService; 