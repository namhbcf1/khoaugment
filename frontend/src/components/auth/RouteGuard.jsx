import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import { hasPermission, hasAnyPermission, ROLES } from '../../auth/permissions';

/**
 * Route Guard Component
 * Protects routes based on authentication and permissions
 */
export const RouteGuard = ({
  children,
  requireAuth = true,
  permission,
  permissions,
  roles,
  requireAll = false,
  redirectTo = '/login',
  fallbackComponent = null
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If no specific permissions required, allow access
  if (!permission && !permissions && !roles) {
    return children;
  }

  const userRole = user?.role;

  // Check role-based access
  if (roles && Array.isArray(roles)) {
    if (!roles.includes(userRole)) {
      return fallbackComponent || (
        <Result
          status="403"
          title="403"
          subTitle="Bạn không có quyền truy cập trang này."
          icon={<LockOutlined />}
          extra={
            <Button type="primary" icon={<HomeOutlined />} onClick={() => window.history.back()}>
              Quay lại
            </Button>
          }
        />
      );
    }
  }

  // Check permission-based access
  const hasAccess = () => {
    if (permission) {
      return hasPermission(userRole, permission);
    }

    if (permissions && Array.isArray(permissions)) {
      return requireAll 
        ? permissions.every(p => hasPermission(userRole, p))
        : hasAnyPermission(userRole, permissions);
    }

    return true;
  };

  if (!hasAccess()) {
    return fallbackComponent || (
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle="Bạn không có đủ quyền để truy cập trang này."
        icon={<LockOutlined />}
        extra={
          <Button type="primary" icon={<HomeOutlined />} onClick={() => window.history.back()}>
            Quay lại
          </Button>
        }
      />
    );
  }

  return children;
};

/**
 * Admin Route Guard
 * Specifically for admin-only routes
 */
export const AdminRouteGuard = ({ children, fallbackComponent = null }) => {
  return (
    <RouteGuard
      roles={[ROLES.ADMIN]}
      fallbackComponent={fallbackComponent}
    >
      {children}
    </RouteGuard>
  );
};

/**
 * Cashier Route Guard
 * For cashier and admin access
 */
export const CashierRouteGuard = ({ children, fallbackComponent = null }) => {
  return (
    <RouteGuard
      roles={[ROLES.ADMIN, ROLES.CASHIER]}
      fallbackComponent={fallbackComponent}
    >
      {children}
    </RouteGuard>
  );
};

/**
 * Staff Route Guard
 * For staff, cashier, and admin access
 */
export const StaffRouteGuard = ({ children, fallbackComponent = null }) => {
  return (
    <RouteGuard
      roles={[ROLES.ADMIN, ROLES.CASHIER, ROLES.STAFF]}
      fallbackComponent={fallbackComponent}
    >
      {children}
    </RouteGuard>
  );
};

/**
 * Public Route Guard
 * For routes that should only be accessible when NOT authenticated
 */
export const PublicRouteGuard = ({ 
  children, 
  redirectTo = '/dashboard',
  redirectIfAuthenticated = true 
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Role-based Route Component
 * Automatically redirects to appropriate dashboard based on role
 */
export const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role;

  switch (userRole) {
    case ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLES.CASHIER:
      return <Navigate to="/cashier/pos" replace />;
    case ROLES.STAFF:
      return <Navigate to="/staff/dashboard" replace />;
    case ROLES.CUSTOMER:
      return <Navigate to="/customer/profile" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

/**
 * Permission-based Route Guard
 * More granular permission checking for specific features
 */
export const PermissionRouteGuard = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallbackPath = null,
  showFallback = true
}) => {
  const { user } = useAuth();
  const userRole = user?.role;

  const hasAccess = () => {
    if (permission) {
      return hasPermission(userRole, permission);
    }

    if (permissions && Array.isArray(permissions)) {
      return requireAll 
        ? permissions.every(p => hasPermission(userRole, p))
        : hasAnyPermission(userRole, permissions);
    }

    return true;
  };

  if (!hasAccess()) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }

    if (showFallback) {
      return (
        <Result
          status="403"
          title="Tính năng không khả dụng"
          subTitle="Bạn không có quyền sử dụng tính năng này."
          icon={<LockOutlined />}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          }
        />
      );
    }

    return null;
  }

  return children;
};

/**
 * Development Route Guard
 * Only shows routes in development mode
 */
export const DevRouteGuard = ({ children }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

/**
 * Feature Flag Route Guard
 * Shows routes based on feature flags
 */
export const FeatureRouteGuard = ({ 
  children, 
  feature, 
  fallbackPath = '/404' 
}) => {
  // Simple feature flag check
  const featureFlags = {
    ai_features: true,
    gamification: true,
    advanced_analytics: true,
    mobile_app: true,
    api_integrations: true
  };

  const isFeatureEnabled = featureFlags[feature] !== false;

  if (!isFeatureEnabled) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

/**
 * Maintenance Mode Guard
 * Shows maintenance page when system is under maintenance
 */
export const MaintenanceGuard = ({ children }) => {
  const isMaintenanceMode = false; // This would come from API or config
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  if (isMaintenanceMode && !isAdmin) {
    return (
      <Result
        status="500"
        title="Hệ thống đang bảo trì"
        subTitle="Chúng tôi đang nâng cấp hệ thống. Vui lòng quay lại sau."
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        }
      />
    );
  }

  return children;
};

export default {
  RouteGuard,
  AdminRouteGuard,
  CashierRouteGuard,
  StaffRouteGuard,
  PublicRouteGuard,
  RoleBasedRedirect,
  PermissionRouteGuard,
  DevRouteGuard,
  FeatureRouteGuard,
  MaintenanceGuard
};
