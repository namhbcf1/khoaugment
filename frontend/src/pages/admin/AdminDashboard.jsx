import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Progress, Table, Tag, Space, Button,
  Typography, Alert, Divider, Timeline, List, Avatar, Badge,
  Tabs, Select, DatePicker, notification, Tooltip, Empty
} from 'antd';
import {
  DollarOutlined, ShoppingCartOutlined, UserOutlined, InboxOutlined,
  RiseOutlined, FallOutlined, WarningOutlined, TrophyOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  ReloadOutlined, EyeOutlined, SettingOutlined, FireOutlined,
  TeamOutlined, BankOutlined, GiftOutlined, ThunderboltOutlined,
  StarOutlined, CrownOutlined, HeartOutlined, BulbOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import { useTranslation } from 'react-i18next';
import { MetricCard, PageHeader, LoadingSkeleton } from '../../components/ui/DesignSystem';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState({});

  // Enhanced mock data for demonstration
  const kpiData = [
    {
      title: 'Doanh thu hôm nay',
      value: 25750000,
      prefix: '₫',
      trend: 15.8,
      icon: <DollarOutlined />,
      color: '#52c41a',
      bgGradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      description: 'Tăng 15.8% so với hôm qua'
    },
    {
      title: 'Đơn hàng hôm nay',
      value: 234,
      trend: 12.3,
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      bgGradient: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
      description: 'Tăng 12.3% so với hôm qua'
    },
    {
      title: 'Khách hàng mới',
      value: 47,
      trend: 8.5,
      icon: <UserOutlined />,
      color: '#722ed1',
      bgGradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
      description: 'Tăng 8.5% so với hôm qua'
    },
    {
      title: 'Sản phẩm bán chạy',
      value: 89,
      trend: 15.3,
      icon: <FireOutlined />,
      color: '#faad14',
      bgGradient: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
      description: 'Tăng 15.3% so với hôm qua'
    },
    {
      title: 'Nhân viên hoạt động',
      value: 12,
      trend: 0,
      icon: <TeamOutlined />,
      color: '#13c2c2',
      bgGradient: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
      description: 'Đang làm việc'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: 94.5,
      suffix: '%',
      trend: 2.1,
      icon: <TrophyOutlined />,
      color: '#eb2f96',
      bgGradient: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
      description: 'Tăng 2.1% so với tuần trước'
    }
  ];

  const revenueData = [
    { name: 'T2', revenue: 12000000, orders: 45, customers: 23 },
    { name: 'T3', revenue: 15000000, orders: 52, customers: 28 },
    { name: 'T4', revenue: 18000000, orders: 61, customers: 35 },
    { name: 'T5', revenue: 22000000, orders: 73, customers: 42 },
    { name: 'T6', revenue: 25000000, orders: 85, customers: 48 },
    { name: 'T7', revenue: 28000000, orders: 92, customers: 55 },
    { name: 'CN', revenue: 32000000, orders: 108, customers: 67 }
  ];

  const topProducts = [
    { id: 1, name: 'Laptop Dell XPS 13', sold: 45, revenue: 67500000, trend: 'up' },
    { id: 2, name: 'iPhone 15 Pro Max', sold: 38, revenue: 95000000, trend: 'up' },
    { id: 3, name: 'Samsung Galaxy S24', sold: 32, revenue: 64000000, trend: 'down' },
    { id: 4, name: 'MacBook Air M3', sold: 28, revenue: 84000000, trend: 'up' },
    { id: 5, name: 'iPad Pro 12.9', sold: 25, revenue: 62500000, trend: 'up' }
  ];

  const recentOrders = [
    { id: 'ORD001', customer: 'Nguyễn Văn A', amount: 2500000, status: 'completed', time: '10:30' },
    { id: 'ORD002', customer: 'Trần Thị B', amount: 1800000, status: 'processing', time: '10:25' },
    { id: 'ORD003', customer: 'Lê Văn C', amount: 3200000, status: 'pending', time: '10:20' },
    { id: 'ORD004', customer: 'Phạm Thị D', amount: 950000, status: 'completed', time: '10:15' },
    { id: 'ORD005', customer: 'Hoàng Văn E', amount: 4100000, status: 'completed', time: '10:10' }
  ];

  const systemAlerts = [
    { type: 'warning', message: 'Sản phẩm "Laptop HP Pavilion" sắp hết hàng (còn 5 chiếc)', time: '5 phút trước' },
    { type: 'info', message: 'Đồng bộ dữ liệu Shopee hoàn tất - 23 sản phẩm được cập nhật', time: '15 phút trước' },
    { type: 'error', message: 'Lỗi kết nối máy in nhiệt - vui lòng kiểm tra', time: '30 phút trước' },
    { type: 'success', message: 'Backup dữ liệu hàng ngày hoàn tất thành công', time: '1 giờ trước' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData({
        totalRevenue: 125000000,
        totalOrders: 1250,
        totalCustomers: 450,
        conversionRate: 3.2
      });
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: 'Không thể tải dữ liệu dashboard'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderKPICard = (kpi, index) => (
    <Col xs={24} sm={12} lg={6} key={kpi.title}>
      <Card
        style={{
          background: kpi.bgGradient || `linear-gradient(135deg, ${kpi.color}15 0%, ${kpi.color}25 100%)`,
          border: `1px solid ${kpi.color}30`,
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        bodyStyle={{ padding: '20px' }}
        hoverable
        className="kpi-card"
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `${kpi.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: kpi.color
            }}>
              {kpi.icon}
            </div>
            {kpi.trend !== 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: kpi.trend > 0 ? '#f6ffed' : '#fff2f0',
                border: `1px solid ${kpi.trend > 0 ? '#b7eb8f' : '#ffb3b3'}`
              }}>
                {kpi.trend > 0 ?
                  <RiseOutlined style={{ color: '#52c41a', fontSize: '12px' }} /> :
                  <FallOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                }
                <span style={{
                  color: kpi.trend > 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {Math.abs(kpi.trend)}%
                </span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 8 }}>
            <Typography.Title level={2} style={{
              margin: 0,
              color: '#262626',
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1
            }}>
              {kpi.prefix && <span style={{ fontSize: '20px', opacity: 0.8 }}>{kpi.prefix}</span>}
              {kpi.value.toLocaleString()}
              {kpi.suffix && <span style={{ fontSize: '16px', opacity: 0.8 }}>{kpi.suffix}</span>}
            </Typography.Title>
          </div>

          <div>
            <Typography.Text style={{
              color: '#8c8c8c',
              fontSize: '14px',
              fontWeight: 500,
              display: 'block',
              marginBottom: 4
            }}>
              {kpi.title}
            </Typography.Text>
            <Typography.Text style={{
              color: '#595959',
              fontSize: '12px'
            }}>
              {kpi.description}
            </Typography.Text>
          </div>
        </div>

        {/* Decorative background element */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `${kpi.color}10`,
          zIndex: 1
        }} />
      </Card>
    </Col>
  );

  const getIconName = (icon) => {
    if (!icon) return 'chart';
    const iconName = icon.type?.name || '';
    if (iconName.includes('Dollar')) return 'dollar';
    if (iconName.includes('Shopping')) return 'cart';
    if (iconName.includes('User')) return 'user';
    if (iconName.includes('Inbox')) return 'cart';
    return 'chart';
  };

  const getColorName = (color) => {
    switch (color) {
      case '#52c41a': return 'success';
      case '#1890ff': return 'primary';
      case '#faad14': return 'warning';
      case '#ff4d4f': return 'error';
      default: return 'info';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'processing';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
      case 'pending': return 'Chờ xử lý';
      default: return status;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default: return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Dashboard Quản trị"
        subtitle="Tổng quan hoạt động kinh doanh và hiệu suất hệ thống"
        icon="chart"
        actions={[
          <Select
            key="daterange"
            defaultValue="7d"
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 120 }}
          >
            <Select.Option value="1d">Hôm nay</Select.Option>
            <Select.Option value="7d">7 ngày</Select.Option>
            <Select.Option value="30d">30 ngày</Select.Option>
            <Select.Option value="90d">90 ngày</Select.Option>
          </Select>,
          <Button key="refresh" icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>
            Làm mới
          </Button>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiData.map(renderKPICard)}
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Revenue Chart */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarOutlined style={{ color: '#1890ff' }} />
                <span>Biểu đồ doanh thu 7 ngày</span>
              </div>
            }
            extra={<Button size="small" icon={<EyeOutlined />} type="link">Chi tiết</Button>}
            style={{ borderRadius: '12px' }}
          >
            <Area
              data={revenueData}
              xField="name"
              yField="revenue"
              height={300}
              smooth={true}
              areaStyle={{
                fill: 'l(270) 0:#ffffff 0.5:#1890ff 1:#1890ff',
                fillOpacity: 0.3,
              }}
              line={{
                color: '#1890ff',
                size: 3,
              }}
              point={{
                size: 5,
                shape: 'circle',
                style: {
                  fill: '#1890ff',
                  stroke: '#ffffff',
                  lineWidth: 2,
                },
              }}
              tooltip={{
                formatter: (datum) => ({
                  name: 'Doanh thu',
                  value: `${datum.revenue.toLocaleString()} ₫`,
                }),
              }}
              annotations={[
                {
                  type: 'text',
                  position: ['max', 'max'],
                  content: `Cao nhất: ${Math.max(...revenueData.map(d => d.revenue)).toLocaleString()} ₫`,
                  style: {
                    textAlign: 'end',
                    fontSize: 12,
                    fill: '#8c8c8c',
                  },
                  offsetY: -10,
                },
              ]}
            />
          </Card>
        </Col>

        {/* System Alerts */}
        <Col xs={24} lg={8}>
          <Card title="Cảnh báo hệ thống" extra={<Badge count={systemAlerts.length} />}>
            <List
              size="small"
              dataSource={systemAlerts}
              renderItem={alert => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getAlertIcon(alert.type)}
                    title={<Text style={{ fontSize: 12 }}>{alert.message}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>{alert.time}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FireOutlined style={{ color: '#faad14' }} />
                <span>Sản phẩm bán chạy</span>
              </div>
            }
            extra={<Button size="small" icon={<EyeOutlined />} type="link">Xem tất cả</Button>}
            style={{ borderRadius: '12px' }}
          >
            <List
              dataSource={topProducts}
              renderItem={(product, index) => (
                <List.Item style={{ padding: '12px 0', borderBottom: index === topProducts.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        background: index === 0 ? '#faad14' : index === 1 ? '#1890ff' : '#52c41a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        #{index + 1}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                          {product.name}
                        </Text>
                        {product.trend === 'up' ?
                          <RiseOutlined style={{ color: '#52c41a', fontSize: '12px' }} /> :
                          <FallOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                        }
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <Space size={16}>
                          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Đã bán: <Text strong style={{ color: '#1890ff' }}>{product.sold}</Text>
                          </span>
                          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Doanh thu: <Text strong style={{ color: '#52c41a' }}>{(product.revenue / 1000000).toFixed(1)}M ₫</Text>
                          </span>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây" extra={<Button size="small" icon={<EyeOutlined />}>Xem tất cả</Button>}>
            <Table
              dataSource={recentOrders}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Mã đơn',
                  dataIndex: 'id',
                  key: 'id',
                  width: 80,
                  render: (text) => <Text code style={{ fontSize: 11 }}>{text}</Text>
                },
                {
                  title: 'Khách hàng',
                  dataIndex: 'customer',
                  key: 'customer',
                  render: (text) => <Text style={{ fontSize: 12 }}>{text}</Text>
                },
                {
                  title: 'Số tiền',
                  dataIndex: 'amount',
                  key: 'amount',
                  width: 100,
                  render: (value) => <Text style={{ fontSize: 11 }}>{(value / 1000).toFixed(0)}K</Text>
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  width: 100,
                  render: (status) => (
                    <Tag color={getOrderStatusColor(status)} style={{ fontSize: 10 }}>
                      {getOrderStatusText(status)}
                    </Tag>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Button type="primary" block icon={<ShoppingCartOutlined />}>
              Tạo đơn hàng
            </Button>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Button block icon={<InboxOutlined />}>
              Thêm sản phẩm
            </Button>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Button block icon={<UserOutlined />}>
              Thêm khách hàng
            </Button>
          </Col>
          <Col xs={12} sm={8} md={6} lg={4}>
            <Button block icon={<SettingOutlined />}>
              Cài đặt
            </Button>
          </Col>
        </Row>
      </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
