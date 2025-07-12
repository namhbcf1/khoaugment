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
import { USER_ROLES, UserRole } from "../utils/constants/USER_ROLES";
import { useAuth } from "./AuthContext";

/**
 * Error handler utility for TypeScript compatibility
 */
const errorHandler = {
  handle: (
    error: unknown,
    context: { component: string; location: string }
  ): void => {
    console.error("Protected route error:", error, context);
  },
};

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole | UserRole[] | null;
  requiredPermissions?: string | string[];
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
  showUnauthorized?: boolean;
}

/**
 * ProtectedRoute Component
 * @param {ProtectedRouteProps} props - Component props
 * @returns {JSX.Element} Protected route content
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = null,
  requiredPermissions = [],
  requireAuth = true,
  redirectTo = "/admin/login",
  fallback = null,
  showUnauthorized = true,
}) => {
  const {
    user,
    loading,
    isAuthenticated,
    hasRole,
    hasPermission,
    checkSession,
    refreshAuth,
  } = useAuth();

  const location = useLocation();
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check session validity on mount
  useEffect(() => {
    const validateSession = async (): Promise<void> => {
      try {
        if (requireAuth && isAuthenticated) {
          const isValid = await checkSession?.();
          if (!isValid && refreshAuth) {
            // Try to refresh authentication
            const refreshed = await refreshAuth();
            if (!refreshed) {
              setAuthError("Session expired");
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Authentication error";
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
  }, [
    requireAuth,
    isAuthenticated,
    checkSession,
    refreshAuth,
    location.pathname,
  ]);

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
  if (requiredRoles && isAuthenticated) {
    const roles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];
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
  if (requiredPermissions.length > 0 && isAuthenticated) {
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];
    const hasAllPermissions = permissions.every((permission) =>
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
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
 * Configuration for the withProtection HOC
 */
interface ProtectionConfig extends Omit<ProtectedRouteProps, "children"> {}

/**
 * Higher-order component for protecting routes
 * @param {ProtectionConfig} config - Protection configuration
 * @returns {Function} HOC function
 */
export const withProtection = (
  config: ProtectionConfig = {} as ProtectionConfig
) => {
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
    requiredRoles: [USER_ROLES.ADMIN],
    showUnauthorized: true,
  },

  STAFF_AND_ADMIN: {
    requiredRoles: [USER_ROLES.ADMIN, USER_ROLES.STAFF],
    showUnauthorized: true,
  },

  CASHIER_ACCESS: {
    requiredRoles: [USER_ROLES.ADMIN, USER_ROLES.CASHIER, USER_ROLES.STAFF],
    showUnauthorized: true,
  },

  AUTHENTICATED_ONLY: {
    requireAuth: true,
    showUnauthorized: false,
  },
};

export default ProtectedRoute;
