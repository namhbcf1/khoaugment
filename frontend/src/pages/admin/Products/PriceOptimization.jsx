import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space, 
  Select, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Slider, 
  InputNumber,
  Form,
  Tabs,
  Alert,
  Tooltip,
  Divider,
  DatePicker,
  Radio,
  Switch,
  Modal
} from 'antd';
import { 
  DollarOutlined, 
  LineChartOutlined, 
  RiseOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  QuestionCircleOutlined,
  SyncOutlined,
  TagOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  CalculatorOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PriceOptimization = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [priceStrategies, setPriceStrategies] = useState('competitive');
  const [marginTarget, setMarginTarget] = useState(30);
  const [optimizationResults, setOptimizationResults] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Mô phỏng dữ liệu sản phẩm
  const mockProducts = [
    {
      key: '1',
      name: 'Laptop Dell Inspiron 15',
      sku: 'DELL-INS-15',
      category: 'Laptop',
      currentPrice: 15000000,
      cost: 12000000,
      suggestedPrice: 15500000,
      margin: 20,
      suggestedMargin: 22.58,
      competitivePrice: {
        min: 14500000,
        max: 16000000,
        avg: 15200000
      },
      demand: 'medium',
      sales: 12,
      inventory: 25
    },
    {
      key: '2',
      name: 'Màn hình Dell 24"',
      sku: 'DELL-MON-24',
      category: 'Màn hình',
      currentPrice: 3500000,
      cost: 2700000,
      suggestedPrice: 3700000,
      margin: 22.86,
      suggestedMargin: 27.03,
      competitivePrice: {
        min: 3200000,
        max: 3800000,
        avg: 3450000
      },
      demand: 'high',
      sales: 35,
      inventory: 42
    },
    {
      key: '3',
      name: 'Chuột không dây Logitech',
      sku: 'LOG-MOUSE-01',
      category: 'Phụ kiện',
      currentPrice: 450000,
      cost: 280000,
      suggestedPrice: 420000,
      margin: 37.78,
      suggestedMargin: 33.33,
      competitivePrice: {
        min: 400000,
        max: 550000,
        avg: 450000
      },
      demand: 'high',
      sales: 56,
      inventory: 78
    },
    {
      key: '4',
      name: 'Bàn phím cơ AKKO',
      sku: 'AKKO-KB-01',
      category: 'Phụ kiện',
      currentPrice: 1200000,
      cost: 800000,
      suggestedPrice: 1350000,
      margin: 33.33,
      suggestedMargin: 40.74,
      competitivePrice: {
        min: 1100000,
        max: 1450000,
        avg: 1250000
      },
      demand: 'medium',
      sales: 18,
      inventory: 15
    },
    {
      key: '5',
      name: 'Laptop Acer Nitro 5',
      sku: 'ACER-NIT-5',
      category: 'Laptop',
      currentPrice: 22000000,
      cost: 18500000,
      suggestedPrice: 21500000,
      margin: 15.91,
      suggestedMargin: 13.95,
      competitivePrice: {
        min: 20000000,
        max: 22500000,
        avg: 21200000
      },
      demand: 'low',
      sales: 5,
      inventory: 8
    },
  ];

  // Load dữ liệu
  useEffect(() => {
    // Mô phỏng API call
    setTimeout(() => {
      setProducts(mockProducts);
      runOptimization(mockProducts, priceStrategies, marginTarget);
      setLoading(false);
    }, 1500);
  }, []);

  // Hàm tối ưu hóa giá
  const runOptimization = (products, strategy, targetMargin) => {
    setLoading(true);
    
    // Mô phỏng API call để tối ưu hóa giá
    setTimeout(() => {
      // Trong thực tế, đây sẽ là kết quả từ thuật toán tối ưu hóa giá
      // dựa trên dữ liệu đầu vào, thuật toán AI, v.v.
      const results = products.map(product => {
        let suggestedPrice;
        
        switch (strategy) {
          case 'competitive':
            // Giá dựa trên thị trường cạnh tranh
            suggestedPrice = Math.round(product.competitivePrice.avg * (0.95 + Math.random() * 0.1));
            break;
          case 'margin':
            // Giá dựa trên mục tiêu biên lợi nhuận
            suggestedPrice = Math.round(product.cost / (1 - targetMargin / 100));
            break;
          case 'demand':
            // Giá dựa trên nhu cầu thị trường
            const demandFactor = product.demand === 'high' ? 1.1 : (product.demand === 'medium' ? 1.0 : 0.9);
            suggestedPrice = Math.round(product.currentPrice * demandFactor);
            break;
          case 'inventory':
            // Giá dựa trên tồn kho
            const inventoryFactor = product.inventory < 10 ? 1.05 : (product.inventory > 50 ? 0.95 : 1.0);
            suggestedPrice = Math.round(product.currentPrice * inventoryFactor);
            break;
          default:
            suggestedPrice = product.currentPrice;
        }
        
        const suggestedMargin = ((suggestedPrice - product.cost) / suggestedPrice * 100).toFixed(2);
        
        return {
          ...product,
          suggestedPrice,
          suggestedMargin: parseFloat(suggestedMargin),
          priceChange: suggestedPrice - product.currentPrice,
          priceChangePercent: ((suggestedPrice - product.currentPrice) / product.currentPrice * 100).toFixed(2)
        };
      });
      
      setOptimizationResults(results);
      setLoading(false);
    }, 1000);
  };

  // Áp dụng thay đổi giá
  const applyPriceChanges = () => {
    if (selectedRows.length === 0) {
      return;
    }
    
    // Mô phỏng API call để cập nhật giá
    setLoading(true);
    setTimeout(() => {
      // Trong thực tế, đây sẽ là API cập nhật giá
      setProducts(prevProducts => {
        return prevProducts.map(product => {
          const optimizedProduct = optimizationResults.find(opt => opt.key === product.key);
          const isSelected = selectedRows.some(row => row.key === product.key);
          
          if (isSelected && optimizedProduct) {
            return {
              ...product,
              currentPrice: optimizedProduct.suggestedPrice,
              margin: optimizedProduct.suggestedMargin
            };
          }
          
          return product;
        });
      });
      
      setLoading(false);
      setShowApplyModal(false);
      setSelectedRows([]);
      
      // Chạy lại tối ưu hóa
      runOptimization(products, priceStrategies, marginTarget);
    }, 1000);
  };

  // Xử lý thay đổi chiến lược giá
  const handleStrategyChange = (value) => {
    setPriceStrategies(value);
    runOptimization(products, value, marginTarget);
  };

  // Xử lý thay đổi mục tiêu biên lợi nhuận
  const handleMarginChange = (value) => {
    setMarginTarget(value);
    runOptimization(products, priceStrategies, value);
  };

  // Cấu hình bảng
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary">{record.sku}</Text>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>,
      filters: [...new Set(products.map(item => item.category))].map(category => ({
        text: category,
        value: category
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Giá hiện tại',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      sorter: (a, b) => a.currentPrice - b.currentPrice,
      render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text),
    },
    {
      title: 'Giá đề xuất',
      dataIndex: 'suggestedPrice',
      key: 'suggestedPrice',
      sorter: (a, b) => a.suggestedPrice - b.suggestedPrice,
      render: (text) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text),
    },
    {
      title: 'Thay đổi',
      dataIndex: 'priceChange',
      key: 'priceChange',
      sorter: (a, b) => a.priceChange - b.priceChange,
      render: (text, record) => {
        const color = text > 0 ? '#52c41a' : (text < 0 ? '#f5222d' : '');
        const icon = text > 0 ? <ArrowUpOutlined /> : (text < 0 ? <ArrowDownOutlined /> : null);
        
        return (
          <Space>
            <span style={{ color }}>
              {icon} {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text)}
            </span>
            <span style={{ color }}>
              ({record.priceChangePercent}%)
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Biên LN hiện tại',
      dataIndex: 'margin',
      key: 'margin',
      sorter: (a, b) => a.margin - b.margin,
      render: (text) => `${text}%`,
    },
    {
      title: 'Biên LN đề xuất',
      dataIndex: 'suggestedMargin',
      key: 'suggestedMargin',
      sorter: (a, b) => a.suggestedMargin - b.suggestedMargin,
      render: (text, record) => {
        const diff = (text - record.margin).toFixed(2);
        const color = diff > 0 ? '#52c41a' : (diff < 0 ? '#f5222d' : '');
        
        return (
          <Space>
            <span>{text}%</span>
            <span style={{ color }}>({diff > 0 ? '+' : ''}{diff}%)</span>
          </Space>
        );
      },
    },
  ];

  // Cấu hình lựa chọn hàng
  const rowSelection = {
    onChange: (_, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  // Tính toán số liệu thống kê
  const getTotalStats = () => {
    if (!optimizationResults.length) return { totalChange: 0, averageMarginChange: 0, productsIncreased: 0, productsDecreased: 0 };
    
    const totalChange = optimizationResults.reduce((sum, item) => sum + item.priceChange, 0);
    const totalMarginChange = optimizationResults.reduce((sum, item) => sum + (item.suggestedMargin - item.margin), 0);
    const averageMarginChange = totalMarginChange / optimizationResults.length;
    const productsIncreased = optimizationResults.filter(item => item.priceChange > 0).length;
    const productsDecreased = optimizationResults.filter(item => item.priceChange < 0).length;
    
    return { totalChange, averageMarginChange, productsIncreased, productsDecreased };
  };

  const stats = getTotalStats();

  return (
    <div className="price-optimization">
      <Card>
        <Title level={2}>Tối ưu hóa giá sản phẩm</Title>
        <Paragraph type="secondary">
          Tối ưu hóa giá sản phẩm dựa trên nhiều yếu tố: chi phí, nhu cầu thị trường, giá cạnh tranh và tồn kho.
        </Paragraph>

        <Tabs defaultActiveKey="optimization">
          <TabPane 
            tab={
              <span><CalculatorOutlined /> Tối ưu hóa giá</span>
            } 
            key="optimization"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Chiến lược tối ưu hóa">
                  <Row gutter={16}>
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item label="Chiến lược giá">
                        <Select 
                          value={priceStrategies} 
                          onChange={handleStrategyChange}
                          style={{ width: '100%' }}
                        >
                          <Option value="competitive">Dựa trên giá cạnh tranh</Option>
                          <Option value="margin">Dựa trên biên lợi nhuận</Option>
                          <Option value="demand">Dựa trên nhu cầu thị trường</Option>
                          <Option value="inventory">Dựa trên tồn kho</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    {priceStrategies === 'margin' && (
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item 
                          label={
                            <span>
                              Mục tiêu biên lợi nhuận 
                              <Tooltip title="Biên lợi nhuận mục tiêu (%) cho chiến lược giá">
                                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                              </Tooltip>
                            </span>
                          }
                        >
                          <Slider
                            min={0}
                            max={50}
                            value={marginTarget}
                            onChange={handleMarginChange}
                            marks={{
                              0: '0%',
                              10: '10%',
                              20: '20%',
                              30: '30%',
                              40: '40%',
                              50: '50%'
                            }}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item label="Thời gian áp dụng">
                        <RangePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12} lg={6}>
                      <Form.Item label="Hành động">
                        <Button 
                          type="primary" 
                          loading={loading}
                          onClick={() => runOptimization(products, priceStrategies, marginTarget)}
                          icon={<SyncOutlined />}
                          style={{ width: '100%' }}
                        >
                          Chạy tối ưu hóa
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Thống kê tối ưu hóa */}
              <Col span={24}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Tổng thay đổi"
                        value={stats.totalChange}
                        precision={0}
                        valueStyle={{ color: stats.totalChange >= 0 ? '#3f8600' : '#cf1322' }}
                        prefix={stats.totalChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        suffix="VND"
                        formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Thay đổi biên LN trung bình"
                        value={stats.averageMarginChange}
                        precision={2}
                        valueStyle={{ color: stats.averageMarginChange >= 0 ? '#3f8600' : '#cf1322' }}
                        prefix={stats.averageMarginChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        suffix="%"
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Sản phẩm tăng giá"
                        value={stats.productsIncreased}
                        valueStyle={{ color: '#3f8600' }}
                        prefix={<ArrowUpOutlined />}
                        suffix={`/${optimizationResults.length}`}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Card>
                      <Statistic
                        title="Sản phẩm giảm giá"
                        value={stats.productsDecreased}
                        valueStyle={{ color: '#cf1322' }}
                        prefix={<ArrowDownOutlined />}
                        suffix={`/${optimizationResults.length}`}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* Bảng kết quả */}
              <Col span={24}>
                <Card title="Kết quả tối ưu hóa giá">
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Button
                        type="primary"
                        disabled={selectedRows.length === 0}
                        onClick={() => setShowApplyModal(true)}
                      >
                        Áp dụng giá đã chọn ({selectedRows.length})
                      </Button>
                    </Space>
                  </div>
                  
                  <Table
                    rowSelection={{
                      type: 'checkbox',
                      ...rowSelection,
                    }}
                    columns={columns}
                    dataSource={optimizationResults}
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    rowKey="key"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span><LineChartOutlined /> Phân tích giá</span>
            } 
            key="analysis"
          >
            <Alert
              message="Phân tích giá"
              description="Công cụ phân tích giá cả thị trường và xu hướng giá đang được phát triển."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Card title="Phân tích giá cả thị trường">
              <Paragraph>
                Tính năng này sẽ hiển thị:
              </Paragraph>
              <ul>
                <li>So sánh giá của bạn với đối thủ cạnh tranh</li>
                <li>Xu hướng giá theo thời gian</li>
                <li>Phân tích độ nhạy cảm giá</li>
                <li>Phân tích tác động của giá đến doanh số</li>
              </ul>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal xác nhận áp dụng giá */}
      <Modal
        title="Xác nhận thay đổi giá"
        open={showApplyModal}
        onOk={applyPriceChanges}
        onCancel={() => setShowApplyModal(false)}
        okText="Áp dụng"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn áp dụng giá mới cho {selectedRows.length} sản phẩm đã chọn?</p>
        {selectedRows.length > 0 && (
          <>
            <Divider />
            <div>
              {selectedRows.map(row => {
                const result = optimizationResults.find(r => r.key === row.key);
                if (!result) return null;
                
                const change = result.priceChange;
                const color = change > 0 ? '#52c41a' : (change < 0 ? '#f5222d' : '');
                const icon = change > 0 ? <ArrowUpOutlined /> : (change < 0 ? <ArrowDownOutlined /> : null);
                
                return (
                  <div key={row.key} style={{ marginBottom: 8 }}>
                    <Text strong>{row.name}</Text>
                    <div>
                      <Text type="secondary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.currentPrice)}
                        {' → '}
                        <span style={{ color }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.suggestedPrice)}
                          {' '}
                          {icon} {result.priceChangePercent}%
                        </span>
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PriceOptimization; 