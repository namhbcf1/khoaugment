import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Grid, message, Spin } from 'antd';
import AppHeader from '../Header';
import AppFooter from '../Footer';
import Sidebar from '../Sidebar';
import ResponsiveLayout from '../../layout/ResponsiveLayout';
import { useAuth } from '../../../auth/AuthContext';
import './styles.css';

const { Content } = Layout;
const { useBreakpoint } = Grid;

/**
 * Layout cho vai trò Admin
 */
const AdminLayout = ({ 
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  fullWidth = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const screens = useBreakpoint();
  
  const [collapsed, setCollapsed] = useState(screens.lg ? false : true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Kiểm tra đăng nhập và role
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location.pathname } });
      } else if (user && user.role !== 'admin') {
        message.error('Bạn không có quyền truy cập trang quản trị');
        navigate('/');
      }
    }
  }, [isAuthenticated, user, loading, navigate, location.pathname]);

  // Tính toán padding cho content
  const getContentPadding = () => {
    if (fullWidth) return 0;
    return { padding: '24px' };
  };

  // Xử lý responsive cho sidebar
  const isMobile = !screens.lg;

  // Kiểm tra loading state
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <div className="loading-text">Đang tải...</div>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      sidebar={showSidebar ? (
        <Sidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          isMobile={isMobile}
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
        />
      ) : null}
      header={showHeader ? (
        <AppHeader
          collapsed={collapsed}
          onCollapse={(c) => {
            if (isMobile) {
              setSidebarVisible(!sidebarVisible);
            } else {
              setCollapsed(c);
            }
          }}
          title="KhoAugment POS - Quản trị"
        />
      ) : null}
      className="admin-layout"
    >
      <div className={`admin-content ${fullWidth ? 'full-width' : ''}`} style={getContentPadding()}>
        <Outlet />
        {showFooter && <AppFooter minimal />}
      </div>
    </ResponsiveLayout>
  );
};

export default AdminLayout;