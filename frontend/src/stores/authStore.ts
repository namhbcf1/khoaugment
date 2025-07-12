import axios from 'axios';
import { create } from 'zustand';

// API URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

// User type definition
interface User {
  id: number;
  email: string;
  role: 'admin' | 'cashier' | 'staff';
  full_name: string;
}

// Auth store state interface
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create auth store with Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: false,
  error: null,

  // Login function
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data.data;
      
      // Save token to localStorage
      localStorage.setItem('auth_token', token);
      
      // Update store
      set({
        user,
        token,
        loading: false,
        error: null
      });
      
      // Configure axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Đăng nhập thất bại';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      }
      
      set({
        user: null,
        token: null,
        loading: false,
        error: errorMessage
      });
      
      // Clear token if exists
      localStorage.removeItem('auth_token');
    }
  },
  
  // Logout function
  logout: async () => {
    set({ loading: true });
    
    try {
      const token = get().token;
      
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and user data regardless of API success
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      
      set({
        user: null,
        token: null,
        loading: false,
        error: null
      });
    }
  },
  
  // Check authentication status
  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      set({ user: null, token: null, loading: false });
      return;
    }
    
    set({ loading: true });
    
    try {
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token with backend
      const response = await axios.get(`${API_URL}/auth/status`);
      
      if (response.data.success && response.data.data.user) {
        set({
          user: response.data.data.user,
          token,
          loading: false,
          error: null
        });
      } else {
        throw new Error('Invalid authentication');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      
      // Clear invalid token
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      
      set({
        user: null,
        token: null,
        loading: false,
        error: 'Phiên đăng nhập hết hạn'
      });
    }
  }
})); 