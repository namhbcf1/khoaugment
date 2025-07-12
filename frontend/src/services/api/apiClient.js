/**
 * API Client
 * Centralized API client with interceptors for authentication and error handling
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS';

// Default API configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client': 'KhoChuan-POS-Frontend',
    'X-Client-Version': import.meta.env?.VITE_APP_VERSION || '1.0.0'
  }
});

// Get auth token from local storage
const getAuthToken = () => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

// Get refresh token from local storage
const getRefreshToken = () => {
  return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
};

// Set auth token in local storage
const setAuthToken = (token, remember = true) => {
  if (token) {
    if (remember) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }
};

// Set refresh token in local storage
const setRefreshToken = (token, remember = true) => {
  if (token) {
    if (remember) {
      localStorage.setItem('refresh_token', token);
    } else {
      sessionStorage.setItem('refresh_token', token);
    }
  }
};

// Clear auth tokens
const clearAuthTokens = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('refresh_token');
};

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Skip auth token for login/refresh endpoints
    if (config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/refresh-token'))) {
      return config;
    }
    
    // Add auth token to request
    const token = getAuthToken();
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
      }
    }
    
    // Cache successful GET responses for offline use
    if (response.config.method === 'get' && response.status === 200) {
      cacheResponse(response.config.url, response.data);
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
      const cachedResponse = await getCachedResponse(originalRequest.url);
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
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
          refresh_token: refreshToken
        });
        
        if (response.data.success) {
          const { access_token, refresh_token } = response.data.data;
          
          // Update tokens
          setAuthToken(access_token);
          if (refresh_token) {
            setRefreshToken(refresh_token);
          }
          
          // Update header with new token
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          
          // Retry original request
          return apiClient(originalRequest);
        } else {
          throw new Error(response.data.message || 'Token refresh failed');
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
      message: error.response ? error.response.data?.message || error.message : error.message,
      data: error.response ? error.response.data : null,
      originalError: error
    };
    
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
 * Cache API response for offline use
 * @param {string} url - The request URL
 * @param {Object} data - The response data
 */
function cacheResponse(url, data) {
  try {
    // Create a simple in-memory cache
    if (!window._apiCache) {
      window._apiCache = {};
    }
    
    // Store in memory cache
    window._apiCache[url] = {
      data,
      timestamp: Date.now()
    };
    
    // Store in IndexedDB for persistence
    if ('indexedDB' in window) {
      const request = indexedDB.open('khoChuan_api_cache', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('responses')) {
          db.createObjectStore('responses', { keyPath: 'url' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['responses'], 'readwrite');
        const store = transaction.objectStore('responses');
        
        store.put({
          url,
          data,
          timestamp: Date.now()
        });
      };
    }
  } catch (error) {
    console.error('Error caching response:', error);
  }
}

/**
 * Get cached response for offline fallback
 * @param {string} url - The request URL
 * @returns {Promise<Object|null>} - Cached response or null
 */
async function getCachedResponse(url) {
  try {
    // Check memory cache first
    if (window._apiCache && window._apiCache[url]) {
      return window._apiCache[url];
    }
    
    // Check IndexedDB
    if ('indexedDB' in window) {
      return new Promise((resolve) => {
        const request = indexedDB.open('khoChuan_api_cache', 1);
        
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction(['responses'], 'readonly');
          const store = transaction.objectStore('responses');
          const getRequest = store.get(url);
          
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              resolve(getRequest.result);
            } else {
              resolve(null);
            }
          };
          
          getRequest.onerror = () => {
            resolve(null);
          };
        };
        
        request.onerror = () => {
          resolve(null);
        };
      });
    }
  } catch (error) {
    console.error('Error getting cached response:', error);
  }
  
  return null;
}

// Export authentication functions
export const auth = {
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
  clearAuthTokens
};

export default apiClient;
