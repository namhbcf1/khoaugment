import axios from 'axios';

// PRODUCTION API - NO MOCK DATA
const AUTH_API_URL = import.meta.env.VITE_API_URL || 'https://khoaugment-api.bangachieu2.workers.dev';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Các API endpoint
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  VERIFY: '/auth/verify'
};

/**
 * Service xác thực người dùng
 */
const authService = {
  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập (email, password)
   * @returns {Promise} Promise with user data
   */
  login: async (credentials) => {
    console.log('🔑 PRODUCTION AuthService: Login attempt', { email: credentials.email });

    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        email: credentials.email,
        password: credentials.password
      });

      console.log('🔑 PRODUCTION AuthService: API response', response.data);

      if (response.data.success) {
        // Store token in localStorage for persistence
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.data.user));

        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.token
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Đăng nhập không thành công'
        };
      }
    } catch (error) {
      console.error('🔑 PRODUCTION AuthService: API error', error);

      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          message: error.response.data?.message || 'Email hoặc mật khẩu không đúng'
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
        };
      } else {
        // Other error
        return {
          success: false,
          message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
        };
      }
    }
  },

  /**
   * Đăng xuất người dùng
   * @returns {Promise} Promise with logout result
   */
  logout: async () => {
    // Use mock API if configured
    if (shouldUseMockApi()) {
      return await mockApi.logout();
    }

    try {
      const token = localStorage.getItem('khochuan_token');
      if (token) {
        const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data;
      }
      return { success: true, message: 'Đã đăng xuất' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true, message: 'Đã đăng xuất' }; // Always return success even on error
    }
  },

  /**
   * Xác thực token
   * @param {string} token - JWT token hiện tại
   * @returns {Promise} Promise with verification result
   */
  verifyToken: async (token) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY, { token });
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      };
    }
  },
  
  /**
   * Thêm token vào request header
   * @param {string} token - JWT token 
   */
  setAuthToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }
};

export default authService; 