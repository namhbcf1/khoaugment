/**
 * Authentication Store
 * Zustand store for managing authentication state
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService from '../services/api/authService.js';

/**
 * Authentication Store
 * Manages user authentication state, login/logout, and user data
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      loginAttempts: 0,
      lastLoginAttempt: null,
      sessionExpiry: null,

      // Actions
      /**
       * Login user with credentials
       * @param {Object} credentials - Login credentials
       * @param {string} credentials.email - User email
       * @param {string} credentials.password - User password
       * @param {boolean} credentials.remember - Remember user session
       */
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          // Check rate limiting
          const { loginAttempts, lastLoginAttempt } = get();
          const now = Date.now();
          const timeSinceLastAttempt = now - (lastLoginAttempt || 0);
          
          // Rate limiting: max 5 attempts per 15 minutes
          if (loginAttempts >= 5 && timeSinceLastAttempt < 15 * 60 * 1000) {
            throw new Error('Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.');
          }

          // Reset attempts if enough time has passed
          if (timeSinceLastAttempt > 15 * 60 * 1000) {
            set({ loginAttempts: 0 });
          }

          const response = await authService.login(credentials);

          if (response.success) {
            const sessionExpiry = Date.now() + (credentials.remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
            
            set({
              user: response.user,
              token: response.token,
              permissions: response.permissions || [],
              isAuthenticated: true,
              isLoading: false,
              error: null,
              loginAttempts: 0,
              lastLoginAttempt: null,
              sessionExpiry
            });

            return { success: true, message: response.message };
          } else {
            throw new Error(response.message || 'Đăng nhập thất bại');
          }
        } catch (error) {
          const { loginAttempts } = get();
          set({
            isLoading: false,
            error: error.message,
            loginAttempts: loginAttempts + 1,
            lastLoginAttempt: Date.now()
          });

          return { success: false, error: error.message };
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        set({ isLoading: true });

        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
            error: null,
            sessionExpiry: null
          });
        }
      },

      /**
       * Refresh authentication token
       */
      refreshAuth: async () => {
        try {
          const response = await authService.refreshToken();
          
          if (response.success) {
            set({
              token: response.token,
              error: null
            });
            return true;
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          get().logout();
          return false;
        }
      },

      /**
       * Update user profile
       * @param {Object} profileData - Updated profile data
       */
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.updateProfile(profileData);
          
          if (response.success) {
            set({
              user: { ...get().user, ...response.user },
              isLoading: false,
              error: null
            });
            return { success: true, message: response.message };
          } else {
            throw new Error(response.message || 'Cập nhật thông tin thất bại');
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          });
          return { success: false, error: error.message };
        }
      },

      /**
       * Change user password
       * @param {Object} passwordData - Password change data
       */
      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.changePassword(passwordData);
          
          if (response.success) {
            set({
              isLoading: false,
              error: null
            });
            return { success: true, message: response.message };
          } else {
            throw new Error(response.message || 'Đổi mật khẩu thất bại');
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.message
          });
          return { success: false, error: error.message };
        }
      },

      /**
       * Check if user has specific permission
       * @param {string} permission - Permission to check
       * @returns {boolean} Has permission
       */
      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission) || permissions.includes('admin');
      },

      /**
       * Check if user has any of the specified roles
       * @param {Array} roles - Roles to check
       * @returns {boolean} Has any role
       */
      hasAnyRole: (roles) => {
        const { user } = get();
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles.includes(role));
      },

      /**
       * Check if session is expired
       * @returns {boolean} Is session expired
       */
      isSessionExpired: () => {
        const { sessionExpiry } = get();
        return sessionExpiry && Date.now() > sessionExpiry;
      },

      /**
       * Clear authentication error
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Initialize authentication state from stored data
       */
      initializeAuth: () => {
        const token = authService.getToken();
        const user = authService.getUser();
        
        if (token && user && !authService.isTokenExpired()) {
          set({
            user,
            token,
            isAuthenticated: true,
            permissions: JSON.parse(localStorage.getItem('user_permissions') || '[]')
          });
        } else {
          get().logout();
        }
      },

      /**
       * Set loading state
       * @param {boolean} loading - Loading state
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * Set error state
       * @param {string} error - Error message
       */
      setError: (error) => {
        set({ error });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if session is expired on rehydration
          if (state.isSessionExpired()) {
            state.logout();
          }
        }
      }
    }
  )
);

// Auto-refresh token before expiry
let refreshInterval;

const startTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated && !state.isSessionExpired()) {
      state.refreshAuth();
    }
  }, 10 * 60 * 1000); // Check every 10 minutes
};

const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Subscribe to authentication state changes
useAuthStore.subscribe((state, prevState) => {
  if (state.isAuthenticated && !prevState.isAuthenticated) {
    startTokenRefresh();
  } else if (!state.isAuthenticated && prevState.isAuthenticated) {
    stopTokenRefresh();
  }
});

export default useAuthStore;
