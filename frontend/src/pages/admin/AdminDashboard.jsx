import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Table, Tag, Space, Button,
  Typography, List, Badge, Select, notification
} from 'antd';
import {
  DollarOutlined, ShoppingCartOutlined, UserOutlined, InboxOutlined,
  RiseOutlined, FallOutlined, WarningOutlined, TrophyOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  ReloadOutlined, EyeOutlined, SettingOutlined, FireOutlined,
  TeamOutlined, ThunderboltOutlined, DashboardOutlined, LineChartOutlined
} from '@ant-design/icons';
import { Area } from '@ant-design/plots';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

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
    } catch (error) {
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: 'Không thể tải dữ liệu dashboard'
      });
    } finally {
      setLoading(false);
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
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Enhanced Header */}
      <Card
        bordered={false}
        style={{
          borderRadius: 0,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                <DashboardOutlined />
              </div>
              <div>
                <Title level={1} style={{ margin: 0, color: 'white', fontSize: '28px' }}>
                  Dashboard Quản trị
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                  Tổng quan hoạt động kinh doanh và hiệu suất hệ thống
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Space size={16}>
              <Select
                defaultValue="7d"
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 140 }}
                size="large"
              >
                <Select.Option value="1d">Hôm nay</Select.Option>
                <Select.Option value="7d">7 ngày</Select.Option>
                <Select.Option value="30d">30 ngày</Select.Option>
                <Select.Option value="90d">90 ngày</Select.Option>
              </Select>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={loadDashboardData}
                loading={loading}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white'
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ padding: '0 24px 24px' }}>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {kpiData.slice(0, 4).map((kpi, index) => (
          <Col xs={24} sm={12} lg={6} key={kpi.title}>
            <Card
              style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              bodyStyle={{ padding: '24px' }}
              hoverable
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    background: `${kpi.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: kpi.color
                  }}>
                    {kpi.icon}
                  </div>
                  {kpi.trend !== 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: kpi.trend > 0 ? '#f6ffed' : '#fff2f0',
                      border: `1px solid ${kpi.trend > 0 ? '#b7eb8f' : '#ffb3b3'}`
                    }}>
                      {kpi.trend > 0 ?
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} /> :
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '14px' }} />
                      }
                      <span style={{
                        color: kpi.trend > 0 ? '#52c41a' : '#ff4d4f',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        {Math.abs(kpi.trend)}%
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Typography.Title level={2} style={{
                    margin: 0,
                    color: '#262626',
                    fontSize: '32px',
                    fontWeight: 700,
                    lineHeight: 1
                  }}>
                    {kpi.prefix && <span style={{ fontSize: '22px', opacity: 0.8 }}>{kpi.prefix}</span>}
                    {kpi.value.toLocaleString()}
                    {kpi.suffix && <span style={{ fontSize: '18px', opacity: 0.8 }}>{kpi.suffix}</span>}
                  </Typography.Title>
                </div>

                <div>
                  <Typography.Text style={{
                    color: '#8c8c8c',
                    fontSize: '15px',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: 6
                  }}>
                    {kpi.title}
                  </Typography.Text>
                  <Typography.Text style={{
                    color: kpi.trend > 0 ? '#52c41a' : '#595959',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    {kpi.description}
                  </Typography.Text>
                </div>
              </div>

              {/* Decorative background element */}
              <div style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `${kpi.color}08`,
                zIndex: 1
              }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Revenue Chart */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LineChartOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Biểu đồ doanh thu 7 ngày</span>
              </div>
            }
            extra={
              <Button
                size="small"
                icon={<EyeOutlined />}
                type="link"
                style={{ color: '#1890ff', fontWeight: 500 }}
              >
                Chi tiết
              </Button>
            }
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Area
                data={revenueData}
                xField="name"
                yField="revenue"
                height={280}
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
                  size: 6,
                  shape: 'circle',
                  style: {
                    fill: '#1890ff',
                    stroke: '#ffffff',
                    lineWidth: 3,
                  },
                }}
                tooltip={{
                  formatter: (datum) => ({
                    name: 'Doanh thu',
                    value: `${datum.revenue.toLocaleString()} ₫`,
                  }),
                }}
                xAxis={{
                  grid: {
                    line: {
                      style: {
                        stroke: '#f0f0f0',
                        lineWidth: 1,
                      },
                    },
                  },
                }}
                yAxis={{
                  grid: {
                    line: {
                      style: {
                        stroke: '#f0f0f0',
                        lineWidth: 1,
                      },
                    },
                  },
                  label: {
                    formatter: (value) => `${(value / 1000000).toFixed(0)}M`,
                  },
                }}
              />
            </div>
          </Card>
        </Col>

        {/* System Alerts */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <WarningOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Cảnh báo hệ thống</span>
              </div>
            }
            extra={<Badge count={systemAlerts.length} style={{ backgroundColor: '#faad14' }} />}
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <List
              size="small"
              dataSource={systemAlerts}
              renderItem={alert => (
                <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <List.Item.Meta
                    avatar={getAlertIcon(alert.type)}
                    title={
                      <Text style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#262626',
                        lineHeight: 1.4
                      }}>
                        {alert.message}
                      </Text>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {alert.time}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FireOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Sản phẩm bán chạy</span>
              </div>
            }
            extra={
              <Button
                size="small"
                icon={<EyeOutlined />}
                type="link"
                style={{ color: '#1890ff', fontWeight: 500 }}
              >
                Xem tất cả
              </Button>
            }
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Table
              dataSource={topProducts}
              pagination={false}
              size="middle"
              showHeader={true}
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record, index) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        background: index === 0 ? '#faad14' : index === 1 ? '#1890ff' : '#52c41a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {index + 1}
                      </div>
                      <Text strong style={{ fontSize: '14px' }}>{text}</Text>
                    </div>
                  )
                },
                {
                  title: 'Đã bán',
                  dataIndex: 'sold',
                  key: 'sold',
                  width: 80,
                  render: (value) => <Text style={{ fontSize: '13px', fontWeight: 500 }}>{value}</Text>
                },
                {
                  title: 'Doanh thu',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  width: 100,
                  render: (value) => (
                    <Text style={{ fontSize: '13px', fontWeight: 500, color: '#52c41a' }}>
                      {(value / 1000000).toFixed(1)}M
                    </Text>
                  )
                },
                {
                  title: 'Xu hướng',
                  dataIndex: 'trend',
                  key: 'trend',
                  width: 80,
                  render: (trend) => (
                    trend === 'up' ?
                      <RiseOutlined style={{ color: '#52c41a', fontSize: '16px' }} /> :
                      <FallOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
                  )
                }
              ]}
            />
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShoppingCartOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Đơn hàng gần đây</span>
              </div>
            }
            extra={
              <Button
                size="small"
                icon={<EyeOutlined />}
                type="link"
                style={{ color: '#1890ff', fontWeight: 500 }}
              >
                Xem tất cả
              </Button>
            }
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Table
              dataSource={recentOrders}
              pagination={false}
              size="middle"
              showHeader={true}
              columns={[
                {
                  title: 'Mã đơn',
                  dataIndex: 'id',
                  key: 'id',
                  width: 90,
                  render: (text) => (
                    <Text
                      code
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        background: '#f0f0f0',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {text}
                    </Text>
                  )
                },
                {
                  title: 'Khách hàng',
                  dataIndex: 'customer',
                  key: 'customer',
                  render: (text) => <Text style={{ fontSize: 13, fontWeight: 500 }}>{text}</Text>
                },
                {
                  title: 'Số tiền',
                  dataIndex: 'amount',
                  key: 'amount',
                  width: 90,
                  render: (value) => (
                    <Text style={{ fontSize: 13, fontWeight: 600, color: '#52c41a' }}>
                      {(value / 1000).toFixed(0)}K
                    </Text>
                  )
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  width: 110,
                  render: (status) => (
                    <Tag
                      color={getOrderStatusColor(status)}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        borderRadius: '12px',
                        padding: '2px 8px'
                      }}
                    >
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
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThunderboltOutlined style={{ color: '#722ed1', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>Thao tác nhanh</span>
          </div>
        }
        style={{
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6} md={6} lg={3}>
            <Button
              type="primary"
              block
              size="large"
              icon={<ShoppingCartOutlined />}
              style={{
                height: '60px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
              }}
            >
              Tạo đơn hàng
            </Button>
          </Col>
          <Col xs={12} sm={6} md={6} lg={3}>
            <Button
              block
              size="large"
              icon={<InboxOutlined />}
              style={{
                height: '60px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
              }}
            >
              Thêm sản phẩm
            </Button>
          </Col>
          <Col xs={12} sm={6} md={6} lg={3}>
            <Button
              block
              size="large"
              icon={<UserOutlined />}
              style={{
                height: '60px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)'
              }}
            >
              Thêm khách hàng
            </Button>
          </Col>
          <Col xs={12} sm={6} md={6} lg={3}>
            <Button
              block
              size="large"
              icon={<SettingOutlined />}
              style={{
                height: '60px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 12px rgba(250, 173, 20, 0.3)'
              }}
            >
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
