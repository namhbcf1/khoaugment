import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, Drawer, Grid, message, Spin, Modal } from 'antd';
import { MenuOutlined, ReloadOutlined } from '@ant-design/icons';
import AppHeader from '../Header';
import AppFooter from '../Footer';
import Sidebar from '../Sidebar';
import { useAuth } from '../../../auth/AuthContext';
import './styles.css';

const { Content } = Layout;
const { useBreakpoint } = Grid;

/**
 * Layout cho vai trò Cashier (Thu ngân)
 */
const CashierLayout = ({ 
  showHeader = true,
  showSidebar = true,
  showFooter = false,
  fullWidth = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const screens = useBreakpoint();
  
  const [collapsed, setCollapsed] = useState(screens.lg ? false : true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [shift, setShift] = useState(null);

  // Kiểm tra đăng nhập và role
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location.pathname } });
      } else if (user && user.role !== 'cashier') {
        message.error('Bạn không có quyền truy cập trang này');
        navigate('/');
      } else {
        // Kiểm tra ca làm việc
        checkActiveShift();
      }
    }
  }, [isAuthenticated, user, loading, navigate, location.pathname]);

  // Kiểm tra ca làm việc hiện tại
  const checkActiveShift = async () => {
    try {
      // Giả lập API call, thực tế sẽ gọi service để kiểm tra ca làm việc
      const activeShift = localStorage.getItem('activeShift');
      
      if (activeShift) {
        setShift(JSON.parse(activeShift));
      } else if (location.pathname !== '/cashier/session/start') {
        // Nếu không có ca làm việc và không đang ở trang mở ca
        Modal.confirm({
          title: 'Chưa mở ca',
          content: 'Bạn cần mở ca làm việc trước khi sử dụng hệ thống POS. Chuyển đến trang mở ca?',
          okText: 'Đến trang mở ca',
          cancelText: 'Hủy',
          onOk() {
            navigate('/cashier/session/start');
          },
        });
      }
    } catch (error) {
      console.error('Error checking shift:', error);
    }
  };

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
            title="Trường Phát POS - Thu Ngân"
          />
        )}

        {/* Hiển thị thông tin ca làm việc nếu có */}
        {shift && (
          <div className="shift-info">
            <div className="shift-status">
              <span>Ca làm việc: <strong>{shift.name}</strong></span>
              <span>Bắt đầu: <strong>{new Date(shift.startTime).toLocaleString()}</strong></span>
              <Button type="link" icon={<ReloadOutlined />} onClick={checkActiveShift}>
                Làm mới
              </Button>
            </div>
          </div>
        )}

        {/* Content area */}
        <Content className="site-content" style={getContentPadding()}>
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

export default CashierLayout;