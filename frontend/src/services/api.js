/**
 * Real API Service - NO MOCK DATA
 * 100% Real Database Operations with Cloudflare Workers
 * Trường Phát Computer Hòa Bình
 */

import axios from 'axios';
import { getAccessToken, refreshToken, clearAuthTokens } from '../utils/helpers/authUtils';
import { localCache } from '../utils/helpers/cacheUtils';
import { logEvent } from '../utils/helpers/analyticsUtils';

// Default API configuration
const DEFAULT_TIMEOUT = 15000; // 15 seconds
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000; // 1 second

// Real API client instance - NO MOCK
const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'https://khoaugment-api.bangachieu2.workers.dev',
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'Khochuan-POS-Frontend',
    'X-Client-Version': import.meta.env?.VITE_APP_VERSION || '1.0.0',
    'X-Company': 'Truong-Phat-Computer'
  }
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Skip auth token for login/refresh endpoints
    if (config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/refresh'))) {
      return config;
    }
    
    // Add auth token to request
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add request timestamp for performance tracking
    config.metadata = { startTime: Date.now() };
    
    // Add offline flag for background sync
    config.headers['X-Offline-Operation'] = navigator.onLine ? 'false' : 'true';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration for performance monitoring
    if (response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      response.duration = duration;
      
      // Log slow requests
      if (duration > 1000) {
        console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
        logEvent('api_performance', {
          endpoint: response.config.url,
          duration,
          status: response.status
        });
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors (offline)
    if (!error.response && error.message === 'Network Error') {
      // Queue request for background sync when online
      await queueOfflineRequest(originalRequest);
      
      // Return cached response if available
      const cachedResponse = await getCachedResponse(originalRequest);
      if (cachedResponse) {
        return Promise.resolve({
          ...cachedResponse,
          isOfflineCache: true
        });
      }
      
      return Promise.reject({
        ...error,
        isOfflineError: true,
        message: 'You are currently offline. This operation will sync when you\'re back online.'
      });
    }
    
    // Handle token expired error (401)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Only attempt refresh once
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const newToken = await refreshToken();
        
        if (newToken) {
          // Update header with new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Retry original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        clearAuthTokens();
        window.location.href = '/login?session_expired=true';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle rate limit (429)
    if (error.response && error.response.status === 429 && !originalRequest._rateLimit) {
      // Get retry after header or use default delay
      const retryAfter = error.response.headers['retry-after'] 
        ? parseInt(error.response.headers['retry-after']) * 1000 
        : RETRY_DELAY;
      
      // Mark as rate limited to avoid multiple retries
      originalRequest._rateLimit = true;
      
      // Wait for the retry delay
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      
      // Retry the request
      return apiClient(originalRequest);
    }
    
    // Handle server errors with retry logic (5xx)
    if (error.response && error.response.status >= 500 && !originalRequest._serverRetry) {
      originalRequest._serverRetry = true;
      
      // Wait for the retry delay
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // Retry the request
      return apiClient(originalRequest);
    }
    
    // Format error response
    const errorResponse = {
      status: error.response ? error.response.status : 0,
      message: error.response ? error.response.data.message || error.message : error.message,
      data: error.response ? error.response.data : null,
      originalError: error
    };
    
    // Log error for monitoring
    logEvent('api_error', {
      endpoint: originalRequest.url,
      method: originalRequest.method,
      status: errorResponse.status,
      message: errorResponse.message
    });
    
    return Promise.reject(errorResponse);
  }
);

/**
 * Queue a request for processing when back online
 * @param {Object} request - The API request config
 * @returns {Promise<void>}
 */
async function queueOfflineRequest(request) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    // Store in local queue if service worker isn't available
    const offlineQueue = JSON.parse(localStorage.getItem('offlineApiQueue') || '[]');
    offlineQueue.push({
      url: request.url,
      method: request.method,
      data: request.data,
      headers: request.headers,
      timestamp: Date.now()
    });
    localStorage.setItem('offlineApiQueue', JSON.stringify(offlineQueue));
    return;
  }
  
  // Send to service worker for background sync
  try {
    await navigator.serviceWorker.ready;
    await navigator.serviceWorker.controller.postMessage({
      type: 'ENQUEUE_REQUEST',
      payload: {
        url: request.url,
        method: request.method,
        data: request.data,
        headers: request.headers,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Failed to queue offline request:', error);
  }
}

/**
 * Get cached response for offline fallback
 * @param {Object} request - The API request config
 * @returns {Promise<Object|null>} - Cached response or null
 */
async function getCachedResponse(request) {
  // Create cache key from URL and params
  const cacheKey = `api_cache_${request.url}_${JSON.stringify(request.params || {})}`;
  
  // Check local memory cache first
  const cachedResponse = localCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Check IndexedDB cache if available
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      await navigator.serviceWorker.ready;
      const message = await new Promise(resolve => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = event => resolve(event.data);
        
        navigator.serviceWorker.controller.postMessage({
          type: 'GET_CACHED_RESPONSE',
          payload: { url: request.url, params: request.params }
        }, [messageChannel.port2]);
      });
      
      if (message && message.data) {
        return message.data;
      }
    } catch (error) {
      console.error('Failed to get cached response:', error);
    }
  }
  
  return null;
}

// API wrapper with offline support
const api = {
  /**
   * GET request
   * @param {String} url - API endpoint
   * @param {Object} config - Additional config
   * @returns {Promise<Object>} - Response data
   */
  async get(url, config = {}) {
    const response = await apiClient.get(url, config);
    return response.data;
  },
  
  /**
   * POST request
   * @param {String} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional config
   * @returns {Promise<Object>} - Response data
   */
  async post(url, data = {}, config = {}) {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },
  
  /**
   * PUT request
   * @param {String} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional config
   * @returns {Promise<Object>} - Response data
   */
  async put(url, data = {}, config = {}) {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },
  
  /**
   * PATCH request
   * @param {String} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} config - Additional config
   * @returns {Promise<Object>} - Response data
   */
  async patch(url, data = {}, config = {}) {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  },
  
  /**
   * DELETE request
   * @param {String} url - API endpoint
   * @param {Object} config - Additional config
   * @returns {Promise<Object>} - Response data
   */
  async delete(url, config = {}) {
    const response = await apiClient.delete(url, config);
    return response.data;
  },
  
  /**
   * GET request with caching
   * @param {String} url - API endpoint
   * @param {Object} config - Additional config
   * @param {Number} cacheTTL - Cache time-to-live in seconds
   * @returns {Promise<Object>} - Response data
   */
  async getCached(url, config = {}, cacheTTL = 300) {
    // Create cache key from URL and params
    const cacheKey = `api_cache_${url}_${JSON.stringify(config.params || {})}`;
    
    // Check cache first
    const cachedResponse = localCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Make request
    const response = await apiClient.get(url, config);
    
    // Cache response
    localCache.set(cacheKey, response.data, cacheTTL);
    
    return response.data;
  },
  
  /**
   * Upload file(s)
   * @param {String} url - API endpoint
   * @param {FormData} formData - Form data with files
   * @param {Function} onProgress - Progress callback
   * @param {Object} config - Additional config
   * @returns {Promise<Object>} - Response data
   */
  async upload(url, formData, onProgress = null, config = {}) {
    const uploadConfig = {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    };
    
    // Add progress tracking if callback provided
    if (onProgress) {
      uploadConfig.onUploadProgress = progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted, progressEvent);
      };
    }
    
    const response = await apiClient.post(url, formData, uploadConfig);
    return response.data;
  },
  
  /**
   * Download file
   * @param {String} url - API endpoint
   * @param {Object} params - Request parameters
   * @param {String} filename - Suggested filename
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Blob>} - File blob
   */
  async download(url, params = {}, filename = null, onProgress = null) {
    const downloadConfig = {
      params,
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream'
      }
    };
    
    // Add progress tracking if callback provided
    if (onProgress) {
      downloadConfig.onDownloadProgress = progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted, progressEvent);
      };
    }
    
    const response = await apiClient.get(url, downloadConfig);
    
    // Create download link and trigger download
    if (filename) {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    }
    
    return response.data;
  },
  
  /**
   * Batch requests
   * @param {Array} requests - Array of request configs
   * @returns {Promise<Array>} - Array of responses
   */
  async batch(requests) {
    // Use axios.all to run requests in parallel
    const responses = await Promise.allSettled(
      requests.map(req => {
        const method = (req.method || 'get').toLowerCase();
        return apiClient[method](req.url, req.data, req.config);
      })
    );
    
    // Process responses
    return responses.map(result => {
      if (result.status === 'fulfilled') {
        return { success: true, data: result.value.data };
    } else {
        return { 
          success: false, 
          error: {
            status: result.reason.response?.status,
            message: result.reason.response?.data?.message || result.reason.message
          }
        };
      }
    });
  },
  
  /**
   * Health check to verify API connectivity
   * @returns {Promise<Boolean>} - True if API is accessible
   */
  async healthCheck() {
    try {
      const response = await apiClient.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Get client instance for advanced usage
   * @returns {Object} - Axios instance
   */
  getClient() {
    return apiClient;
  }
};

// Add event listener for online/offline
window.addEventListener('online', async () => {
  // Process offline queue when back online
  const offlineQueue = JSON.parse(localStorage.getItem('offlineApiQueue') || '[]');
  if (offlineQueue.length > 0) {
    console.log(`Processing ${offlineQueue.length} offline requests`);
    
    // Process queue in sequence
    for (const request of offlineQueue) {
      try {
        await apiClient({
          url: request.url,
          method: request.method,
          data: request.data,
          headers: request.headers
        });
      } catch (error) {
        console.error('Failed to process offline request:', error);
      }
    }
    
    // Clear queue
    localStorage.removeItem('offlineApiQueue');
  }
  
  // Notify user they're back online
  // This would typically use a notification system
  console.log('Back online. Synced offline changes.');
});

window.addEventListener('offline', () => {
  // Notify user they're offline
  console.log('You are offline. Changes will be saved and synced when you reconnect.');
});

// Enhanced API with mock fallback
const enhancedApi = {
  ...api,

  // Real Authentication - NO MOCK
  async login(email, password) {
    return await api.post('/auth/login', { email, password });
  },

  async logout() {
    return await api.post('/auth/logout');
  },

  async getProfile() {
    return await api.get('/auth/me');
  },

  // Real Products - NO MOCK
  async getProducts(params = {}) {
    return await api.get('/products', { params });
  },

  async getProduct(id) {
    return await api.get(`/products/${id}`);
  },

  // Real Orders - NO MOCK
  async getOrders(params = {}) {
    return await api.get('/orders', { params });
  },

  async createOrder(orderData) {
    return await api.post('/orders', orderData);
  },

  // Real Dashboard - NO MOCK
  async getDashboardStats() {
    return await api.get('/analytics/dashboard');
  },

  // Real Categories - NO MOCK
  async getCategories() {
    return await api.get('/categories');
  }
};

export { enhancedApi as api, apiClient };
export default enhancedApi;