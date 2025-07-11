import React from 'react';
import { Result, Button } from 'antd';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../auth/permissions';

/**
 * Permission Guard Component
 * Conditionally renders content based on user permissions
 */
export const PermissionGuard = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showFallback = true,
  redirectTo = null,
  className = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role;

  // Check permissions
  const hasAccess = () => {
    if (!userRole) return false;

    if (permission) {
      return hasPermission(userRole, permission);
    }

    if (permissions && Array.isArray(permissions)) {
      return requireAll 
        ? hasAllPermissions(userRole, permissions)
        : hasAnyPermission(userRole, permissions);
    }

    return true; // No specific permissions required
  };

  const canAccess = hasAccess();

  // Handle redirect
  if (!canAccess && redirectTo) {
    navigate(redirectTo);
    return null;
  }

  // Show content if user has access
  if (canAccess) {
    return <div className={className}>{children}</div>;
  }

  // Show custom fallback
  if (fallback) {
    return fallback;
  }

  // Show default fallback if enabled
  if (showFallback) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập tính năng này."
        icon={<LockOutlined />}
        extra={
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        }
      />
    );
  }

  // Don't render anything
  return null;
};

/**
 * Role Guard Component
 * Conditionally renders content based on user role
 */
export const RoleGuard = ({
  children,
  role,
  roles,
  fallback = null,
  showFallback = true,
  className = ''
}) => {
  const { user } = useAuth();
  const userRole = user?.role;

  const hasAccess = () => {
    if (!userRole) return false;

    if (role) {
      return userRole === role;
    }

    if (roles && Array.isArray(roles)) {
      return roles.includes(userRole);
    }

    return true;
  };

  const canAccess = hasAccess();

  if (canAccess) {
    return <div className={className}>{children}</div>;
  }

  if (fallback) {
    return fallback;
  }

  if (showFallback) {
    return (
      <Result
        status="403"
        title="Không có quyền truy cập"
        subTitle="Tính năng này chỉ dành cho một số vai trò nhất định."
        icon={<LockOutlined />}
      />
    );
  }

  return null;
};

/**
 * Feature Guard Component
 * Conditionally renders content based on feature flags
 */
export const FeatureGuard = ({
  children,
  feature,
  fallback = null,
  className = ''
}) => {
  // Simple feature flag check - can be enhanced with external service
  const isFeatureEnabled = (featureName) => {
    // For now, all features are enabled
    // In production, this would check against a feature flag service
    const featureFlags = {
      ai_features: true,
      gamification: true,
      advanced_analytics: true,
      mobile_app: true,
      api_integrations: true
    };

    return featureFlags[featureName] !== false;
  };

  if (isFeatureEnabled(feature)) {
    return <div className={className}>{children}</div>;
  }

  return fallback;
};

/**
 * Conditional Render Component
 * Renders content based on multiple conditions
 */
export const ConditionalRender = ({
  children,
  condition,
  permission,
  role,
  feature,
  fallback = null,
  className = ''
}) => {
  const { user } = useAuth();
  const userRole = user?.role;

  const shouldRender = () => {
    // Custom condition
    if (condition !== undefined && !condition) {
      return false;
    }

    // Permission check
    if (permission && !hasPermission(userRole, permission)) {
      return false;
    }

    // Role check
    if (role && userRole !== role) {
      return false;
    }

    // Feature check
    if (feature && !FeatureGuard({ feature }).props.children) {
      return false;
    }

    return true;
  };

  if (shouldRender()) {
    return <div className={className}>{children}</div>;
  }

  return fallback;
};

/**
 * Permission Button Component
 * Button that's only visible/enabled based on permissions
 */
export const PermissionButton = ({
  children,
  permission,
  permissions,
  requireAll = false,
  disabled = false,
  hideIfNoAccess = false,
  ...buttonProps
}) => {
  const { user } = useAuth();
  const userRole = user?.role;

  const hasAccess = () => {
    if (!userRole) return false;

    if (permission) {
      return hasPermission(userRole, permission);
    }

    if (permissions && Array.isArray(permissions)) {
      return requireAll 
        ? hasAllPermissions(userRole, permissions)
        : hasAnyPermission(userRole, permissions);
    }

    return true;
  };

  const canAccess = hasAccess();

  if (!canAccess && hideIfNoAccess) {
    return null;
  }

  return (
    <Button
      {...buttonProps}
      disabled={disabled || !canAccess}
      title={!canAccess ? 'Bạn không có quyền thực hiện hành động này' : buttonProps.title}
    >
      {children}
    </Button>
  );
};

/**
 * Permission Link Component
 * Link that's only visible/enabled based on permissions
 */
export const PermissionLink = ({
  children,
  permission,
  to,
  hideIfNoAccess = false,
  className = '',
  ...linkProps
}) => {
  const { user } = useAuth();
  const userRole = user?.role;

  const canAccess = hasPermission(userRole, permission);

  if (!canAccess && hideIfNoAccess) {
    return null;
  }

  if (!canAccess) {
    return (
      <span 
        className={`${className} disabled-link`}
        style={{ color: '#ccc', cursor: 'not-allowed' }}
        title="Bạn không có quyền truy cập"
      >
        {children}
      </span>
    );
  }

  return (
    <a href={to} className={className} {...linkProps}>
      {children}
    </a>
  );
};

/**
 * Higher-Order Component for permission checking
 */
export const withPermission = (permission) => (WrappedComponent) => {
  return function PermissionWrappedComponent(props) {
    return (
      <PermissionGuard permission={permission}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
};

/**
 * Higher-Order Component for role checking
 */
export const withRole = (role) => (WrappedComponent) => {
  return function RoleWrappedComponent(props) {
    return (
      <RoleGuard role={role}>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
};

/**
 * Hook for permission checking
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  return {
    hasPermission: (permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(userRole, permissions),
    userRole,
    user
  };
};

export default {
  PermissionGuard,
  RoleGuard,
  FeatureGuard,
  ConditionalRender,
  PermissionButton,
  PermissionLink,
  withPermission,
  withRole,
  usePermissions
};
