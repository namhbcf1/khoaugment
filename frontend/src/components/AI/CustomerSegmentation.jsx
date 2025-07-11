/**
 * Customer Segmentation Dashboard
 * Hiển thị kết quả phân khúc khách hàng sử dụng AI/ML
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Statistic,
  Progress,
  Tooltip,
  Modal,
  List,
  Avatar,
  Descriptions,
  Alert,
  Spin,
  Select,
  DatePicker,
  message
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
  WarningOutlined,
  DownloadOutlined,
  ReloadOutlined,
  RobotOutlined,
  BarChartOutlined,
  BulbOutlined,
  StarOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

import aiService from '../../services/aiService';
import api from '../../services/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CustomerSegmentation = () => {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [segmentModalVisible, setSegmentModalVisible] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      // Load customer data from API
      const response = await api.get('/customers/with-orders');
      const customerData = response.data.data || [];
      
      setCustomers(customerData);
      
      if (customerData.length > 0) {
        await performSegmentation(customerData);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
      // Use demo data for development
      const demoData = generateDemoCustomerData();
      setCustomers(demoData);
      await performSegmentation(demoData);
    } finally {
      setLoading(false);
    }
  };

  const performSegmentation = async (customerData) => {
    try {
      const result = await aiService.segmentCustomers(customerData);
      setSegments(result.segments);
      setInsights(result.insights);
      message.success(`Đã phân khúc ${customerData.length} khách hàng thành ${result.segments.length} nhóm`);
    } catch (error) {
      console.error('Segmentation error:', error);
      message.error('Có lỗi xảy ra khi phân khúc khách hàng');
    }
  };

  const generateDemoCustomerData = () => {
    const demoCustomers = [];
    const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'];
    
    for (let i = 0; i < 100; i++) {
      const orderCount = Math.floor(Math.random() * 20) + 1;
      const orders = [];
      
      for (let j = 0; j < orderCount; j++) {
        orders.push({
          id: `order_${i}_${j}`,
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          total: Math.floor(Math.random() * 2000000) + 100000
        });
      }
      
      demoCustomers.push({
        id: `customer_${i}`,
        name: `${names[i % names.length]} ${i + 1}`,
        email: `customer${i}@example.com`,
        phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
        createdAt: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        orders
      });
    }
    
    return demoCustomers;
  };

  const segmentColumns = [
    {
      title: 'Phân khúc',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <div 
            style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: record.color 
            }} 
          />
          <Text strong>{name}</Text>
        </Space>
      )
    },
    {
      title: 'Số lượng KH',
      dataIndex: 'size',
      key: 'size',
      render: (size) => (
        <Statistic 
          value={size} 
          prefix={<UserOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      )
    },
    {
      title: 'Doanh thu',
      key: 'revenue',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>
            {(record.metrics?.totalRevenue || 0).toLocaleString('vi-VN')} đ
          </Text>
          <Progress 
            percent={record.metrics?.revenuePercentage || 0}
            size="small"
            strokeColor={record.color}
          />
        </Space>
      )
    },
    {
      title: 'RFM Trung bình',
      key: 'rfm',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>R: {record.metrics?.avgRecency || 0} ngày</Text>
          <Text>F: {record.metrics?.avgFrequency || 0} lần</Text>
          <Text>M: {(record.metrics?.avgOrderValue || 0).toLocaleString('vi-VN')} đ</Text>
        </Space>
      )
    },
    {
      title: 'Chiến lược',
      dataIndex: 'strategy',
      key: 'strategy',
      render: (strategy) => (
        <Tooltip title={strategy}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {strategy}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => {
              setSelectedSegment(record);
              setSegmentModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
        </Space>
      )
    }
  ];

  const chartData = useMemo(() => {
    return segments.map(segment => ({
      name: segment.name,
      value: segment.size,
      revenue: segment.metrics?.totalRevenue || 0,
      color: segment.color
    }));
  }, [segments]);

  const handleExportResults = () => {
    try {
      const exportData = aiService.exportSegmentationResults(segments);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-segmentation-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Đã xuất kết quả phân khúc');
    } catch (error) {
      message.error('Có lỗi khi xuất dữ liệu');
    }
  };

  const renderInsightCard = (insight) => {
    const icons = {
      overview: <BarChartOutlined />,
      top_segment: <TrophyOutlined />,
      at_risk: <WarningOutlined />
    };

    const colors = {
      overview: '#1890ff',
      top_segment: '#52c41a',
      at_risk: '#ff4d4f'
    };

    return (
      <Card key={insight.type} size="small">
        <Statistic
          title={insight.title}
          value={insight.value}
          prefix={icons[insight.type]}
          valueStyle={{ color: colors[insight.type] }}
          suffix={insight.type === 'top_segment' ? 'đ' : ''}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {insight.description}
        </Text>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang phân tích dữ liệu khách hàng...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2}>
                  <RobotOutlined /> Phân khúc khách hàng AI
                </Title>
                <Text type="secondary">
                  Sử dụng Machine Learning để phân tích và phân khúc khách hàng theo RFM
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadCustomerData}
                    loading={loading}
                  >
                    Phân tích lại
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={handleExportResults}
                    disabled={segments.length === 0}
                  >
                    Xuất kết quả
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Insights Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {insights.map(insight => (
          <Col span={8} key={insight.type}>
            {renderInsightCard(insight)}
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Phân bố khách hàng theo phân khúc" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Doanh thu theo phân khúc" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="revenue" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Segments Table */}
      <Card title="Chi tiết phân khúc khách hàng" size="small">
        <Table
          columns={segmentColumns}
          dataSource={segments}
          rowKey="clusterId"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* Segment Detail Modal */}
      <Modal
        title={`Chi tiết phân khúc: ${selectedSegment?.name}`}
        open={segmentModalVisible}
        onCancel={() => setSegmentModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedSegment && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Alert
                  message={selectedSegment.description}
                  description={selectedSegment.strategy}
                  type="info"
                  showIcon
                />
              </Col>
            </Row>
            
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Số lượng khách hàng">
                {selectedSegment.size}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng doanh thu">
                {(selectedSegment.metrics?.totalRevenue || 0).toLocaleString('vi-VN')} đ
              </Descriptions.Item>
              <Descriptions.Item label="Recency trung bình">
                {selectedSegment.metrics?.avgRecency || 0} ngày
              </Descriptions.Item>
              <Descriptions.Item label="Frequency trung bình">
                {selectedSegment.metrics?.avgFrequency || 0} lần
              </Descriptions.Item>
              <Descriptions.Item label="AOV trung bình">
                {(selectedSegment.metrics?.avgOrderValue || 0).toLocaleString('vi-VN')} đ
              </Descriptions.Item>
              <Descriptions.Item label="% Doanh thu">
                {selectedSegment.metrics?.revenuePercentage || 0}%
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Title level={5}>
                <BulbOutlined /> Khuyến nghị hành động
              </Title>
              <List
                size="small"
                dataSource={aiService.getSegmentRecommendations(selectedSegment)}
                renderItem={(item) => (
                  <List.Item>
                    <StarOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerSegmentation;
