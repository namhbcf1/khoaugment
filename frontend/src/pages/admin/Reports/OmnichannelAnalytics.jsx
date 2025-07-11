import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  Button,
  DatePicker,
  Table,
  Tooltip,
  Space,
  Statistic,
  Badge,
  Tabs,
  Radio,
  Progress,
  Segmented,
  List,
  Avatar,
  Tag,
  Alert
} from 'antd';
import {
  ShopOutlined,
  GlobalOutlined,
  MobileOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LineChartOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined
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
  Cell,
  ComposedChart,
  Area
} from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

// Sample data for charts
const channelData = [
  { month: 'Jan', inStore: 45, online: 30, marketplace: 15, social: 10 },
  { month: 'Feb', inStore: 42, online: 33, marketplace: 16, social: 9 },
  { month: 'Mar', inStore: 40, online: 35, marketplace: 16, social: 9 },
  { month: 'Apr', inStore: 38, online: 37, marketplace: 17, social: 8 },
  { month: 'May', inStore: 35, online: 39, marketplace: 18, social: 8 },
  { month: 'Jun', inStore: 33, online: 41, marketplace: 18, social: 8 },
  { month: 'Jul', inStore: 32, online: 42, marketplace: 19, social: 7 },
  { month: 'Aug', inStore: 30, online: 44, marketplace: 19, social: 7 },
  { month: 'Sep', inStore: 29, online: 45, marketplace: 20, social: 6 },
  { month: 'Oct', inStore: 28, online: 46, marketplace: 20, social: 6 },
  { month: 'Nov', inStore: 26, online: 48, marketplace: 21, social: 5 },
  { month: 'Dec', inStore: 25, online: 49, marketplace: 21, social: 5 }
];

const marketplaceData = [
  { name: 'Shopee', value: 45, growth: 12 },
  { name: 'Lazada', value: 28, growth: 8 },
  { name: 'Tiki', value: 15, growth: 5 },
  { name: 'Sendo', value: 12, growth: -3 }
];

const deviceData = [
  { name: 'Desktop', value: 38 },
  { name: 'Mobile', value: 52 },
  { name: 'Tablet', value: 10 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

const channelComparison = [
  { 
    channel: 'In-Store', 
    icon: <ShopOutlined />, 
    revenue: 425000000, 
    orders: 1250,
    avgOrder: 340000,
    conversion: null,
    growth: -8.3,
    color: '#0088FE'
  },
  { 
    channel: 'Web Store', 
    icon: <GlobalOutlined />, 
    revenue: 390000000, 
    orders: 2100,
    avgOrder: 185714,
    conversion: 2.8,
    growth: 15.2,
    color: '#00C49F'
  },
  { 
    channel: 'Mobile App', 
    icon: <MobileOutlined />, 
    revenue: 180000000, 
    orders: 950,
    avgOrder: 189473,
    conversion: 3.2,
    growth: 23.5,
    color: '#FFBB28'
  },
  { 
    channel: 'Shopee', 
    icon: <ShoppingCartOutlined />, 
    revenue: 145000000, 
    orders: 720,
    avgOrder: 201388,
    conversion: 4.5,
    growth: 12.7,
    color: '#FF8042'
  },
  { 
    channel: 'Lazada', 
    icon: <ShoppingCartOutlined />, 
    revenue: 89000000, 
    orders: 430,
    avgOrder: 206976,
    conversion: 3.8,
    growth: 8.3,
    color: '#A28EFF'
  }
];

// Top products data
const productPerformance = [
  {
    id: 1,
    name: 'Asus TUF Gaming A15',
    inStore: 45,
    webStore: 30,
    mobileApp: 10,
    marketplaces: 15,
    total: 100
  },
  {
    id: 2,
    name: 'Logitech G Pro X Keyboard',
    inStore: 30,
    webStore: 40,
    mobileApp: 15,
    marketplaces: 15,
    total: 100
  },
  {
    id: 3,
    name: 'AMD Ryzen 9 5900X',
    inStore: 25,
    webStore: 45,
    mobileApp: 20,
    marketplaces: 10,
    total: 100
  },
  {
    id: 4,
    name: 'Samsung Odyssey G7 32"',
    inStore: 40,
    webStore: 25,
    mobileApp: 5,
    marketplaces: 30,
    total: 100
  },
  {
    id: 5,
    name: 'WD Black SN850 1TB NVMe',
    inStore: 15,
    webStore: 35,
    mobileApp: 15,
    marketplaces: 35,
    total: 100
  }
];

// Customer journey data
const customerJourneyData = [
  {
    stage: 'First Touch',
    inStore: 25,
    webStore: 45,
    mobileApp: 15,
    marketplaces: 15
  },
  {
    stage: 'Research',
    inStore: 15,
    webStore: 55,
    mobileApp: 20,
    marketplaces: 10
  },
  {
    stage: 'Consideration',
    inStore: 35,
    webStore: 30,
    mobileApp: 20,
    marketplaces: 15
  },
  {
    stage: 'Purchase',
    inStore: 40,
    webStore: 30,
    mobileApp: 15,
    marketplaces: 15
  },
  {
    stage: 'Support',
    inStore: 50,
    webStore: 25,
    mobileApp: 15,
    marketplaces: 10
  },
  {
    stage: 'Repeat Purchase',
    inStore: 45,
    webStore: 25,
    mobileApp: 20,
    marketplaces: 10
  }
];

const OmnichannelAnalytics = () => {
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [metric, setMetric] = useState('revenue');
  
  const handleRefreshData = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const channelRevenueColumns = [
    {
      title: 'Channel',
      dataIndex: 'channel',
      key: 'channel',
      render: (text, record) => (
        <Space>
          <Avatar 
            icon={record.icon} 
            style={{ backgroundColor: record.color }} 
            size="small"
          />
          {text}
        </Space>
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: 'Avg. Order Value',
      dataIndex: 'avgOrder',
      key: 'avgOrder',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.avgOrder - b.avgOrder,
    },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversion',
      key: 'conversion',
      render: (value) => value ? `${value}%` : 'N/A',
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (value) => {
        if (value > 0) {
          return (
            <Text type="success">
              <RiseOutlined /> {value}%
            </Text>
          );
        }
        return (
          <Text type="danger">
            <FallOutlined /> {Math.abs(value)}%
          </Text>
        );
      },
      sorter: (a, b) => a.growth - b.growth,
    },
  ];
  
  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'In-Store',
      dataIndex: 'inStore',
      key: 'inStore',
      render: (value) => `${value}%`,
    },
    {
      title: 'Web Store',
      dataIndex: 'webStore',
      key: 'webStore',
      render: (value) => `${value}%`,
    },
    {
      title: 'Mobile App',
      dataIndex: 'mobileApp',
      key: 'mobileApp',
      render: (value) => `${value}%`,
    },
    {
      title: 'Marketplaces',
      dataIndex: 'marketplaces',
      key: 'marketplaces',
      render: (value) => `${value}%`,
    },
    {
      title: 'Distribution',
      key: 'distribution',
      render: (_, record) => (
        <div style={{ width: '100%', display: 'flex', height: '20px' }}>
          <div style={{ width: `${record.inStore}%`, backgroundColor: '#0088FE' }} />
          <div style={{ width: `${record.webStore}%`, backgroundColor: '#00C49F' }} />
          <div style={{ width: `${record.mobileApp}%`, backgroundColor: '#FFBB28' }} />
          <div style={{ width: `${record.marketplaces}%`, backgroundColor: '#FF8042' }} />
        </div>
      ),
    },
  ];
  
  return (
    <div style={{ padding: '24px' }}>
      <Card bordered={false} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <AppstoreOutlined /> Omnichannel Analytics
            </Title>
            <Text type="secondary">
              Sales performance analysis across all channels
            </Text>
          </div>
          <Space>
            <RangePicker 
              onChange={setDateRange}
              allowClear={false}
              placeholder={['Start Date', 'End Date']}
            />
            <Button
              icon={<SyncOutlined />}
              onClick={handleRefreshData}
              loading={loading}
            >
              Refresh
            </Button>
            <Button icon={<DownloadOutlined />}>
              Export
            </Button>
          </Space>
        </div>
        
        {/* KPI summary row */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title={<Space><ShoppingCartOutlined /> Total Orders</Space>}
                value={5450}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="success">+8.3% vs previous period</Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={<Space><DollarOutlined /> Total Revenue</Space>}
                value="1.23T"
                suffix="₫"
                valueStyle={{ color: '#3f8600' }}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="success">+12.7% vs previous period</Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={<Space><UserOutlined /> New Customers</Space>}
                value={845}
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="success">+15.2% vs previous period</Text>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={<Space><ShopOutlined /> Channel Reach</Space>}
                value={12}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div style={{ marginTop: '10px' }}>
                <Badge status="processing" text="2 new channels added" />
              </div>
            </Card>
          </Col>
        </Row>
        
        <Tabs defaultActiveKey="overview">
          <TabPane 
            tab={
              <span>
                <LineChartOutlined /> Channel Overview
              </span>
            } 
            key="overview"
          >
            <Card style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={4} style={{ margin: 0 }}>Channel Performance Trend</Title>
                <Space>
                  <Radio.Group 
                    value={metric} 
                    onChange={(e) => setMetric(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="revenue">Revenue</Radio.Button>
                    <Radio.Button value="orders">Orders</Radio.Button>
                    <Radio.Button value="customers">Customers</Radio.Button>
                  </Radio.Group>
                  
                  <Segmented
                    options={[
                      {
                        value: 'line',
                        icon: <LineChartOutlined />,
                      },
                      {
                        value: 'bar',
                        icon: <BarChartOutlined />,
                      },
                      {
                        value: 'area',
                        icon: <AreaChartOutlined />,
                      },
                    ]}
                    value={chartType}
                    onChange={setChartType}
                  />
                </Space>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'line' ? (
                  <LineChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inStore" name="In-Store" stroke="#0088FE" />
                    <Line type="monotone" dataKey="online" name="Online" stroke="#00C49F" />
                    <Line type="monotone" dataKey="marketplace" name="Marketplaces" stroke="#FFBB28" />
                    <Line type="monotone" dataKey="social" name="Social Commerce" stroke="#FF8042" />
                  </LineChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="inStore" name="In-Store" fill="#0088FE" />
                    <Bar dataKey="online" name="Online" fill="#00C49F" />
                    <Bar dataKey="marketplace" name="Marketplaces" fill="#FFBB28" />
                    <Bar dataKey="social" name="Social Commerce" fill="#FF8042" />
                  </BarChart>
                ) : (
                  <ComposedChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="inStore" name="In-Store" fill="#0088FE" fillOpacity={0.3} stroke="#0088FE" />
                    <Area type="monotone" dataKey="online" name="Online" fill="#00C49F" fillOpacity={0.3} stroke="#00C49F" />
                    <Area type="monotone" dataKey="marketplace" name="Marketplaces" fill="#FFBB28" fillOpacity={0.3} stroke="#FFBB28" />
                    <Area type="monotone" dataKey="social" name="Social Commerce" fill="#FF8042" fillOpacity={0.3} stroke="#FF8042" />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </Card>
            
            <Table 
              columns={channelRevenueColumns} 
              dataSource={channelComparison}
              pagination={false}
              rowKey="channel"
              style={{ marginBottom: '24px' }}
            />
            
            <Row gutter={24}>
              <Col span={12}>
                <Card style={{ marginBottom: '24px' }}>
                  <Title level={4}>Marketplace Breakdown</Title>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '50%', height: '250px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={marketplaceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          >
                            {marketplaceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ width: '50%', padding: '0 16px' }}>
                      <List
                        itemLayout="horizontal"
                        dataSource={marketplaceData}
                        renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={
                                <Badge 
                                  count={
                                    <div style={{ 
                                      backgroundColor: item.growth > 0 ? '#52c41a' : '#f5222d',
                                      height: '20px', 
                                      width: '20px', 
                                      lineHeight: '20px',
                                      borderRadius: '50%',
                                      color: '#fff',
                                      fontSize: '12px'
                                    }}>
                                      {item.growth > 0 ? '+' : ''}{item.growth}
                                    </div>
                                  }
                                >
                                  <Avatar style={{ backgroundColor: COLORS[marketplaceData.indexOf(item) % COLORS.length] }} />
                                </Badge>
                              }
                              title={item.name}
                              description={`${item.value}% of marketplace sales`}
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card style={{ marginBottom: '24px' }}>
                  <Title level={4}>Online Device Distribution</Title>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '50%', height: '250px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          >
                            {deviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ width: '50%', padding: '16px' }}>
                      <Paragraph>
                        <InfoCircleOutlined /> Device distribution shows how customers access your online store.
                      </Paragraph>
                      <ul>
                        <li>Mobile: Dominant platform, focus on mobile-first design</li>
                        <li>Desktop: Higher conversion rate and order value</li>
                        <li>Tablet: Small but growing segment</li>
                      </ul>
                      <Button type="link" style={{ padding: 0 }}>
                        View detailed device analytics
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ShoppingCartOutlined /> Cross-Channel Products
              </span>
            } 
            key="products"
          >
            <Card style={{ marginBottom: '24px' }}>
              <Alert 
                message="Product Channel Performance" 
                description="See how products perform across different sales channels. Understanding channel-specific performance helps optimize product placement and marketing." 
                type="info" 
                showIcon 
                style={{ marginBottom: '24px' }}
              />
              
              <div style={{ marginBottom: '16px' }}>
                <Space>
                  <Select defaultValue="all" style={{ width: 200 }}>
                    <Option value="all">All Categories</Option>
                    <Option value="laptops">Laptops</Option>
                    <Option value="components">Components</Option>
                    <Option value="peripherals">Peripherals</Option>
                    <Option value="monitors">Monitors</Option>
                  </Select>
                  
                  <Select defaultValue="sales" style={{ width: 200 }}>
                    <Option value="sales">By Sales</Option>
                    <Option value="revenue">By Revenue</Option>
                    <Option value="profit">By Profit</Option>
                  </Select>
                </Space>
              </div>
              
              <Table 
                columns={productColumns}
                dataSource={productPerformance}
                rowKey="id"
                pagination={false}
              />
              
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                  <Text type="secondary">Legend:</Text>
                  <Tag color="#0088FE">In-Store</Tag>
                  <Tag color="#00C49F">Web Store</Tag>
                  <Tag color="#FFBB28">Mobile App</Tag>
                  <Tag color="#FF8042">Marketplaces</Tag>
                </Space>
              </div>
            </Card>
            
            <Card>
              <Title level={4}>Cross-Channel Performance Insights</Title>
              <Row gutter={24}>
                <Col span={8}>
                  <Card title="Channel Synergy" bordered={false}>
                    <Statistic 
                      title="Omnichannel Customers" 
                      value="38%" 
                      prefix={<UserOutlined />} 
                    />
                    <Paragraph style={{ marginTop: '16px' }}>
                      Customers who shop across multiple channels spend 30% more than single-channel customers.
                    </Paragraph>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="ROPO Effect" bordered={false}>
                    <Statistic 
                      title="Research Online, Purchase Offline" 
                      value="45%" 
                      prefix={<GlobalOutlined />} 
                    />
                    <Paragraph style={{ marginTop: '16px' }}>
                      Percentage of in-store customers who researched products online before visiting.
                    </Paragraph>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="Showrooming" bordered={false}>
                    <Statistic 
                      title="View In-Store, Buy Online" 
                      value="28%" 
                      prefix={<MobileOutlined />} 
                    />
                    <Paragraph style={{ marginTop: '16px' }}>
                      Customers who view products in-store but make final purchase online.
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <UserOutlined /> Customer Journey
              </span>
            } 
            key="journey"
          >
            <Card style={{ marginBottom: '24px' }}>
              <Title level={4}>Customer Journey Map</Title>
              <Paragraph>
                Track how customers interact with your brand across channels throughout their buying journey
              </Paragraph>
              
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={customerJourneyData}
                  layout="vertical"
                  barCategoryGap={10}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={120} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="inStore" name="In-Store" stackId="a" fill="#0088FE" />
                  <Bar dataKey="webStore" name="Web Store" stackId="a" fill="#00C49F" />
                  <Bar dataKey="mobileApp" name="Mobile App" stackId="a" fill="#FFBB28" />
                  <Bar dataKey="marketplaces" name="Marketplaces" stackId="a" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
              
              <div style={{ marginTop: '24px' }}>
                <Title level={5}>Key Observations</Title>
                <Row gutter={24}>
                  <Col span={8}>
                    <Card size="small">
                      <Text strong>First Touch</Text>
                      <Paragraph>Web and marketplaces dominate initial discovery, focus digital marketing here.</Paragraph>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Text strong>Research Phase</Text>
                      <Paragraph>Heavy web usage - optimize product information and comparison tools.</Paragraph>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Text strong>Purchase</Text>
                      <Paragraph>In-store still leads final purchase - strong omnichannel approach is working.</Paragraph>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Card>
            
            <Card>
              <Title level={4}>Channel Transition Analysis</Title>
              <Paragraph>
                How customers move between channels during their journey
              </Paragraph>
              
              <Row gutter={24} style={{ marginTop: '24px' }}>
                <Col span={12}>
                  <Card title="Most Common Paths" bordered={false}>
                    <List
                      itemLayout="horizontal"
                      dataSource={[
                        { 
                          path: 'Online Research → In-Store Purchase', 
                          percentage: 28,
                          change: 5
                        },
                        { 
                          path: 'Social Media → Online Store → Purchase', 
                          percentage: 22,
                          change: 12
                        },
                        { 
                          path: 'In-Store Browse → Online Purchase', 
                          percentage: 15,
                          change: -3
                        },
                        { 
                          path: 'Marketplace Browse → Website → Purchase', 
                          percentage: 12,
                          change: 8
                        },
                        { 
                          path: 'Mobile App Only', 
                          percentage: 10,
                          change: 15
                        }
                      ]}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            title={
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>{item.path}</Text>
                                <Text strong>{item.percentage}%</Text>
                              </div>
                            }
                          />
                          <div>
                            {item.change > 0 ? (
                              <Tag color="green">+{item.change}%</Tag>
                            ) : (
                              <Tag color="red">{item.change}%</Tag>
                            )}
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Channel Stickiness" bordered={false}>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text>In-Store Retention</Text>
                        <Text>85%</Text>
                      </div>
                      <Progress percent={85} status="active" />
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text>Web Store Retention</Text>
                        <Text>72%</Text>
                      </div>
                      <Progress percent={72} status="active" />
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text>Mobile App Retention</Text>
                        <Text>68%</Text>
                      </div>
                      <Progress percent={68} status="active" />
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text>Marketplace Retention</Text>
                        <Text>56%</Text>
                      </div>
                      <Progress percent={56} status="active" />
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default OmnichannelAnalytics; 