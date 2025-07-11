/**
 * Authentication Utilities
 * Functions for token management, user info, and role-based access
 * Enhanced with security service integration
 */

import securityService from '../../services/securityService';

// Token management
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';
const TOKEN_EXPIRY_KEY = 'token_expiry';

/**
 * Set authentication tokens in storage with security enhancements
 * @param {String} accessToken - JWT access token
 * @param {String} refreshToken - JWT refresh token
 * @param {Number} expiresIn - Expiration time in seconds
 * @param {Object} userInfo - User information
 */
export const setAuthTokens = (accessToken, refreshToken, expiresIn = 3600, userInfo = null) => {
  // Encrypt sensitive tokens before storing
  const encryptedToken = securityService.encrypt(accessToken);
  const encryptedRefreshToken = securityService.encrypt(refreshToken);

  localStorage.setItem(TOKEN_KEY, JSON.stringify(encryptedToken));
  localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(encryptedRefreshToken));

  // Calculate expiry time
  const expiryTime = Date.now() + (expiresIn * 1000);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

  // Create secure session if user info provided
  if (userInfo) {
    const sessionId = securityService.createSession(userInfo.id, userInfo);
    localStorage.setItem('session_id', sessionId);
    securityService.logSecurityEvent('successful_login', { userId: userInfo.id, role: userInfo.role });
  }
};

/**
 * Get current access token with security validation
 * @returns {String|null} - Current access token or null if not set
 */
export const getAccessToken = () => {
  try {
    const encryptedToken = localStorage.getItem(TOKEN_KEY);
    if (!encryptedToken) return null;

    const tokenData = JSON.parse(encryptedToken);
    const decryptedToken = securityService.decrypt(tokenData.encrypted, tokenData.iv);

    // Validate session if exists
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      try {
        securityService.validateSession(sessionId);
      } catch (error) {
        // Session invalid, clear tokens
        clearAuthTokens();
        return null;
      }
    }

    return decryptedToken;
  } catch (error) {
    console.error('Error decrypting token:', error);
    clearAuthTokens();
    return null;
  }
};

/**
 * Get refresh token
 * @returns {String|null} - Current refresh token or null if not set
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Clear all authentication tokens and user info with security cleanup
 */
export const clearAuthTokens = () => {
  // Destroy session if exists
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    securityService.destroySession(sessionId);
  }

  // Clear all auth-related data
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem('session_id');

  // Log security event
  securityService.logSecurityEvent('logout');
};

/**
 * Secure login with rate limiting and security checks
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Promise} - Login result
 */
export const secureLogin = async (email, password) => {
  try {
    // Validate input
    if (!securityService.validateEmail(email)) {
      throw new Error('Email không hợp lệ');
    }

    // Check login attempts
    securityService.checkLoginAttempts(email);

    // Sanitize input
    const sanitizedEmail = securityService.sanitizeInput(email);

    // Import API dynamically to avoid circular dependency
    const { default: api } = await import('../../services/api');

    // Attempt login
    const response = await api.post('/auth/login', {
      email: sanitizedEmail,
      password: password
    });

    if (response.data.success) {
      // Clear failed attempts on success
      securityService.clearLoginAttempts(email);

      // Set tokens with security enhancements
      setAuthTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.expiresIn,
        response.data.user
      );

      return response.data;
    } else {
      throw new Error(response.data.message || 'Đăng nhập thất bại');
    }
  } catch (error) {
    // Record failed login attempt
    securityService.recordFailedLogin(email);
    throw error;
  }
};

/**
 * Check if access token is expired
 * @returns {Boolean} - True if token is expired or invalid
 */
export const isTokenExpired = () => {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  
  return Date.now() > parseInt(expiry, 10);
};

/**
 * Refresh authentication token
 * @returns {Promise<String|null>} - New access token or null if refresh failed
 */
export const refreshToken = async () => {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) return null;
  
  try {
    // Import dynamically to avoid circular dependencies
    const { apiClient } = await import('../../services/api');
    
    const response = await apiClient.post('/auth/refresh', {
      refreshToken: refreshTokenValue
    }, {
      headers: {
        // Avoid auth interceptor
        'X-Skip-Auth': 'true'
      }
    });
    
    if (response.data && response.data.accessToken) {
      setAuthTokens(
        response.data.accessToken,
        response.data.refreshToken || refreshTokenValue,
        response.data.expiresIn || 3600
      );
      
      // Update user info if provided
      if (response.data.user) {
        setUserInfo(response.data.user);
      }
      
      return response.data.accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearAuthTokens();
    return null;
  }
};

/**
 * Set user information in storage
 * @param {Object} userInfo - User information object
 */
export const setUserInfo = (userInfo) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

/**
 * Get current user information
 * @returns {Object|null} - User information or null if not logged in
 */
export const getUserInfo = () => {
  const userJson = localStorage.getItem(USER_INFO_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('Failed to parse user info:', e);
    return null;
  }
};

/**
 * Get current user ID
 * @returns {String|null} - Current user ID or null if not logged in
 */
export const getCurrentUserId = () => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.id : null;
};

/**
 * Check if user is authenticated
 * @returns {Boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  const user = getUserInfo();
  
  return !!token && !!user && !isTokenExpired();
};

/**
 * Get user role
 * @returns {String|null} - User role or null if not logged in
 */
export const getUserRole = () => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.role : null;
};

/**
 * Check if user has specific role
 * @param {String|Array} roles - Role or array of roles to check
 * @returns {Boolean} - True if user has any of the specified roles
 */
export const hasRole = (roles) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
};

/**
 * Check if user has permission
 * @param {String} permission - Permission to check
 * @returns {Boolean} - True if user has the specified permission
 */
export const hasPermission = (permission) => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.permissions) return false;
  
  return userInfo.permissions.includes(permission);
};

/**
 * Get default redirect path based on user role
 * @returns {String} - Redirect path
 */
export const getDefaultRedirectPath = () => {
  const role = getUserRole();
  
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'cashier':
      return '/cashier/pos';
    case 'staff':
      return '/staff/dashboard';
    default:
      return '/login';
  }
};

/**
 * Decode JWT token
 * @param {String} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // Split the token and get the payload part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token will expire soon (within the next 5 minutes)
 * @returns {Boolean} - True if token will expire soon
 */
export const willTokenExpireSoon = () => {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  
  // Check if token will expire within the next 5 minutes
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  return parseInt(expiry, 10) < fiveMinutesFromNow;
};

/**
 * Ensure valid authentication (refresh token if needed)
 * @returns {Promise<Boolean>} - True if valid authentication is ensured
 */
export const ensureAuthentication = async () => {
  if (!isAuthenticated()) return false;
  
  if (willTokenExpireSoon()) {
    const newToken = await refreshToken();
    return !!newToken;
  }
  
  return true;
};

/**
 * Get authentication headers
 * @returns {Object} - Headers object with authorization
 */
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Initialize authentication from URL params (for OAuth callbacks)
 * @returns {Boolean} - True if authentication was initialized from URL
 */
export const initAuthFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const expiresIn = params.get('expires_in');
  const user = params.get('user');
  
  if (accessToken && refreshToken) {
    setAuthTokens(
      accessToken,
      refreshToken,
      expiresIn ? parseInt(expiresIn, 10) : 3600
    );
    
    if (user) {
      try {
        setUserInfo(JSON.parse(atob(user)));
      } catch (e) {
        console.error('Failed to parse user info from URL:', e);
      }
    }
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }
  
  return false;
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return { score: 0, feedback: 'Password is required' };
  }
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  return {
    score,
    feedback: feedback.join(', ') || 'Password is strong',
    isStrong: score >= 4
  };
};

export default {
  setAuthTokens,
  getAccessToken,
  getRefreshToken,
  clearAuthTokens,
  isTokenExpired,
  refreshToken,
  setUserInfo,
  getUserInfo,
  getCurrentUserId,
  isAuthenticated,
  getUserRole,
  hasRole,
  hasPermission,
  getDefaultRedirectPath,
  decodeToken,
  willTokenExpireSoon,
  ensureAuthentication,
  getAuthHeaders,
  initAuthFromUrl,
  validatePasswordStrength
}; 