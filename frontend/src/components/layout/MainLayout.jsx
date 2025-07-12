import {
  BarcodeOutlined,
  BellOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Layout, Menu, theme } from "antd";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Layout.css";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  const notificationItems = [
    {
      key: "1",
      label: "Đơn hàng mới #1234",
    },
    {
      key: "2",
      label: "Sản phẩm sắp hết hàng",
    },
    {
      key: "3",
      label: "Cập nhật hệ thống",
    },
  ];

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "/pos",
      icon: <ShoppingCartOutlined />,
      label: "Bán hàng",
    },
    {
      key: "/products",
      icon: <BarcodeOutlined />,
      label: "Sản phẩm",
    },
    {
      key: "/inventory",
      icon: <ShopOutlined />,
      label: "Kho hàng",
    },
    {
      key: "/orders",
      icon: <FileTextOutlined />,
      label: "Đơn hàng",
    },
    {
      key: "/customers",
      icon: <TeamOutlined />,
      label: "Khách hàng",
    },
    {
      key: "/reports",
      icon: <FileTextOutlined />,
      label: "Báo cáo",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const handleUserMenuClick = (e) => {
    if (e.key === "logout") {
      // Handle logout logic
      console.log("Logging out...");
      // navigate('/login');
    } else if (e.key === "profile") {
      navigate("/profile");
    } else if (e.key === "settings") {
      navigate("/settings");
    }
  };

  return (
    <Layout className="main-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div className="logo">{!collapsed ? "KhoAugment POS" : "POS"}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="header-content">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <div className="header-right">
              <Dropdown
                menu={{
                  items: notificationItems,
                }}
                placement="bottomRight"
                arrow
              >
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{ fontSize: "16px" }}
                  />
                </Badge>
              </Dropdown>
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
                arrow
              >
                <div className="user-profile">
                  <Avatar icon={<UserOutlined />} />
                  {!collapsed && <span className="username">Admin</span>}
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
