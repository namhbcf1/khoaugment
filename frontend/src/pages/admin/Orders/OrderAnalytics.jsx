import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  DatePicker, 
  Select, 
  Button,
  Table,
  Badge,
  Tabs,
  Space,
  Divider,
  Tag,
  Tooltip,
  Spin
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ReloadOutlined,
  DownloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { Line, Pie, Column, Area } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Trang phân tích đơn hàng
 */
const OrderAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [data, setData] = useState({
    summary: {},
    orderTrends: [],
    orderByStatus: [],
    orderByChannel: [],
    orderByTime: [],
    topCustomers: [],
  });

  // Tải dữ liệu mẫu
  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      const mockData = generateMockData();
      setData(mockData);
      setLoading(false);
    }, 1500);
  }, [period, dateRange]);

  // Tạo dữ liệu mẫu
  const generateMockData = () => {
    return {
      summary: {
        totalOrders: 356,
        completedOrders: 312,
        pendingOrders: 24,
        cancelledOrders: 20,
        avgProcessingTime: 18, // phút
        totalOrderValue: 7852650000,
        avgOrderValue: 22058427,
        totalOrderGrowth: 12.5,
        avgOrderValueGrowth: 4.8,
      },
      orderTrends: generateOrderTrends(),
      orderByStatus: [
        { status: 'Hoàn thành', value: 312, color: '#52c41a' },
        { status: 'Đang xử lý', value: 24, color: '#1890ff' },
        { status: 'Hủy', value: 20, color: '#ff4d4f' },
      ],
      orderByChannel: [
        { channel: 'Cửa hàng', value: 245, percentage: 68.8 },
        { channel: 'Online', value: 65, percentage: 18.3 },
        { channel: 'Đại lý', value: 46, percentage: 12.9 },
      ],
      orderByTime: generateOrderByTime(),
      topCustomers: generateTopCustomers(),
    };
  };

  // Tạo dữ liệu xu hướng đơn hàng
  const generateOrderTrends = () => {
    const data = [];
    const startDate = dayjs().subtract(30, 'days');

    for (let i = 0; i < 30; i++) {
      const date = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
      data.push({
        date,
        'Hoàn thành': Math.floor(Math.random() * 15) + 5,
        'Đang xử lý': Math.floor(Math.random() * 3),
        'Hủy': Math.floor(Math.random() * 2),
      });
    }
    return data;
  };

  // Tạo dữ liệu đơn hàng theo thời gian trong ngày
  const generateOrderByTime = () => {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      data.push({
        hour: `${hour}:00`,
        orders: Math.floor(Math.random() * 30) + (hour >= 9 && hour <= 20 ? 10 : 0),
      });
    }
    return data;
  };

  // Tạo dữ liệu khách hàng mua nhiều nhất
  const generateTopCustomers = () => {
    return [
      { id: 1, name: 'Nguyễn Văn A', orders: 12, value: 65800000, loyalty: 'Vàng' },
      { id: 2, name: 'Trần Thị B', orders: 8, value: 45300000, loyalty: 'Bạc' },
      { id: 3, name: 'Lê Văn C', orders: 7, value: 38500000, loyalty: 'Bạc' },
      { id: 4, name: 'Phạm Minh D', orders: 6, value: 52700000, loyalty: 'Vàng' },
      { id: 5, name: 'Hoàng Thị E', orders: 5, value: 24900000, loyalty: 'Đồng' },
    ];
  };

  // Config biểu đồ xu hướng đơn hàng
  const orderTrendsConfig = {
    data: data.orderTrends,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      title: {
        text: 'Số đơn hàng',
      },
    },
    xAxis: {
      type: 'time',
      tickCount: 10,
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    isStack: false,
    slider: {
      start: 0,
      end: 1,
      trendCfg: {
        isArea: false,
      },
    },
    meta: {
      value: {
        alias: 'Số đơn',
      },
      type: {
        alias: 'Trạng thái',
      },
    },
  };

  // Transform data for order trends chart
  const orderTrendsChartData = data.orderTrends.reduce((acc, item) => {
    const { date, ...statuses } = item;
    Object.entries(statuses).forEach(([type, value]) => {
      acc.push({ date, type, value });
    });
    return acc;
  }, []);

  // Config biểu đồ đơn hàng theo trạng thái
  const orderByStatusConfig = {
    data: data.orderByStatus,
    angleField: 'value',
    colorField: 'status',
    radius: 0.75,
    label: {
      type: 'spider',
      content: '{name}: {percentage}',
    },
    color: ({ status }) => {
      const item = data.orderByStatus.find(d => d.status === status);
      return item ? item.color : '#1890ff';
    },
    interactions: [{ type: 'element-active' }],
  };

  // Config biểu đồ đơn hàng theo kênh
  const orderByChannelConfig = {
    data: data.orderByChannel,
    angleField: 'value',
    colorField: 'channel',
    radius: 0.75,
    label: {
      type: 'spider',
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  // Config biểu đồ đơn hàng theo giờ
  const orderByTimeConfig = {
    data: data.orderByTime,
    xField: 'hour',
    yField: 'orders',
    color: '#1890ff',
    label: {
      position: 'top',
      style: {
        fill: '#1890ff',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      hour: {
        alias: 'Giờ',
      },
      orders: {
        alias: 'Đơn hàng',
      },
    },
  };

  // Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Xử lý thay đổi khoảng thời gian
  const handlePeriodChange = (value) => {
    setPeriod(value);

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

  // Xử lý thay đổi ngày tùy chỉnh
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      setPeriod('custom');
    }
  };

  // Cột cho bảng khách hàng top
  const topCustomersColumns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'orders',
      key: 'orders',
      align: 'right',
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Hạng',
      dataIndex: 'loyalty',
      key: 'loyalty',
      align: 'center',
      render: (text) => {
        let color;
        switch (text) {
          case 'Vàng':
            color = 'gold';
            break;
          case 'Bạc':
            color = 'silver';
            break;
          case 'Đồng':
            color = '#cd7f32';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div className="order-analytics">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={3}>Phân tích đơn hàng</Title>
            <Text type="secondary">
              Thống kê và phân tích đơn hàng trong khoảng thời gian đã chọn
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
              <Select
                style={{ width: 120 }}
                value={period}
                onChange={handlePeriodChange}
                disabled={loading}
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

              <Button icon={<DownloadOutlined />} disabled={loading}>
                Xuất báo cáo
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCartOutlined />
                  <span>Tổng đơn hàng</span>
                </div>
              }
              value={data.summary.totalOrders}
              suffix={
                <div style={{ fontSize: '14px', color: data.summary.totalOrderGrowth >= 0 ? '#52c41a' : '#f5222d' }}>
                  {data.summary.totalOrderGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(data.summary.totalOrderGrowth)}%
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarOutlined />
                  <span>Giá trị trung bình</span>
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

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClockCircleOutlined />
                  <span>Thời gian xử lý TB</span>
                </div>
              }
              value={data.summary.avgProcessingTime}
              suffix="phút"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserOutlined />
                  <span>Tỷ lệ hoàn thành</span>
                </div>
              }
              value={(data.summary.completedOrders / data.summary.totalOrders) * 100}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title={<span><LineChartOutlined /> Xu hướng đơn hàng</span>} 
            bordered={false}
            loading={loading}
          >
            {loading ? (
              <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin />
              </div>
            ) : (
              <Line {...orderTrendsConfig} data={orderTrendsChartData} height={400} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span><PieChartOutlined /> Phân tích đơn hàng</span>} 
            bordered={false}
            loading={loading}
          >
            <Tabs defaultActiveKey="status">
              <TabPane tab="Theo trạng thái" key="status">
                {loading ? (
                  <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Spin />
                  </div>
                ) : (
                  <Pie {...orderByStatusConfig} height={300} />
                )}
              </TabPane>
              <TabPane tab="Theo kênh bán hàng" key="channel">
                {loading ? (
                  <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Spin />
                  </div>
                ) : (
                  <Pie {...orderByChannelConfig} height={300} />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={<span><BarChartOutlined /> Đơn hàng theo giờ</span>} 
            bordered={false}
            loading={loading}
          >
            {loading ? (
              <div style={{ height: 358, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin />
              </div>
            ) : (
              <Column {...orderByTimeConfig} height={358} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title={<span><UserOutlined /> Khách hàng mua nhiều nhất</span>} 
            bordered={false}
            loading={loading}
          >
            <Table 
              dataSource={data.topCustomers} 
              columns={topCustomersColumns} 
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderAnalytics; 