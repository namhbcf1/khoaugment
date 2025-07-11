import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Select, DatePicker, Button, 
  Table, Progress, Tag, Typography, Space, Tabs, Alert,
  Tooltip, Divider, Switch, InputNumber, Form
} from 'antd';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, ComposedChart, Scatter, ScatterChart
} from 'recharts';
import {
  TrendingUpOutlined, TrendingDownOutlined, DollarOutlined,
  ShoppingCartOutlined, UserOutlined, BarChartOutlined,
  PieChartOutlined, LineChartOutlined, DashboardOutlined,
  ExportOutlined, FilterOutlined, ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const AdvancedBI = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'orders', 'customers']);
  const [dashboardData, setDashboardData] = useState({});
  const [predictiveData, setPredictiveData] = useState({});

  // Advanced KPI data
  const kpiData = [
    {
      title: 'Revenue Growth',
      value: 23.5,
      suffix: '%',
      trend: 'up',
      icon: <TrendingUpOutlined />,
      color: '#52c41a',
      target: 25,
      description: 'Month-over-month revenue growth'
    },
    {
      title: 'Customer Acquisition Cost',
      value: 45000,
      prefix: '₫',
      trend: 'down',
      icon: <UserOutlined />,
      color: '#1890ff',
      target: 40000,
      description: 'Average cost to acquire new customer'
    },
    {
      title: 'Customer Lifetime Value',
      value: 2.8,
      suffix: 'M ₫',
      trend: 'up',
      icon: <DollarOutlined />,
      color: '#722ed1',
      target: 3.0,
      description: 'Average customer lifetime value'
    },
    {
      title: 'Conversion Rate',
      value: 3.2,
      suffix: '%',
      trend: 'up',
      icon: <ShoppingCartOutlined />,
      color: '#faad14',
      target: 3.5,
      description: 'Visitor to customer conversion rate'
    }
  ];

  // Revenue forecasting data
  const forecastData = [
    { month: 'Jan', actual: 120, predicted: 125, confidence: 95 },
    { month: 'Feb', actual: 135, predicted: 140, confidence: 92 },
    { month: 'Mar', actual: 148, predicted: 145, confidence: 88 },
    { month: 'Apr', actual: 162, predicted: 165, confidence: 90 },
    { month: 'May', actual: null, predicted: 175, confidence: 85 },
    { month: 'Jun', actual: null, predicted: 185, confidence: 82 },
    { month: 'Jul', actual: null, predicted: 195, confidence: 80 }
  ];

  // Customer segmentation data
  const segmentationData = [
    { name: 'VIP Customers', value: 15, revenue: 45, color: '#722ed1' },
    { name: 'Regular Customers', value: 35, revenue: 35, color: '#1890ff' },
    { name: 'New Customers', value: 25, revenue: 15, color: '#52c41a' },
    { name: 'Inactive Customers', value: 25, revenue: 5, color: '#faad14' }
  ];

  // Product performance data
  const productPerformance = [
    { category: 'Electronics', revenue: 450, margin: 25, growth: 15 },
    { category: 'Clothing', revenue: 320, margin: 35, growth: 8 },
    { category: 'Home & Garden', revenue: 280, margin: 30, growth: 12 },
    { category: 'Sports', revenue: 180, margin: 20, growth: -5 },
    { category: 'Books', revenue: 120, margin: 40, growth: 3 }
  ];

  // Cohort analysis data
  const cohortData = [
    { cohort: 'Jan 2025', month0: 100, month1: 85, month2: 72, month3: 65 },
    { cohort: 'Feb 2025', month0: 100, month1: 88, month2: 75, month3: null },
    { cohort: 'Mar 2025', month0: 100, month1: 82, month2: null, month3: null },
    { cohort: 'Apr 2025', month0: 100, month1: null, month2: null, month3: null }
  ];

  useEffect(() => {
    loadDashboardData();
    loadPredictiveData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        totalRevenue: 12500000,
        totalOrders: 1250,
        avgOrderValue: 10000,
        customerRetention: 85.5
      });
      setLoading(false);
    }, 1000);
  };

  const loadPredictiveData = async () => {
    // Simulate predictive analytics API call
    setPredictiveData({
      nextMonthRevenue: 18500000,
      churnRisk: 12.5,
      inventoryOptimization: 95.2
    });
  };

  const renderKPICard = (kpi) => (
    <Col xs={24} sm={12} lg={6} key={kpi.title}>
      <Card hoverable>
        <Statistic
          title={
            <Space>
              {kpi.icon}
              <span>{kpi.title}</span>
              <Tooltip title={kpi.description}>
                <Text type="secondary" style={{ fontSize: 12 }}>ⓘ</Text>
              </Tooltip>
            </Space>
          }
          value={kpi.value}
          prefix={kpi.prefix}
          suffix={kpi.suffix}
          valueStyle={{ color: kpi.color }}
        />
        <div style={{ marginTop: 8 }}>
          <Progress 
            percent={Math.round((kpi.value / kpi.target) * 100)} 
            size="small"
            strokeColor={kpi.color}
            showInfo={false}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Target: {kpi.prefix}{kpi.target}{kpi.suffix}
          </Text>
        </div>
      </Card>
    </Col>
  );

  const renderForecastChart = () => (
    <Card title="Revenue Forecasting" extra={
      <Space>
        <Select defaultValue="monthly" size="small">
          <Select.Option value="weekly">Weekly</Select.Option>
          <Select.Option value="monthly">Monthly</Select.Option>
          <Select.Option value="quarterly">Quarterly</Select.Option>
        </Select>
        <Button size="small" icon={<ExportOutlined />}>Export</Button>
      </Space>
    }>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={forecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="actual" fill="#1890ff" name="Actual Revenue (M ₫)" />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#52c41a" 
            strokeDasharray="5 5"
            name="Predicted Revenue (M ₫)"
          />
          <Area 
            dataKey="confidence" 
            fill="#52c41a" 
            fillOpacity={0.1}
            name="Confidence (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderSegmentationChart = () => (
    <Card title="Customer Segmentation Analysis">
      <Row gutter={16}>
        <Col span={12}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={segmentationData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {segmentationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col span={12}>
          <div style={{ padding: '20px 0' }}>
            {segmentationData.map(segment => (
              <div key={segment.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <div style={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: segment.color,
                      borderRadius: '50%'
                    }} />
                    <Text strong>{segment.name}</Text>
                  </Space>
                  <Text>{segment.revenue}% Revenue</Text>
                </div>
                <Progress 
                  percent={segment.revenue} 
                  strokeColor={segment.color}
                  size="small"
                  showInfo={false}
                />
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderProductPerformance = () => (
    <Card title="Product Category Performance">
      <Table
        dataSource={productPerformance}
        pagination={false}
        size="small"
        columns={[
          {
            title: 'Category',
            dataKey: 'category',
            key: 'category'
          },
          {
            title: 'Revenue (M ₫)',
            dataKey: 'revenue',
            key: 'revenue',
            render: (value) => <Text strong>{value}</Text>
          },
          {
            title: 'Margin (%)',
            dataKey: 'margin',
            key: 'margin',
            render: (value) => (
              <Tag color={value > 30 ? 'green' : value > 20 ? 'orange' : 'red'}>
                {value}%
              </Tag>
            )
          },
          {
            title: 'Growth (%)',
            dataKey: 'growth',
            key: 'growth',
            render: (value) => (
              <Space>
                {value > 0 ? <TrendingUpOutlined style={{ color: '#52c41a' }} /> : 
                 <TrendingDownOutlined style={{ color: '#ff4d4f' }} />}
                <Text style={{ color: value > 0 ? '#52c41a' : '#ff4d4f' }}>
                  {value}%
                </Text>
              </Space>
            )
          }
        ]}
      />
    </Card>
  );

  const renderCohortAnalysis = () => (
    <Card title="Customer Cohort Analysis" extra={
      <Tooltip title="Customer retention by acquisition month">
        <Text type="secondary">ⓘ</Text>
      </Tooltip>
    }>
      <Table
        dataSource={cohortData}
        pagination={false}
        size="small"
        columns={[
          {
            title: 'Cohort',
            dataKey: 'cohort',
            key: 'cohort',
            fixed: 'left'
          },
          {
            title: 'Month 0',
            dataKey: 'month0',
            key: 'month0',
            render: (value) => <Text strong>{value}%</Text>
          },
          {
            title: 'Month 1',
            dataKey: 'month1',
            key: 'month1',
            render: (value) => value ? `${value}%` : '-'
          },
          {
            title: 'Month 2',
            dataKey: 'month2',
            key: 'month2',
            render: (value) => value ? `${value}%` : '-'
          },
          {
            title: 'Month 3',
            dataKey: 'month3',
            key: 'month3',
            render: (value) => value ? `${value}%` : '-'
          }
        ]}
      />
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>
          <DashboardOutlined /> Advanced Business Intelligence
        </Title>
        <Space>
          <RangePicker />
          <Select 
            defaultValue="7d" 
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 120 }}
          >
            <Select.Option value="1d">Today</Select.Option>
            <Select.Option value="7d">7 Days</Select.Option>
            <Select.Option value="30d">30 Days</Select.Option>
            <Select.Option value="90d">90 Days</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Advanced KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiData.map(renderKPICard)}
      </Row>

      <Tabs defaultActiveKey="forecast">
        <TabPane tab={<span><LineChartOutlined />Forecasting</span>} key="forecast">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              {renderForecastChart()}
            </Col>
            <Col span={12}>
              <Card title="Predictive Insights">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Next Month Revenue Prediction"
                    value={predictiveData.nextMonthRevenue}
                    prefix="₫"
                    suffix="(+15%)"
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic
                    title="Customer Churn Risk"
                    value={predictiveData.churnRisk}
                    suffix="%"
                    valueStyle={{ color: '#faad14' }}
                  />
                  <Statistic
                    title="Inventory Optimization Score"
                    value={predictiveData.inventoryOptimization}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="AI Recommendations">
                <Alert
                  message="Inventory Alert"
                  description="Consider restocking Electronics category - predicted 25% demand increase"
                  type="warning"
                  style={{ marginBottom: 16 }}
                />
                <Alert
                  message="Marketing Opportunity"
                  description="VIP customers show 85% retention - expand loyalty program"
                  type="info"
                  style={{ marginBottom: 16 }}
                />
                <Alert
                  message="Price Optimization"
                  description="Home & Garden category can support 8% price increase"
                  type="success"
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><PieChartOutlined />Segmentation</span>} key="segmentation">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              {renderSegmentationChart()}
            </Col>
            <Col span={24}>
              {renderCohortAnalysis()}
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><BarChartOutlined />Performance</span>} key="performance">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              {renderProductPerformance()}
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdvancedBI;
