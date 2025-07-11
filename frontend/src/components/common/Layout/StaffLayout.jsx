import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Grid, message, Spin } from 'antd';
import AppHeader from '../Header';
import AppFooter from '../Footer';
import Sidebar from '../Sidebar';
import { useAuth } from '../../../auth/AuthContext';
import './styles.css';

const { Content } = Layout;
const { useBreakpoint } = Grid;

/**
 * Layout cho vai trò Staff (Nhân viên)
 */
const StaffLayout = ({ 
  showHeader = true,
  showSidebar = true,
  showFooter = false,
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
      } else if (user && user.role !== 'staff') {
        message.error('Bạn không có quyền truy cập trang này');
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
    <Layout className="site-layout">
      {/* Sidebar: chỉ hiển thị nếu showSidebar=true */}
      {showSidebar && (
        <>
          {isMobile ? (
            <Sidebar 
              collapsed={collapsed}
              onCollapse={setCollapsed}
              isMobile={true}
              visible={sidebarVisible}
              onClose={() => setSidebarVisible(false)}
            />
          ) : (
            <Sidebar 
              collapsed={collapsed}
              onCollapse={setCollapsed}
            />
          )}
        </>
      )}

      <Layout className={`site-layout-content ${showSidebar ? (collapsed ? 'content-collapsed' : 'content-expanded') : 'content-no-sidebar'}`}>
        {/* Header: chỉ hiển thị nếu showHeader=true */}
        {showHeader && (
          <AppHeader 
            collapsed={collapsed} 
            onCollapse={(c) => {
              if (isMobile) {
                setSidebarVisible(!sidebarVisible);
              } else {
                setCollapsed(c);
              }
            }}
            title="Trường Phát POS - Nhân viên"
          />
        )}

        {/* Content area */}
        <Content className="site-content staff-content" style={getContentPadding()}>
          <Outlet />
        </Content>

        {/* Footer: chỉ hiển thị nếu showFooter=true */}
        {showFooter && (
          <AppFooter minimal />
        )}
      </Layout>
    </Layout>
  );
};

export default StaffLayout;