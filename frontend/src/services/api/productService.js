/**
 * Product Service
 * Handles all product-related API operations
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS';
import apiClient from './apiClient';

/**
 * Product Service Class
 * Manages all product operations
 */
class ProductService {
  /**
   * Get all products with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search term
   * @param {string} params.category_id - Filter by category
   * @param {boolean} params.in_stock - Filter by stock availability
   * @param {boolean} params.popular - Get popular products
   * @param {string} params.sort_by - Sort field
   * @param {string} params.sort_dir - Sort direction (asc/desc)
   * @returns {Promise<Object>} Products data with pagination
   */
  async getProducts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải danh sách sản phẩm'
      );
    }
  }

  /**
   * Get product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProductById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching product #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải thông tin sản phẩm'
      );
    }
  }

  /**
   * Get product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Promise<Object>} Product data
   */
  async getProductByBarcode(barcode) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.GET_BY_BARCODE(barcode));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching product with barcode ${barcode}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tìm sản phẩm theo mã vạch'
      );
    }
  }

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product data
   */
  async createProduct(productData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tạo sản phẩm'
      );
    }
  }

  /**
   * Update product
   * @param {string|number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product data
   */
  async updateProduct(id, productData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), productData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error updating product #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi cập nhật sản phẩm'
      );
    }
  }

  /**
   * Delete product
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteProduct(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error deleting product #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xóa sản phẩm'
      );
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Object>} Categories data
   */
  async getCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải danh sách danh mục'
      );
    }
  }

  /**
   * Get category by ID
   * @param {string|number} id - Category ID
   * @returns {Promise<Object>} Category data
   */
  async getCategoryById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching category #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải thông tin danh mục'
      );
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category data
   */
  async createCategory(categoryData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tạo danh mục'
      );
    }
  }

  /**
   * Update category
   * @param {string|number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} Updated category data
   */
  async updateCategory(id, categoryData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), categoryData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error updating category #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi cập nhật danh mục'
      );
    }
  }

  /**
   * Delete category
   * @param {string|number} id - Category ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error deleting category #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi xóa danh mục'
      );
    }
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(query, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.SEARCH, { 
        params: { 
          query,
          ...params
        } 
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tìm kiếm sản phẩm'
      );
    }
  }

  /**
   * Get low stock products
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Low stock products data
   */
  async getLowStockProducts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LOW_STOCK, { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải sản phẩm sắp hết hàng'
      );
    }
  }

  /**
   * Get product price history
   * @param {string|number} id - Product ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Price history data
   */
  async getProductPriceHistory(id, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.PRICE_HISTORY(id), { params });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching price history for product #${id}:`, error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi tải lịch sử giá sản phẩm'
      );
    }
  }

  /**
   * Bulk import products
   * @param {Array} products - Products data
   * @returns {Promise<Object>} Import result
   */
  async bulkImportProducts(products) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.BULK_IMPORT, { products });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error bulk importing products:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi nhập sản phẩm hàng loạt'
      );
    }
  }

  /**
   * Bulk update products
   * @param {Array} products - Products data with IDs
   * @returns {Promise<Object>} Update result
   */
  async bulkUpdateProducts(products) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.BULK_UPDATE, { products });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw new Error(
        error.message || 
        'Có lỗi xảy ra khi cập nhật sản phẩm hàng loạt'
      );
    }
  }
}

// Create and export singleton instance
const productService = new ProductService();
export default productService;
