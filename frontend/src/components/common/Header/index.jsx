import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layout, Menu, Button, Dropdown, Space, Avatar, Badge, Divider,
  Typography, Input, Select, Row, Col, Drawer, message, Tooltip
} from 'antd';
import {
  UserOutlined, LogoutOutlined, BellOutlined, SearchOutlined,
  MenuUnfoldOutlined, MenuFoldOutlined, SettingOutlined,
  GlobalOutlined, QuestionCircleOutlined, ShoppingCartOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';
import { CompactLanguageSwitcher } from '../LanguageSwitcher';
import OfflineIndicator from '../OfflineIndicator';
import './styles.css';

const { Header } = Layout;
const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

/**
 * Header component với menu và user controls
 */
const AppHeader = ({ 
  collapsed, 
  onCollapse, 
  title = "Trường Phát POS",
  showSearch = true,
  showNotifications = true 
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Mock data cho thông báo
  const notifications = [
    {
      id: 1,
      title: 'Đơn hàng mới',
      message: 'Đơn hàng #123456 vừa được tạo',
      time: '5 phút trước',
      read: false
    },
    {
      id: 2,
      title: 'Sản phẩm sắp hết hàng',
      message: 'Laptop Dell XPS 13 sắp hết hàng (còn 2)',
      time: '30 phút trước',
      read: false
    },
    {
      id: 3,
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ bảo trì lúc 22:00 tối nay',
      time: '2 giờ trước',
      read: true
    }
  ];

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      message.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  // Menu người dùng
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // Danh sách thông báo
  const notificationsMenu = (
    <Menu style={{ width: 320 }}>
      <Menu.Item key="header" disabled style={{ cursor: 'default' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Thông báo</Text>
          <Button type="link" size="small">Đánh dấu tất cả đã đọc</Button>
        </div>
      </Menu.Item>
      <Menu.Divider />
      {notifications.length > 0 ? (
        notifications.map(notification => (
          <Menu.Item key={notification.id} style={{ opacity: notification.read ? 0.7 : 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {!notification.read && (
                  <Badge color="blue" style={{ marginRight: 8 }} />
                )}
                <Text strong>{notification.title}</Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">{notification.message}</Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {notification.time}
                </Text>
              </div>
            </div>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item key="empty">
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <Text type="secondary">Không có thông báo mới</Text>
          </div>
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="footer">
        <div style={{ textAlign: 'center' }}>
          <Button type="link" onClick={() => navigate('/notifications')}>
            Xem tất cả
          </Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="app-header">
      <div className="header-left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ fontSize: '16px', width: 64, height: 64 }}
        />
        <div className="logo-title">
          <Link to="/">
            <h1>{title}</h1>
          </Link>
        </div>
      </div>

      <div className="header-right">
        {showSearch && (
          <div className="header-search">
            <Search
              placeholder="Tìm kiếm..."
              allowClear
              onSearch={value => console.log(value)}
              style={{ width: 250 }}
            />
          </div>
        )}
        
        <div className="header-actions">
          {showNotifications && (
            <Dropdown
              overlay={notificationsMenu}
              trigger={['click']}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <Badge count={notifications.filter(n => !n.read).length} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ fontSize: '16px' }}
                />
              </Badge>
            </Dropdown>
          )}

          <OfflineIndicator />

          <CompactLanguageSwitcher style={{ marginRight: 8 }} />

          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <div className="user-profile">
              <Avatar 
                icon={<UserOutlined />} 
                src={user?.avatar}
                style={{ cursor: 'pointer' }}
              />
              <span className="username">{user?.name || 'User'}</span>
            </div>
          </Dropdown>
        </div>
      </div>
      
      {/* Responsive Search Drawer (mobile) */}
      <Drawer
        title="Tìm kiếm"
        placement="top"
        onClose={() => setSearchVisible(false)}
        visible={searchVisible}
        height={120}
      >
        <Search
          placeholder="Tìm kiếm..."
          allowClear
          enterButton
          onSearch={value => {
            console.log(value);
            setSearchVisible(false);
          }}
          size="large"
        />
      </Drawer>
    </Header>
  );
};

export default AppHeader; 