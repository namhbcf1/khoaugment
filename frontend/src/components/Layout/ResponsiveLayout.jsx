import React, { useState, useEffect } from 'react';
import { Layout, Drawer, Button, Grid } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import EnhancedMobileNavigation from '../mobile/EnhancedMobileNavigation';
import MobileHeader from '../mobile/MobileHeader';
import { useMobileNavigation, useMobileDetection } from '../../hooks/useMobileGestures';
import './ResponsiveLayout.css';


const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const ResponsiveLayout = ({
  children,
  sidebar,
  header,
  className = '',
  siderWidth = 256,
  collapsedWidth = 80,
  title = 'KhoAugment POS',
  showBack = false,
  showSearch = false,
  quickActions = [],
  notifications = [],
  ...props
}) => {
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const { isMobile } = useMobileDetection();

  // Determine if we're on mobile
  const isScreenMobile = !screens.md;

  // Enable mobile gestures
  useMobileNavigation();

  useEffect(() => {
    // Auto-collapse sidebar on tablet
    if (screens.md && !screens.lg) {
      setCollapsed(true);
    } else if (screens.lg) {
      setCollapsed(false);
    }
  }, [screens]);

  // Close mobile drawer when screen size changes
  useEffect(() => {
    if (!isScreenMobile) {
      setMobileDrawerVisible(false);
    }
  }, [isScreenMobile]);

  const toggleMobileDrawer = () => {
    setMobileDrawerVisible(!mobileDrawerVisible);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerVisible(false);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Mobile Layout
  if (isScreenMobile || isMobile) {
    return (
      <Layout className={`responsive-layout mobile-layout ${className}`} {...props}>
        {/* Enhanced Mobile Header */}
        <MobileHeader
          title={title}
          showBack={showBack}
          showSearch={showSearch}
          onMenuClick={toggleMobileDrawer}
          actions={quickActions}
          notifications={notifications}
        />

        {/* Mobile Content */}
        <Content className="mobile-content">
          <div className="mobile-content-wrapper">
            {children}
          </div>
        </Content>

        {/* Enhanced Mobile Navigation */}
        <EnhancedMobileNavigation
          visible={mobileDrawerVisible}
          onClose={closeMobileDrawer}
          menuItems={sidebar?.props?.menuItems || []}
          notifications={notifications}
          quickActions={quickActions}
          showSearch={showSearch}
        />
      </Layout>
    );
  }

  // Desktop/Tablet Layout
  return (
    <Layout className={`responsive-layout desktop-layout ${className}`} {...props}>
      {/* Desktop Sidebar */}
      {sidebar && (
        <Sider
          width={siderWidth}
          collapsedWidth={collapsedWidth}
          collapsed={collapsed}
          onCollapse={toggleCollapse}
          className="desktop-sidebar"
          breakpoint="lg"
          collapsible
        >
          <div className="desktop-sidebar-content">
            {sidebar}
          </div>
        </Sider>
      )}

      {/* Desktop Layout */}
      <Layout className="desktop-main-layout">
        {/* Desktop Header */}
        <Header className="desktop-header">
          <div className="desktop-header-content">
            {header}
          </div>
        </Header>

        {/* Desktop Content */}
        <Content className="desktop-content">
          <div className="desktop-content-wrapper">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

// Example usage component
export const ResponsiveLayoutExample = () => {
  const sampleSidebar = (
    <div style={{ padding: '16px', color: 'white' }}>
      <h3>Navigation</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ padding: '8px 0' }}>Dashboard</li>
        <li style={{ padding: '8px 0' }}>Products</li>
        <li style={{ padding: '8px 0' }}>Orders</li>
        <li style={{ padding: '8px 0' }}>Customers</li>
        <li style={{ padding: '8px 0' }}>Analytics</li>
      </ul>
    </div>
  );

  const sampleHeader = (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      width: '100%',
      color: 'white'
    }}>
      <h2 style={{ margin: 0 }}>KhoAugment POS</h2>
      <div>
        <Button type="primary">Profile</Button>
      </div>
    </div>
  );

  const sampleContent = (
    <div style={{ padding: '24px' }}>
      <h1>Main Content Area</h1>
      <p>This is the main content area that adapts to different screen sizes.</p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            background: '#f5f5f5',
            padding: '24px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            Card {i + 1}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ResponsiveLayout
      sidebar={sampleSidebar}
      header={sampleHeader}
    >
      {sampleContent}
    </ResponsiveLayout>
  );
};

export default ResponsiveLayout;
