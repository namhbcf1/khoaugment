import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Button, 
  Space, 
  Tag, 
  List, 
  Avatar, 
  Tooltip, 
  Badge, 
  Spin,
  Statistic,
  Empty,
  Divider,
  Alert,
  Skeleton
} from 'antd';
import { 
  BulbOutlined, 
  ShoppingCartOutlined, 
  PlusOutlined, 
  RocketOutlined, 
  FireOutlined,
  StarOutlined,
  LikeOutlined,
  ThunderboltOutlined,
  PercentageOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  SyncOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const SmartSuggestions = ({ 
  currentCart = [], 
  onAddItem, 
  customerData = null,
  visible = true,
  refreshSuggestions = () => {},
  loading = false 
}) => {
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [bundleDeals, setBundleDeals] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [suggestionReason, setSuggestionReason] = useState('cart');

  // Mock data for suggested items and bundle deals
  const mockSuggestedItems = {
    // Based on current cart items
    cart: [
      {
        id: 101,
        name: 'Chuột không dây Logitech M185',
        image: 'https://via.placeholder.com/50',
        price: 250000,
        originalPrice: 290000,
        rating: 4.5,
        reason: 'Người mua laptop thường mua thêm',
        inStock: 15
      },
      {
        id: 102,
        name: 'Bàn di chuột size L',
        image: 'https://via.placeholder.com/50',
        price: 90000,
        originalPrice: 120000,
        rating: 4.2,
        reason: 'Phụ kiện đi kèm phổ biến',
        inStock: 22
      },
      {
        id: 103,
        name: 'Túi đựng laptop 15.6"',
        image: 'https://via.placeholder.com/50',
        price: 350000,
        originalPrice: 400000,
        rating: 4.8,
        reason: 'Bảo vệ laptop của bạn',
        inStock: 8
      },
      {
        id: 104,
        name: 'Đèn LED USB',
        image: 'https://via.placeholder.com/50',
        price: 70000,
        originalPrice: 90000,
        rating: 4.0,
        reason: 'Tiện dụng khi làm việc đêm',
        inStock: 30
      }
    ],
    // Based on customer purchase history
    customer: [
      {
        id: 201,
        name: 'SSD Samsung 250GB',
        image: 'https://via.placeholder.com/50',
        price: 1200000,
        originalPrice: 1500000,
        rating: 4.9,
        reason: 'Dựa trên lịch sử mua hàng',
        inStock: 12
      },
      {
        id: 202,
        name: 'Bàn phím cơ E-DRA EK387',
        image: 'https://via.placeholder.com/50',
        price: 850000,
        originalPrice: 950000,
        rating: 4.7,
        reason: 'Khách hàng quan tâm gần đây',
        inStock: 5
      },
      {
        id: 203,
        name: 'Webcam Logitech C270',
        image: 'https://via.placeholder.com/50',
        price: 550000,
        originalPrice: 700000,
        rating: 4.3,
        reason: 'Sản phẩm tương tự đã mua',
        inStock: 9
      }
    ],
    // Trending products
    trending: [
      {
        id: 301,
        name: 'Tai nghe gaming Logitech G Pro X',
        image: 'https://via.placeholder.com/50',
        price: 2800000,
        originalPrice: 3200000,
        rating: 4.8,
        reason: 'Bán chạy tuần này',
        inStock: 7
      },
      {
        id: 302,
        name: 'USB Kingston 64GB',
        image: 'https://via.placeholder.com/50',
        price: 180000,
        originalPrice: 220000,
        rating: 4.5,
        reason: 'Sản phẩm phổ biến',
        inStock: 42
      },
      {
        id: 303,
        name: 'Dây cáp HDMI 2.0',
        image: 'https://via.placeholder.com/50',
        price: 120000,
        originalPrice: 150000,
        rating: 4.6,
        reason: 'Đang giảm giá',
        inStock: 20
      }
    ]
  };

  const mockBundles = [
    {
      id: 'bundle1',
      name: 'Bộ phụ kiện laptop cơ bản',
      discount: 15,
      items: [
        {
          id: 101,
          name: 'Chuột không dây Logitech M185',
          image: 'https://via.placeholder.com/50',
          price: 250000,
        },
        {
          id: 102,
          name: 'Bàn di chuột size L',
          image: 'https://via.placeholder.com/50',
          price: 90000,
        },
        {
          id: 103,
          name: 'Túi đựng laptop 15.6"',
          image: 'https://via.placeholder.com/50',
          price: 350000,
        }
      ],
      originalPrice: 690000,
      bundlePrice: 586500,
    },
    {
      id: 'bundle2',
      name: 'Bộ nâng cấp hiệu suất',
      discount: 10,
      items: [
        {
          id: 201,
          name: 'SSD Samsung 250GB',
          image: 'https://via.placeholder.com/50',
          price: 1200000,
        },
        {
          id: 501,
          name: 'RAM Kingston 8GB DDR4',
          image: 'https://via.placeholder.com/50',
          price: 850000,
        }
      ],
      originalPrice: 2050000,
      bundlePrice: 1845000,
    }
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Load data
  useEffect(() => {
    setLocalLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Determine which suggestion set to show based on available data
      let reason = 'cart';
      let suggestions = [...mockSuggestedItems.cart];
      
      if (customerData?.id) {
        // If we have customer data, mix in some customer-based suggestions
        reason = 'customer';
        suggestions = [...mockSuggestedItems.customer, ...mockSuggestedItems.cart.slice(0, 2)];
      } else if (!currentCart.length) {
        // If cart is empty, show trending products
        reason = 'trending';
        suggestions = [...mockSuggestedItems.trending];
      }
      
      setSuggestedItems(suggestions);
      setBundleDeals(mockBundles);
      setSuggestionReason(reason);
      setLocalLoading(false);
    }, 800);
  }, [currentCart, customerData, loading]);

  // Get suggestion title based on reason
  const getSuggestionTitle = () => {
    switch (suggestionReason) {
      case 'customer':
        return 'Đề xuất riêng cho khách hàng';
      case 'cart':
        return 'Khách hàng thường mua cùng';
      case 'trending':
        return 'Sản phẩm phổ biến hiện nay';
      default:
        return 'Đề xuất cho bạn';
    }
  };

  // Get suggestion icon based on reason
  const getSuggestionIcon = () => {
    switch (suggestionReason) {
      case 'customer':
        return <StarOutlined style={{ color: '#722ed1' }} />;
      case 'cart':
        return <BulbOutlined style={{ color: '#faad14' }} />;
      case 'trending':
        return <FireOutlined style={{ color: '#f5222d' }} />;
      default:
        return <BulbOutlined style={{ color: '#faad14' }} />;
    }
  };

  if (!visible) return null;

  return (
    <div className="smart-suggestions">
      <Skeleton loading={localLoading} active paragraph={{ rows: 8 }} title>
        {suggestedItems.length > 0 || bundleDeals.length > 0 ? (
          <div>
            {/* Individual Product Suggestions */}
            <Card 
              title={
                <Space>
                  {getSuggestionIcon()}
                  <span>{getSuggestionTitle()}</span>
                </Space>
              }
              extra={
                <Button 
                  type="text" 
                  icon={<SyncOutlined />} 
                  onClick={refreshSuggestions}
                  size="small"
                >
                  Làm mới
                </Button>
              }
              size="small"
              className="suggestion-card"
            >
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={suggestedItems}
                renderItem={(item) => (
                  <List.Item>
                    <Card 
                      size="small" 
                      hoverable
                      cover={
                        <div style={{ padding: '10px', textAlign: 'center', background: '#f5f5f5' }}>
                          <img 
                            alt={item.name} 
                            src={item.image} 
                            style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} 
                          />
                        </div>
                      }
                      actions={[
                        <Tooltip title="Thêm vào giỏ hàng">
                          <Button 
                            type="primary" 
                            size="small" 
                            icon={<PlusOutlined />}
                            onClick={() => onAddItem(item)}
                          >
                            Thêm
                          </Button>
                        </Tooltip>
                      ]}
                    >
                      <div style={{ height: '45px', overflow: 'hidden' }}>
                        <Tooltip title={item.name}>
                          <Text strong style={{ fontSize: '13px' }} ellipsis={{ tooltip: item.name }}>
                            {item.name}
                          </Text>
                        </Tooltip>
                      </div>
                      <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <Space align="center">
                          <Text style={{ fontSize: '14px', color: '#f50', fontWeight: 'bold' }}>
                            {formatCurrency(item.price)}
                          </Text>
                          {item.originalPrice > item.price && (
                            <Text delete style={{ fontSize: '12px', color: '#999' }}>
                              {formatCurrency(item.originalPrice)}
                            </Text>
                          )}
                        </Space>
                        {item.originalPrice > item.price && (
                          <Tag color="red" style={{ marginTop: '4px' }}>
                            -{Math.round((item.originalPrice - item.price) / item.originalPrice * 100)}%
                          </Tag>
                        )}
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <InfoCircleOutlined /> {item.reason}
                        </Text>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
              
              {/* Bundle Deals */}
              {bundleDeals.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <Divider orientation="left">
                    <Space>
                      <RocketOutlined style={{ color: '#1890ff' }} />
                      <span>Combo tiết kiệm</span>
                    </Space>
                  </Divider>
                  
                  <List
                    dataSource={bundleDeals}
                    renderItem={(bundle) => (
                      <List.Item>
                        <Card 
                          size="small"
                          title={
                            <Space>
                              <Text strong>{bundle.name}</Text>
                              <Tag color="red">Tiết kiệm {bundle.discount}%</Tag>
                            </Space>
                          }
                          style={{ width: '100%' }}
                        >
                          <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={16}>
                              <List
                                dataSource={bundle.items}
                                renderItem={(item) => (
                                  <List.Item style={{ padding: '8px 0' }}>
                                    <List.Item.Meta
                                      avatar={<Avatar src={item.image} shape="square" />}
                                      title={item.name}
                                      description={formatCurrency(item.price)}
                                    />
                                  </List.Item>
                                )}
                              />
                            </Col>
                            <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                              <div>
                                <Statistic
                                  title="Giá gốc"
                                  value={bundle.originalPrice}
                                  formatter={(value) => <Text delete>{formatCurrency(value)}</Text>}
                                />
                                <Statistic
                                  title="Giá combo"
                                  value={bundle.bundlePrice}
                                  valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                                  formatter={(value) => formatCurrency(value)}
                                  suffix={<PercentageOutlined style={{ fontSize: '0.7em' }} />}
                                />
                                <Button
                                  type="primary"
                                  icon={<ShoppingCartOutlined />}
                                  style={{ marginTop: '16px' }}
                                  onClick={() => bundle.items.forEach(item => onAddItem(item))}
                                >
                                  Thêm tất cả
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>
            
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <RobotOutlined /> Đề xuất thông minh bằng AI dựa trên dữ liệu bán hàng và hành vi khách hàng
              </Text>
            </div>
          </div>
        ) : (
          <Empty 
            description="Không có đề xuất nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Skeleton>
    </div>
  );
};

export default SmartSuggestions; 