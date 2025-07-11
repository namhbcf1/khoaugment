/**
 * Product Recommendation Engine
 * AI-powered product recommendations cho POS và e-commerce
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  List,
  Button,
  Space,
  Typography,
  Tag,
  Avatar,
  Tooltip,
  Rate,
  Statistic,
  Alert,
  Spin,
  Select,
  Switch,
  Descriptions,
  Badge,
  Progress,
  message
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  StarOutlined,
  TrophyOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  UserOutlined,
  BarChartOutlined,
  RobotOutlined,
  GiftOutlined,
  RiseOutlined
} from '@ant-design/icons';

import aiService from '../../services/aiService';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductRecommendation = ({ 
  customerId = null, 
  currentCart = [], 
  onAddToCart,
  mode = 'full' // 'full', 'pos', 'widget'
}) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();
  }, [customerId]);

  useEffect(() => {
    if (autoRefresh && currentCart.length > 0) {
      generateRealtimeRecommendations();
    }
  }, [currentCart, autoRefresh]);

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
      
      if (customerId) {
        await generatePersonalizedRecommendations(
          productsRes.data.data || [],
          ordersRes.data.data || []
        );
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Use demo data
      const demoProducts = generateDemoProducts();
      const demoOrders = generateDemoOrders();
      setProducts(demoProducts);
      setOrders(demoOrders);
      
      if (customerId) {
        await generatePersonalizedRecommendations(demoProducts, demoOrders);
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedRecommendations = async (productsData, ordersData) => {
    try {
      const options = {
        maxRecommendations: mode === 'widget' ? 4 : 10,
        includePopular: selectedStrategy === 'all' || selectedStrategy === 'popular',
        includeSimilar: selectedStrategy === 'all' || selectedStrategy === 'similar',
        includePersonalized: selectedStrategy === 'all' || selectedStrategy === 'personalized'
      };
      
      const result = await aiService.generateProductRecommendations(
        customerId,
        productsData,
        ordersData,
        options
      );
      
      setRecommendations(result.recommendations);
      setInsights(result.insights);
    } catch (error) {
      console.error('Recommendation error:', error);
      message.error('Có lỗi khi tạo gợi ý sản phẩm');
    }
  };

  const generateRealtimeRecommendations = async () => {
    try {
      const result = await aiService.getRealtimeRecommendations(currentCart, customerId);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Realtime recommendation error:', error);
    }
  };

  const generateDemoProducts = () => {
    const categories = ['Electronics', 'Clothing', 'Books', 'Food', 'Accessories'];
    const brands = ['Samsung', 'Apple', 'Nike', 'Adidas', 'Sony'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `product_${i}`,
      name: `Sản phẩm ${i + 1}`,
      category: categories[i % categories.length],
      brand: brands[i % brands.length],
      price: Math.floor(Math.random() * 2000000) + 100000,
      description: `Mô tả sản phẩm ${i + 1}`,
      image: `https://via.placeholder.com/150?text=Product${i + 1}`,
      rating: Math.random() * 2 + 3, // 3-5 stars
      reviews: Math.floor(Math.random() * 100) + 10
    }));
  };

  const generateDemoOrders = () => {
    const orders = [];
    const customerIds = ['customer_1', 'customer_2', 'customer_3'];
    
    for (let i = 0; i < 100; i++) {
      orders.push({
        id: `order_${i}`,
        customerId: customerIds[i % customerIds.length],
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

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
      message.success(`Đã thêm ${product.name} vào giỏ hàng`);
    }
  };

  const getStrategyIcon = (strategy) => {
    const icons = {
      'collaborative': <UserOutlined />,
      'content-based': <StarOutlined />,
      'popularity': <TrophyOutlined />,
      'cross-sell': <GiftOutlined />,
      'upsell': <RiseOutlined />
    };
    return icons[strategy] || <BulbOutlined />;
  };

  const getStrategyColor = (strategy) => {
    const colors = {
      'collaborative': 'blue',
      'content-based': 'green',
      'popularity': 'gold',
      'cross-sell': 'purple',
      'upsell': 'orange'
    };
    return colors[strategy] || 'default';
  };

  const renderRecommendationCard = (rec, index) => {
    const { product, score, reason, strategy } = rec;
    
    return (
      <Card
        key={product.id}
        size="small"
        hoverable
        style={{ marginBottom: 8 }}
        actions={mode !== 'widget' ? [
          <Button 
            type="primary" 
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleAddToCart(product)}
          >
            Thêm vào giỏ
          </Button>
        ] : []}
      >
        <Card.Meta
          avatar={
            <Avatar 
              src={product.image} 
              size={mode === 'widget' ? 'small' : 'default'}
            />
          }
          title={
            <Space>
              <Text strong style={{ fontSize: mode === 'widget' ? 12 : 14 }}>
                {product.name}
              </Text>
              <Tag 
                color={getStrategyColor(strategy)} 
                icon={getStrategyIcon(strategy)}
                size="small"
              >
                {strategy}
              </Tag>
            </Space>
          }
          description={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {reason}
              </Text>
              <Space>
                <Text strong style={{ color: '#1890ff' }}>
                  {product.price?.toLocaleString('vi-VN')} đ
                </Text>
                {product.rating && (
                  <Rate 
                    disabled 
                    defaultValue={product.rating} 
                    size="small"
                    style={{ fontSize: 12 }}
                  />
                )}
              </Space>
              <Progress 
                percent={Math.round(score * 100)} 
                size="small"
                format={() => `${Math.round(score * 100)}% phù hợp`}
              />
            </Space>
          }
        />
      </Card>
    );
  };

  if (mode === 'widget') {
    return (
      <Card 
        title={
          <Space>
            <RobotOutlined />
            <Text>Gợi ý cho bạn</Text>
          </Space>
        }
        size="small"
        style={{ maxHeight: 400, overflow: 'auto' }}
      >
        {loading ? (
          <Spin />
        ) : (
          <List
            dataSource={recommendations.slice(0, 4)}
            renderItem={(rec, index) => (
              <List.Item style={{ padding: '8px 0' }}>
                {renderRecommendationCard(rec, index)}
              </List.Item>
            )}
          />
        )}
      </Card>
    );
  }

  return (
    <div style={{ padding: mode === 'pos' ? 16 : 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={mode === 'pos' ? 4 : 2}>
                  <RobotOutlined /> Gợi ý sản phẩm AI
                </Title>
                <Text type="secondary">
                  Recommendations được tạo bằng Machine Learning
                </Text>
              </Col>
              <Col>
                <Space>
                  <Select
                    value={selectedStrategy}
                    onChange={setSelectedStrategy}
                    style={{ width: 150 }}
                    size="small"
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="personalized">Cá nhân hóa</Option>
                    <Option value="similar">Tương tự</Option>
                    <Option value="popular">Phổ biến</Option>
                  </Select>
                  <Switch
                    checked={autoRefresh}
                    onChange={setAutoRefresh}
                    checkedChildren="Auto"
                    unCheckedChildren="Manual"
                    size="small"
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Insights */}
      {insights.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {insights.map((insight, index) => (
            <Col span={12} key={index}>
              <Card size="small">
                <Statistic
                  title={insight.title}
                  value={insight.value}
                  suffix={insight.type === 'confidence' ? '%' : ''}
                  prefix={<ThunderboltOutlined />}
                />
                {insight.description && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {insight.description}
                  </Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Current Cart Context */}
      {currentCart.length > 0 && (
        <Row style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Alert
              message="Gợi ý dựa trên giỏ hàng hiện tại"
              description={`${currentCart.length} sản phẩm trong giỏ hàng`}
              type="info"
              showIcon
            />
          </Col>
        </Row>
      )}

      {/* Recommendations Grid */}
      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24} style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Đang tạo gợi ý sản phẩm...</Text>
            </div>
          </Col>
        ) : recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <Col 
              span={mode === 'pos' ? 12 : 8} 
              key={rec.product.id}
            >
              {renderRecommendationCard(rec, index)}
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: 50 }}>
                <BulbOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    Chưa có gợi ý sản phẩm. Thêm sản phẩm vào giỏ hàng hoặc chọn khách hàng để nhận gợi ý.
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ProductRecommendation;
