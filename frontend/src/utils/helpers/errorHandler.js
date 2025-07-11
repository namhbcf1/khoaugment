/**
 * Error Handler Utility
 * Centralized error handling and logging for the application
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import useUIStore from '../../store/uiStore.js';

/**
 * Error types enumeration
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error Handler Class
 * Provides centralized error handling, logging, and user notification
 */
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.enableConsoleLogging = import.meta.env.DEV;
    this.enableRemoteLogging = import.meta.env.PROD;
  }

  /**
   * Handle error with appropriate response
   * @param {Error|Object} error - Error object or error data
   * @param {Object} context - Additional context information
   * @param {Object} options - Handling options
   */
  handle(error, context = {}, options = {}) {
    const {
      showNotification = true,
      logError = true,
      severity = ERROR_SEVERITY.MEDIUM,
      fallbackMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    } = options;

    // Normalize error object
    const normalizedError = this.normalizeError(error);
    
    // Add context and metadata
    const errorData = {
      ...normalizedError,
      context,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    // Log error
    if (logError) {
      this.logError(errorData);
    }

    // Show user notification
    if (showNotification) {
      this.showUserNotification(errorData, fallbackMessage);
    }

    // Handle specific error types
    this.handleSpecificError(errorData);

    return errorData;
  }

  /**
   * Normalize error to consistent format
   * @param {Error|Object} error - Error to normalize
   * @returns {Object} Normalized error object
   */
  normalizeError(error) {
    if (error instanceof Error) {
      return {
        type: this.determineErrorType(error),
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }

    if (error && typeof error === 'object') {
      return {
        type: error.type || this.determineErrorType(error),
        message: error.message || 'Unknown error',
        code: error.code,
        status: error.status,
        data: error.data
      };
    }

    return {
      type: ERROR_TYPES.UNKNOWN,
      message: String(error) || 'Unknown error'
    };
  }

  /**
   * Determine error type based on error characteristics
   * @param {Error|Object} error - Error object
   * @returns {string} Error type
   */
  determineErrorType(error) {
    // Network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return ERROR_TYPES.NETWORK;
    }

    // HTTP status-based errors
    if (error.status || error.response?.status) {
      const status = error.status || error.response.status;
      
      if (status === 401) {
        return ERROR_TYPES.AUTHENTICATION;
      } else if (status === 403) {
        return ERROR_TYPES.AUTHORIZATION;
      } else if (status >= 400 && status < 500) {
        return ERROR_TYPES.CLIENT;
      } else if (status >= 500) {
        return ERROR_TYPES.SERVER;
      }
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.type === 'validation') {
      return ERROR_TYPES.VALIDATION;
    }

    return ERROR_TYPES.UNKNOWN;
  }

  /**
   * Log error to console and/or remote service
   * @param {Object} errorData - Error data to log
   */
  logError(errorData) {
    // Add to local error log
    this.errorLog.unshift(errorData);
    
    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console logging in development
    if (this.enableConsoleLogging) {
      console.group(`🚨 Error [${errorData.type}]`);
      console.error('Message:', errorData.message);
      console.error('Context:', errorData.context);
      console.error('Stack:', errorData.stack);
      console.error('Full Error:', errorData);
      console.groupEnd();
    }

    // Remote logging in production
    if (this.enableRemoteLogging) {
      this.sendToRemoteLogger(errorData);
    }
  }

  /**
   * Show user-friendly notification
   * @param {Object} errorData - Error data
   * @param {string} fallbackMessage - Fallback message
   */
  showUserNotification(errorData, fallbackMessage) {
    const { showError } = useUIStore.getState();
    
    const userMessage = this.getUserFriendlyMessage(errorData) || fallbackMessage;
    
    showError(userMessage, 'Lỗi');
  }

  /**
   * Get user-friendly error message
   * @param {Object} errorData - Error data
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage(errorData) {
    const messageMap = {
      [ERROR_TYPES.NETWORK]: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      [ERROR_TYPES.AUTHENTICATION]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      [ERROR_TYPES.AUTHORIZATION]: 'Bạn không có quyền thực hiện hành động này.',
      [ERROR_TYPES.VALIDATION]: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
      [ERROR_TYPES.SERVER]: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      [ERROR_TYPES.CLIENT]: 'Yêu cầu không hợp lệ. Vui lòng thử lại.'
    };

    // Check for specific error messages
    if (errorData.message) {
      // Common API error messages
      if (errorData.message.includes('timeout')) {
        return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
      }
      
      if (errorData.message.includes('rate limit')) {
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      }
      
      if (errorData.message.includes('not found')) {
        return 'Không tìm thấy tài nguyên yêu cầu.';
      }
    }

    return messageMap[errorData.type] || null;
  }

  /**
   * Handle specific error types with custom logic
   * @param {Object} errorData - Error data
   */
  handleSpecificError(errorData) {
    switch (errorData.type) {
      case ERROR_TYPES.AUTHENTICATION:
        // Redirect to login page
        this.handleAuthenticationError();
        break;
        
      case ERROR_TYPES.NETWORK:
        // Check if offline and show appropriate message
        this.handleNetworkError();
        break;
        
      case ERROR_TYPES.SERVER:
        // Check if it's a critical server error
        if (errorData.severity === ERROR_SEVERITY.CRITICAL) {
          this.handleCriticalError(errorData);
        }
        break;
    }
  }

  /**
   * Handle authentication errors
   */
  handleAuthenticationError() {
    // Clear auth data and redirect to login
    localStorage.clear();
    sessionStorage.clear();
    
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
  }

  /**
   * Handle network errors
   */
  handleNetworkError() {
    // Check if browser is offline
    if (!navigator.onLine) {
      const { showWarning } = useUIStore.getState();
      showWarning('Bạn đang offline. Một số tính năng có thể không hoạt động.');
    }
  }

  /**
   * Handle critical errors
   * @param {Object} errorData - Error data
   */
  handleCriticalError(errorData) {
    // Show critical error modal or page
    const { showError } = useUIStore.getState();
    showError(
      'Hệ thống gặp lỗi nghiêm trọng. Vui lòng liên hệ bộ phận hỗ trợ.',
      'Lỗi nghiêm trọng'
    );
    
    // Send immediate alert to monitoring service
    this.sendCriticalAlert(errorData);
  }

  /**
   * Send error to remote logging service
   * @param {Object} errorData - Error data
   */
  async sendToRemoteLogger(errorData) {
    try {
      // Only send non-sensitive data
      const sanitizedError = {
        type: errorData.type,
        message: errorData.message,
        severity: errorData.severity,
        timestamp: errorData.timestamp,
        url: errorData.url,
        userAgent: errorData.userAgent,
        userId: errorData.userId
      };

      // Send to logging service (implement based on your logging provider)
      await fetch('/api/logs/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedError)
      });
    } catch (loggingError) {
      // Fail silently for logging errors
      console.warn('Failed to send error to remote logger:', loggingError);
    }
  }

  /**
   * Send critical alert
   * @param {Object} errorData - Error data
   */
  async sendCriticalAlert(errorData) {
    try {
      await fetch('/api/alerts/critical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: errorData,
          timestamp: new Date().toISOString(),
          urgent: true
        })
      });
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  }

  /**
   * Get current user ID for logging
   * @returns {string|null} User ID
   */
  getCurrentUserId() {
    try {
      const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return null;
  }

  /**
   * Get error log
   * @param {number} limit - Number of errors to return
   * @returns {Array} Error log entries
   */
  getErrorLog(limit = 50) {
    return this.errorLog.slice(0, limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Export error log for debugging
   * @returns {string} JSON string of error log
   */
  exportErrorLog() {
    return JSON.stringify(this.errorLog, null, 2);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Global error handlers
window.addEventListener('error', (event) => {
  errorHandler.handle(event.error, {
    type: 'global_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handle(event.reason, {
    type: 'unhandled_promise_rejection'
  });
});

export default errorHandler;
