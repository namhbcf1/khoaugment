import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  Button,
  DatePicker,
  Tabs,
  Table,
  Tooltip,
  Space,
  Statistic,
  Divider,
  Segmented,
  Alert,
  Badge,
  Tag,
  Progress,
  Radio
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  SyncOutlined,
  ShareAltOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import { MetricCard, PageHeader, LoadingSkeleton } from '../../../components/ui/DesignSystem';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

// Sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 30400, target: 28000, profit: 12500 },
  { month: 'Feb', revenue: 25300, target: 25000, profit: 10200 },
  { month: 'Mar', revenue: 31200, target: 30000, profit: 13400 },
  { month: 'Apr', revenue: 42100, target: 32000, profit: 18500 },
  { month: 'May', revenue: 37800, target: 35000, profit: 16700 },
  { month: 'Jun', revenue: 51900, target: 40000, profit: 25800 },
  { month: 'Jul', revenue: 48700, target: 45000, profit: 22300 },
  { month: 'Aug', revenue: 55300, target: 48000, profit: 26900 },
  { month: 'Sep', revenue: 62800, target: 50000, profit: 31600 },
  { month: 'Oct', revenue: 59400, target: 52000, profit: 29100 },
  { month: 'Nov', revenue: 68200, target: 55000, profit: 34500 },
  { month: 'Dec', revenue: 85600, target: 60000, profit: 42900 }
];

const channelData = [
  { name: 'In-Store', value: 54.8 },
  { name: 'Online', value: 28.4 },
  { name: 'Wholesale', value: 16.8 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

const categoryData = [
  { name: 'Laptops', value: 38 },
  { name: 'Components', value: 22 },
  { name: 'Accessories', value: 18 },
  { name: 'Monitors', value: 12 },
  { name: 'Peripherals', value: 10 }
];

// Sample data for tables
const topProductsData = [
  { 
    id: 1, 
    name: 'Asus TUF Gaming A15', 
    category: 'Laptops',
    sku: 'ASU-TUF-15-01',
    sales: 125,
    revenue: 3125000000,
    profit: 625000000,
    margin: 20,
    trend: 'up'
  },
  { 
    id: 2, 
    name: 'Logitech G Pro X Keyboard', 
    category: 'Peripherals',
    sku: 'LOG-PROX-KB-01',
    sales: 214,
    revenue: 642000000,
    profit: 205440000,
    margin: 32,
    trend: 'up'
  },
  { 
    id: 3, 
    name: 'AMD Ryzen 9 5900X', 
    category: 'Components',
    sku: 'AMD-R9-5900X',
    sales: 97,
    revenue: 970000000,
    profit: 271600000,
    margin: 28,
    trend: 'down'
  },
  { 
    id: 4, 
    name: 'Samsung Odyssey G7 32"', 
    category: 'Monitors',
    sku: 'SAM-ODY-G7-32',
    sales: 76,
    revenue: 988000000,
    profit: 247000000,
    margin: 25,
    trend: 'up'
  },
  { 
    id: 5, 
    name: 'WD Black SN850 1TB NVMe', 
    category: 'Components',
    sku: 'WD-BLK-SN850-1TB',
    sales: 142,
    revenue: 497000000,
    profit: 174000000,
    margin: 35,
    trend: 'stable'
  }
];

const customerSegmentData = [
  { 
    segment: 'VIP', 
    customers: 45, 
    avgSpend: 8500000, 
    totalSpend: 382500000,
    retention: 94,
    growth: 12
  },
  { 
    segment: 'Regular', 
    customers: 267, 
    avgSpend: 3200000, 
    totalSpend: 854400000,
    retention: 78,
    growth: 8
  },
  { 
    segment: 'Occasional', 
    customers: 583, 
    avgSpend: 1450000, 
    totalSpend: 845350000,
    retention: 42,
    growth: -3
  },
  { 
    segment: 'New', 
    customers: 129, 
    avgSpend: 2100000, 
    totalSpend: 270900000,
    retention: null,
    growth: null
  }
];

const BusinessIntelligence = () => {
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [timeGranularity, setTimeGranularity] = useState('monthly');
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [loading, setLoading] = useState(false);
  
  const handleRefreshData = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };
  
  const handleExport = (type) => {
    message.success(`Exporting ${type} report`);
  };
  
  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.sku}</Text>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Sales (units)',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => a.sales - b.sales,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => `${(value / 1000000).toFixed(1)}M ₫`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (value) => `${(value / 1000000).toFixed(1)}M ₫`,
      sorter: (a, b) => a.profit - b.profit,
    },
    {
      title: 'Margin',
      dataIndex: 'margin',
      key: 'margin',
      render: (value) => `${value}%`,
      sorter: (a, b) => a.margin - b.margin,
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend) => {
        if (trend === 'up') return <Tag color="green">↑</Tag>;
        if (trend === 'down') return <Tag color="red">↓</Tag>;
        return <Tag color="blue">→</Tag>;
      },
    },
  ];
  
  const customerColumns = [
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      render: (text) => {
        const colors = {
          'VIP': 'gold',
          'Regular': 'green',
          'Occasional': 'blue',
          'New': 'purple'
        };
        
        return <Tag color={colors[text]}>{text}</Tag>;
      }
    },
    {
      title: 'Customers',
      dataIndex: 'customers',
      key: 'customers',
      sorter: (a, b) => a.customers - b.customers,
    },
    {
      title: 'Avg. Spend',
      dataIndex: 'avgSpend',
      key: 'avgSpend',
      render: (value) => `${(value / 1000000).toFixed(1)}M ₫`,
      sorter: (a, b) => a.avgSpend - b.avgSpend,
    },
    {
      title: 'Total Spend',
      dataIndex: 'totalSpend',
      key: 'totalSpend',
      render: (value) => `${(value / 1000000).toFixed(1)}M ₫`,
      sorter: (a, b) => a.totalSpend - b.totalSpend,
    },
    {
      title: 'Retention',
      dataIndex: 'retention',
      key: 'retention',
      render: (value) => value ? `${value}%` : 'N/A',
      sorter: (a, b) => (a.retention || 0) - (b.retention || 0),
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (value) => {
        if (value === null) return 'N/A';
        if (value > 0) return <Text type="success">{value}% ↑</Text>;
        if (value < 0) return <Text type="danger">{Math.abs(value)}% ↓</Text>;
        return <Text>{value}%</Text>;
      },
      sorter: (a, b) => (a.growth || 0) - (b.growth || 0),
    },
  ];
  
  return (
    <div>
      <PageHeader
        title="Business Intelligence"
        subtitle="Advanced analytics and business performance insights"
        icon="chart"
        actions={[
          <Select
            key="currency"
            defaultValue="vnd"
            style={{ width: 100 }}
          >
            <Option value="vnd">VND (₫)</Option>
            <Option value="usd">USD ($)</Option>
          </Select>,
          <RangePicker
            key="daterange"
            value={dateRange}
            onChange={setDateRange}
            allowClear={false}
          />,
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleExport('dashboard')}
          >
            Export
          </Button>,
          <Button
            key="refresh"
            icon={<SyncOutlined />}
            onClick={handleRefreshData}
            loading={loading}
          >
            Refresh
          </Button>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        <Card bordered={false} style={{ marginBottom: '24px' }}>
        
        <Alert 
          message="Premium Analytics" 
          description="Upgrade to access advanced AI-powered insights, predictive analytics, and unlimited historical data."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
            <Button size="small" type="primary">
              Upgrade
            </Button>
          }
        />
        
        {/* KPI summary row */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Revenue"
                value={598700000}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="₫"
                formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <div style={{ marginTop: '10px' }}>
                <Progress 
                  percent={92} 
                  size="small" 
                  status="active"
                  format={() => '92% of target'}
                />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Profit"
                value={283500000}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<RiseOutlined />}
                suffix="₫"
                formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="success">+12.3% vs previous period</Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Orders"
                value={1458}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ShoppingCartOutlined />}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="success">+8.7% vs previous period</Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="New Customers"
                value={129}
                precision={0}
                valueStyle={{ color: '#722ed1' }}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="success">+15.2% vs previous period</Text>
              </div>
            </Card>
          </Col>
        </Row>
        
        <Tabs defaultActiveKey="performance">
          <TabPane 
            tab={
              <span>
                <LineChartOutlined /> Performance Metrics
              </span>
            } 
            key="performance"
          >
            <Card style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={4} style={{ margin: 0 }}>Revenue Analysis</Title>
                <Space>
                  <Radio.Group 
                    value={timeGranularity}
                    onChange={(e) => setTimeGranularity(e.target.value)}
                  >
                    <Radio.Button value="daily">Daily</Radio.Button>
                    <Radio.Button value="weekly">Weekly</Radio.Button>
                    <Radio.Button value="monthly">Monthly</Radio.Button>
                    <Radio.Button value="quarterly">Quarterly</Radio.Button>
                  </Radio.Group>
                  
                  <Select 
                    defaultValue="revenue" 
                    style={{ width: 150 }}
                    onChange={setSelectedChart}
                  >
                    <Option value="revenue">Revenue</Option>
                    <Option value="profit">Profit</Option>
                    <Option value="combined">Combined</Option>
                  </Select>
                </Space>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                {selectedChart === 'combined' ? (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#1890ff" />
                    <Bar yAxisId="right" dataKey="profit" name="Profit" fill="#52c41a" />
                  </BarChart>
                ) : (
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={selectedChart} 
                      stroke={selectedChart === 'revenue' ? '#1890ff' : '#52c41a'} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line type="monotone" dataKey="target" stroke="#ff7a45" strokeDasharray="5 5" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </Card>
            
            <Row gutter={24}>
              <Col span={12}>
                <Card style={{ height: '100%' }}>
                  <Title level={4}>Sales by Channel</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card style={{ height: '100%' }}>
                  <Title level={4}>Sales by Category</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={categoryData}
                      layout="vertical"
                      barCategoryGap={15}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip formatter={(value) => `${value}%`} />
                      <Bar 
                        dataKey="value" 
                        name="Sales %" 
                        fill="#1890ff" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ShoppingCartOutlined /> Product Performance
              </span>
            } 
            key="products"
          >
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={4}>Top Performing Products</Title>
                <Space>
                  <Select 
                    defaultValue="revenue" 
                    style={{ width: 150 }}
                  >
                    <Option value="revenue">By Revenue</Option>
                    <Option value="profit">By Profit</Option>
                    <Option value="units">By Units Sold</Option>
                    <Option value="margin">By Margin</Option>
                  </Select>
                  
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => handleExport('products')}
                  >
                    Export
                  </Button>
                </Space>
              </div>
              
              <Table 
                columns={productColumns}
                dataSource={topProductsData}
                pagination={false}
                rowKey="id"
              />
            </Card>
            
            <Card style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={4}>Product Category Breakdown</Title>
                <Select 
                  defaultValue="all" 
                  style={{ width: 150 }}
                >
                  <Option value="all">All Categories</Option>
                  <Option value="laptops">Laptops</Option>
                  <Option value="components">Components</Option>
                  <Option value="accessories">Accessories</Option>
                  <Option value="monitors">Monitors</Option>
                  <Option value="peripherals">Peripherals</Option>
                </Select>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <UserOutlined /> Customer Analysis
              </span>
            } 
            key="customers"
          >
            <Card style={{ marginBottom: '24px' }}>
              <Title level={4}>Customer Segments</Title>
              <Table 
                columns={customerColumns}
                dataSource={customerSegmentData}
                pagination={false}
                rowKey="segment"
              />
            </Card>
            
            <Row gutter={24}>
              <Col span={12}>
                <Card>
                  <Title level={4}>Customer Lifetime Value</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: 1, value: 2.1 },
                      { month: 3, value: 4.3 },
                      { month: 6, value: 7.8 },
                      { month: 9, value: 10.2 },
                      { month: 12, value: 12.5 },
                      { month: 18, value: 16.1 },
                      { month: 24, value: 18.7 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: 0 }} />
                      <YAxis label={{ value: 'Value (in millions ₫)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip formatter={(value) => `${value}M ₫`} />
                      <Line type="monotone" dataKey="value" stroke="#1890ff" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card>
                  <Title level={4}>Customer Retention Rate</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: 'Jan', value: 92 },
                      { month: 'Feb', value: 89 },
                      { month: 'Mar', value: 91 },
                      { month: 'Apr', value: 88 },
                      { month: 'May', value: 86 },
                      { month: 'Jun', value: 88 },
                      { month: 'Jul', value: 90 },
                      { month: 'Aug', value: 93 },
                      { month: 'Sep', value: 92 },
                      { month: 'Oct', value: 94 },
                      { month: 'Nov', value: 91 },
                      { month: 'Dec', value: 89 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[80, 100]} />
                      <RechartsTooltip formatter={(value) => `${value}%`} />
                      <Line type="monotone" dataKey="value" stroke="#52c41a" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CalendarOutlined /> Periodic Reports
              </span>
            } 
            key="reports"
          >
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={4}>Scheduled Reports</Title>
                <Button type="primary">New Report</Button>
              </div>
              
              <Table 
                dataSource={[
                  {
                    id: 1,
                    name: 'Daily Sales Summary',
                    type: 'Sales',
                    frequency: 'Daily',
                    recipients: 'management@truongphat.com',
                    lastSent: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
                    status: 'active'
                  },
                  {
                    id: 2,
                    name: 'Weekly Inventory Report',
                    type: 'Inventory',
                    frequency: 'Weekly',
                    recipients: 'inventory@truongphat.com',
                    lastSent: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm'),
                    status: 'active'
                  },
                  {
                    id: 3,
                    name: 'Monthly Financial Summary',
                    type: 'Financial',
                    frequency: 'Monthly',
                    recipients: 'finance@truongphat.com',
                    lastSent: dayjs().subtract(15, 'day').format('YYYY-MM-DD HH:mm'),
                    status: 'active'
                  },
                  {
                    id: 4,
                    name: 'Quarterly Performance Review',
                    type: 'Performance',
                    frequency: 'Quarterly',
                    recipients: 'director@truongphat.com',
                    lastSent: dayjs().subtract(45, 'day').format('YYYY-MM-DD HH:mm'),
                    status: 'paused'
                  },
                ]}
                rowKey="id"
                columns={[
                  {
                    title: 'Report Name',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type',
                    render: (text) => <Tag color="blue">{text}</Tag>
                  },
                  {
                    title: 'Frequency',
                    dataIndex: 'frequency',
                    key: 'frequency',
                  },
                  {
                    title: 'Recipients',
                    dataIndex: 'recipients',
                    key: 'recipients',
                  },
                  {
                    title: 'Last Sent',
                    dataIndex: 'lastSent',
                    key: 'lastSent',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      status === 'active' ? 
                        <Badge status="success" text="Active" /> : 
                        <Badge status="default" text="Paused" />
                    )
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space size="small">
                        <Button size="small">Edit</Button>
                        <Button 
                          size="small" 
                          icon={<DownloadOutlined />}
                          onClick={() => handleExport(record.type.toLowerCase())}
                        />
                        <Button 
                          size="small" 
                          type={record.status === 'active' ? 'default' : 'primary'}
                        >
                          {record.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                      </Space>
                    )
                  }
                ]}
              />
            </Card>
            
            <Card style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={4}>Custom Report Builder</Title>
              </div>
              
              <Alert 
                message="Pro Feature" 
                description="Custom report builder is available on Business and Enterprise plans"
                type="info" 
                showIcon 
                style={{ marginBottom: 24 }}
                action={
                  <Button size="small" type="primary">
                    Upgrade
                  </Button>
                }
              />
              
              <div style={{ opacity: 0.6 }}>
                <Form layout="vertical">
                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item label="Report Type">
                        <Select disabled>
                          <Option value="sales">Sales</Option>
                          <Option value="inventory">Inventory</Option>
                          <Option value="customers">Customers</Option>
                          <Option value="financial">Financial</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Date Range">
                        <RangePicker disabled style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Format">
                        <Select disabled>
                          <Option value="pdf">PDF</Option>
                          <Option value="excel">Excel</Option>
                          <Option value="csv">CSV</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item label="Included Metrics">
                    <Select mode="multiple" disabled placeholder="Select metrics to include" style={{ width: '100%' }}>
                      <Option value="revenue">Revenue</Option>
                      <Option value="profit">Profit</Option>
                      <Option value="sales_count">Sales Count</Option>
                      <Option value="average_order">Average Order Value</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" disabled>
                      Generate Report
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
      </div>
    </div>
  );
};

export default BusinessIntelligence; 