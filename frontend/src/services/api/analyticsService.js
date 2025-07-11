/**
 * Analytics Service
 * Real backend integration for analytics and reporting
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS.js';
import { apiClient } from './apiClient.js';

/**
 * Analytics Service Class
 * Handles all analytics and reporting API calls
 */
class AnalyticsService {
  /**
   * Get dashboard analytics data
   * @param {Object} params - Query parameters
   * @param {string} params.period - Time period (today, week, month, year)
   * @param {string} params.date_from - Start date
   * @param {string} params.date_to - End date
   * @returns {Promise<Object>} Dashboard analytics
   */
  async getDashboardAnalytics(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get dashboard analytics');
      }
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy dữ liệu dashboard'
      );
    }
  }

  /**
   * Get sales report
   * @param {Object} params - Report parameters
   * @param {string} params.period - Time period
   * @param {string} params.group_by - Group by field (day, week, month)
   * @param {string} params.date_from - Start date
   * @param {string} params.date_to - End date
   * @param {string} params.staff_id - Staff filter
   * @param {string} params.product_id - Product filter
   * @returns {Promise<Object>} Sales report data
   */
  async getSalesReport(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.SALES_REPORT, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          summary: response.data.summary,
          charts: response.data.charts,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get sales report');
      }
    } catch (error) {
      console.error('Get sales report error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy báo cáo bán hàng'
      );
    }
  }

  /**
   * Get inventory report
   * @param {Object} params - Report parameters
   * @param {string} params.warehouse_id - Warehouse filter
   * @param {string} params.category_id - Category filter
   * @param {boolean} params.low_stock_only - Show only low stock items
   * @returns {Promise<Object>} Inventory report data
   */
  async getInventoryReport(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.INVENTORY_REPORT, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          summary: response.data.summary,
          charts: response.data.charts,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get inventory report');
      }
    } catch (error) {
      console.error('Get inventory report error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy báo cáo tồn kho'
      );
    }
  }

  /**
   * Get customer analytics
   * @param {Object} params - Analytics parameters
   * @param {string} params.period - Time period
   * @param {string} params.segment - Customer segment
   * @param {string} params.metric - Metric to analyze
   * @returns {Promise<Object>} Customer analytics data
   */
  async getCustomerAnalytics(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.CUSTOMER_ANALYTICS, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          segments: response.data.segments,
          trends: response.data.trends,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get customer analytics');
      }
    } catch (error) {
      console.error('Get customer analytics error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy phân tích khách hàng'
      );
    }
  }

  /**
   * Get staff performance analytics
   * @param {Object} params - Performance parameters
   * @param {string} params.period - Time period
   * @param {string} params.staff_id - Staff ID filter
   * @param {string} params.metric - Performance metric
   * @returns {Promise<Object>} Staff performance data
   */
  async getStaffPerformance(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.STAFF_PERFORMANCE, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          rankings: response.data.rankings,
          trends: response.data.trends,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get staff performance');
      }
    } catch (error) {
      console.error('Get staff performance error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy hiệu suất nhân viên'
      );
    }
  }

  /**
   * Get financial report
   * @param {Object} params - Financial parameters
   * @param {string} params.period - Time period
   * @param {string} params.report_type - Report type (profit_loss, cash_flow, balance_sheet)
   * @param {string} params.date_from - Start date
   * @param {string} params.date_to - End date
   * @returns {Promise<Object>} Financial report data
   */
  async getFinancialReport(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.FINANCIAL_REPORT, { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          summary: response.data.summary,
          charts: response.data.charts,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get financial report');
      }
    } catch (error) {
      console.error('Get financial report error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy báo cáo tài chính'
      );
    }
  }

  /**
   * Get real-time metrics
   * @returns {Promise<Object>} Real-time metrics data
   */
  async getRealTimeMetrics() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.REAL_TIME_METRICS);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          timestamp: response.data.timestamp,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get real-time metrics');
      }
    } catch (error) {
      console.error('Get real-time metrics error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy số liệu thời gian thực'
      );
    }
  }

  /**
   * Create custom report
   * @param {Object} reportConfig - Report configuration
   * @param {string} reportConfig.name - Report name
   * @param {string} reportConfig.type - Report type
   * @param {Object} reportConfig.filters - Report filters
   * @param {Array} reportConfig.fields - Fields to include
   * @param {Object} reportConfig.grouping - Grouping configuration
   * @returns {Promise<Object>} Custom report data
   */
  async createCustomReport(reportConfig) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ANALYTICS.CUSTOM_REPORTS, reportConfig);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          report_id: response.data.report_id,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to create custom report');
      }
    } catch (error) {
      console.error('Create custom report error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi tạo báo cáo tùy chỉnh'
      );
    }
  }

  /**
   * Get saved custom reports
   * @returns {Promise<Object>} Saved reports list
   */
  async getSavedReports() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.CUSTOM_REPORTS);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get saved reports');
      }
    } catch (error) {
      console.error('Get saved reports error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy báo cáo đã lưu'
      );
    }
  }

  /**
   * Export report
   * @param {string} reportType - Type of report to export
   * @param {Object} params - Export parameters
   * @param {string} format - Export format (pdf, excel, csv)
   * @returns {Promise<Object>} Export response
   */
  async exportReport(reportType, params = {}, format = 'pdf') {
    try {
      const exportParams = {
        ...params,
        format
      };
      
      const endpoint = this.getReportEndpoint(reportType);
      const filename = `${reportType}_report.${format}`;
      
      const response = await apiClient.download(endpoint, filename, { params: exportParams });
      
      return {
        success: true,
        message: 'Xuất báo cáo thành công'
      };
    } catch (error) {
      console.error('Export report error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi xuất báo cáo'
      );
    }
  }

  /**
   * Get report endpoint based on type
   * @param {string} reportType - Report type
   * @returns {string} API endpoint
   */
  getReportEndpoint(reportType) {
    const endpoints = {
      sales: API_ENDPOINTS.ANALYTICS.SALES_REPORT,
      inventory: API_ENDPOINTS.ANALYTICS.INVENTORY_REPORT,
      customer: API_ENDPOINTS.ANALYTICS.CUSTOMER_ANALYTICS,
      staff: API_ENDPOINTS.ANALYTICS.STAFF_PERFORMANCE,
      financial: API_ENDPOINTS.ANALYTICS.FINANCIAL_REPORT
    };
    
    return endpoints[reportType] || API_ENDPOINTS.ANALYTICS.DASHBOARD;
  }

  /**
   * Schedule report generation
   * @param {Object} scheduleConfig - Schedule configuration
   * @param {string} scheduleConfig.report_type - Report type
   * @param {string} scheduleConfig.frequency - Schedule frequency
   * @param {Object} scheduleConfig.recipients - Email recipients
   * @param {Object} scheduleConfig.filters - Report filters
   * @returns {Promise<Object>} Schedule response
   */
  async scheduleReport(scheduleConfig) {
    try {
      const response = await apiClient.post('/analytics/schedule-report', scheduleConfig);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to schedule report');
      }
    } catch (error) {
      console.error('Schedule report error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lên lịch báo cáo'
      );
    }
  }
}

// Create and export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
