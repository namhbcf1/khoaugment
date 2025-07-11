/**
 * Role-Based Access Control Component
 * Component-level access control based on user roles and permissions
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import React from 'react';
import { Alert, Button, Tooltip } from 'antd';
import { LockOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useAuth } from './AuthContext';
import { USER_ROLES } from '../utils/constants/USER_ROLES.js';

/**
 * RoleBasedAccess Component
 * Controls content visibility based on user roles and permissions
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to show when access is granted
 * @param {string|Array} props.allowedRoles - Roles allowed to view content
 * @param {string|Array} props.requiredPermissions - Permissions required to view content
 * @param {React.ReactNode} props.fallback - Content to show when access is denied
 * @param {boolean} props.hideWhenNoAccess - Hide completely when no access (default: true)
 * @param {boolean} props.showAccessDenied - Show access denied message instead of hiding
 * @param {string} props.accessDeniedMessage - Custom access denied message
 * @param {boolean} props.showTooltip - Show tooltip explaining access requirements
 * @param {string} props.tooltipTitle - Custom tooltip title
 * @returns {JSX.Element|null} Rendered content or null
 */
const RoleBasedAccess = ({ 
  children, 
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
  hideWhenNoAccess = true,
  showAccessDenied = false,
  accessDeniedMessage = 'Bạn không có quyền xem nội dung này',
  showTooltip = false,
  tooltipTitle = 'Yêu cầu quyền truy cập'
}) => {
  const { user, isAuthenticated, hasRole, hasPermission } = useAuth();

  // Helper function to check access
  const checkAccess = () => {
    // If not authenticated
    if (!isAuthenticated || !user) {
      return false;
    }

    // Check role requirements
    if (allowedRoles.length > 0) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const hasAllowedRole = roles.some(role => hasRole(role));
      if (!hasAllowedRole) {
        return false;
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      const hasRequiredPermissions = permissions.every(permission => 
        hasPermission(permission)
      );
      if (!hasRequiredPermissions) {
        return false;
      }
    }

    return true;
  };

  const hasAccess = checkAccess();

  // If user has access, render children
  if (hasAccess) {
    return children;
  }

  // If no access and should show access denied message
  if (showAccessDenied) {
    const accessDeniedContent = (
      <Alert
        message="Truy cập bị từ chối"
        description={accessDeniedMessage}
        type="warning"
        icon={<LockOutlined />}
        showIcon
        action={
          <Button size="small" type="link">
            Liên hệ quản trị viên
          </Button>
        }
        style={{ margin: '8px 0' }}
      />
    );

    return showTooltip ? (
      <Tooltip title={tooltipTitle}>
        {accessDeniedContent}
      </Tooltip>
    ) : accessDeniedContent;
  }

  // If should hide when no access
  if (hideWhenNoAccess) {
    return null;
  }

  // Return fallback content
  if (fallback) {
    return showTooltip ? (
      <Tooltip title={tooltipTitle}>
        {fallback}
      </Tooltip>
    ) : fallback;
  }

  // Default fallback - show disabled placeholder
  const disabledContent = (
    <div style={{ 
      opacity: 0.5, 
      cursor: 'not-allowed',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <EyeInvisibleOutlined />
      <span>Nội dung bị ẩn</span>
    </div>
  );

  return showTooltip ? (
    <Tooltip title={tooltipTitle}>
      {disabledContent}
    </Tooltip>
  ) : disabledContent;
};

/**
 * Higher-order component for role-based access control
 * @param {Object} accessConfig - Access configuration
 * @returns {Function} HOC function
 */
export const withRoleAccess = (accessConfig = {}) => {
  return (Component) => {
    const AccessControlledComponent = (props) => (
      <RoleBasedAccess {...accessConfig}>
        <Component {...props} />
      </RoleBasedAccess>
    );
    
    AccessControlledComponent.displayName = `withRoleAccess(${Component.displayName || Component.name})`;
    return AccessControlledComponent;
  };
};

/**
 * Hook for checking access in components
 * @param {Object} config - Access configuration
 * @returns {Object} Access check results
 */
export const useAccessControl = (config = {}) => {
  const { allowedRoles = [], requiredPermissions = [] } = config;
  const { user, isAuthenticated, hasRole, hasPermission } = useAuth();

  const checkAccess = () => {
    if (!isAuthenticated || !user) return false;

    if (allowedRoles.length > 0) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const hasAllowedRole = roles.some(role => hasRole(role));
      if (!hasAllowedRole) return false;
    }

    if (requiredPermissions.length > 0) {
      const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      const hasRequiredPermissions = permissions.every(permission => 
        hasPermission(permission)
      );
      if (!hasRequiredPermissions) return false;
    }

    return true;
  };

  return {
    hasAccess: checkAccess(),
    isAuthenticated,
    user,
    hasRole,
    hasPermission
  };
};

/**
 * Predefined access configurations
 */
export const ACCESS_CONFIGS = {
  ADMIN_ONLY: {
    allowedRoles: [USER_ROLES.ADMIN],
    showAccessDenied: true,
    accessDeniedMessage: 'Chỉ quản trị viên mới có thể truy cập'
  },
  
  STAFF_AND_ADMIN: {
    allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.STAFF],
    showAccessDenied: true,
    accessDeniedMessage: 'Yêu cầu quyền nhân viên hoặc quản trị viên'
  },
  
  CASHIER_ACCESS: {
    allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.CASHIER, USER_ROLES.STAFF],
    showAccessDenied: true,
    accessDeniedMessage: 'Yêu cầu quyền thu ngân, nhân viên hoặc quản trị viên'
  },
  
  AUTHENTICATED_ONLY: {
    hideWhenNoAccess: true,
    showTooltip: true,
    tooltipTitle: 'Yêu cầu đăng nhập'
  }
};

export default RoleBasedAccess;
