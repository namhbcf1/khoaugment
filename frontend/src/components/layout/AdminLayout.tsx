import {
    AppstoreOutlined,
    BarChartOutlined,
    BellOutlined,
    DashboardOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Layout, Menu, theme } from 'antd';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get current selected menu key based on location
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin') return '/admin';
    const parts = path.split('/');
    if (parts.length >= 3) {
      return `/${parts[1]}/${parts[2]}`;
    }
    return path;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Helmet>
        <title>Quản trị - KhoAugment POS</title>
      </Helmet>
      
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{ 
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        theme="dark"
        width={256}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 24px',
        }}>
          {!collapsed && (
            <h1 style={{ 
              color: 'white', 
              margin: 0, 
              fontSize: 20,
              fontWeight: 600,
            }}>
              KhoAugment POS
            </h1>
          )}
          {collapsed && (
            <div style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>
              K
            </div>
          )}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={({ key }) => handleMenuClick(key as string)}
          items={[
            {
              key: '/admin',
              icon: <DashboardOutlined />,
              label: 'Tổng quan',
            },
            {
              key: '/admin/products',
              icon: <ShoppingOutlined />,
              label: 'Sản phẩm',
            },
            {
              key: '/admin/categories',
              icon: <AppstoreOutlined />,
              label: 'Danh mục',
            },
            {
              key: '/admin/orders',
              icon: <ShoppingCartOutlined />,
              label: 'Đơn hàng',
            },
            {
              key: '/admin/customers',
              icon: <UserOutlined />,
              label: 'Khách hàng',
            },
            {
              key: '/admin/reports',
              icon: <BarChartOutlined />,
              label: 'Báo cáo',
            },
            {
              key: '/admin/users',
              icon: <TeamOutlined />,
              label: 'Người dùng',
            },
            {
              key: '/admin/settings',
              icon: <SettingOutlined />,
              label: 'Cài đặt',
            },
          ]}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: token.colorBgContainer,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Badge count={5} dot>
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                style={{ fontSize: 16 }}
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button 
                type="text" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  marginLeft: 16,
                }}
              >
                <Avatar 
                  style={{ marginRight: 8 }} 
                  icon={<UserOutlined />}
                />
                {user?.full_name || 'Admin'}
              </Button>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: token.colorBgContainer,
          borderRadius: 8,
          minHeight: 280,
          overflow: 'initial',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 