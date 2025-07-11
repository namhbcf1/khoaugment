/**
 * Inventory Management Service
 * Real backend integration for inventory operations
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS.js';
import { apiClient } from './apiClient.js';

/**
 * Inventory Service Class
 * Handles all inventory-related API calls
 */
class InventoryService {
  /**
   * Get inventory list with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @param {string} params.warehouse_id - Warehouse filter
   * @param {string} params.low_stock - Low stock filter
   * @param {string} params.sort - Sort field
   * @param {string} params.order - Sort order (asc/desc)
   * @returns {Promise<Object>} Inventory list with pagination
   */
  async getInventory(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LIST, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
          summary: response.data.summary,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get inventory');
      }
    } catch (error) {
      console.error('Get inventory error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy danh sách tồn kho'
      );
    }
  }

  /**
   * Update stock quantity for a product
   * @param {string|number} productId - Product ID
   * @param {Object} stockData - Stock update data
   * @param {number} stockData.quantity - New quantity
   * @param {string} stockData.type - Update type (set, add, subtract)
   * @param {string} stockData.reason - Reason for update
   * @param {string} stockData.warehouse_id - Warehouse ID
   * @returns {Promise<Object>} Stock update response
   */
  async updateStock(productId, stockData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.INVENTORY.UPDATE_STOCK(productId), stockData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Update stock error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi cập nhật tồn kho'
      );
    }
  }

  /**
   * Get inventory movements/transactions
   * @param {Object} params - Query parameters
   * @param {string} params.product_id - Product ID filter
   * @param {string} params.warehouse_id - Warehouse ID filter
   * @param {string} params.type - Movement type filter
   * @param {string} params.date_from - Start date filter
   * @param {string} params.date_to - End date filter
   * @returns {Promise<Object>} Inventory movements
   */
  async getMovements(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INVENTORY.MOVEMENTS, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
          summary: response.data.summary,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get inventory movements');
      }
    } catch (error) {
      console.error('Get inventory movements error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy lịch sử xuất nhập kho'
      );
    }
  }

  /**
   * Get low stock items
   * @param {Object} params - Query parameters
   * @param {number} params.threshold - Low stock threshold
   * @param {string} params.warehouse_id - Warehouse ID filter
   * @returns {Promise<Object>} Low stock items
   */
  async getLowStock(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LOW_STOCK, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          total: response.data.total,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get low stock items');
      }
    } catch (error) {
      console.error('Get low stock error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy danh sách hàng sắp hết'
      );
    }
  }

  /**
   * Get stock alerts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Stock alerts
   */
  async getStockAlerts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INVENTORY.STOCK_ALERTS, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          total: response.data.total,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get stock alerts');
      }
    } catch (error) {
      console.error('Get stock alerts error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy cảnh báo tồn kho'
      );
    }
  }

  /**
   * Create warehouse transfer
   * @param {Object} transferData - Transfer data
   * @param {string} transferData.from_warehouse_id - Source warehouse
   * @param {string} transferData.to_warehouse_id - Destination warehouse
   * @param {Array} transferData.items - Items to transfer
   * @param {string} transferData.notes - Transfer notes
   * @returns {Promise<Object>} Transfer response
   */
  async createWarehouseTransfer(transferData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.WAREHOUSE_TRANSFER, transferData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to create warehouse transfer');
      }
    } catch (error) {
      console.error('Create warehouse transfer error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi tạo phiếu chuyển kho'
      );
    }
  }

  /**
   * Perform stock count
   * @param {Object} stockCountData - Stock count data
   * @param {string} stockCountData.warehouse_id - Warehouse ID
   * @param {Array} stockCountData.items - Items to count
   * @param {string} stockCountData.notes - Count notes
   * @returns {Promise<Object>} Stock count response
   */
  async performStockCount(stockCountData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.STOCK_COUNT, stockCountData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to perform stock count');
      }
    } catch (error) {
      console.error('Perform stock count error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi kiểm kê tồn kho'
      );
    }
  }

  /**
   * Get inventory forecasting data
   * @param {Object} params - Forecasting parameters
   * @param {string} params.product_id - Product ID
   * @param {number} params.days - Number of days to forecast
   * @param {string} params.method - Forecasting method
   * @returns {Promise<Object>} Forecasting data
   */
  async getForecasting(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INVENTORY.FORECASTING, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get inventory forecasting');
      }
    } catch (error) {
      console.error('Get inventory forecasting error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy dự báo tồn kho'
      );
    }
  }

  /**
   * Bulk update inventory
   * @param {Array} updates - Array of inventory updates
   * @returns {Promise<Object>} Bulk update response
   */
  async bulkUpdateInventory(updates) {
    try {
      const response = await apiClient.post('/inventory/bulk-update', {
        updates
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to bulk update inventory');
      }
    } catch (error) {
      console.error('Bulk update inventory error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi cập nhật tồn kho hàng loạt'
      );
    }
  }

  /**
   * Get inventory valuation
   * @param {Object} params - Valuation parameters
   * @param {string} params.warehouse_id - Warehouse ID filter
   * @param {string} params.method - Valuation method (fifo, lifo, average)
   * @returns {Promise<Object>} Inventory valuation
   */
  async getInventoryValuation(params = {}) {
    try {
      const response = await apiClient.get('/inventory/valuation', { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get inventory valuation');
      }
    } catch (error) {
      console.error('Get inventory valuation error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy định giá tồn kho'
      );
    }
  }

  /**
   * Export inventory report
   * @param {Object} filters - Export filters
   * @param {string} format - Export format (csv, excel, pdf)
   * @returns {Promise<Object>} Export response
   */
  async exportInventory(filters = {}, format = 'excel') {
    try {
      const params = {
        ...filters,
        format
      };
      
      const response = await apiClient.download('/inventory/export', `inventory.${format}`, { params });
      
      return {
        success: true,
        message: 'Xuất báo cáo tồn kho thành công'
      };
    } catch (error) {
      console.error('Export inventory error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi xuất báo cáo tồn kho'
      );
    }
  }
}

// Create and export singleton instance
const inventoryService = new InventoryService();
export default inventoryService;
