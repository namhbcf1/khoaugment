/**
 * Payment Service
 * Real implementation for payment processing
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../utils/constants/API_ENDPOINTS.js';
import { apiClient } from './api/apiClient.js';

/**
 * Payment Service Class
 * Handles all payment-related API calls
 */
class PaymentService {
  /**
   * Process payment
   * @param {Object} paymentData - Payment data
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.method - Payment method (cash, card, vnpay, momo, zalopay)
   * @param {string} paymentData.reference - Reference ID (e.g., order ID)
   * @param {Object} paymentData.metadata - Additional payment metadata
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.PROCESS, paymentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Process payment error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error occurred while processing payment'
      );
    }
  }

  /**
   * Verify payment
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(transactionId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.VERIFY(transactionId));
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error occurred while verifying payment'
      );
    }
  }

  /**
   * Process refund
   * @param {string} transactionId - Transaction ID
   * @param {Object} refundData - Refund data
   * @param {number} refundData.amount - Refund amount
   * @param {string} refundData.reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(transactionId, refundData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.REFUND(transactionId), refundData);
      
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
      console.error('Process refund error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error occurred while processing refund'
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
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get payment methods');
      }
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error occurred while fetching payment methods'
      );
    }
  }

  /**
   * Generate payment QR code for digital payment methods
   * @param {Object} qrData - QR code data
   * @param {number} qrData.amount - Payment amount
   * @param {string} qrData.method - Payment method (vnpay, momo, zalopay)
   * @param {string} qrData.reference - Reference ID
   * @returns {Promise<Object>} QR code data
   */
  async generatePaymentQR(qrData) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.BASE_URL}/payments/qr-code`, qrData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to generate payment QR code');
      }
    } catch (error) {
      console.error('Generate payment QR error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error occurred while generating payment QR code'
      );
    }
  }

  /**
   * Handle card payment
   * @param {Object} cardData - Card payment data
   * @param {number} cardData.amount - Payment amount
   * @param {string} cardData.reference - Reference ID
   * @param {Object} cardData.card - Card information (will be tokenized)
   * @returns {Promise<Object>} Card payment result
   */
  async processCardPayment(cardData) {
    try {
      // In a real implementation, card data should be tokenized
      // before sending to the server for security reasons
      const tokenizedData = {
        ...cardData,
        card: await this.tokenizeCardData(cardData.card)
      };
      
      const response = await apiClient.post(`${API_ENDPOINTS.BASE_URL}/payments/card`, tokenizedData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to process card payment');
      }
    } catch (error) {
      console.error('Process card payment error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error occurred while processing card payment'
      );
    }
  }

  /**
   * Tokenize card data (this would normally be done by a payment gateway SDK)
   * @param {Object} cardData - Card data
   * @returns {Promise<string>} Tokenized card data
   * @private
   */
  async tokenizeCardData(cardData) {
    // This is a placeholder. In a real implementation,
    // this would use a payment gateway SDK to tokenize card data
    // without sending it to your server
    
    // For example, with Stripe:
    // const stripe = window.Stripe('your-publishable-key');
    // const result = await stripe.createToken(cardData);
    // return result.token.id;
    
    // For now, we'll just return a mock token
    return `token_${Date.now()}`;
  }
}

// Create and export singleton instance
const paymentService = new PaymentService();
export default paymentService;
