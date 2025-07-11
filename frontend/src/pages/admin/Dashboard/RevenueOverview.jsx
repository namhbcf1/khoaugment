import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Table, 
  Tabs,
  DatePicker, 
  Select,
  Button,
  Space,
  Divider,
  Tooltip,
  Badge,
  Alert
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Area, Column, Line, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Trang tổng quan doanh thu
 */
const RevenueOverview = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [data, setData] = useState({
    summary: {},
    revenueData: [],
    productCategoryData: [],
    topSellingProducts: [],
    paymentMethodData: []
  });

  // Tải dữ liệu mẫu
  useEffect(() => {
    // Giả lập API call
    setLoading(true);
    setTimeout(() => {
      setData({
        summary: {
          totalRevenue: 756450000,
          orderCount: 245,
          avgOrderValue: 3087551,
          revenueGrowth: 12.5,
          orderCountGrowth: 8.3,
          avgOrderValueGrowth: 4.2
        },
        revenueData: generateRevenueData(),
        productCategoryData: [
          { category: 'Laptop', revenue: 320500000, percentage: 42.4 },
          { category: 'PC', revenue: 156750000, percentage: 20.7 },
          { category: 'Màn hình', revenue: 95800000, percentage: 12.7 },
          { category: 'Linh kiện', revenue: 75200000, percentage: 9.9 },
          { category: 'Phụ kiện', revenue: 68200000, percentage: 9.0 },
          { category: 'Âm thanh', revenue: 40000000, percentage: 5.3 }
        ],
        topSellingProducts: generateTopProductsData(),
        paymentMethodData: [
          { method: 'Tiền mặt', value: 45.2 },
          { method: 'Thẻ tín dụng', value: 25.3 },
          { method: 'Chuyển khoản', value: 15.8 },
          { method: 'Ví điện tử', value: 13.7 }
        ]
      });
      setLoading(false);
    }, 1500);
  }, [period, dateRange]);

  // Tạo dữ liệu doanh thu theo thời gian
  const generateRevenueData = () => {
    const data = [];
    const startDate = dayjs().subtract(30, 'days');
    const categories = ['Laptop', 'PC', 'Màn hình', 'Linh kiện', 'Phụ kiện', 'Âm thanh'];
    
    for (let i = 0; i < 30; i++) {
      const date = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
      const dateObj = {
        date,
        revenue: Math.floor(Math.random() * 30000000) + 10000000,
      };
      
      // Thêm doanh thu theo danh mục
      categories.forEach(category => {
        dateObj[category] = Math.floor(Math.random() * 8000000) + 1000000;
      });
      
      data.push(dateObj);
    }
    return data;
  };

  // Tạo dữ liệu top sản phẩm bán chạy
  const generateTopProductsData = () => {
    return [
      { 
        id: 1,
        name: 'Laptop Dell Inspiron 15', 
        category: 'Laptop',
        soldQuantity: 32,
        revenue: 480000000,
        growth: 15.2 
      },
      { 
        id: 2,
        name: 'Màn hình Dell 24"',
        category: 'Màn hình', 
        soldQuantity: 45,
        revenue: 157500000,
        growth: 8.7 
      },
      { 
        id: 3,
        name: 'Chuột không dây Logitech',
        category: 'Phụ kiện', 
        soldQuantity: 78,
        revenue: 35100000,
        growth: 22.5 
      },
      { 
        id: 4,
        name: 'Laptop Acer Nitro 5',
        category: 'Laptop', 
        soldQuantity: 22,
        revenue: 484000000,
        growth: -3.1 
      },
      { 
        id: 5,
        name: 'Ổ cứng SSD Samsung 1TB',
        category: 'Linh kiện', 
        soldQuantity: 60,
        revenue: 168000000,
        growth: 12.4 
      }
    ];
  };

  // Cấu hình biểu đồ doanh thu theo thời gian
  const revenueChartConfig = {
    data: data.revenueData,
    xField: 'date',
    yField: 'revenue',
    seriesField: undefined,
    xAxis: {
      type: 'time',
      tickCount: 10,
    },
    yAxis: {
      label: {
        formatter: (v) => `${(v / 1000000).toFixed(0)}tr`,
      },
    },
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    },
    smooth: true,
    tooltip: {
      formatter: (data) => {
        return {
          name: 'Doanh thu',
          value: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(data.revenue),
        };
      },
    },
  };

  // Cấu hình biểu đồ phân bố doanh thu theo danh mục
  const categoriesPieConfig = {
    data: data.productCategoryData,
    angleField: 'revenue',
    colorField: 'category',
    radius: 0.9,
    label: {
      type: 'spider',
      content: '{name}\n{percentage}',
    },
    interactions: [{ type: 'element-active' }],
    tooltip: {
      formatter: (data) => {
        return {
          name: data.category,
          value: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(data.revenue),
        };
      },
    },
  };

  // Cấu hình biểu đồ top sản phẩm bán chạy
  const topProductsBarConfig = {
    data: data.topSellingProducts.slice().sort((a, b) => b.revenue - a.revenue),
    xField: 'revenue',
    yField: 'name',
    seriesField: 'category',
    legend: { position: 'top' },
    barBackground: { style: { fill: 'rgba(0,0,0,0.05)' } },
    tooltip: {
      formatter: (data) => {
        return {
          name: data.name,
          value: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(data.revenue),
        };
      },
    },
  };

  // Cấu hình biểu đồ phương thức thanh toán
  const paymentMethodPieConfig = {
    data: data.paymentMethodData,
    angleField: 'value',
    colorField: 'method',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handlePeriodChange = (value) => {
    setPeriod(value);
    
    // Cập nhật dateRange dựa trên khoảng thời gian đã chọn
    switch (value) {
      case 'week':
        setDateRange([dayjs().subtract(7, 'days'), dayjs()]);
        break;
      case 'month':
        setDateRange([dayjs().subtract(30, 'days'), dayjs()]);
        break;
      case 'quarter':
        setDateRange([dayjs().subtract(90, 'days'), dayjs()]);
        break;
      case 'year':
        setDateRange([dayjs().subtract(365, 'days'), dayjs()]);
        break;
      default:
        setDateRange([dayjs().subtract(30, 'days'), dayjs()]);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      setPeriod('custom');
    }
  };

  // Columns cho bảng top sản phẩm
  const topProductsColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'soldQuantity',
      key: 'soldQuantity',
      align: 'right',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (text) => formatCurrency(text),
    },
    {
      title: 'So với kỳ trước',
      dataIndex: 'growth',
      key: 'growth',
      align: 'right',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#52c41a' : '#f5222d' }}>
          {value >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value)}%
        </span>
      ),
    },
  ];

  return (
    <div className="revenue-overview">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={3}>Tổng quan doanh thu</Title>
            <Text type="secondary">
              Thống kê doanh thu và đơn hàng trong khoảng thời gian đã chọn
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
              <Select 
                style={{ width: 120 }} 
                value={period} 
                onChange={handlePeriodChange}
                loading={loading}
              >
                <Option value="week">7 ngày qua</Option>
                <Option value="month">30 ngày qua</Option>
                <Option value="quarter">90 ngày qua</Option>
                <Option value="year">365 ngày qua</Option>
                {period === 'custom' && <Option value="custom">Tùy chỉnh</Option>}
              </Select>
              
              <RangePicker 
                value={dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                allowClear={false}
                disabled={loading}
              />
              
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => setLoading(true)}
                loading={loading}
              >
                Làm mới
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarOutlined />
                  <span>Tổng doanh thu</span>
                </div>
              }
              value={data.summary.totalRevenue}
              precision={0}
              formatter={(value) => formatCurrency(value)}
              suffix={
                <div style={{ fontSize: '14px', color: data.summary.revenueGrowth >= 0 ? '#52c41a' : '#f5222d' }}>
                  {data.summary.revenueGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(data.summary.revenueGrowth)}%
                </div>
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCartOutlined />
                  <span>Số đơn hàng</span>
                </div>
              }
              value={data.summary.orderCount}
              suffix={
                <div style={{ fontSize: '14px', color: data.summary.orderCountGrowth >= 0 ? '#52c41a' : '#f5222d' }}>
                  {data.summary.orderCountGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(data.summary.orderCountGrowth)}%
                </div>
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChartOutlined />
                  <span>Giá trị đơn hàng trung bình</span>
                </div>
              }
              value={data.summary.avgOrderValue}
              precision={0}
              formatter={(value) => formatCurrency(value)}
              suffix={
                <div style={{ fontSize: '14px', color: data.summary.avgOrderValueGrowth >= 0 ? '#52c41a' : '#f5222d' }}>
                  {data.summary.avgOrderValueGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(data.summary.avgOrderValueGrowth)}%
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card
            title={<span><LineChartOutlined /> Biểu đồ doanh thu theo thời gian</span>}
            bordered={false}
            loading={loading}
            extra={
              <Space>
                <Tooltip title="Xuất báo cáo">
                  <Button icon={<DownloadOutlined />} />
                </Tooltip>
                <Tooltip title="Thông tin">
                  <Button icon={<InfoCircleOutlined />} />
                </Tooltip>
              </Space>
            }
          >
            <Area {...revenueChartConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card
            title={<span><BarChartOutlined /> Top sản phẩm bán chạy</span>}
            bordered={false}
            loading={loading}
          >
            <Table 
              dataSource={data.topSellingProducts} 
              columns={topProductsColumns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Tabs defaultActiveKey="categories" type="card">
            <TabPane tab={<span><PieChartOutlined /> Theo danh mục</span>} key="categories">
              <Card bordered={false} loading={loading} bodyStyle={{ padding: '12px' }}>
                <Pie {...categoriesPieConfig} height={300} />
              </Card>
            </TabPane>
            <TabPane tab={<span><PieChartOutlined /> Thanh toán</span>} key="payments">
              <Card bordered={false} loading={loading} bodyStyle={{ padding: '12px' }}>
                <Pie {...paymentMethodPieConfig} height={300} />
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Alert
            message="Chú ý"
            description="Số liệu thống kê được tổng hợp từ các giao dịch thực tế. Có thể có sự khác biệt nhỏ so với báo cáo tài chính chính thức do thời điểm ghi nhận doanh thu."
            type="info"
            showIcon
            closable
          />
        </Col>
      </Row>
    </div>
  );
};

export default RevenueOverview; 