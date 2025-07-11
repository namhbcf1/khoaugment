/**
 * Customer API Service
 * Handles customer-facing API endpoints for product lookup, warranty information, and order details
 */

import { api } from '../api';

/**
 * Customer API service
 */
const customerService = {
  /**
   * Look up customer information by phone or order ID
   * @param {String} type - Search type ('phone' or 'order')
   * @param {String} value - Search value (phone number or order ID)
   * @returns {Promise<Object>} - Customer data with products and orders
   */
  async lookupCustomer(type, value) {
    return await api.get('/customer/lookup', {
      params: { type, value }
    });
  },
  
  /**
   * Get order details by ID (used for QR code scanning)
   * @param {String} orderId - Order ID
   * @returns {Promise<Object>} - Order details with customer and product information
   */
  async getOrderById(orderId) {
    return await api.get(`/customer/order/${orderId}`);
  },
  
  /**
   * Get warranty information for a product
   * @param {String} serialNumber - Product serial number
   * @returns {Promise<Object>} - Warranty information
   */
  async getWarrantyInfo(serialNumber) {
    return await api.get(`/customer/warranty/${serialNumber}`);
  },
  
  /**
   * Get invoice preview as blob
   * @param {String} orderId - Order ID
   * @returns {Promise<Blob>} - Invoice PDF blob
   */
  async getInvoicePreview(orderId) {
    return await api.get(`/customer/invoice/${orderId}/preview`, {
      responseType: 'blob'
    });
  },
  
  /**
   * Download invoice PDF
   * @param {String} orderId - Order ID
   * @returns {Promise<void>} - Triggers file download
   */
  async downloadInvoice(orderId) {
    return await api.download(
      `/customer/invoice/${orderId}`,
      {},
      `hoa-don-${orderId}.pdf`
    );
  }
};

export default customerService; 