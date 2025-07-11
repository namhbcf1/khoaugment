import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  Badge, 
  Avatar, 
  Dropdown, 
  Typography,
  Input,
  Drawer
} from 'antd';
import {
  MenuOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  MoreOutlined,
  ScanOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { announceToScreenReader } from '../../utils/accessibility';
import './MobileHeader.css';

const { Text } = Typography;

const MobileHeader = ({
  title,
  showBack = false,
  showMenu = true,
  showSearch = false,
  showNotifications = true,
  showProfile = true,
  onMenuClick,
  onBackClick,
  actions = [],
  searchPlaceholder = "Tìm kiếm...",
  onSearch,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, notifications = [] } = useAuth();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Handle back navigation
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
    announceToScreenReader('Đã quay lại trang trước', 'polite');
  };

  // Handle search toggle
  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      announceToScreenReader('Đã mở tìm kiếm', 'polite');
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
    if (value) {
      announceToScreenReader(`Đang tìm kiếm: ${value}`, 'polite');
    }
  };

  // Profile dropdown menu
  const profileMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <MoreOutlined />,
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      danger: true,
      onClick: () => {
        // Handle logout
        announceToScreenReader('Đã đăng xuất', 'polite');
      }
    }
  ];

  // Quick action buttons based on current page
  const getQuickActions = () => {
    const path = location.pathname;
    const defaultActions = [...actions];

    // Add context-specific actions
    if (path.includes('/pos')) {
      defaultActions.unshift({
        key: 'scan',
        icon: <ScanOutlined />,
        label: 'Quét mã',
        onClick: () => {
          // Handle barcode scan
          announceToScreenReader('Đã mở máy quét mã vạch', 'polite');
        }
      });
    }

    if (path.includes('/inventory') || path.includes('/products')) {
      defaultActions.unshift({
        key: 'add',
        icon: <PlusOutlined />,
        label: 'Thêm',
        onClick: () => navigate(`${path}/add`)
      });
    }

    return defaultActions;
  };

  const quickActions = getQuickActions();

  return (
    <>
      <div className={`mobile-header ${className}`}>
        <div className="mobile-header-main">
          {/* Left Section */}
          <div className="mobile-header-left">
            {showBack ? (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                className="mobile-header-btn"
                size="large"
                aria-label="Quay lại"
              />
            ) : showMenu ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={onMenuClick}
                className="mobile-header-btn"
                size="large"
                aria-label="Mở menu"
              />
            ) : null}
          </div>

          {/* Center Section */}
          <div className="mobile-header-center">
            {!searchVisible && (
              <Text className="mobile-header-title" strong>
                {title}
              </Text>
            )}
          </div>

          {/* Right Section */}
          <div className="mobile-header-right">
            <Space size="small">
              {/* Quick Actions */}
              {quickActions.slice(0, 2).map(action => (
                <Button
                  key={action.key}
                  type="text"
                  icon={action.icon}
                  onClick={action.onClick}
                  className="mobile-header-btn"
                  size="large"
                  aria-label={action.label}
                />
              ))}

              {/* Search Button */}
              {showSearch && (
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  onClick={handleSearchToggle}
                  className="mobile-header-btn"
                  size="large"
                  aria-label="Tìm kiếm"
                />
              )}

              {/* Notifications */}
              {showNotifications && (
                <Badge count={notifications.length} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => navigate('/notifications')}
                    className="mobile-header-btn"
                    size="large"
                    aria-label={`Thông báo (${notifications.length})`}
                  />
                </Badge>
              )}

              {/* Profile */}
              {showProfile && (
                <Dropdown
                  menu={{ items: profileMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    className="mobile-header-btn mobile-header-profile"
                    size="large"
                    aria-label="Menu người dùng"
                  >
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />}
                      src={user?.avatar}
                    />
                  </Button>
                </Dropdown>
              )}

              {/* More Actions */}
              {quickActions.length > 2 && (
                <Dropdown
                  menu={{
                    items: quickActions.slice(2).map(action => ({
                      key: action.key,
                      label: action.label,
                      icon: action.icon,
                      onClick: action.onClick
                    }))
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    className="mobile-header-btn"
                    size="large"
                    aria-label="Thêm hành động"
                  />
                </Dropdown>
              )}
            </Space>
          </div>
        </div>

        {/* Search Bar */}
        {searchVisible && (
          <div className="mobile-header-search">
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              onPressEnter={() => handleSearch(searchValue)}
              autoFocus
              allowClear
              className="mobile-search-input"
              aria-label="Nhập từ khóa tìm kiếm"
            />
            <Button
              type="text"
              onClick={handleSearchToggle}
              className="mobile-search-close"
              aria-label="Đóng tìm kiếm"
            >
              Hủy
            </Button>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      <Drawer
        title="Tìm kiếm"
        placement="top"
        height="100%"
        open={searchVisible && searchValue.length > 0}
        onClose={() => setSearchVisible(false)}
        className="mobile-search-drawer"
        bodyStyle={{ padding: 0 }}
      >
        <div className="mobile-search-results">
          <Text type="secondary">
            Kết quả tìm kiếm cho "{searchValue}"
          </Text>
          {/* Search results would go here */}
        </div>
      </Drawer>
    </>
  );
};

export default MobileHeader;
