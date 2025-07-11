import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Select, 
  DatePicker, 
  Tabs, 
  Table, 
  Space, 
  Button,
  Progress,
  Tag,
  Divider,
  Tooltip,
  List,
  Badge,
  Alert
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  FieldTimeOutlined,
  ExportOutlined,
  ReloadOutlined,
  LineChartOutlined,
  TeamOutlined,
  BarChartOutlined,
  PieChartOutlined,
  InfoCircleOutlined,
  PercentageOutlined
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
  ComposedChart,
  Area
} from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const PerformanceMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('key-metrics');
  const [compareMode, setCompareMode] = useState(false);
  
  // Mock data
  const kpiTrends = [
    { name: 'T1', revenue: 285000000, profit: 54000000, orders: 1250, customers: 980, conversion: 2.8 },
    { name: 'T2', revenue: 310000000, profit: 68000000, orders: 1320, customers: 1050, conversion: 3.1 },
    { name: 'T3', revenue: 342000000, profit: 74000000, orders: 1410, customers: 1180, conversion: 3.3 },
    { name: 'T4', revenue: 305000000, profit: 65000000, orders: 1350, customers: 1080, conversion: 2.9 },
    { name: 'T5', revenue: 368000000, profit: 82000000, orders: 1580, customers: 1260, conversion: 3.6 },
    { name: 'T6', revenue: 402000000, profit: 94000000, orders: 1690, customers: 1380, conversion: 3.8 }
  ];
  
  const productPerformance = [
    {
      category: 'Điện thoại',
      revenue: 186000000,
      profit: 42000000,
      growth: 12.5,
      margin: 22.6,
      inventory: 85
    },
    {
      category: 'Laptop',
      revenue: 142000000,
      profit: 32000000,
      growth: 8.2,
      margin: 22.5,
      inventory: 72
    },
    {
      category: 'Phụ kiện',
      revenue: 76000000,
      profit: 24000000,
      growth: 15.8,
      margin: 31.6,
      inventory: 64
    },
    {
      category: 'Màn hình',
      revenue: 45000000,
      profit: 11000000,
      growth: 5.3,
      margin: 24.4,
      inventory: 78
    },
    {
      category: 'Linh kiện',
      revenue: 38000000,
      profit: 8500000,
      growth: -2.1,
      margin: 22.4,
      inventory: 92
    },
    {
      category: 'Khác',
      revenue: 24000000,
      profit: 5200000,
      growth: 3.2,
      margin: 21.7,
      inventory: 80
    }
  ];
  
  const storePerformance = [
    {
      store: 'Cửa hàng Quận 1',
      revenue: 125000000,
      profit: 28000000,
      growth: 8.5,
      customers: 850,
      avgOrder: 1200000
    },
    {
      store: 'Cửa hàng Quận 3',
      revenue: 98000000,
      profit: 20500000,
      growth: 5.2,
      customers: 720,
      avgOrder: 950000
    },
    {
      store: 'Cửa hàng Quận 7',
      revenue: 105000000,
      profit: 22000000,
      growth: 10.8,
      customers: 780,
      avgOrder: 1050000
    },
    {
      store: 'Cửa hàng Gò Vấp',
      revenue: 86000000,
      profit: 18500000,
      growth: -1.2,
      customers: 650,
      avgOrder: 880000
    },
    {
      store: 'Cửa hàng Thủ Đức',
      revenue: 94000000,
      profit: 19800000,
      growth: 7.3,
      customers: 710,
      avgOrder: 920000
    }
  ];
  
  const channelPerformance = [
    {
      channel: 'Cửa hàng vật lý',
      revenue: 210000000,
      profit: 46000000,
      customers: 1800,
      conversion: 32.5,
      cac: 85000
    },
    {
      channel: 'Website',
      revenue: 124000000,
      profit: 32000000,
      customers: 2400,
      conversion: 3.8,
      cac: 120000
    },
    {
      channel: 'Ứng dụng di động',
      revenue: 86000000,
      profit: 22000000,
      customers: 1500,
      conversion: 4.2,
      cac: 95000
    },
    {
      channel: 'Sàn TMĐT',
      revenue: 145000000,
      profit: 28000000,
      customers: 2800,
      conversion: 2.9,
      cac: 135000
    },
    {
      channel: 'Đại lý',
      revenue: 68000000,
      profit: 15000000,
      customers: 320,
      conversion: 18.5,
      cac: 65000
    }
  ];

  // Summary KPI data
  const kpiData = [
    {
      title: 'Doanh thu',
      value: 402000000,
      prevValue: 368000000,
      changePercent: 9.2,
      changeType: 'increase',
      format: 'currency',
      icon: <DollarOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a'
    },
    {
      title: 'Lợi nhuận',
      value: 94000000,
      prevValue: 82000000,
      changePercent: 14.6,
      changeType: 'increase',
      format: 'currency',
      icon: <DollarOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff'
    },
    {
      title: 'Đơn hàng',
      value: 1690,
      prevValue: 1580,
      changePercent: 7.0,
      changeType: 'increase',
      format: 'number',
      icon: <ShoppingOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1'
    },
    {
      title: 'Biên lợi nhuận',
      value: 23.4,
      prevValue: 22.3,
      changePercent: 4.9,
      changeType: 'increase',
      format: 'percent',
      icon: <PercentageOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16'
    }
  ];
  
  // Simulate API call
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percent
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Get growth tag
  const getGrowthTag = (value) => {
    if (value > 0) {
      return <Tag color="green"><ArrowUpOutlined /> {value}%</Tag>;
    } else if (value < 0) {
      return <Tag color="red"><ArrowDownOutlined /> {Math.abs(value)}%</Tag>;
    } else {
      return <Tag color="gray">0%</Tag>;
    }
  };
  
  // Render KPI trend chart
  const renderKpiTrendChart = () => {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={kpiTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="revenue" orientation="left" />
          <YAxis yAxisId="profit" orientation="right" />
          <RechartsTooltip 
            formatter={(value, name) => {
              if (name === 'revenue' || name === 'profit') {
                return [formatCurrency(value), name === 'revenue' ? 'Doanh thu' : 'Lợi nhuận'];
              }
              return [value, name === 'orders' ? 'Đơn hàng' : name === 'customers' ? 'Khách hàng' : 'Tỷ lệ chuyển đổi (%)'];
            }}
          />
          <Legend />
          <Bar yAxisId="revenue" dataKey="revenue" name="Doanh thu" fill="#1890ff" />
          <Bar yAxisId="profit" dataKey="profit" name="Lợi nhuận" fill="#52c41a" />
          <Line yAxisId="profit" type="monotone" dataKey="conversion" name="Tỷ lệ chuyển đổi" stroke="#f5222d" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
  
  // Render product performance chart
  const renderProductPerformanceChart = () => {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={productPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis yAxisId="revenue" orientation="left" />
          <YAxis yAxisId="margin" orientation="right" />
          <RechartsTooltip 
            formatter={(value, name) => {
              if (name === 'revenue' || name === 'profit') {
                return [formatCurrency(value), name === 'revenue' ? 'Doanh thu' : 'Lợi nhuận'];
              }
              if (name === 'margin') {
                return [formatPercent(value), 'Biên lợi nhuận'];
              }
              return [value, name];
            }}
          />
          <Legend />
          <Bar yAxisId="revenue" dataKey="revenue" name="Doanh thu" fill="#1890ff" />
          <Bar yAxisId="revenue" dataKey="profit" name="Lợi nhuận" fill="#52c41a" />
          <Line yAxisId="margin" type="monotone" dataKey="margin" name="Biên lợi nhuận" stroke="#fa8c16" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Product performance columns
  const productColumns = [
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: value => formatCurrency(value),
      sorter: (a, b) => a.revenue - b.revenue
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'profit',
      key: 'profit',
      render: value => formatCurrency(value),
      sorter: (a, b) => a.profit - b.profit
    },
    {
      title: 'Tăng trưởng',
      dataIndex: 'growth',
      key: 'growth',
      render: value => getGrowthTag(value),
      sorter: (a, b) => a.growth - b.growth
    },
    {
      title: 'Biên LN',
      dataIndex: 'margin',
      key: 'margin',
      render: value => `${value.toFixed(1)}%`,
      sorter: (a, b) => a.margin - b.margin
    },
    {
      title: 'Tồn kho',
      dataIndex: 'inventory',
      key: 'inventory',
      render: value => (
        <Progress 
          percent={value} 
          size="small" 
          status={value > 85 ? 'exception' : value < 30 ? 'active' : 'normal'} 
          style={{ width: 80 }}
        />
      )
    }
  ];
  
  // Store performance columns
  const storeColumns = [
    {
      title: 'Cửa hàng',
      dataIndex: 'store',
      key: 'store'
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: value => formatCurrency(value),
      sorter: (a, b) => a.revenue - b.revenue
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'profit',
      key: 'profit',
      render: value => formatCurrency(value),
      sorter: (a, b) => a.profit - b.profit
    },
    {
      title: 'Tăng trưởng',
      dataIndex: 'growth',
      key: 'growth',
      render: value => getGrowthTag(value),
      sorter: (a, b) => a.growth - b.growth
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customers',
      key: 'customers',
      sorter: (a, b) => a.customers - b.customers
    },
    {
      title: 'Đơn TB',
      dataIndex: 'avgOrder',
      key: 'avgOrder',
      render: value => formatCurrency(value),
      sorter: (a, b) => a.avgOrder - b.avgOrder
    }
  ];
  
  // Channel performance columns
  const channelColumns = [
    {
      title: 'Kênh bán hàng',
      dataIndex: 'channel',
      key: 'channel'
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: value => formatCurrency(value),
      sorter: (a, b) => a.revenue - b.revenue
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'profit',
      key: 'profit',
      render: value => formatCurrency(value),
      sorter: (a, b) => a.profit - b.profit
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customers',
      key: 'customers',
      sorter: (a, b) => a.customers - b.customers
    },
    {
      title: 'Tỷ lệ chuyển đổi',
      dataIndex: 'conversion',
      key: 'conversion',
      render: value => `${value}%`,
      sorter: (a, b) => a.conversion - b.conversion
    },
    {
      title: 'Chi phí thu hút KH',
      dataIndex: 'cac',
      key: 'cac',
      render: value => formatCurrency(value),
      sorter: (a, b) => a.cac - b.cac
    }
  ];

  return (
    <div>
      <Title level={2}>Chỉ số hiệu suất kinh doanh (KPIs)</Title>
      
      {/* Time range selector */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Select 
            value={timeRange} 
            onChange={setTimeRange} 
            style={{ width: 150 }}
          >
            <Option value="week">Tuần này</Option>
            <Option value="month">Tháng này</Option>
            <Option value="quarter">Quý này</Option>
            <Option value="year">Năm nay</Option>
          </Select>
          <RangePicker />
          <Button 
            type="primary"
            icon={<ExportOutlined />}
          >
            Xuất báo cáo
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 800);
            }}
          >
            Làm mới
          </Button>
        </Space>
      </Card>
      
      {/* KPI Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {kpiData.map((kpi, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={kpi.title}
                value={kpi.value}
                precision={kpi.format === 'currency' ? 0 : kpi.format === 'percent' ? 1 : 0}
                valueStyle={{ color: kpi.color }}
                prefix={kpi.icon}
                suffix={kpi.format === 'percent' ? '%' : null}
                formatter={(value) => {
                  if (kpi.format === 'currency') {
                    return new Intl.NumberFormat('vi-VN').format(value);
                  }
                  return value;
                }}
              />
              <div style={{ marginTop: '8px' }}>
                <Space>
                  {kpi.changeType === 'increase' ? (
                    <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  <Text 
                    style={{ 
                      color: kpi.changeType === 'increase' ? '#52c41a' : '#ff4d4f',
                      fontSize: '12px'
                    }}
                  >
                    {kpi.changePercent}% so với tháng trước
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* KPI Trends Tab */}
        <TabPane tab="Chỉ số chính" key="key-metrics">
          <Card title="Xu hướng hiệu suất kinh doanh" className="card-with-chart">
            {renderKpiTrendChart()}
          </Card>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Tỷ lệ chi phí và doanh thu">
                <List
                  size="small"
                  bordered
                  dataSource={[
                    { name: 'Chi phí vận hành / Doanh thu', value: '18.5%', status: 'normal' },
                    { name: 'Chi phí nhân sự / Doanh thu', value: '22.4%', status: 'warning' },
                    { name: 'Chi phí marketing / Doanh thu', value: '8.2%', status: 'success' },
                    { name: 'Chi phí hàng hóa / Doanh thu', value: '52.8%', status: 'normal' },
                    { name: 'Chi phí khấu hao / Doanh thu', value: '4.8%', status: 'success' }
                  ]}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Tag color={
                          item.status === 'success' ? 'green' : 
                          item.status === 'warning' ? 'orange' :
                          'blue'
                        }>{item.value}</Tag>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Hiệu quả đầu tư (ROI)">
                <List
                  size="small"
                  bordered
                  dataSource={[
                    { name: 'ROI Marketing', value: '320%', status: 'success' },
                    { name: 'ROI Đầu tư hàng hóa', value: '185%', status: 'normal' },
                    { name: 'ROI Nhân sự bán hàng', value: '210%', status: 'success' },
                    { name: 'ROI Kho vận', value: '145%', status: 'warning' },
                    { name: 'ROI Tổng thể', value: '220%', status: 'success' }
                  ]}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Tag color={
                          item.status === 'success' ? 'green' : 
                          item.status === 'warning' ? 'orange' :
                          'blue'
                        }>{item.value}</Tag>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        {/* Product Performance Tab */}
        <TabPane tab="Hiệu suất sản phẩm" key="product-metrics">
          <Card title="Hiệu suất theo danh mục sản phẩm" className="card-with-chart">
            {renderProductPerformanceChart()}
          </Card>
          
          <Card title="Chi tiết danh mục sản phẩm" style={{ marginTop: 16 }}>
            <Table 
              dataSource={productPerformance} 
              columns={productColumns}
              rowKey="category"
              loading={loading}
              pagination={false}
            />
          </Card>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Alert
                message="Gợi ý tối ưu danh mục sản phẩm"
                description={
                  <ul>
                    <li>Danh mục <strong>Phụ kiện</strong> có biên lợi nhuận cao nhất (31.6%). Cân nhắc mở rộng danh mục này.</li>
                    <li>Danh mục <strong>Linh kiện</strong> đang có tăng trưởng âm (-2.1%). Cần xem xét lại chiến lược tiếp thị.</li>
                    <li>Tồn kho danh mục <strong>Linh kiện</strong> đang cao (92%). Cần có chương trình khuyến mãi để giảm tồn.</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </TabPane>
        
        {/* Store Performance Tab */}
        <TabPane tab="Hiệu suất cửa hàng" key="store-metrics">
          <Card title="Chi tiết hiệu suất cửa hàng">
            <Table 
              dataSource={storePerformance} 
              columns={storeColumns}
              rowKey="store"
              loading={loading}
              pagination={false}
            />
          </Card>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Alert
                message="Gợi ý tối ưu hoạt động cửa hàng"
                description={
                  <ul>
                    <li>Cửa hàng <strong>Quận 7</strong> có tăng trưởng cao nhất (10.8%). Nghiên cứu và áp dụng các chiến lược thành công cho các cửa hàng khác.</li>
                    <li>Cửa hàng <strong>Gò Vấp</strong> đang có tăng trưởng âm (-1.2%). Cần xem xét lại chiến lược vận hành và sản phẩm.</li>
                    <li>Cửa hàng <strong>Quận 1</strong> có giá trị đơn hàng trung bình cao nhất. Tập trung vào upselling và cross-selling.</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </TabPane>
        
        {/* Channel Performance Tab */}
        <TabPane tab="Hiệu suất kênh bán hàng" key="channel-metrics">
          <Card title="Chi tiết hiệu suất kênh bán hàng">
            <Table 
              dataSource={channelPerformance} 
              columns={channelColumns}
              rowKey="channel"
              loading={loading}
              pagination={false}
            />
          </Card>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Alert
                message="Gợi ý tối ưu kênh bán hàng"
                description={
                  <ul>
                    <li>Kênh <strong>Ứng dụng di động</strong> có tỷ lệ chuyển đổi cao nhất (4.2%). Cân nhắc tăng đầu tư marketing cho kênh này.</li>
                    <li>Kênh <strong>Đại lý</strong> có chi phí thu hút khách hàng thấp nhất. Đánh giá khả năng mở rộng kênh này.</li>
                    <li>Kênh <strong>Sàn TMĐT</strong> có tỷ lệ chuyển đổi thấp (2.9%) với chi phí thu hút cao. Cần tối ưu hóa hiệu suất.</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PerformanceMetrics; 