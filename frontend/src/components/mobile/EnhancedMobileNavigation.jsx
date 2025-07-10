import React, { useState, useEffect, useRef } from 'react';
import { 
  Drawer, 
  Button, 
  Menu, 
  Avatar, 
  Typography, 
  Space, 
  Badge, 
  Divider,
  Input,
  Collapse,
  FloatButton
} from 'antd';
import {
  MenuOutlined,
  CloseOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { announceToScreenReader, handleKeyboardNavigation } from '../../utils/accessibility';
import './EnhancedMobileNavigation.css';

const { Text, Title } = Typography;
const { Panel } = Collapse;

const EnhancedMobileNavigation = ({
  visible,
  onClose,
  menuItems = [],
  notifications = [],
  quickActions = [],
  showSearch = true,
  showNotifications = true,
  showQuickActions = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems);
  const [activePanel, setActivePanel] = useState(['navigation']);
  const drawerRef = useRef(null);

  // Filter menu items based on search
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredMenuItems(menuItems);
      return;
    }

    const filtered = menuItems.filter(item => 
      item.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      (item.children && item.children.some(child => 
        child.label.toLowerCase().includes(searchValue.toLowerCase())
      ))
    );

    setFilteredMenuItems(filtered);
  }, [searchValue, menuItems]);

  // Handle menu item click
  const handleMenuClick = (path) => {
    navigate(path);
    onClose();
    announceToScreenReader(`Đã chuyển đến ${path}`, 'polite');
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
    if (value) {
      announceToScreenReader(`Tìm thấy ${filteredMenuItems.length} kết quả`, 'polite');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    onClose();
    announceToScreenReader('Đã đăng xuất', 'polite');
  };

  // Handle quick action
  const handleQuickAction = (action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    }
    onClose();
  };

  // Render menu items recursively
  const renderMenuItems = (items) => {
    return items.map(item => {
      if (item.children) {
        return (
          <Panel 
            header={
              <Space>
                {item.icon}
                <Text>{item.label}</Text>
                {item.badge && <Badge count={item.badge} size="small" />}
              </Space>
            }
            key={item.key}
          >
            <div className="submenu-items">
              {item.children.map(child => (
                <div
                  key={child.key}
                  className={`menu-item ${location.pathname === child.path ? 'active' : ''}`}
                  onClick={() => handleMenuClick(child.path)}
                  onKeyDown={(e) => handleKeyboardNavigation(e, {
                    onEnter: () => handleMenuClick(child.path)
                  })}
                  tabIndex={0}
                  role="button"
                  aria-label={`Chuyển đến ${child.label}`}
                >
                  <Space>
                    {child.icon}
                    <Text>{child.label}</Text>
                    {child.badge && <Badge count={child.badge} size="small" />}
                  </Space>
                </div>
              ))}
            </div>
          </Panel>
        );
      }

      return (
        <div
          key={item.key}
          className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => handleMenuClick(item.path)}
          onKeyDown={(e) => handleKeyboardNavigation(e, {
            onEnter: () => handleMenuClick(item.path)
          })}
          tabIndex={0}
          role="button"
          aria-label={`Chuyển đến ${item.label}`}
        >
          <Space>
            {item.icon}
            <Text>{item.label}</Text>
            {item.badge && <Badge count={item.badge} size="small" />}
          </Space>
        </div>
      );
    });
  };

  return (
    <Drawer
      ref={drawerRef}
      title={null}
      placement="left"
      closable={false}
      onClose={onClose}
      open={visible}
      bodyStyle={{ padding: 0 }}
      className="enhanced-mobile-navigation"
      width={320}
      aria-label="Menu điều hướng chính"
    >
      {/* Header */}
      <div className="mobile-nav-header">
        <div className="mobile-nav-header-top">
          <div className="mobile-nav-logo">
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              KhoAugment
            </Title>
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="mobile-nav-close"
            size="large"
            aria-label="Đóng menu"
          />
        </div>

        {/* User Info */}
        <div className="mobile-nav-user">
          <Avatar 
            size="large"
            icon={<UserOutlined />}
            src={user?.avatar}
          />
          <div className="mobile-nav-user-info">
            <Text strong style={{ color: '#fff' }}>
              {user?.name || 'Người dùng'}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Khách'}
            </Text>
          </div>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="mobile-nav-search">
          <Input
            placeholder="Tìm kiếm menu..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            aria-label="Tìm kiếm trong menu"
          />
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <div className="mobile-nav-quick-actions">
          <Text strong className="section-title">Thao tác nhanh</Text>
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <Button
                key={action.key}
                type="text"
                icon={action.icon}
                onClick={() => handleQuickAction(action)}
                className="quick-action-btn"
                aria-label={action.label}
              >
                <Text className="quick-action-text">{action.label}</Text>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="mobile-nav-content">
        <Collapse 
          activeKey={activePanel}
          onChange={setActivePanel}
          ghost
          expandIconPosition="end"
          className="mobile-nav-collapse"
        >
          <Panel 
            header={
              <Space>
                <HomeOutlined />
                <Text strong>Điều hướng</Text>
              </Space>
            }
            key="navigation"
          >
            <div className="navigation-items">
              {renderMenuItems(filteredMenuItems)}
            </div>
          </Panel>

          {/* Notifications */}
          {showNotifications && notifications.length > 0 && (
            <Panel 
              header={
                <Space>
                  <BellOutlined />
                  <Text strong>Thông báo</Text>
                  <Badge count={notifications.length} size="small" />
                </Space>
              }
              key="notifications"
            >
              <div className="notification-items">
                {notifications.slice(0, 5).map(notification => (
                  <div key={notification.id} className="notification-item">
                    <Text strong>{notification.title}</Text>
                    <Text type="secondary" className="notification-message">
                      {notification.message}
                    </Text>
                    <Text type="secondary" className="notification-time">
                      {notification.time}
                    </Text>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Settings */}
          <Panel 
            header={
              <Space>
                <SettingOutlined />
                <Text strong>Cài đặt</Text>
              </Space>
            }
            key="settings"
          >
            <div className="settings-items">
              <div 
                className="menu-item"
                onClick={() => handleMenuClick('/profile')}
                tabIndex={0}
                role="button"
              >
                <Space>
                  <UserOutlined />
                  <Text>Hồ sơ cá nhân</Text>
                </Space>
              </div>
              <div 
                className="menu-item"
                onClick={() => handleMenuClick('/settings')}
                tabIndex={0}
                role="button"
              >
                <Space>
                  <SettingOutlined />
                  <Text>Cài đặt hệ thống</Text>
                </Space>
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>

      {/* Footer */}
      <div className="mobile-nav-footer">
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          size="large"
          aria-label="Đăng xuất khỏi hệ thống"
        >
          Đăng xuất
        </Button>
      </div>
    </Drawer>
  );
};

export default EnhancedMobileNavigation;
