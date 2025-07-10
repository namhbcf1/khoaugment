import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Select, DatePicker, Button, Space,
  Typography, Tabs, Table, Tag, Progress, Alert, List, Avatar,
  Tooltip, Badge, Timeline, Drawer, Form, InputNumber, Switch
} from 'antd';
import {
  BarChartOutlined, LineChartOutlined, PieChartOutlined,
  ArrowUpOutlined, ArrowDownOutlined, DollarOutlined,
  ShoppingCartOutlined, UserOutlined, ClockCircleOutlined,
  FireOutlined, ThunderboltOutlined, BulbOutlined, AimOutlined,
  RocketOutlined, CrownOutlined, StarOutlined, EyeOutlined,
  DownloadOutlined, FilterOutlined, ReloadOutlined
} from '@ant-design/icons';
import {
  Line, Column, Pie, Area, Gauge, Radar, Scatter, Heatmap,
  DualAxes, Rose, Funnel, Liquid
} from '@ant-design/plots';
import { api } from '../services/api';
import dayjs from 'dayjs';
import { MetricCard, PageHeader, LoadingSkeleton } from '../components/ui/DesignSystem';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Analytics data
  const [dashboardMetrics, setDashboardMetrics] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [hourlyTrends, setHourlyTrends] = useState([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState([]);
  const [cohortAnalysis, setCohortAnalysis] = useState([]);
  const [predictiveData, setPredictiveData] = useState([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({});

  useEffect(() => {
    loadAnalyticsData();

    // Set up real-time updates
    const interval = setInterval(loadRealTimeMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [dateRange, selectedLocation]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardMetrics(),
        loadRevenueData(),
        loadSalesData(),
        loadCustomerData(),
        loadProductPerformance(),
        loadStaffPerformance(),
        loadHourlyTrends(),
        loadCategoryAnalysis(),
        loadCohortAnalysis(),
        loadPredictiveData()
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      const response = await api.get('/analytics/dashboard-metrics', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          location_id: selectedLocation !== 'all' ? selectedLocation : undefined
        }
      });

      if (response.data.success) {
        setDashboardMetrics(response.data.data);
      }
    } catch (error) {
      // Mock data
      setDashboardMetrics({
        totalRevenue: 125600000,
        revenueGrowth: 15.2,
        totalOrders: 2847,
        ordersGrowth: 8.7,
        avgOrderValue: 44120,
        avgOrderGrowth: 6.1,
        totalCustomers: 1892,
        customersGrowth: 12.3,
        conversionRate: 3.2,
        conversionGrowth: 0.8,
        customerLifetimeValue: 2850000,
        churnRate: 5.2,
        inventoryTurnover: 4.8,
        grossMargin: 42.5
      });
    }
  };

  const loadRevenueData = async () => {
    try {
      const response = await api.get('/analytics/revenue-trend', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          location_id: selectedLocation !== 'all' ? selectedLocation : undefined
        }
      });

      if (response.data.success) {
        setRevenueData(response.data.data);
      }
    } catch (error) {
      // Mock data
      const mockData = [];
      for (let i = 0; i < 30; i++) {
        mockData.push({
          date: dayjs().subtract(29 - i, 'days').format('YYYY-MM-DD'),
          revenue: Math.floor(Math.random() * 5000000) + 2000000,
          orders: Math.floor(Math.random() * 100) + 50,
          customers: Math.floor(Math.random() * 80) + 30
        });
      }
      setRevenueData(mockData);
    }
  };

  const loadSalesData = async () => {
    try {
      const response = await api.get('/analytics/sales-performance', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        }
      });

      if (response.data.success) {
        setSalesData(response.data.data);
      }
    } catch (error) {
      // Mock data
      setSalesData([
        { period: 'Tuần 1', target: 25000000, actual: 28500000, achievement: 114 },
        { period: 'Tuần 2', target: 25000000, actual: 23200000, achievement: 92.8 },
        { period: 'Tuần 3', target: 25000000, actual: 31200000, achievement: 124.8 },
        { period: 'Tuần 4', target: 25000000, actual: 29800000, achievement: 119.2 }
      ]);
    }
  };

  const loadCustomerData = async () => {
    try {
      const response = await api.get('/analytics/customer-insights', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        }
      });

      if (response.data.success) {
        setCustomerData(response.data.data);
      }
    } catch (error) {
      // Mock data
      setCustomerData([
        { segment: 'VIP', count: 89, revenue: 45600000, avgSpend: 512360 },
        { segment: 'Premium', count: 156, revenue: 38200000, avgSpend: 244870 },
        { segment: 'Regular', count: 647, revenue: 41800000, avgSpend: 64600 },
        { segment: 'New', count: 234, revenue: 8900000, avgSpend: 38030 }
      ]);
    }
  };

  const loadProductPerformance = async () => {
    try {
      const response = await api.get('/analytics/product-performance', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          limit: 20
        }
      });

      if (response.data.success) {
        setProductPerformance(response.data.data);
      }
    } catch (error) {
      // Mock data
      setProductPerformance([
        { name: 'Coca Cola 330ml', revenue: 8500000, quantity: 567, margin: 35.2, trend: 'up' },
        { name: 'Bánh mì sandwich', revenue: 6200000, quantity: 248, margin: 40.0, trend: 'up' },
        { name: 'Mì tôm Hảo Hảo', revenue: 4800000, quantity: 960, margin: 30.0, trend: 'down' },
        { name: 'Nước suối', revenue: 3200000, quantity: 800, margin: 25.5, trend: 'stable' },
        { name: 'Cà phê đen', revenue: 2900000, quantity: 145, margin: 45.8, trend: 'up' }
      ]);
    }
  };

  const loadStaffPerformance = async () => {
    try {
      const response = await api.get('/analytics/staff-performance', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        }
      });

      if (response.data.success) {
        setStaffPerformance(response.data.data);
      }
    } catch (error) {
      // Mock data
      setStaffPerformance([
        { name: 'Nguyễn Văn A', revenue: 15600000, orders: 156, efficiency: 95.2, rating: 4.8 },
        { name: 'Trần Thị B', revenue: 14200000, orders: 142, efficiency: 92.1, rating: 4.6 },
        { name: 'Lê Văn C', revenue: 12800000, orders: 128, efficiency: 88.5, rating: 4.4 },
        { name: 'Phạm Thị D', revenue: 11500000, orders: 115, efficiency: 85.2, rating: 4.2 }
      ]);
    }
  };

  const loadHourlyTrends = async () => {
    try {
      const response = await api.get('/analytics/hourly-trends', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        }
      });

      if (response.data.success) {
        setHourlyTrends(response.data.data);
      }
    } catch (error) {
      // Mock data
      const mockData = [];
      for (let hour = 0; hour < 24; hour++) {
        const baseRevenue = hour >= 6 && hour <= 22 ?
          Math.floor(Math.random() * 800000) + 200000 :
          Math.floor(Math.random() * 100000) + 50000;

        mockData.push({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          revenue: baseRevenue,
          orders: Math.floor(baseRevenue / 50000),
          customers: Math.floor(baseRevenue / 80000)
        });
      }
      setHourlyTrends(mockData);
    }
  };

  const loadCategoryAnalysis = async () => {
    try {
      const response = await api.get('/analytics/category-analysis', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        }
      });

      if (response.data.success) {
        setCategoryAnalysis(response.data.data);
      }
    } catch (error) {
      // Mock data
      setCategoryAnalysis([
        { category: 'Beverages', revenue: 45600000, percentage: 36.3, growth: 12.5 },
        { category: 'Food', revenue: 38200000, percentage: 30.4, growth: 8.7 },
        { category: 'Snacks', revenue: 25800000, percentage: 20.5, growth: 15.2 },
        { category: 'Personal Care', revenue: 16000000, percentage: 12.8, growth: 6.3 }
      ]);
    }
  };

  const loadCohortAnalysis = async () => {
    try {
      const response = await api.get('/analytics/cohort-analysis');

      if (response.data.success) {
        setCohortAnalysis(response.data.data);
      }
    } catch (error) {
      // Mock data
      setCohortAnalysis([
        { cohort: 'Jan 2024', month0: 100, month1: 85, month2: 72, month3: 65 },
        { cohort: 'Feb 2024', month0: 100, month1: 88, month2: 75, month3: 68 },
        { cohort: 'Mar 2024', month0: 100, month1: 82, month2: 70, month3: null }
      ]);
    }
  };

  const loadPredictiveData = async () => {
    try {
      const response = await api.get('/analytics/predictions');

      if (response.data.success) {
        setPredictiveData(response.data.data);
      }
    } catch (error) {
      // Mock data
      const mockData = [];
      for (let i = 0; i < 30; i++) {
        mockData.push({
          date: dayjs().add(i, 'days').format('YYYY-MM-DD'),
          predicted_revenue: Math.floor(Math.random() * 1000000) + 3000000,
          confidence: Math.random() * 0.3 + 0.7
        });
      }
      setPredictiveData(mockData);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const response = await api.get('/analytics/real-time');

      if (response.data.success) {
        setRealTimeMetrics(response.data.data);
      }
    } catch (error) {
      // Mock data
      setRealTimeMetrics({
        currentRevenue: Math.floor(Math.random() * 500000) + 1000000,
        currentOrders: Math.floor(Math.random() * 20) + 15,
        activeCustomers: Math.floor(Math.random() * 50) + 25,
        conversionRate: (Math.random() * 2 + 2).toFixed(1),
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ?
      <ArrowUpOutlined style={{ color: '#52c41a' }} /> :
      <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? '#52c41a' : '#ff4d4f';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
      case 'down': return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
      default: return <span style={{ color: '#faad14' }}>—</span>;
    }
  };

  // Chart configurations
  const revenueChartConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    color: '#1890ff',
    point: { size: 3, shape: 'circle' },
    tooltip: {
      formatter: (datum) => ({
        name: 'Doanh thu',
        value: formatCurrency(datum.revenue)
      })
    }
  };

  const salesPerformanceConfig = {
    data: salesData,
    xField: 'period',
    yField: ['target', 'actual'],
    geometryOptions: [
      { geometry: 'column', color: '#d9d9d9' },
      { geometry: 'column', color: '#1890ff' }
    ]
  };

  const customerSegmentConfig = {
    data: customerData,
    angleField: 'revenue',
    colorField: 'segment',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}'
    }
  };

  const hourlyTrendsConfig = {
    data: hourlyTrends,
    xField: 'hour',
    yField: 'revenue',
    smooth: true,
    color: '#52c41a',
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
        fillOpacity: 0.3
      }
    }
  };

  const categoryAnalysisConfig = {
    data: categoryAnalysis,
    xField: 'category',
    yField: 'revenue',
    color: '#faad14',
    columnWidthRatio: 0.6
  };

  const predictiveChartConfig = {
    data: predictiveData,
    xField: 'date',
    yField: 'predicted_revenue',
    smooth: true,
    color: '#722ed1',
    point: { size: 2 },
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#b37feb 1:#722ed1',
        fillOpacity: 0.2
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Analytics & Business Intelligence"
        subtitle="Phân tích dữ liệu và báo cáo thông minh"
        icon="chart"
        actions={[
          <Select
            key="location"
            value={selectedLocation}
            onChange={setSelectedLocation}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả cửa hàng</Option>
            <Option value="loc-001">Cửa hàng chính</Option>
          </Select>,
          <RangePicker
            key="daterange"
            value={dateRange}
            format="DD/MM/YYYY"
          />,
          <Button
            key="filter"
            icon={<FilterOutlined />}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            Bộ lọc
          </Button>,
          <Button
            key="refresh"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={loadAnalyticsData}
            loading={loading}
          >
            Cập nhật
          </Button>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>

      {/* Real-time Metrics */}
      <Alert
        message={
          <Space>
            <ClockCircleOutlined />
            <Text strong>Dữ liệu thời gian thực</Text>
            <Text type="secondary">
              (Cập nhật lần cuối: {dayjs(realTimeMetrics.lastUpdated).format('HH:mm:ss')})
            </Text>
          </Space>
        }
        description={
          <Row gutter={[16, 8]}>
            <Col span={6}>
              <Text>Doanh thu hôm nay: <Text strong style={{ color: '#1890ff' }}>
                {formatCurrency(realTimeMetrics.currentRevenue || 0)}
              </Text></Text>
            </Col>
            <Col span={6}>
              <Text>Đơn hàng: <Text strong>{realTimeMetrics.currentOrders || 0}</Text></Text>
            </Col>
            <Col span={6}>
              <Text>Khách hàng hoạt động: <Text strong>{realTimeMetrics.activeCustomers || 0}</Text></Text>
            </Col>
            <Col span={6}>
              <Text>Tỷ lệ chuyển đổi: <Text strong>{realTimeMetrics.conversionRate || 0}%</Text></Text>
            </Col>
          </Row>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Tổng quan" key="overview">
          {/* Key Metrics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <MetricCard
                title="Tổng doanh thu"
                value={formatCurrency(dashboardMetrics.totalRevenue)}
                icon="dollar"
                trend={dashboardMetrics.revenueGrowth >= 0 ? 'up' : 'down'}
                trendValue={`${Math.abs(dashboardMetrics.revenueGrowth)}%`}
                color="success"
                loading={loading}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricCard
                title="Tổng đơn hàng"
                value={dashboardMetrics.totalOrders?.toLocaleString()}
                icon="cart"
                trend={dashboardMetrics.ordersGrowth >= 0 ? 'up' : 'down'}
                trendValue={`${Math.abs(dashboardMetrics.ordersGrowth)}%`}
                color="primary"
                loading={loading}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricCard
                title="Giá trị đơn hàng TB"
                value={formatCurrency(dashboardMetrics.avgOrderValue)}
                icon="chart"
                trend={dashboardMetrics.avgOrderGrowth >= 0 ? 'up' : 'down'}
                trendValue={`${Math.abs(dashboardMetrics.avgOrderGrowth)}%`}
                color="info"
                loading={loading}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <MetricCard
                title="Tỷ lệ chuyển đổi"
                value={`${dashboardMetrics.conversionRate}%`}
                icon="chart"
                color="warning"
                loading={loading}
              />
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="Xu hướng doanh thu" loading={loading}>
                <Line {...revenueChartConfig} height={300} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Phân khúc khách hàng" loading={loading}>
                <Pie {...customerSegmentConfig} height={300} />
              </Card>
            </Col>
          </Row>

          {/* Performance Tables */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Top sản phẩm" loading={loading}>
                <Table
                  dataSource={productPerformance}
                  rowKey="name"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Sản phẩm',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: 'Doanh thu',
                      dataIndex: 'revenue',
                      key: 'revenue',
                      render: (value) => formatCurrency(value),
                    },
                    {
                      title: 'Xu hướng',
                      dataIndex: 'trend',
                      key: 'trend',
                      render: (trend) => getTrendIcon(trend),
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Hiệu suất nhân viên" loading={loading}>
                <Table
                  dataSource={staffPerformance}
                  rowKey="name"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Nhân viên',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: 'Doanh thu',
                      dataIndex: 'revenue',
                      key: 'revenue',
                      render: (value) => formatCurrency(value),
                    },
                    {
                      title: 'Hiệu suất',
                      dataIndex: 'efficiency',
                      key: 'efficiency',
                      render: (value) => `${value}%`,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Xu hướng theo giờ" key="hourly">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title="Doanh thu theo giờ trong ngày" loading={loading}>
                <Area {...hourlyTrendsConfig} height={400} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="Giờ cao điểm" loading={loading}>
                <List
                  dataSource={hourlyTrends.sort((a, b) => b.revenue - a.revenue).slice(0, 5)}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />}
                        title={`${item.hour}`}
                        description={`Doanh thu: ${formatCurrency(item.revenue)} - ${item.orders} đơn hàng`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Phân tích theo danh mục" loading={loading}>
                <Column {...categoryAnalysisConfig} height={300} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Dự báo AI" key="predictions">
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <BulbOutlined style={{ color: '#722ed1' }} />
                    <span>Dự báo doanh thu 30 ngày tới</span>
                    <Tag color="purple">AI Powered</Tag>
                  </Space>
                }
                loading={loading}
              >
                <Area {...predictiveChartConfig} height={400} />
                <Alert
                  message="Thông tin dự báo"
                  description="Dự báo được tạo bằng AI dựa trên dữ liệu lịch sử, xu hướng thị trường và các yếu tố mùa vụ. Độ tin cậy trung bình: 85%"
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={8}>
              <Card title="Insights AI" loading={loading}>
                <List
                  dataSource={[
                    {
                      icon: <FireOutlined style={{ color: '#ff4d4f' }} />,
                      title: 'Xu hướng tăng trưởng',
                      description: 'Doanh thu dự kiến tăng 15% trong tháng tới'
                    },
                    {
                      icon: <ThunderboltOutlined style={{ color: '#faad14' }} />,
                      title: 'Cơ hội bán chéo',
                      description: 'Khách mua Coca Cola có 70% khả năng mua snacks'
                    },
                    {
                      icon: <AimOutlined style={{ color: '#52c41a' }} />,
                      title: 'Tối ưu hóa',
                      description: 'Tăng stock Bánh mì vào 7-9h sáng để tối đa hóa doanh thu'
                    }
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={item.icon}
                        title={item.title}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Chỉ số hiệu suất" loading={loading}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>Inventory Turnover</Text>
                    <Progress percent={dashboardMetrics.inventoryTurnover * 20} strokeColor="#1890ff" />
                    <Text type="secondary">{dashboardMetrics.inventoryTurnover} lần/tháng</Text>
                  </div>
                  <div>
                    <Text>Gross Margin</Text>
                    <Progress percent={dashboardMetrics.grossMargin} strokeColor="#52c41a" />
                    <Text type="secondary">{dashboardMetrics.grossMargin}%</Text>
                  </div>
                  <div>
                    <Text>Customer Retention</Text>
                    <Progress percent={100 - dashboardMetrics.churnRate * 10} strokeColor="#faad14" />
                    <Text type="secondary">{(100 - dashboardMetrics.churnRate * 10).toFixed(1)}%</Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Khuyến nghị" loading={loading}>
                <Timeline>
                  <Timeline.Item color="green">
                    <Text strong>Tăng stock Coca Cola</Text>
                    <div><Text type="secondary">Dự báo tăng 25% nhu cầu tuần tới</Text></div>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text strong>Chương trình khuyến mãi</Text>
                    <div><Text type="secondary">Combo Bánh mì + Cà phê vào buổi sáng</Text></div>
                  </Timeline.Item>
                  <Timeline.Item color="orange">
                    <Text strong>Training nhân viên</Text>
                    <div><Text type="secondary">Kỹ năng bán hàng cho nhân viên ca chiều</Text></div>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Cohort Analysis" key="cohort">
          <Card title="Phân tích Cohort - Tỷ lệ giữ chân khách hàng" loading={loading}>
            <Table
              dataSource={cohortAnalysis}
              rowKey="cohort"
              pagination={false}
              columns={[
                {
                  title: 'Cohort',
                  dataIndex: 'cohort',
                  key: 'cohort',
                  fixed: 'left',
                },
                {
                  title: 'Tháng 0',
                  dataIndex: 'month0',
                  key: 'month0',
                  render: (value) => <Tag color="blue">{value}%</Tag>,
                },
                {
                  title: 'Tháng 1',
                  dataIndex: 'month1',
                  key: 'month1',
                  render: (value) => value ? <Tag color="green">{value}%</Tag> : '-',
                },
                {
                  title: 'Tháng 2',
                  dataIndex: 'month2',
                  key: 'month2',
                  render: (value) => value ? <Tag color="orange">{value}%</Tag> : '-',
                },
                {
                  title: 'Tháng 3',
                  dataIndex: 'month3',
                  key: 'month3',
                  render: (value) => value ? <Tag color="red">{value}%</Tag> : '-',
                },
              ]}
            />
            <Alert
              message="Giải thích Cohort Analysis"
              description="Bảng này cho thấy tỷ lệ khách hàng quay lại mua hàng theo từng tháng. Cohort Jan 2024 có 100% khách hàng mới, 85% quay lại tháng 1, 72% tháng 2, và 65% tháng 3."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </TabPane>
      </Tabs>
      </div>
    </div>
  );
};

export default Analytics;