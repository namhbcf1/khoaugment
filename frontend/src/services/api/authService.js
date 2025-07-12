/**
 * Authentication Service
 * Real backend integration for user authentication
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { API_ENDPOINTS } from '../../utils/constants/API_ENDPOINTS';
import apiClient, { auth } from './apiClient';

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
        this.setAuthData(response.data.data, credentials.remember);
        
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
      const token = auth.getAuthToken();
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
      const refreshToken = auth.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
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
    const token = auth.getAuthToken();
    const user = this.getUser();
    return !!(token && user && !this.isTokenExpired());
  }

  /**
   * Check if token is expired
   * @returns {boolean} Token expiration status
   */
  isTokenExpired() {
    const token = auth.getAuthToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch (error) {
      return true;
    }
  }

  /**
   * Set authentication data in storage
   * @param {Object} authData - Authentication data from API
   * @param {boolean} remember - Whether to remember user
   */
  setAuthData(authData, remember = true) {
    if (!authData) return;
    
    const { access_token, refresh_token, user, permissions, roles } = authData;
    
    if (access_token) {
      auth.setAuthToken(access_token, remember);
    }
    
    if (refresh_token) {
      auth.setRefreshToken(refresh_token, remember);
    }
    
    if (user) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
    }
    
    if (permissions) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('permissions', JSON.stringify(permissions));
    }
    
    if (roles) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('roles', JSON.stringify(roles));
    }
  }

  /**
   * Clear authentication data from storage
   */
  clearAuthData() {
    auth.clearAuthTokens();
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('roles');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('permissions');
    sessionStorage.removeItem('roles');
    
    // Clear token refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  getUser() {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get stored user permissions
   * @returns {Array} User permissions
   */
  getPermissions() {
    const permissionsJson = localStorage.getItem('permissions') || sessionStorage.getItem('permissions');
    if (!permissionsJson) return [];
    
    try {
      return JSON.parse(permissionsJson);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get stored user roles
   * @returns {Array} User roles
   */
  getRoles() {
    const rolesJson = localStorage.getItem('roles') || sessionStorage.getItem('roles');
    if (!rolesJson) return [];
    
    try {
      return JSON.parse(rolesJson);
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} Whether user has permission
   */
  hasPermission(permission) {
    const roles = this.getRoles();
    if (roles.includes('admin')) return true;
    
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has role
   */
  hasRole(role) {
    const roles = this.getRoles();
    return roles.includes(role);
  }

  /**
   * Set up automatic token refresh
   * @param {number} expiresIn - Token expiration time in seconds
   */
  setupTokenRefresh(expiresIn) {
    if (!expiresIn) return;
    
    // Clear any existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // Convert to milliseconds and subtract buffer time (5 minutes)
    const refreshTime = (expiresIn * 1000) - (5 * 60 * 1000);
    
    // Set timer to refresh token before expiration
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().catch(error => {
        console.error('Auto token refresh failed:', error);
      });
    }, refreshTime);
  }

  /**
   * Get device information for login
   * @returns {Object} Device information
   */
  getDeviceInfo() {
    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request response
   */
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi yêu cầu đặt lại mật khẩu'
      );
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.password - New password
   * @param {string} resetData.password_confirmation - Confirm new password
   * @returns {Promise<Object>} Reset response
   */
  async resetPassword(resetData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi đặt lại mật khẩu'
      );
    }
  }

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification response
   */
  async verifyEmail(token) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Có lỗi xảy ra khi xác minh email'
      );
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
