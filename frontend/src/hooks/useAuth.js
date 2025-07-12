/**
 * Custom useAuth hook
 * Provides authentication functionality throughout the application
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import { message } from 'antd';
import { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import authService from '../services/api/authService';

/**
 * Custom hook for authentication
 * @returns {Object} Authentication methods and state
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {boolean} credentials.remember - Remember user
   * @returns {Promise<Object>} Login result
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      context.setUser(result.user);
      context.setPermissions(result.permissions || []);
      context.setRoles(result.roles || []);
      message.success(result.message || 'Đăng nhập thành công');
      return result;
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [context]);
  
  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      context.setUser(null);
      context.setPermissions([]);
      context.setRoles([]);
      message.success('Đăng xuất thành công');
    } catch (error) {
      message.error(error.message || 'Đăng xuất thất bại');
    } finally {
      setLoading(false);
    }
  }, [context]);
  
  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} Has permission
   */
  const hasPermission = useCallback((permission) => {
    // Admin role has all permissions
    if (context.roles.includes('admin')) {
      return true;
    }
    
    return context.permissions.includes(permission);
  }, [context.permissions, context.roles]);
  
  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Has role
   */
  const hasRole = useCallback((role) => {
    return context.roles.includes(role);
  }, [context.roles]);
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Update result
   */
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const result = await authService.updateProfile(profileData);
      context.setUser(result.user);
      message.success(result.message || 'Cập nhật thông tin thành công');
      return result;
    } catch (error) {
      message.error(error.message || 'Cập nhật thông tin thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [context]);
  
  /**
   * Change password
   * @param {Object} passwordData - Password data
   * @param {string} passwordData.current_password - Current password
   * @param {string} passwordData.new_password - New password
   * @param {string} passwordData.confirm_password - Confirm new password
   * @returns {Promise<Object>} Change result
   */
  const changePassword = useCallback(async (passwordData) => {
    setLoading(true);
    try {
      const result = await authService.changePassword(passwordData);
      message.success(result.message || 'Đổi mật khẩu thành công');
      return result;
    } catch (error) {
      message.error(error.message || 'Đổi mật khẩu thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request result
   */
  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    try {
      const result = await authService.requestPasswordReset(email);
      message.success(result.message || 'Yêu cầu đặt lại mật khẩu đã được gửi');
      return result;
    } catch (error) {
      message.error(error.message || 'Yêu cầu đặt lại mật khẩu thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Reset password
   * @param {Object} resetData - Reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.password - New password
   * @param {string} resetData.password_confirmation - Confirm new password
   * @returns {Promise<Object>} Reset result
   */
  const resetPassword = useCallback(async (resetData) => {
    setLoading(true);
    try {
      const result = await authService.resetPassword(resetData);
      message.success(result.message || 'Đặt lại mật khẩu thành công');
      return result;
    } catch (error) {
      message.error(error.message || 'Đặt lại mật khẩu thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Verify email
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result
   */
  const verifyEmail = useCallback(async (token) => {
    setLoading(true);
    try {
      const result = await authService.verifyEmail(token);
      message.success(result.message || 'Xác minh email thành công');
      return result;
    } catch (error) {
      message.error(error.message || 'Xác minh email thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    // State
    user: context.user,
    permissions: context.permissions,
    roles: context.roles,
    isAuthenticated: !!context.user,
    loading: context.loading || loading,
    initialized: context.initialized,
    
    // Methods
    login,
    logout,
    hasPermission,
    hasRole,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail
  };
};

export default useAuth;