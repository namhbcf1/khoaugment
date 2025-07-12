/**
 * Authentication Context
 * Global auth state management for KhoAugment POS System
 *
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { message } from "antd";
import { jwtDecode } from "jwt-decode";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { apiClient } from "../services/api/apiClient";
import { API_ENDPOINTS } from "../utils/constants/API_ENDPOINTS";

// User interface
export interface User {
  id: number;
  email: string;
  role: "admin" | "cashier" | "staff";
  full_name: string;
  active?: boolean;
  phone?: string;
  avatar_url?: string;
  last_login?: string;
}

// JWT Token payload interface
interface JwtPayload {
  sub: string | number;
  exp: number;
  iat: number;
  user_id: number;
  role: string;
  [key: string]: any;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  permissions: string[];
  roles: string[];
  loading: boolean;
  initialized: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user: User; message: string }>;
  logout: () => Promise<void>;
  hasPermission: (permissionName: string) => boolean;
  hasRole: (roleName: string) => boolean;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get token from localStorage
  const getToken = (): string | null => {
    return localStorage.getItem("auth_token");
  };

  // Set token in localStorage
  const setToken = (token: string | null): void => {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  };

  // Get refresh token from localStorage
  const getRefreshToken = (): string | null => {
    return localStorage.getItem("refresh_token");
  };

  // Set refresh token in localStorage
  const setRefreshToken = (token: string | null): void => {
    if (token) {
      localStorage.setItem("refresh_token", token);
    } else {
      localStorage.removeItem("refresh_token");
    }
  };

  // Parse JWT token
  const parseToken = (token: string): JwtPayload | null => {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error("Failed to parse token:", error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;

    const decoded = parseToken(token);
    if (!decoded) return true;

    // Check if token is expired (with 60 seconds buffer)
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime - 60;
  };

  // Initialize auth state from stored token
  const initializeAuth = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const token = getToken();

      if (!token || isTokenExpired(token)) {
        // Try to use refresh token if available
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          await refreshUserToken();
        } else {
          setUser(null);
          setPermissions([]);
          setRoles([]);
        }
      } else {
        // Token is valid, fetch user data
        await fetchUserData();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setUser(null);
      setPermissions([]);
      setRoles([]);
      setError("Failed to initialize authentication");
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Fetch current user data
  const fetchUserData = async (): Promise<void> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData.user);
        setPermissions(userData.permissions || []);
        setRoles(userData.roles || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Fetch user data error:", error);
      logout();
      throw error;
    }
  };

  // Refresh user token
  const refreshUserToken = async (): Promise<boolean> => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refresh_token: refreshToken,
      });

      if (response.data.success) {
        const { access_token, refresh_token } = response.data.data;
        setToken(access_token);
        setRefreshToken(refresh_token);

        // Fetch user data with new token
        await fetchUserData();
        return true;
      } else {
        throw new Error(response.data.message || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      return false;
    }
  };

  // Login user
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user: User; message: string }> => {
    setLoading(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      if (response.data.success) {
        const { access_token, refresh_token, user, permissions, roles } =
          response.data.data;

        setToken(access_token);
        setRefreshToken(refresh_token);
        setUser(user);
        setPermissions(permissions || []);
        setRoles(roles || []);

        return {
          success: true,
          user,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || error.message || "Login failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = getToken();
      if (token) {
        try {
          await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
          console.error("Logout API error:", error);
        }
      }
    } finally {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setPermissions([]);
      setRoles([]);
      setLoading(false);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;
    if (roles.includes("admin")) return true; // Admin has all permissions
    return permissions.includes(permissionName);
  };

  // Check if user has specific role
  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return roles.includes(roleName);
  };

  // Initialize auth on component mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up token refresh interval
  useEffect(() => {
    if (!user) return;

    const token = getToken();
    if (!token) return;

    const decoded = parseToken(token);
    if (!decoded) return;

    // Calculate time until token expiration (with 5 minute buffer)
    const expiresIn = decoded.exp * 1000 - Date.now() - 5 * 60 * 1000;

    // Set up refresh timer
    const refreshTimer = setTimeout(
      () => {
        refreshUserToken().catch((error) => {
          console.error("Auto refresh token error:", error);
        });
      },
      expiresIn > 0 ? expiresIn : 0
    );

    return () => clearTimeout(refreshTimer);
  }, [user]);

  // Change password
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          current_password: currentPassword,
          new_password: newPassword,
        }
      );

      if (response.data.success) {
        message.success("Password changed successfully");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to change password"
      );
      throw error;
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        {
          email,
        }
      );

      if (response.data.success) {
        message.success("Password reset instructions sent to your email");
        return true;
      } else {
        throw new Error(
          response.data.message || "Failed to request password reset"
        );
      }
    } catch (error: any) {
      console.error("Request password reset error:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to request password reset"
      );
      throw error;
    }
  };

  // Reset password with token
  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password: newPassword,
      });

      if (response.data.success) {
        message.success("Password has been reset successfully");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reset password"
      );
      throw error;
    }
  };

  // Context value
  const value: AuthContextType = {
    user,
    permissions,
    roles,
    loading,
    initialized,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    hasRole,
    changePassword,
    requestPasswordReset,
    resetPassword,
    refreshToken: refreshUserToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
