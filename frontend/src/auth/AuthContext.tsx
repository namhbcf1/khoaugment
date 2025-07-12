/**
 * Authentication Context
 * Global auth state management for KhoChuan POS System
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
  useContext,
  useEffect,
  useState,
} from "react";
import apiClient from "../services/apiClient";
import API_ENDPOINTS from "../utils/constants/API_ENDPOINTS";
import { UserRole } from "../utils/constants/USER_ROLES";

// User interface
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  [key: string]: any; // For additional properties
}

// JWT Token payload interface
interface JWTPayload {
  sub: string;
  exp: number;
  iat: number;
  user_id: number;
  email: string;
  role: string;
  [key: string]: any;
}

// Login response interface
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  permissions: string[];
  roles: string[];
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  permissions: string[];
  roles: string[];
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user: User; message: string }>;
  logout: () => Promise<void>;
  hasPermission: (permissionName: string) => boolean;
  hasRole: (roleName: string) => boolean;
  checkSession: () => Promise<boolean>;
  refreshAuth: () => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: [],
  roles: [],
  loading: false,
  isAuthenticated: false,
  error: null,
  login: async () => ({ success: false, user: {} as User, message: "" }),
  logout: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
  checkSession: async () => false,
  refreshAuth: async () => false,
  changePassword: async () => false,
  requestPasswordReset: async () => false,
  resetPassword: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

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
  const parseToken = (token: string): JWTPayload | null => {
    try {
      return jwtDecode<JWTPayload>(token);
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
      const response = await apiClient.get<{
        user: User;
        permissions: string[];
        roles: string[];
      }>(API_ENDPOINTS.AUTH.STATUS);

      if (response.success) {
        const userData = response.data!;
        setUser(userData.user);
        setPermissions(userData.permissions || []);
        setRoles(userData.roles || []);
      } else {
        throw new Error(response.error || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Fetch user data error:", error);
      await logout();
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

      const response = await apiClient.post<{
        access_token: string;
        refresh_token: string;
      }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refresh_token: refreshToken });

      if (response.success) {
        const { access_token, refresh_token } = response.data!;
        setToken(access_token);
        setRefreshToken(refresh_token);

        // Fetch user data with new token
        await fetchUserData();
        return true;
      } else {
        throw new Error(response.error || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      await logout();
      return false;
    }
  };

  // Check session validity
  const checkSession = async (): Promise<boolean> => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      return false;
    }

    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.STATUS);
      return response.success;
    } catch (error) {
      return false;
    }
  };

  // Refresh authentication
  const refreshAuth = async (): Promise<boolean> => {
    return await refreshUserToken();
  };

  // Login user
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user: User; message: string }> => {
    setLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      if (response.success) {
        const { access_token, refresh_token, user, permissions, roles } =
          response.data!;

        setToken(access_token);
        setRefreshToken(refresh_token);
        setUser(user);
        setPermissions(permissions || []);
        setRoles(roles || []);

        return {
          success: true,
          user,
          message: response.error || "Login successful",
        };
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
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

      if (response.success) {
        message.success("Mật khẩu đã được thay đổi thành công");
        return true;
      } else {
        message.error(response.error || "Không thể thay đổi mật khẩu");
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể thay đổi mật khẩu";
      message.error(errorMessage);
      return false;
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
      });

      if (response.success) {
        message.success(
          "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn"
        );
        return true;
      } else {
        message.error(response.error || "Không thể gửi email đặt lại mật khẩu");
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể gửi email đặt lại mật khẩu";
      message.error(errorMessage);
      return false;
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

      if (response.success) {
        message.success(
          "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập."
        );
        return true;
      } else {
        message.error(response.error || "Không thể đặt lại mật khẩu");
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể đặt lại mật khẩu";
      message.error(errorMessage);
      return false;
    }
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
      refreshUserToken,
      Math.max(1000, expiresIn)
    );

    return () => clearTimeout(refreshTimer);
  }, [user]);

  const isAuthenticated = !!user;

  const contextValue: AuthContextType = {
    user,
    permissions,
    roles,
    loading,
    isAuthenticated,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    checkSession,
    refreshAuth,
    changePassword,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook for using auth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
