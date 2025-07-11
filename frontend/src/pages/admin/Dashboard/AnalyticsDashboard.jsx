import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space, 
  Button, 
  Select, 
  DatePicker,
  Progress,
  Table,
  Tag,
  Avatar,
  List,
  Divider,
  Spin,
  Alert,
  Tabs,
  Switch
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExportOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState('daily');
  const [isComparing, setIsComparing] = useState(false);

  // Demo data
  const kpiData = [
    {
      title: 'Tổng doanh thu',
      value: 245680000,
      prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
      suffix: 'VND',
      change: 12.5,
      changeType: 'increase'
    },
    {
      title: 'Đơn hàng',
      value: 1234,
      prefix: <ShoppingCartOutlined style={{ color: '#1890ff' }} />,
      change: 8.2,
      changeType: 'increase'
    },
    {
      title: 'Khách hàng mới',
      value: 89,
      prefix: <UserOutlined style={{ color: '#722ed1' }} />,
      change: -2.1,
      changeType: 'decrease'
    },
    {
      title: 'Tỷ lệ chuyển đổi',
      value: 3.2,
      prefix: <TrophyOutlined style={{ color: '#fa8c16' }} />,
      suffix: '%',
      change: 0.8,
      changeType: 'increase'
    }
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: 45000000, trend: 'up' },
    { name: 'Samsung Galaxy S24', sales: 38, revenue: 38000000, trend: 'up' },
    { name: 'MacBook Air M3', sales: 23, revenue: 69000000, trend: 'down' },
    { name: 'AirPods Pro', sales: 67, revenue: 20100000, trend: 'up' },
    { name: 'iPad Pro', sales: 19, revenue: 38000000, trend: 'stable' }
  ];

  const recentOrders = [
    { 
      id: 'ORD-001', 
      customer: 'Nguyễn Văn A', 
      amount: 2500000, 
      status: 'completed',
      time: '10:30 AM',
      items: 3
    },
    { 
      id: 'ORD-002', 
      customer: 'Trần Thị B', 
      amount: 1800000, 
      status: 'processing',
      time: '10:15 AM',
      items: 2
    },
    { 
      id: 'ORD-003', 
      customer: 'Lê Văn C', 
      amount: 3200000, 
      status: 'completed',
      time: '09:45 AM',
      items: 5
    },
    { 
      id: 'ORD-004', 
      customer: 'Phạm Thị D', 
      amount: 950000, 
      status: 'pending',
      time: '09:30 AM',
      items: 1
    }
  ];

  const staffPerformance = [
    { name: 'Nguyễn Minh', sales: 15, revenue: 12500000, target: 85 },
    { name: 'Trần Hương', sales: 12, revenue: 9800000, target: 78 },
    { name: 'Lê Tuấn', sales: 18, revenue: 15200000, target: 92 },
    { name: 'Phạm Linh', sales: 9, revenue: 7300000, target: 65 }
  ];

  // Daily sales data
  const salesData = [
    { name: 'T2', revenue: 15500000, orders: 25 },
    { name: 'T3', revenue: 12800000, orders: 22 },
    { name: 'T4', revenue: 14200000, orders: 28 },
    { name: 'T5', revenue: 16800000, orders: 30 },
    { name: 'T6', revenue: 19500000, orders: 35 },
    { name: 'T7', revenue: 25600000, orders: 42 },
    { name: 'CN', revenue: 18500000, orders: 32 }
  ];

  // Monthly sales data
  const monthlySalesData = [
    { name: 'T1', revenue: 320500000, orders: 520 },
    { name: 'T2', revenue: 290800000, orders: 485 },
    { name: 'T3', revenue: 310200000, orders: 510 },
    { name: 'T4', revenue: 350800000, orders: 580 },
    { name: 'T5', revenue: 380500000, orders: 620 },
    { name: 'T6', revenue: 410600000, orders: 650 }
  ];

  // Channel distribution data
  const channelData = [
    { name: 'Cửa hàng', value: 65, color: '#1890ff' },
    { name: 'Web', value: 20, color: '#52c41a' },
    { name: 'App', value: 10, color: '#722ed1' },
    { name: 'Marketplace', value: 5, color: '#fa8c16' }
  ];

  // Category distribution data
  const categoryData = [
    { name: 'Điện thoại', value: 40, color: '#1890ff' },
    { name: 'Laptop', value: 25, color: '#52c41a' },
    { name: 'Phụ kiện', value: 20, color: '#faad14' },
    { name: 'Màn hình', value: 10, color: '#eb2f96' },
    { name: 'Khác', value: 5, color: '#bfbfbf' }
  ];

  // Function to get status color for orders
  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      processing: 'processing',
      pending: 'warning',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  // Function to get status text in Vietnamese
  const getStatusText = (status) => {
    const texts = {
      completed: 'Hoàn thành',
      processing: 'Đang xử lý',
      pending: 'Chờ xử lý',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  // Function to get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <RiseOutlined style={{ color: '#52c41a' }} />;
      case 'down':
        return <FallOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <LineChartOutlined style={{ color: '#faad14' }} />;
    }
  };

  // Function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Render sales chart based on selected type
  const renderSalesChart = () => {
    const data = chartType === 'daily' ? salesData : monthlySalesData;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip 
            formatter={(value, name) => {
              if (name === 'revenue') {
                return [formatCurrency(value), 'Doanh thu'];
              }
              return [value, 'Đơn hàng'];
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            stroke="#1890ff" 
            name="Doanh thu" 
            activeDot={{ r: 8 }} 
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="orders" 
            stroke="#52c41a" 
            name="Đơn hàng" 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render channel distribution chart
  const renderChannelChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={channelData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {channelData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render category distribution chart
  const renderCategoryChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={categoryData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <RechartsTooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
        <Legend />
        <Bar dataKey="value" name="Tỷ lệ %" radius={[0, 10, 10, 0]}>
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              📊 Analytics Dashboard
            </Title>
            <Text type="secondary">
              Tổng quan phân tích doanh thu và hiệu suất
            </Text>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Select.Option value="today">Hôm nay</Select.Option>
                <Select.Option value="week">Tuần này</Select.Option>
                <Select.Option value="month">Tháng này</Select.Option>
                <Select.Option value="quarter">Quý này</Select.Option>
              </Select>
              <RangePicker />
              <Button type="primary" icon={<ExportOutlined />}>
                Xuất báo cáo
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tổng quan" key="overview">
          {/* KPI Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {kpiData.map((kpi, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card>
                  <Statistic
                    title={kpi.title}
                    value={kpi.value}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    valueStyle={{ color: kpi.prefix.props.style.color }}
                    formatter={value => {
                      if (kpi.title === 'Tổng doanh thu') {
                        return new Intl.NumberFormat('vi-VN').format(value);
                      }
                      return value;
                    }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Space>
                      {kpi.changeType === 'increase' ? (
                        <RiseOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <FallOutlined style={{ color: '#ff4d4f' }} />
                      )}
                      <Text 
                        style={{ 
                          color: kpi.changeType === 'increase' ? '#52c41a' : '#ff4d4f',
                          fontSize: '12px'
                        }}
                      >
                        {Math.abs(kpi.change)}% so với hôm qua
                      </Text>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]}>
            {/* Sales Chart */}
            <Col xs={24} lg={16}>
              <Card 
                title="Biểu đồ doanh thu & đơn hàng"
                extra={
                  <Space>
                    <Button.Group>
                      <Button 
                        type={chartType === 'daily' ? 'primary' : 'default'} 
                        onClick={() => setChartType('daily')}
                      >
                        Ngày
                      </Button>
                      <Button 
                        type={chartType === 'monthly' ? 'primary' : 'default'} 
                        onClick={() => setChartType('monthly')}
                      >
                        Tháng
                      </Button>
                    </Button.Group>
                    <Switch 
                      checkedChildren="So sánh" 
                      unCheckedChildren="Đơn lẻ" 
                      checked={isComparing}
                      onChange={setIsComparing}
                    />
                  </Space>
                }
              >
                {renderSalesChart()}
              </Card>
            </Col>

            {/* Recent Orders */}
            <Col xs={24} lg={8}>
              <Card 
                title="Đơn hàng gần đây" 
                extra={<Button type="link">Xem tất cả</Button>}
              >
                <List
                  dataSource={recentOrders}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <a href="#">{item.id}</a>
                            <Tag color={getStatusColor(item.status)}>
                              {getStatusText(item.status)}
                            </Tag>
                          </div>
                        }
                        description={
                          <div>
                            <div>{item.customer} - {item.time}</div>
                            <div>{item.items} sản phẩm</div>
                          </div>
                        }
                      />
                      <div>
                        <Text strong style={{ color: '#52c41a' }}>
                          {formatCurrency(item.amount)}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            {/* Top Products */}
            <Col xs={24} lg={12}>
              <Card 
                title="🏆 Sản phẩm bán chạy"
                extra={<Button type="link" icon={<PieChartOutlined />}>Chi tiết</Button>}
              >
                <List
                  dataSource={topProducts}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: '#1890ff' }}>
                            {index + 1}
                          </Avatar>
                        }
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{item.name}</span>
                            {getTrendIcon(item.trend)}
                          </div>
                        }
                        description={
                          <div>
                            <Text type="secondary">Đã bán: {item.sales} sản phẩm</Text>
                            <br />
                            <Text strong style={{ color: '#52c41a' }}>
                              {formatCurrency(item.revenue)}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* Staff Performance */}
            <Col xs={24} lg={12}>
              <Card 
                title="👥 Hiệu suất nhân viên"
                extra={<Button type="link">Chi tiết</Button>}
              >
                <List
                  dataSource={staffPerformance}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={item.name}
                        description={
                          <div>
                            <Space>
                              <span>Đơn hàng: {item.sales}</span>
                              <span>Doanh số: {formatCurrency(item.revenue)}</span>
                            </Space>
                          </div>
                        }
                      />
                      <Progress 
                        percent={item.target} 
                        size="small" 
                        status={item.target >= 80 ? "success" : item.target >= 60 ? "normal" : "exception"}
                        style={{ width: 100 }}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Phân tích kênh bán hàng" key="channels">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Phân bố doanh thu theo kênh">
                {renderChannelChart()}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Phân bố theo danh mục sản phẩm">
                {renderCategoryChart()}
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Báo cáo khách hàng" key="customers">
          <Alert
            message="Báo cáo chi tiết khách hàng"
            description="Phân tích chi tiết khách hàng đang được phát triển và sẽ có sẵn trong bản cập nhật tới."
            type="info"
            showIcon
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 