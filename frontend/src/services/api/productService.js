/**
 * Product Management Service
 * Real backend integration for product operations
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS.js';
import { apiClient } from './apiClient.js';

/**
 * Product Service Class
 * Handles all product-related API calls
 */
class ProductService {
  /**
   * Get all products with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @param {string} params.category - Category filter
   * @param {string} params.sort - Sort field
   * @param {string} params.order - Sort order (asc/desc)
   * @returns {Promise<Object>} Products list with pagination
   */
  async getProducts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get products');
      }
    } catch (error) {
      console.error('Get products error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy danh sách sản phẩm'
      );
    }
  }

  /**
   * Get product by ID
   * @param {string|number} productId - Product ID
   * @returns {Promise<Object>} Product details
   */
  async getProductById(productId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(productId));
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get product');
      }
    } catch (error) {
      console.error('Get product error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy thông tin sản phẩm'
      );
    }
  }

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Create product error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi tạo sản phẩm'
      );
    }
  }

  /**
   * Update product
   * @param {string|number} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productId, productData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(productId), productData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Update product error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi cập nhật sản phẩm'
      );
    }
  }

  /**
   * Delete product
   * @param {string|number} productId - Product ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteProduct(productId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(productId));
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi xóa sản phẩm'
      );
    }
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };
      
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          total: response.data.total,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to search products');
      }
    } catch (error) {
      console.error('Search products error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi tìm kiếm sản phẩm'
      );
    }
  }

  /**
   * Get product categories
   * @returns {Promise<Object>} Categories list
   */
  async getCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get categories');
      }
    } catch (error) {
      console.error('Get categories error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy danh mục sản phẩm'
      );
    }
  }

  /**
   * Bulk import products
   * @param {File} file - CSV/Excel file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Import results
   */
  async bulkImport(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.upload(
        API_ENDPOINTS.PRODUCTS.BULK_IMPORT,
        formData,
        onProgress
      );
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to import products');
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi nhập sản phẩm hàng loạt'
      );
    }
  }

  /**
   * Bulk update products
   * @param {Array} products - Array of products to update
   * @returns {Promise<Object>} Update results
   */
  async bulkUpdate(products) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.BULK_UPDATE, {
        products
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to bulk update products');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi cập nhật sản phẩm hàng loạt'
      );
    }
  }

  /**
   * Get product price history
   * @param {string|number} productId - Product ID
   * @returns {Promise<Object>} Price history
   */
  async getPriceHistory(productId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.PRICE_HISTORY(productId));
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get price history');
      }
    } catch (error) {
      console.error('Get price history error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy lịch sử giá'
      );
    }
  }

  /**
   * Get product variants
   * @param {string|number} productId - Product ID
   * @returns {Promise<Object>} Product variants
   */
  async getProductVariants(productId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.VARIANTS(productId));
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get product variants');
      }
    } catch (error) {
      console.error('Get product variants error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy biến thể sản phẩm'
      );
    }
  }
}

// Create and export singleton instance
const productService = new ProductService();
export default productService;
