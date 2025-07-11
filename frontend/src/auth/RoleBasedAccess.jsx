import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuth } from './AuthContext';

const RoleBasedAccess = ({ 
  children, 
  allowedRoles = [], 
  requiredPermissions = [], 
  redirectPath = "/login"
}) => {
  const { role, isAuthenticated, hasRole, hasPermission } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.length === 0 || hasRole(allowedRoles);

  // Check if user has required permissions
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => hasPermission(permission));

  // If user doesn't have required role or permissions, show access denied
  if (!hasRequiredRole || !hasRequiredPermissions) {
    // Get appropriate redirect path based on user's highest role
    let fallbackPath = "/";
    
    if (role === 'admin') {
      fallbackPath = "/admin/dashboard";
    } else if (role === 'cashier') {
      fallbackPath = "/cashier/pos";
    } else if (role === 'staff') {
      fallbackPath = "/staff/dashboard";
    }

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f2f5'
      }}>
        <Result
          status="403"
          title="Không có quyền truy cập"
          subTitle={
            <div>
              <p>Xin lỗi, bạn không có quyền truy cập trang này.</p>
              <p>Hãy liên hệ với quản trị viên nếu bạn cần quyền này.</p>
            </div>
          }
          extra={[
            <Button type="primary" key="home" onClick={() => window.location.href = fallbackPath}>
              Về trang chính
            </Button>,
            <Button key="back" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          ]}
        />
      </div>
    );
  }

  return children;
};

export default RoleBasedAccess;