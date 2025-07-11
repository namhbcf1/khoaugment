/**
 * Price Optimization Dashboard
 * AI-powered dynamic pricing optimization
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Statistic,
  Progress,
  Alert,
  Spin,
  Select,
  Switch,
  Tooltip,
  Modal,
  Descriptions,
  Badge,
  message
} from 'antd';
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  AimOutlined,
  ExperimentOutlined,
  DownloadOutlined,
  ReloadOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

import aiService from '../../services/aiService';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const PriceOptimization = () => {
  const [loading, setLoading] = useState(false);
  const [optimizations, setOptimizations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [strategy, setStrategy] = useState('profit_maximization');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products and orders
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders')
      ]);
      
      setProducts(productsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      
      await optimizePricing(
        productsRes.data.data || [],
        ordersRes.data.data || []
      );
    } catch (error) {
      console.error('Error loading data:', error);
      // Use demo data
      const demoProducts = generateDemoProducts();
      const demoOrders = generateDemoOrders();
      setProducts(demoProducts);
      setOrders(demoOrders);
      await optimizePricing(demoProducts, demoOrders);
    } finally {
      setLoading(false);
    }
  };

  const optimizePricing = async (productsData, ordersData) => {
    try {
      const marketData = {
        competitors: {
          'Electronics': [1200000, 1500000, 1800000],
          'Clothing': [500000, 800000, 1200000],
          'Books': [150000, 200000, 300000]
        }
      };

      const options = {
        strategy,
        elasticityThreshold: 0.5,
        maxPriceChange: 0.2,
        considerSeasonality: true
      };

      const result = await aiService.optimizePricing(
        productsData.slice(0, 20), // Limit for demo
        ordersData,
        marketData,
        options
      );

      setOptimizations(result.optimizations);
      setInsights(result.insights);
      setSummary(result.summary);
      
      message.success(`Đã tối ưu hóa giá cho ${result.optimizations.length} sản phẩm`);
    } catch (error) {
      console.error('Price optimization error:', error);
      message.error('Có lỗi khi tối ưu hóa giá');
    }
  };

  const generateDemoProducts = () => {
    const categories = ['Electronics', 'Clothing', 'Books', 'Food', 'Accessories'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `product_${i}`,
      name: `Sản phẩm ${i + 1}`,
      category: categories[i % categories.length],
      price: Math.floor(Math.random() * 2000000) + 100000,
      cost: Math.floor(Math.random() * 1000000) + 50000,
      description: `Mô tả sản phẩm ${i + 1}`
    }));
  };

  const generateDemoOrders = () => {
    const orders = [];
    
    for (let i = 0; i < 200; i++) {
      orders.push({
        id: `order_${i}`,
        customerId: `customer_${Math.floor(Math.random() * 20)}`,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        items: [
          {
            productId: `product_${Math.floor(Math.random() * 50)}`,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: Math.floor(Math.random() * 1000000) + 50000
          }
        ]
      });
    }
    
    return orders;
  };

  const handleApplyOptimization = (optimization) => {
    Modal.confirm({
      title: 'Áp dụng tối ưu hóa giá',
      content: `Bạn có chắc muốn thay đổi giá ${optimization.product.name} từ ${optimization.currentPrice.toLocaleString('vi-VN')} đ thành ${optimization.optimizedPrice.toLocaleString('vi-VN')} đ?`,
      onOk: async () => {
        try {
          // API call to update product price
          await api.put(`/products/${optimization.product.id}`, {
            price: optimization.optimizedPrice
          });
          
          message.success('Đã cập nhật giá sản phẩm');
          loadData(); // Reload data
        } catch (error) {
          message.error('Có lỗi khi cập nhật giá');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{name}</Text>
          <Tag color="blue">{record.product.category}</Tag>
        </Space>
      )
    },
    {
      title: 'Giá hiện tại',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price) => (
        <Text>{price.toLocaleString('vi-VN')} đ</Text>
      )
    },
    {
      title: 'Giá tối ưu',
      dataIndex: 'optimizedPrice',
      key: 'optimizedPrice',
      render: (price, record) => (
        <Space>
          <Text strong style={{ color: record.priceChange > 0 ? '#52c41a' : '#ff4d4f' }}>
            {price.toLocaleString('vi-VN')} đ
          </Text>
          {record.priceChange > 0 ? <RiseOutlined style={{ color: '#52c41a' }} /> : <FallOutlined style={{ color: '#ff4d4f' }} />}
        </Space>
      )
    },
    {
      title: 'Thay đổi',
      dataIndex: 'priceChange',
      key: 'priceChange',
      render: (change) => (
        <Tag color={change > 0 ? 'green' : change < 0 ? 'red' : 'blue'}>
          {(change * 100).toFixed(1)}%
        </Tag>
      )
    },
    {
      title: 'Tác động dự kiến',
      key: 'impact',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>Doanh thu: {record.expectedImpact.revenueChange > 0 ? '+' : ''}{record.expectedImpact.revenueChange.toLocaleString('vi-VN')} đ</Text>
          <Text>Lợi nhuận: {record.expectedImpact.profit > 0 ? '+' : ''}{record.expectedImpact.profit.toLocaleString('vi-VN')} đ</Text>
        </Space>
      )
    },
    {
      title: 'Độ tin cậy',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence) => (
        <Progress 
          percent={Math.round(confidence * 100)} 
          size="small"
          status={confidence > 0.7 ? 'success' : confidence > 0.4 ? 'normal' : 'exception'}
        />
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
              setSelectedProduct(record);
              setDetailModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleApplyOptimization(record)}
            disabled={Math.abs(record.priceChange) < 0.01}
          >
            Áp dụng
          </Button>
        </Space>
      )
    }
  ];

  const chartData = useMemo(() => {
    return optimizations.map(opt => ({
      name: opt.product.name.substring(0, 10) + '...',
      currentPrice: opt.currentPrice,
      optimizedPrice: opt.optimizedPrice,
      revenueImpact: opt.expectedImpact.revenueChange,
      confidence: opt.confidence * 100
    }));
  }, [optimizations]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang phân tích và tối ưu hóa giá...</Text>
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
                  <DollarOutlined /> Tối ưu hóa giá AI
                </Title>
                <Text type="secondary">
                  Sử dụng Machine Learning để tối ưu hóa giá bán và tăng lợi nhuận
                </Text>
              </Col>
              <Col>
                <Space>
                  <Select
                    value={strategy}
                    onChange={(value) => {
                      setStrategy(value);
                      optimizePricing(products, orders);
                    }}
                    style={{ width: 200 }}
                  >
                    <Option value="profit_maximization">Tối ưu lợi nhuận</Option>
                    <Option value="market_penetration">Thâm nhập thị trường</Option>
                    <Option value="competitive">Cạnh tranh</Option>
                  </Select>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadData}
                    loading={loading}
                  >
                    Tối ưu lại
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Summary Statistics */}
      {summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tổng sản phẩm"
                value={summary.totalProducts}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tăng giá"
                value={summary.priceIncreases}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Giảm giá"
                value={summary.priceDecreases}
                prefix={<FallOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Tác động doanh thu"
                value={summary.totalRevenueImpact}
                prefix={<DollarOutlined />}
                suffix="đ"
                valueStyle={{ color: summary.totalRevenueImpact > 0 ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {insights.map((insight, index) => (
            <Col span={12} key={index}>
              <Alert
                message={insight.title}
                description={insight.description}
                type="info"
                showIcon
                icon={<BulbOutlined />}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Price Impact Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="So sánh giá hiện tại vs tối ưu" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    `${value.toLocaleString('vi-VN')} đ`,
                    name === 'currentPrice' ? 'Giá hiện tại' : 'Giá tối ưu'
                  ]}
                />
                <Legend />
                <Bar dataKey="currentPrice" fill="#1890ff" name="Giá hiện tại" />
                <Bar dataKey="optimizedPrice" fill="#52c41a" name="Giá tối ưu" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Tác động doanh thu vs Độ tin cậy" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="confidence" name="Độ tin cậy" unit="%" />
                <YAxis dataKey="revenueImpact" name="Tác động doanh thu" />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    name === 'confidence' ? `${value}%` : `${value.toLocaleString('vi-VN')} đ`,
                    name === 'confidence' ? 'Độ tin cậy' : 'Tác động doanh thu'
                  ]}
                />
                <Scatter dataKey="revenueImpact" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Optimization Table */}
      <Card title="Chi tiết tối ưu hóa giá" size="small">
        <Table
          columns={columns}
          dataSource={optimizations}
          rowKey={(record) => record.product.id}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết tối ưu hóa: ${selectedProduct?.product.name}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="apply" 
            type="primary"
            onClick={() => {
              handleApplyOptimization(selectedProduct);
              setDetailModalVisible(false);
            }}
          >
            Áp dụng tối ưu hóa
          </Button>
        ]}
      >
        {selectedProduct && (
          <div>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Sản phẩm">
                {selectedProduct.product.name}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {selectedProduct.product.category}
              </Descriptions.Item>
              <Descriptions.Item label="Giá hiện tại">
                {selectedProduct.currentPrice.toLocaleString('vi-VN')} đ
              </Descriptions.Item>
              <Descriptions.Item label="Giá tối ưu">
                {selectedProduct.optimizedPrice.toLocaleString('vi-VN')} đ
              </Descriptions.Item>
              <Descriptions.Item label="Thay đổi">
                {(selectedProduct.priceChange * 100).toFixed(1)}%
              </Descriptions.Item>
              <Descriptions.Item label="Độ tin cậy">
                {(selectedProduct.confidence * 100).toFixed(1)}%
              </Descriptions.Item>
              <Descriptions.Item label="Lý do" span={2}>
                {selectedProduct.reasoning}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Title level={5}>Tác động dự kiến</Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Thay đổi doanh thu"
                    value={selectedProduct.expectedImpact.revenueChange}
                    suffix="đ"
                    valueStyle={{ 
                      color: selectedProduct.expectedImpact.revenueChange > 0 ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Thay đổi lợi nhuận"
                    value={selectedProduct.expectedImpact.profit}
                    suffix="đ"
                    valueStyle={{ 
                      color: selectedProduct.expectedImpact.profit > 0 ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Thay đổi số lượng"
                    value={selectedProduct.expectedImpact.quantityChange}
                    suffix="sp"
                    valueStyle={{ 
                      color: selectedProduct.expectedImpact.quantityChange > 0 ? '#52c41a' : '#ff4d4f' 
                    }}
                  />
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PriceOptimization;
