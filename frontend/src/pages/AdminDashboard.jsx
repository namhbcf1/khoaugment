import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Table, Progress, Space, Typography, 
  Select, DatePicker, Button, Tag, Avatar, List, Timeline, Tabs
} from 'antd';
import {
  DollarOutlined, ShoppingCartOutlined, UserOutlined, 
  TrophyOutlined, RiseOutlined, FallOutlined, ClockCircleOutlined,
  TeamOutlined, ShopOutlined, BarChartOutlined, LineChartOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import { api } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  
  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topStaff, setTopStaff] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, selectedLocation]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadSalesChart(),
        loadTopProducts(),
        loadTopStaff(),
        loadRecentOrders(),
        loadCustomerSegments(),
        loadLowStockProducts()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          location_id: selectedLocation !== 'all' ? selectedLocation : undefined
        }
      });
      
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      // Use mock data if API fails
      setDashboardStats({
        totalSales: 15420000,
        totalOrders: 1247,
        totalCustomers: 892,
        avgOrderValue: 123650,
        salesGrowth: 12.5,
        ordersGrowth: 8.3,
        customersGrowth: 15.2
      });
    }
  };

  const loadSalesChart = async () => {
    try {
      const response = await api.get('/analytics/sales-chart', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          location_id: selectedLocation !== 'all' ? selectedLocation : undefined
        }
      });
      
      if (response.data.success) {
        setSalesData(response.data.data);
      }
    } catch (error) {
      // Mock data
      const mockData = [];
      for (let i = 0; i < 30; i++) {
        mockData.push({
          date: dayjs().subtract(29 - i, 'days').format('YYYY-MM-DD'),
          sales: Math.floor(Math.random() * 1000000) + 200000,
          orders: Math.floor(Math.random() * 50) + 10
        });
      }
      setSalesData(mockData);
    }
  };

  const loadTopProducts = async () => {
    try {
      const response = await api.get('/analytics/top-products', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          limit: 10
        }
      });
      
      if (response.data.success) {
        setTopProducts(response.data.data);
      }
    } catch (error) {
      // Mock data
      setTopProducts([
        { id: 1, name: 'Coca Cola 330ml', sales: 1250000, quantity: 834, growth: 12.5 },
        { id: 2, name: 'Pepsi 330ml', sales: 980000, quantity: 653, growth: -2.3 },
        { id: 3, name: 'Mì tôm Hảo Hảo', sales: 750000, quantity: 1500, growth: 8.7 },
        { id: 4, name: 'Bánh mì sandwich', sales: 650000, quantity: 325, growth: 15.2 },
        { id: 5, name: 'Cà phê đen', sales: 580000, quantity: 290, growth: 5.8 }
      ]);
    }
  };

  const loadTopStaff = async () => {
    try {
      const response = await api.get('/analytics/top-staff', {
        params: {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
          limit: 10
        }
      });
      
      if (response.data.success) {
        setTopStaff(response.data.data);
      }
    } catch (error) {
      // Mock data
      setTopStaff([
        { id: 1, name: 'Nguyễn Văn A', sales: 2500000, orders: 125, xp: 1250, level: 8 },
        { id: 2, name: 'Trần Thị B', sales: 2200000, orders: 110, xp: 1100, level: 7 },
        { id: 3, name: 'Lê Văn C', sales: 1980000, orders: 99, xp: 990, level: 6 },
        { id: 4, name: 'Phạm Thị D', sales: 1750000, orders: 87, xp: 870, level: 6 },
        { id: 5, name: 'Hoàng Văn E', sales: 1650000, orders: 82, xp: 820, level: 5 }
      ]);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await api.get('/orders', {
        params: { limit: 10, sort: 'created_at', order: 'desc' }
      });
      
      if (response.data.success) {
        setRecentOrders(response.data.data.orders);
      }
    } catch (error) {
      // Mock data
      setRecentOrders([
        { id: 1, order_number: 'ORD-001', customer_name: 'Khách lẻ', total: 125000, status: 'completed', created_at: new Date() },
        { id: 2, order_number: 'ORD-002', customer_name: 'Nguyễn Văn A', total: 89000, status: 'completed', created_at: new Date() },
        { id: 3, order_number: 'ORD-003', customer_name: 'Trần Thị B', total: 156000, status: 'pending', created_at: new Date() }
      ]);
    }
  };

  const loadCustomerSegments = async () => {
    try {
      const response = await api.get('/analytics/customer-segments');
      
      if (response.data.success) {
        setCustomerSegments(response.data.data);
      }
    } catch (error) {
      // Mock data
      setCustomerSegments([
        { type: 'VIP', value: 25, color: '#ff4d4f' },
        { type: 'Premium', value: 35, color: '#faad14' },
        { type: 'Regular', value: 40, color: '#52c41a' }
      ]);
    }
  };

  const loadLowStockProducts = async () => {
    try {
      const response = await api.get('/products/low-stock');
      
      if (response.data.success) {
        setLowStockProducts(response.data.data);
      }
    } catch (error) {
      // Mock data
      setLowStockProducts([
        { id: 1, name: 'Coca Cola 330ml', current_stock: 5, reorder_point: 20, status: 'critical' },
        { id: 2, name: 'Bánh mì sandwich', current_stock: 12, reorder_point: 15, status: 'low' },
        { id: 3, name: 'Cà phê đen', current_stock: 8, reorder_point: 10, status: 'low' }
      ]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <RiseOutlined style={{ color: '#52c41a' }} /> : <FallOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? '#52c41a' : '#ff4d4f';
  };

  // Chart configurations
  const salesChartConfig = {
    data: salesData,
    xField: 'date',
    yField: 'sales',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'Doanh thu', value: formatCurrency(datum.sales) };
      },
    },
  };

  const customerSegmentConfig = {
    data: customerSegments,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> Admin Dashboard
          </Title>
          <Text type="secondary">Tổng quan hệ thống KhoChuan POS</Text>
        </Col>
        <Col>
          <Space>
            <Select
              value={selectedLocation}
              onChange={setSelectedLocation}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả cửa hàng</Option>
              <Option value="loc-001">Cửa hàng chính</Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
            <Button type="primary" onClick={loadDashboardData} loading={loading}>
              Cập nhật
            </Button>
          </Space>
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Tổng quan" key="overview">
          {/* Key Metrics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={dashboardStats.totalSales}
                  formatter={(value) => formatCurrency(value)}
                  prefix={<DollarOutlined />}
                  suffix={
                    <span style={{ fontSize: '14px', color: getGrowthColor(dashboardStats.salesGrowth) }}>
                      {getGrowthIcon(dashboardStats.salesGrowth)} {Math.abs(dashboardStats.salesGrowth)}%
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={dashboardStats.totalOrders}
                  prefix={<ShoppingCartOutlined />}
                  suffix={
                    <span style={{ fontSize: '14px', color: getGrowthColor(dashboardStats.ordersGrowth) }}>
                      {getGrowthIcon(dashboardStats.ordersGrowth)} {Math.abs(dashboardStats.ordersGrowth)}%
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng khách hàng"
                  value={dashboardStats.totalCustomers}
                  prefix={<UserOutlined />}
                  suffix={
                    <span style={{ fontSize: '14px', color: getGrowthColor(dashboardStats.customersGrowth) }}>
                      {getGrowthIcon(dashboardStats.customersGrowth)} {Math.abs(dashboardStats.customersGrowth)}%
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Giá trị đơn hàng TB"
                  value={dashboardStats.avgOrderValue}
                  formatter={(value) => formatCurrency(value)}
                  prefix={<LineChartOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="Biểu đồ doanh thu" loading={loading}>
                <Area {...salesChartConfig} height={300} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Phân khúc khách hàng" loading={loading}>
                <Pie {...customerSegmentConfig} height={300} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Sản phẩm" key="products">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Top sản phẩm bán chạy" loading={loading}>
                <Table
                  dataSource={topProducts}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: 'Sản phẩm',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: 'Doanh thu',
                      dataIndex: 'sales',
                      key: 'sales',
                      render: (value) => formatCurrency(value),
                    },
                    {
                      title: 'Số lượng',
                      dataIndex: 'quantity',
                      key: 'quantity',
                    },
                    {
                      title: 'Tăng trưởng',
                      dataIndex: 'growth',
                      key: 'growth',
                      render: (value) => (
                        <span style={{ color: getGrowthColor(value) }}>
                          {getGrowthIcon(value)} {Math.abs(value)}%
                        </span>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Sản phẩm sắp hết hàng" loading={loading}>
                <List
                  dataSource={lowStockProducts}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.name}
                        description={
                          <Space>
                            <Text>Còn: {item.current_stock}</Text>
                            <Tag color={item.status === 'critical' ? 'red' : 'orange'}>
                              {item.status === 'critical' ? 'Nguy hiểm' : 'Thấp'}
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Nhân viên" key="staff">
          <Card title="Top nhân viên xuất sắc" loading={loading}>
            <Table
              dataSource={topStaff}
              rowKey="id"
              columns={[
                {
                  title: 'Nhân viên',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Space>
                      <Avatar>{text.charAt(0)}</Avatar>
                      <div>
                        <div>{text}</div>
                        <Text type="secondary">Level {record.level}</Text>
                      </div>
                    </Space>
                  ),
                },
                {
                  title: 'Doanh thu',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (value) => formatCurrency(value),
                },
                {
                  title: 'Đơn hàng',
                  dataIndex: 'orders',
                  key: 'orders',
                },
                {
                  title: 'XP',
                  dataIndex: 'xp',
                  key: 'xp',
                  render: (value) => (
                    <Space>
                      <TrophyOutlined style={{ color: '#faad14' }} />
                      {value}
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab="Đơn hàng" key="orders">
          <Card title="Đơn hàng gần đây" loading={loading}>
            <Table
              dataSource={recentOrders}
              rowKey="id"
              columns={[
                {
                  title: 'Mã đơn hàng',
                  dataIndex: 'order_number',
                  key: 'order_number',
                },
                {
                  title: 'Khách hàng',
                  dataIndex: 'customer_name',
                  key: 'customer_name',
                },
                {
                  title: 'Tổng tiền',
                  dataIndex: 'total',
                  key: 'total',
                  render: (value) => formatCurrency(value),
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'completed' ? 'green' : 'orange'}>
                      {status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                    </Tag>
                  ),
                },
                {
                  title: 'Thời gian',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                },
              ]}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
