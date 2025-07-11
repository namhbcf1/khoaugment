import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Button,
  Tabs,
  Table,
  Tag,
  Divider,
  Space,
  Tooltip,
  Progress,
  DatePicker
} from 'antd';
import {
  UserOutlined,
  RiseOutlined,
  ShopOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  DollarOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Mock data for customer analytics
const mockData = {
  summary: {
    totalCustomers: 2450,
    newCustomers: 187,
    newCustomersPercent: 12.4,
    activeCustomers: 1842,
    activeCustomersPercent: 75.2,
    retentionRate: 68.5,
    averagePurchaseFrequency: 2.7,
    averagePurchaseValue: 1850000
  },
  segments: [
    {
      id: 1,
      name: 'Khách hàng VIP',
      count: 245,
      percentage: 10,
      averageValue: 9500000,
      purchaseFrequency: 4.8,
      retentionRate: 92.5,
      customerLifetime: 36,
      color: '#722ed1'
    },
    {
      id: 2,
      name: 'Khách hàng thường xuyên',
      count: 780,
      percentage: 31.8,
      averageValue: 3200000,
      purchaseFrequency: 3.5,
      retentionRate: 78.2,
      customerLifetime: 24,
      color: '#1890ff'
    },
    {
      id: 3,
      name: 'Khách hàng thỉnh thoảng',
      count: 920,
      percentage: 37.6,
      averageValue: 1250000,
      purchaseFrequency: 1.8,
      retentionRate: 54.5,
      customerLifetime: 18,
      color: '#52c41a'
    },
    {
      id: 4,
      name: 'Khách hàng một lần',
      count: 505,
      percentage: 20.6,
      averageValue: 850000,
      purchaseFrequency: 1.0,
      retentionRate: 0,
      customerLifetime: 1,
      color: '#faad14'
    }
  ],
  topCustomers: [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      segment: 'Khách hàng VIP',
      totalSpent: 28500000,
      ordersCount: 12,
      lastPurchase: '2023-07-10',
      averageValue: 2375000
    },
    {
      id: 2,
      name: 'Trần Thị B',
      segment: 'Khách hàng VIP',
      totalSpent: 25200000,
      ordersCount: 8,
      lastPurchase: '2023-07-05',
      averageValue: 3150000
    },
    {
      id: 3,
      name: 'Lê Văn C',
      segment: 'Khách hàng thường xuyên',
      totalSpent: 16800000,
      ordersCount: 7,
      lastPurchase: '2023-07-15',
      averageValue: 2400000
    },
    {
      id: 4,
      name: 'Phạm Thị D',
      segment: 'Khách hàng thường xuyên',
      totalSpent: 14500000,
      ordersCount: 6,
      lastPurchase: '2023-07-08',
      averageValue: 2416666
    },
    {
      id: 5,
      name: 'Hoàng Văn E',
      segment: 'Khách hàng VIP',
      totalSpent: 23800000,
      ordersCount: 9,
      lastPurchase: '2023-07-12',
      averageValue: 2644444
    }
  ],
  purchaseFrequency: [
    { frequency: '1 lần', count: 505, percentage: 20.6 },
    { frequency: '2-3 lần', count: 720, percentage: 29.4 },
    { frequency: '4-6 lần', count: 580, percentage: 23.7 },
    { frequency: '7-10 lần', count: 385, percentage: 15.7 },
    { frequency: '11+ lần', count: 260, percentage: 10.6 }
  ]
};

const CustomerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState([null, null]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Load data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle reload data
  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  };

  // Get color for segment tags
  const getSegmentColor = (segment) => {
    const segmentObj = data?.segments.find(s => s.name === segment);
    return segmentObj?.color || '#1890ff';
  };

  // Columns for top customers table
  const topCustomersColumns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Phân khúc',
      dataIndex: 'segment',
      key: 'segment',
      render: (text) => (
        <Tag color={getSegmentColor(text)}>{text}</Tag>
      ),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'ordersCount',
      key: 'ordersCount',
      sorter: (a, b) => a.ordersCount - b.ordersCount,
    },
    {
      title: 'Giá trị trung bình',
      dataIndex: 'averageValue',
      key: 'averageValue',
      sorter: (a, b) => a.averageValue - b.averageValue,
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Mua gần nhất',
      dataIndex: 'lastPurchase',
      key: 'lastPurchase',
      sorter: (a, b) => new Date(a.lastPurchase) - new Date(b.lastPurchase),
      render: (text) => formatDate(text),
    },
  ];

  // Columns for segment analysis table
  const segmentColumns = [
    {
      title: 'Phân khúc',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Tag color={record.color} style={{ marginRight: 8 }}>{text}</Tag>
          <Text type="secondary">{record.count} khách hàng</Text>
        </div>
      ),
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (text, record) => (
        <Tooltip title={`${text}% khách hàng`}>
          <Progress 
            percent={text} 
            size="small" 
            strokeColor={record.color}
            style={{ width: '120px' }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Giá trị trung bình',
      dataIndex: 'averageValue',
      key: 'averageValue',
      sorter: (a, b) => a.averageValue - b.averageValue,
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Tần suất mua',
      dataIndex: 'purchaseFrequency',
      key: 'purchaseFrequency',
      sorter: (a, b) => a.purchaseFrequency - b.purchaseFrequency,
      render: (text) => `${text} lần/quý`,
    },
    {
      title: 'Tỷ lệ giữ chân',
      dataIndex: 'retentionRate',
      key: 'retentionRate',
      sorter: (a, b) => a.retentionRate - b.retentionRate,
      render: (text) => (
        <Tooltip title={`${text}% khách hàng quay lại`}>
          <Progress 
            percent={text} 
            size="small"
            style={{ width: '120px' }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Vòng đời (tháng)',
      dataIndex: 'customerLifetime',
      key: 'customerLifetime',
      sorter: (a, b) => a.customerLifetime - b.customerLifetime,
    },
  ];

  // Columns for purchase frequency table
  const purchaseFrequencyColumns = [
    {
      title: 'Tần suất mua',
      dataIndex: 'frequency',
      key: 'frequency',
    },
    {
      title: 'Số khách hàng',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      sorter: (a, b) => a.percentage - b.percentage,
      render: (text) => (
        <Tooltip title={`${text}% khách hàng`}>
          <Progress 
            percent={text} 
            size="small"
            style={{ width: '120px' }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="customer-analytics">
      <Card loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>Phân tích khách hàng</Title>
          <Space>
            <RangePicker 
              onChange={setDateRange} 
              format="DD/MM/YYYY"
            />
            <Select 
              defaultValue="month" 
              style={{ width: 120 }}
              onChange={setPeriod}
            >
              <Option value="week">Tuần này</Option>
              <Option value="month">Tháng này</Option>
              <Option value="quarter">Quý này</Option>
              <Option value="year">Năm nay</Option>
            </Select>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleReload}>
              Cập nhật
            </Button>
          </Space>
        </div>

        {/* Summary statistics */}
        {data && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng số khách hàng"
                  value={data.summary.totalCustomers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div>
                  <Text type="success">
                    <RiseOutlined /> {data.summary.newCustomers} khách hàng mới ({data.summary.newCustomersPercent}%)
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ khách hàng hoạt động"
                  value={data.summary.activeCustomersPercent}
                  suffix="%"
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <div>
                  <Text>
                    {data.summary.activeCustomers} khách hàng hoạt động
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ giữ chân khách hàng"
                  value={data.summary.retentionRate}
                  suffix="%"
                  prefix={<HeartOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
                />
                <div>
                  <Text>
                    <ClockCircleOutlined /> Vòng đời khách hàng trung bình: 22 tháng
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Giá trị trung bình đơn hàng"
                  value={data.summary.averagePurchaseValue}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <div>
                  <Text>
                    <ShopOutlined /> {data.summary.averagePurchaseFrequency} lần mua/khách hàng
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        <Divider />

        {/* Detailed Analytics Tabs */}
        <Tabs defaultActiveKey="segments">
          <TabPane tab="Phân khúc khách hàng" key="segments">
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Space>
                <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
                <Button icon={<FilePdfOutlined />}>Xuất PDF</Button>
                <Button type="primary" icon={<DownloadOutlined />}>Tải báo cáo</Button>
              </Space>
            </div>
            <Table
              columns={segmentColumns}
              dataSource={data?.segments || []}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Top khách hàng" key="top_customers">
            <Table
              columns={topCustomersColumns}
              dataSource={data?.topCustomers || []}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Tần suất mua hàng" key="purchase_frequency">
            <Table
              columns={purchaseFrequencyColumns}
              dataSource={data?.purchaseFrequency || []}
              rowKey="frequency"
              loading={loading}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CustomerAnalytics; 