/**
 * Authentication Service
 * Real backend integration for user authentication
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS.js';
import { apiClient } from './apiClient.js';

/**
 * Authentication Service Class
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {boolean} credentials.remember - Remember user session
   * @returns {Promise<Object>} Login response with user data and token
   */
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember || false,
        device_info: this.getDeviceInfo()
      });

      if (response.data.success) {
        // Store authentication data
        this.setAuthData(response.data.data);
        
        // Set up automatic token refresh
        this.setupTokenRefresh(response.data.data.expires_in);
        
        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.access_token,
          permissions: response.data.data.permissions,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi đăng nhập'
      );
    }
  }

  /**
   * User logout
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth data
      this.clearAuthData();
      return { success: true, message: 'Đăng xuất thành công' };
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} Refresh response with new token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken
      });

      if (response.data.success) {
        this.setAuthData(response.data.data);
        return {
          success: true,
          token: response.data.data.access_token
        };
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Failed to get profile');
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy thông tin người dùng'
      );
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update response
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi cập nhật thông tin'
      );
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.current_password - Current password
   * @param {string} passwordData.new_password - New password
   * @param {string} passwordData.confirm_password - Confirm new password
   * @returns {Promise<Object>} Change password response
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi đổi mật khẩu'
      );
    }
  }

  /**
   * Get user permissions
   * @returns {Promise<Array>} User permissions array
   */
  async getPermissions() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PERMISSIONS);
      
      if (response.data.success) {
        return {
          success: true,
          permissions: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Failed to get permissions');
      }
    } catch (error) {
      console.error('Get permissions error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi lấy quyền người dùng'
      );
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user && !this.isTokenExpired());
  }

  /**
   * Get stored authentication token
   * @returns {string|null} Authentication token
   */
  getToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  /**
   * Get stored refresh token
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  getUser() {
    const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if token is expired
   * @returns {boolean} Token expiration status
   */
  isTokenExpired() {
    const expiresAt = localStorage.getItem('token_expires_at') || sessionStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }

  /**
   * Store authentication data
   * @param {Object} authData - Authentication data from server
   */
  setAuthData(authData) {
    const storage = authData.remember ? localStorage : sessionStorage;
    
    storage.setItem('auth_token', authData.access_token);
    storage.setItem('refresh_token', authData.refresh_token);
    storage.setItem('user_data', JSON.stringify(authData.user));
    storage.setItem('token_expires_at', (Date.now() + (authData.expires_in * 1000)).toString());
    
    if (authData.permissions) {
      storage.setItem('user_permissions', JSON.stringify(authData.permissions));
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    // Clear from both localStorage and sessionStorage
    ['auth_token', 'refresh_token', 'user_data', 'token_expires_at', 'user_permissions'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear token refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Set up automatic token refresh
   * @param {number} expiresIn - Token expiration time in seconds
   */
  setupTokenRefresh(expiresIn) {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // Set up refresh 5 minutes before expiration
    const refreshTime = (expiresIn - 300) * 1000; // 5 minutes before expiry
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshToken();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          // Redirect to login if refresh fails
          window.location.href = '/admin/login';
        }
      }, refreshTime);
    }
  }

  /**
   * Get device information for security logging
   * @returns {Object} Device information
   */
  getDeviceInfo() {
    return {
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
