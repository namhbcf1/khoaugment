import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Spin, Layout, Typography, Card, Row, Col, Button, Space, Tag } from 'antd';
import {
  ShopOutlined,
  BarChartOutlined,
  UserOutlined,
  SettingOutlined,
  ScanOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

/**
 * HomePage component - handles initial routing logic
 * Redirects users based on authentication status and role
 */
const HomePage = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Debug logging
  console.log('HomePage render:', { loading, isAuthenticated, user: user?.email });

  // Show loading while checking authentication
  if (loading) {
    console.log('HomePage: Still loading...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: '#666' }}>
          Đang kiểm tra đăng nhập...
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
          Debug: loading={loading.toString()}, auth={isAuthenticated.toString()}
        </div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    return (
      <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Content style={{ padding: '50px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            {/* Hero Section */}
            <div style={{ marginBottom: '60px', color: 'white' }}>
              <Title level={1} style={{ color: 'white', fontSize: '3.5rem', marginBottom: '20px' }}>
                🖥️ Khochuan POS
              </Title>
              <Title level={2} style={{ color: 'white', fontWeight: 'normal', marginBottom: '30px' }}>
                Trường Phát Computer Hòa Bình
              </Title>
              <Paragraph style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 40px' }}>
                Hệ thống Point of Sale thông minh với AI, Gamification, Barcode Scanner, Multi-Payment Methods,
                Real-time Analytics và Customer Management cho doanh nghiệp hiện đại.
              </Paragraph>
              <Space size="large">
                <Button type="primary" size="large" href="/login">
                  Đăng nhập hệ thống
                </Button>
                <Button size="large" style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'white', color: 'white' }}>
                  Tìm hiểu thêm
                </Button>
              </Space>
            </div>

            {/* Features Grid */}
            <Row gutter={[24, 24]} style={{ marginBottom: '60px' }}>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%', textAlign: 'center' }}>
                  <ShopOutlined style={{ fontSize: '3rem', color: '#1890ff', marginBottom: '16px' }} />
                  <Title level={4}>POS Terminal</Title>
                  <Paragraph>
                    Giao diện bán hàng hiện đại với barcode scanner, multi-payment methods và receipt printing
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%', textAlign: 'center' }}>
                  <BarChartOutlined style={{ fontSize: '3rem', color: '#52c41a', marginBottom: '16px' }} />
                  <Title level={4}>Analytics & BI</Title>
                  <Paragraph>
                    Báo cáo thời gian thực, dashboard analytics và business intelligence cho quản lý
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%', textAlign: 'center' }}>
                  <TrophyOutlined style={{ fontSize: '3rem', color: '#faad14', marginBottom: '16px' }} />
                  <Title level={4}>Gamification</Title>
                  <Paragraph>
                    Hệ thống thành tích, bảng xếp hạng và rewards để tăng động lực nhân viên
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%', textAlign: 'center' }}>
                  <RobotOutlined style={{ fontSize: '3rem', color: '#722ed1', marginBottom: '16px' }} />
                  <Title level={4}>AI Features</Title>
                  <Paragraph>
                    Gợi ý sản phẩm thông minh, dự đoán xu hướng và recommendation system
                  </Paragraph>
                </Card>
              </Col>
            </Row>

            {/* Technology Stack */}
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', marginBottom: '40px' }}>
              <Title level={3} style={{ marginBottom: '30px' }}>Công nghệ hiện đại</Title>
              <Space wrap size="middle">
                <Tag color="blue">React 18</Tag>
                <Tag color="green">Cloudflare Pages</Tag>
                <Tag color="orange">PWA Support</Tag>
                <Tag color="purple">Real Database</Tag>
                <Tag color="red">Ant Design</Tag>
                <Tag color="cyan">TypeScript</Tag>
                <Tag color="magenta">Vite</Tag>
                <Tag color="gold">Mobile Responsive</Tag>
              </Space>
            </div>

            {/* Company Info */}
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                © {new Date().getFullYear()} Trường Phát Computer Hòa Bình - Enterprise POS System
              </Text>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  // If authenticated, redirect based on user role
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'cashier') {
    return <Navigate to="/admin/pos" replace />;
  } else if (user?.role === 'staff') {
    return <Navigate to="/staff/dashboard" replace />;
  } else if (user?.role === 'customer') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  // Default fallback to login if role is not recognized
  return <Navigate to="/login" replace />;
};

export default HomePage;
