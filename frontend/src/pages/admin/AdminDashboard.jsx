import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Progress, Table, Tag, Space, Button,
  Typography, Alert, Divider, Timeline, List, Avatar, Badge,
  Tabs, Select, DatePicker, notification
} from 'antd';
import {
  DollarOutlined, ShoppingCartOutlined, UserOutlined, InboxOutlined,
  RiseOutlined, FallOutlined, WarningOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  ReloadOutlined, EyeOutlined, SettingOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
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

  // Mock data for demonstration
  const kpiData = [
    {
      title: 'Doanh thu hôm nay',
      value: 15750000,
      prefix: '₫',
      trend: 12.5,
      icon: <DollarOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Đơn hàng hôm nay',
      value: 156,
      trend: 8.2,
      icon: <ShoppingCartOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Khách hàng mới',
      value: 23,
      trend: -2.1,
      icon: <UserOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Sản phẩm bán chạy',
      value: 89,
      trend: 15.3,
      icon: <InboxOutlined />,
      color: '#faad14'
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

  const renderKPICard = (kpi) => (
    <Col xs={24} sm={12} lg={6} key={kpi.title}>
      <MetricCard
        title={kpi.title}
        value={kpi.prefix ? `${kpi.prefix}${kpi.value.toLocaleString()}` : kpi.value.toLocaleString()}
        icon={getIconName(kpi.icon)}
        trend={kpi.trend > 0 ? 'up' : 'down'}
        trendValue={`${Math.abs(kpi.trend)}%`}
        color={getColorName(kpi.color)}
        loading={loading}
      />
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
          <Card title="Biểu đồ doanh thu 7 ngày" extra={<Button size="small" icon={<EyeOutlined />}>Chi tiết</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${value.toLocaleString()} ₫` : value,
                    name === 'revenue' ? 'Doanh thu' : name === 'orders' ? 'Đơn hàng' : 'Khách hàng'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.3}
                  name="Doanh thu"
                />
              </AreaChart>
            </ResponsiveContainer>
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
          <Card title="Sản phẩm bán chạy" extra={<Button size="small" icon={<EyeOutlined />}>Xem tất cả</Button>}>
            <Table
              dataSource={topProducts}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text) => <Text strong style={{ fontSize: 12 }}>{text}</Text>
                },
                {
                  title: 'Đã bán',
                  dataIndex: 'sold',
                  key: 'sold',
                  width: 80,
                  render: (value) => <Tag color="blue">{value}</Tag>
                },
                {
                  title: 'Doanh thu',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  width: 100,
                  render: (value) => <Text style={{ fontSize: 11 }}>{(value / 1000000).toFixed(1)}M</Text>
                },
                {
                  title: 'Xu hướng',
                  dataIndex: 'trend',
                  key: 'trend',
                  width: 60,
                  render: (trend) => trend === 'up' ?
                    <RiseOutlined style={{ color: '#52c41a' }} /> :
                    <FallOutlined style={{ color: '#ff4d4f' }} />
                }
              ]}
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
