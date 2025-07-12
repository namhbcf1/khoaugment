/**
 * Protected Route Component
 * Route protection wrapper with role and permission-based access control
 *
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { ExclamationCircleOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Result, Spin } from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

/**
 * Error handler for TS compatibility
 * In a real implementation, this would be properly typed
 */
const errorHandler = {
  handle: (error: unknown, context: Record<string, string>) => {
    // Simple version for TypeScript compatibility
    console.error("Error in protected route:", error, context);
  },
};

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** Child components to render */
  children: ReactNode;
  /** Required user roles to access the route */
  requiredRole?: string | string[];
  /** Required permissions to access the route */
  requiredPermissions?: string | string[];
  /** Whether authentication is required */
  requireAuth?: boolean;
  /** Custom redirect path */
  redirectTo?: string;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Show unauthorized page instead of redirect */
  showUnauthorized?: boolean;
}

/**
 * ProtectedRoute Component
 * Route protection wrapper with role and permission-based access control
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = null,
  requiredPermissions = [],
  requireAuth = true,
  redirectTo = "/login",
  fallback = null,
  showUnauthorized = true,
}) => {
  // For the TypeScript version, we're using a simplified auth interface
  // Adapt this to match your actual auth store
  const authStore = useAuthStore();
  const user = authStore.user;
  const loading = authStore.loading;
  const isAuthenticated = !!user;

  // Role and permission checks
  const hasRole = (role: string) => {
    if (!user) return false;
    return user.role === role || role === "any";
  };

  const hasPermission = (permission: string) => {
    // Simplified permission check - in a real app, implement proper permission checking
    if (!user) return false;
    // Admin has all permissions
    if (user.role === "admin") return true;
    return false;
  };

  const location = useLocation();
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check session validity on mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        // Set session as checked - in a real implementation,
        // we would verify the session with an API call
        setSessionChecked(true);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown authentication error";
        setAuthError(errorMessage);
        errorHandler.handle(error, {
          component: "ProtectedRoute",
          location: location.pathname,
        });
      } finally {
        setSessionChecked(true);
      }
    };

    validateSession();
  }, [location.pathname]);

  // Show loading spinner while checking authentication
  if (loading || !sessionChecked) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Spin size="large" />
        <p style={{ color: "#666", margin: 0 }}>Đang xác thực...</p>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    return (
      <Result
        status="error"
        title="Lỗi xác thực"
        subTitle={authError}
        extra={[
          <Button type="primary" key="login" href={redirectTo}>
            Đăng nhập lại
          </Button>,
        ]}
      />
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Store the attempted location for redirect after login
    const redirectPath = location.pathname + location.search;
    return <Navigate to={redirectTo} state={{ from: redirectPath }} replace />;
  }

  // Check role requirements
  if (requiredRole && isAuthenticated) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some((role) => hasRole(role));

    if (!hasRequiredRole) {
      if (showUnauthorized) {
        return (
          <Result
            status="403"
            title="403"
            subTitle="Bạn không có quyền truy cập trang này"
            icon={<LockOutlined />}
            extra={[
              <Button
                type="primary"
                key="back"
                onClick={() => window.history.back()}
              >
                Quay lại
              </Button>,
              <Button key="home" href="/admin/dashboard">
                Trang chủ
              </Button>,
            ]}
          />
        );
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission requirements
  if (requiredPermissions && isAuthenticated) {
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasAllPermissions = permissions.every(
      (permission) =>
        typeof permission === "string" && hasPermission(permission)
    );

    if (!hasAllPermissions && permissions.length > 0) {
      if (showUnauthorized) {
        return (
          <Result
            status="warning"
            title="Không đủ quyền"
            subTitle="Bạn không có quyền thực hiện hành động này"
            icon={<ExclamationCircleOutlined />}
            extra={[
              <Button
                type="primary"
                key="back"
                onClick={() => window.history.back()}
              >
                Quay lại
              </Button>,
              <Button key="contact" type="default">
                Liên hệ quản trị viên
              </Button>,
            ]}
          />
        );
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render custom fallback if provided
  if (fallback && (!requireAuth || !isAuthenticated)) {
    return <>{fallback}</>;
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * HOC configuration interface
 */
interface ProtectionConfig extends Omit<ProtectedRouteProps, "children"> {}

/**
 * Higher-order component for protecting routes
 */
export const withProtection = (config: ProtectionConfig = {}) => {
  return <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
    const ProtectedComponent: React.FC<P> = (props) => (
      <ProtectedRoute {...config}>
        <Component {...props} />
      </ProtectedRoute>
    );

    ProtectedComponent.displayName = `withProtection(${Component.displayName || Component.name})`;
    return ProtectedComponent;
  };
};

/**
 * Predefined protection configurations
 */
export const PROTECTION_CONFIGS: Record<string, ProtectionConfig> = {
  ADMIN_ONLY: {
    requiredRole: "admin",
    showUnauthorized: true,
  },

  STAFF_AND_ADMIN: {
    requiredRole: ["admin", "staff"],
    showUnauthorized: true,
  },

  CASHIER_ACCESS: {
    requiredRole: ["admin", "cashier", "staff"],
    showUnauthorized: true,
  },

  AUTHENTICATED_ONLY: {
    requireAuth: true,
    showUnauthorized: false,
  },
};

export default ProtectedRoute;
