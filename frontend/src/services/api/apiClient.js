/**
 * API Client Configuration
 * Centralized HTTP client for all API communications
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS.js';

/**
 * API Client Configuration
 */
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'https://api.khoaugment.com/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
};

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create(API_CONFIG);

/**
 * Request interceptor
 * Adds authentication token and request logging
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();

    // Add timestamp
    config.headers['X-Request-Time'] = new Date().toISOString();

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles response logging, error handling, and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH, {
            refresh_token: refreshToken
          });

          if (response.data.success) {
            // Update stored token
            setAuthToken(response.data.data.access_token);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.data.access_token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If refresh fails, clear auth data and redirect to login
      clearAuthData();
      window.location.href = '/admin/login';
      return Promise.reject(error);
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      // Show permission denied message
      showErrorMessage('Bạn không có quyền thực hiện hành động này');
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      showErrorMessage('Không tìm thấy tài nguyên yêu cầu');
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat();
        showErrorMessage(errorMessages.join(', '));
      }
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      showErrorMessage('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
    }

    // Handle 500 Internal Server Error
    if (error.response?.status >= 500) {
      showErrorMessage('Lỗi máy chủ. Vui lòng thử lại sau.');
    }

    // Handle network errors
    if (!error.response) {
      showErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to get authentication token
 * @returns {string|null} Authentication token
 */
function getAuthToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

/**
 * Helper function to get refresh token
 * @returns {string|null} Refresh token
 */
function getRefreshToken() {
  return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
}

/**
 * Helper function to set authentication token
 * @param {string} token - Authentication token
 */
function setAuthToken(token) {
  const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
  storage.setItem('auth_token', token);
}

/**
 * Helper function to clear authentication data
 */
function clearAuthData() {
  ['auth_token', 'refresh_token', 'user_data', 'token_expires_at', 'user_permissions'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

/**
 * Helper function to show error messages
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
  // Try to use Ant Design message if available
  if (window.antd && window.antd.message) {
    window.antd.message.error(message);
  } else {
    // Fallback to console error
    console.error('API Error:', message);
  }
}

/**
 * Generate unique request ID for tracking
 * @returns {string} Request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * API Client wrapper with additional methods
 */
const apiClientWrapper = {
  // Standard HTTP methods
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),

  // File upload method
  upload: (url, formData, onUploadProgress) => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  // Download method
  download: async (url, filename) => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },

  // Batch requests method
  batch: async (requests) => {
    try {
      const promises = requests.map(request => {
        const { method, url, data, config } = request;
        return apiClient[method](url, data, config);
      });

      const responses = await Promise.allSettled(promises);
      return responses.map((result, index) => ({
        request: requests[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value.data : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    } catch (error) {
      console.error('Batch request error:', error);
      throw error;
    }
  },

  // Health check method
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return {
        success: true,
        status: response.data.status,
        timestamp: response.data.timestamp,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Set base URL dynamically
  setBaseURL: (baseURL) => {
    apiClient.defaults.baseURL = baseURL;
  },

  // Set default headers
  setDefaultHeaders: (headers) => {
    Object.assign(apiClient.defaults.headers, headers);
  },

  // Get current configuration
  getConfig: () => ({
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout,
    headers: apiClient.defaults.headers,
  }),
};

export { apiClient, apiClientWrapper as default };
export const api = apiClientWrapper;
