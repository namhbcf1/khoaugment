import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Layout, Menu, Tooltip, Typography, Avatar, Badge, Drawer 
} from 'antd';
import {
  DashboardOutlined, ShoppingOutlined, ShoppingCartOutlined,
  UserOutlined, TeamOutlined, BarChartOutlined, SettingOutlined,
  ShopOutlined, MobileOutlined, AppstoreOutlined, FileTextOutlined,
  BankOutlined, ClockCircleOutlined, TrophyOutlined, BookOutlined,
  MailOutlined, BellOutlined, CalendarOutlined, LogoutOutlined,
  HomeOutlined, RollbackOutlined, LaptopOutlined, DesktopOutlined,
  BulbOutlined, RobotOutlined, DollarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';
import './styles.css';

const { Sider } = Layout;
const { SubMenu } = Menu;
const { Text } = Typography;

/**
 * Sidebar component với menu phân quyền theo role
 */
const Sidebar = ({ 
  collapsed, 
  onCollapse, 
  isMobile = false,
  visible,
  onClose
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole, hasPermission, getAccessibleMenus } = useAuth();
  
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  // Xác định menu item đang được chọn dựa trên URL
  useEffect(() => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const currentKey = '/' + pathSnippets.join('/');
    
    setSelectedKeys([currentKey]);
    
    if (pathSnippets.length > 1) {
      setOpenKeys(prev => {
        const newOpenKeys = [`/${pathSnippets[0]}`];
        // Không thay đổi các openKeys khác nếu đã có
        return [...new Set([...prev, ...newOpenKeys])];
      });
    }
  }, [location.pathname]);

  // Tạo menu items dựa trên role
  useEffect(() => {
    const accessibleMenus = getAccessibleMenus ? getAccessibleMenus() : [];
    setMenuItems(accessibleMenus);
  }, [user, getAccessibleMenus]);

  // Xử lý khi menu item được click
  const handleMenuClick = (e) => {
    navigate(e.key);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Map icon component từ tên icon
  const getIconComponent = (iconName) => {
    const iconMap = {
      'DashboardOutlined': <DashboardOutlined />,
      'ShoppingOutlined': <ShoppingOutlined />,
      'ShoppingCartOutlined': <ShoppingCartOutlined />,
      'UserOutlined': <UserOutlined />,
      'TeamOutlined': <TeamOutlined />,
      'BarChartOutlined': <BarChartOutlined />,
      'SettingOutlined': <SettingOutlined />,
      'ShopOutlined': <ShopOutlined />,
      'MobileOutlined': <MobileOutlined />,
      'AppstoreOutlined': <AppstoreOutlined />,
      'FileTextOutlined': <FileTextOutlined />,
      'BankOutlined': <BankOutlined />,
      'ClockCircleOutlined': <ClockCircleOutlined />,
      'TrophyOutlined': <TrophyOutlined />,
      'BookOutlined': <BookOutlined />,
      'MailOutlined': <MailOutlined />,
      'BellOutlined': <BellOutlined />,
      'CalendarOutlined': <CalendarOutlined />,
      'LogoutOutlined': <LogoutOutlined />,
      'HomeOutlined': <HomeOutlined />,
      'RollbackOutlined': <RollbackOutlined />,
      'LaptopOutlined': <LaptopOutlined />,
      'DesktopOutlined': <DesktopOutlined />,
      'BulbOutlined': <BulbOutlined />,
      'RobotOutlined': <RobotOutlined />,
      'DollarOutlined': <DollarOutlined />
    };
    
    return iconMap[iconName] || <AppstoreOutlined />;
  };

  // Tạo các menu item từ data
  const renderMenuItems = (items) => {
    return items.map(item => {
      if (item.children) {
        return (
          <SubMenu 
            key={item.key} 
            icon={getIconComponent(item.icon)} 
            title={item.label}
          >
            {renderMenuItems(item.children)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item 
          key={item.path} 
          icon={getIconComponent(item.icon)}
        >
          {item.label}
          {item.badge && (
            <Badge count={item.badge} size="small" offset={[10, 0]} />
          )}
        </Menu.Item>
      );
    });
  };

  // Menu cố định ngoài những menu động
  const staticMenu = [
    {
      key: 'home',
      label: 'Trang chủ',
      path: '/',
      icon: 'HomeOutlined',
    }
  ];

  // Nội dung của sidebar
  const sidebarContent = (
    <>
      <div className="logo">
        {!collapsed && (
          <Typography.Title level={4} style={{ margin: 0, color: '#fff' }}>
            Trường Phát
          </Typography.Title>
        )}
      </div>
      
      <div className="sidebar-user">
        <Avatar 
          size={collapsed ? 'default' : 'large'}
          icon={<UserOutlined />}
          src={user?.avatar}
        />
        {!collapsed && (
          <div className="user-info">
            <Text strong style={{ color: '#fff' }}>
              {user?.name || 'Người dùng'}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Khách'}
            </Text>
          </div>
        )}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        onClick={handleMenuClick}
      >
        {/* Menu cố định */}
        {renderMenuItems(staticMenu)}
        
        {/* Divider nếu có menu động */}
        {menuItems.length > 0 && (
          <Menu.Divider />
        )}
        
        {/* Menu động dựa trên role */}
        {renderMenuItems(menuItems)}
      </Menu>
    </>
  );

  // Trường hợp mobile: hiển thị Drawer
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        closable={true}
        onClose={onClose}
        open={visible}
        className="sidebar-drawer"
        width={256}
        bodyStyle={{ padding: 0, backgroundColor: '#001529' }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Trường hợp desktop: hiển thị Sider
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={256}
      className="app-sidebar"
    >
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar; 