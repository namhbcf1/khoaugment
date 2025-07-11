import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spin } from 'antd';

/**
 * Component bảo vệ route yêu cầu đăng nhập và phân quyền
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con được render khi đã xác thực
 * @param {Array} props.requiredRoles - Mảng các role được phép truy cập (nếu không cung cấp = tất cả role)
 * @param {Array} props.requiredPermissions - Mảng các quyền được yêu cầu (nếu không cung cấp = không kiểm tra)
 * @param {string} props.redirectTo - Đường dẫn redirect khi không có quyền (mặc định là /login)
 */
const ProtectedRoute = ({ 
  children, 
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const { isAuthenticated, user, loading, hasRole, hasPermission } = useAuth();

  // Hiển thị loading khi đang kiểm tra xác thực
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Đang xác thực..." />
      </div>
    );
  }

  // Chưa đăng nhập -> chuyển hướng đến trang đăng nhập
  // và lưu URL hiện tại để redirect lại sau khi đăng nhập
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Kiểm tra role nếu được yêu cầu
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/403" replace />;
    }
  }

  // Kiểm tra permissions nếu được yêu cầu
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    if (!hasRequiredPermissions) {
      return <Navigate to="/403" replace />;
    }
  }

  // Đã xác thực và có đủ quyền -> render component con
  return children;
};

export default ProtectedRoute;