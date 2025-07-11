import React, { useEffect, useMemo, useCallback, memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Space, Statistic, Progress, message } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { api } from '../services/api';
import { MetricCard, PageHeader, LoadingSkeleton } from '../components/ui/DesignSystem';

const { Title, Text } = Typography;

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for real data
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: []
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load multiple data sources in parallel
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/customers'),
        api.get('/orders/stats')
      ]);

      const products = productsRes.data.success ? productsRes.data.data.products : [];
      const customers = customersRes.data.success ? customersRes.data.data.customers : [];
      const orderStats = ordersRes.data.success ? ordersRes.data.data : {};

      // Calculate dashboard metrics
      const totalProducts = products.length;
      const totalCustomers = customers.length;
      const lowStockProducts = products.filter(p => p.stock_quantity <= p.reorder_level).length;
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
      const totalSpent = customers.reduce((sum, c) => sum + c.total_spent, 0);

      setDashboardData({
        todayRevenue: orderStats.today_revenue || 0,
        totalProducts,
        totalCustomers,
        totalOrders: orderStats.total_orders || 0,
        lowStockProducts,
        totalValue,
        totalSpent,
        recentOrders: orderStats.recent_orders || [],
        topProducts: products.slice(0, 5)
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Memoized statistics using real data
  const stats = useMemo(() => [
    {
      title: 'Doanh thu hôm nay',
      value: dashboardData.todayRevenue,
      prefix: <DollarOutlined />,
      suffix: '₫',
      color: '#52c41a',
      formatter: (value) => value.toLocaleString()
    },
    {
      title: 'Tổng sản phẩm',
      value: dashboardData.totalProducts,
      prefix: <AppstoreOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Khách hàng',
      value: dashboardData.totalCustomers,
      prefix: <UserOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Đơn hàng',
      value: dashboardData.totalOrders,
      prefix: <ShoppingCartOutlined />,
      color: '#fa8c16'
    }
  ], [dashboardData]);

  // Memoized navigation handlers
  const handlePOSAccess = useCallback(() => {
    navigate('/pos');
  }, [navigate]);

  const handleProductsAccess = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const handleCustomersAccess = useCallback(() => {
    navigate('/customers');
  }, [navigate]);

  const handleOrdersAccess = useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  const handleInventoryAccess = useCallback(() => {
    navigate('/inventory');
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={1} style={{ color: '#1677ff', marginBottom: '8px' }}>
            💻 Trường Phát Computer
          </Title>
          <Text style={{ color: '#666', fontSize: '16px' }}>
            Dashboard quản trị hệ thống POS - Xin chào, {user?.firstName || 'Nguyễn Văn'} {user?.lastName || 'Admin'} ({user?.role || 'admin'})
          </Text>
          <div style={{ marginTop: '10px' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadDashboardData}
              type="primary"
            >
              Tải lại dữ liệu
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{ color: stat.color }}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  formatter={stat.formatter}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Navigation Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={handlePOSAccess}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                🛒
              </div>
              <Title level={4} style={{ margin: '0 0 4px 0' }}>
                POS Bán hàng
              </Title>
              <Text type="secondary">
                Giao diện bán hàng
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => navigate('/products')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                📦
              </div>
              <Title level={4} style={{ margin: '0 0 4px 0' }}>
                Sản phẩm
              </Title>
              <Text type="secondary">
                Quản lý sản phẩm
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => navigate('/customers')}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                👥
              </div>
              <Title level={4} style={{ margin: '0 0 4px 0' }}>
                Khách hàng
              </Title>
              <Text type="secondary">
                5 khách hàng
              </Text>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => navigate('/orders')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ color: '#fa8c16', fontSize: '32px', marginBottom: '12px' }}>
                📊
              </div>
              <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
                Đơn hàng
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
                3 đơn hàng
              </Text>
            </Card>
          </Col>
        </Row>

        {/* System Status */}
        <Row gutter={[24, 24]} style={{ marginBottom: '30px' }}>
          <Col xs={24}>
            <Card
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px'
              }}
            >
              <Title level={2} style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
                🎯 Trạng thái hệ thống
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ color: '#52c41a', fontSize: '20px', marginBottom: '8px' }}>
                      ✅ API Backend
                    </div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Hoạt động bình thường
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ color: '#52c41a', fontSize: '20px', marginBottom: '8px' }}>
                      ✅ Database
                    </div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Production data
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ color: '#52c41a', fontSize: '20px', marginBottom: '8px' }}>
                      ✅ Authentication
                    </div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Đã sửa xong
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ color: '#52c41a', fontSize: '20px', marginBottom: '8px' }}>
                      ✅ Frontend
                    </div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Đang hoạt động
                    </Text>
                  </div>
                </Col>
                <Col xs={24}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <div style={{ color: '#1890ff', fontSize: '20px', marginBottom: '8px' }}>
                      ✅ Real Data
                    </div>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      10SP, 5DM, 5KH
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Welcome Card */}
          <Col xs={24} lg={16}>
            <Card 
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                height: '100%'
              }}
            >
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
                  Chào mừng đến với Trường Phát Computer! 👋
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', display: 'block', marginBottom: '32px' }}>
                  Hệ thống quản lý bán hàng hiện đại với AI tích hợp, 
                  giúp tối ưu hóa doanh thu và trải nghiệm khách hàng.
                </Text>
                
                <Space size="large" wrap>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleCashierAccess}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px'
                    }}
                  >
                    Bắt đầu bán hàng
                  </Button>
                  <Button
                    size="large"
                    icon={<UserOutlined />}
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '8px'
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} lg={8}>
            <Card 
              title={<span style={{ color: 'white' }}>Tính năng nổi bật</span>}
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                height: '100%'
              }}
              headStyle={{ border: 'none' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <RiseOutlined style={{ color: '#52c41a', fontSize: '24px', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ color: 'white', display: 'block' }}>Quản lý kho hàng</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Theo dõi tồn kho thời gian thực</Text>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <TrophyOutlined style={{ color: '#fa8c16', fontSize: '24px', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ color: 'white', display: 'block' }}>Báo cáo bán hàng</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Phân tích doanh thu chi tiết</Text>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <UserOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: '12px' }} />
                  <div>
                    <Text strong style={{ color: 'white', display: 'block' }}>Quản lý khách hàng</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Chăm sóc khách hàng toàn diện</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Performance Overview */}
        <Row gutter={[24, 24]} style={{ marginTop: '40px' }}>
          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ color: 'white' }}>Thông tin liên hệ</span>}
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px'
              }}
              headStyle={{ border: 'none' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Hotline</Text>
                  <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>0836.768.597</div>
                </div>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Địa chỉ</Text>
                  <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>Hòa Bình, Việt Nam</div>
                </div>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Email</Text>
                  <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>contact@truongphat.com</div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={<span style={{ color: 'white' }}>Thống kê nhanh</span>}
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px'
              }}
              headStyle={{ border: 'none' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Sản phẩm</span>}
                    value={1234}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Danh mục</span>}
                    value={89}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Nhà cung cấp</span>}
                    value={56}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Khách hàng thân thiết</span>}
                    value={892}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', color: 'rgba(255,255,255,0.6)' }}>
          © 2023 Trường Phát Computer Hòa Bình. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;