// frontend/src/pages/cashier/POS/POSTerminal.jsx
import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Input, 
  Typography, 
  Table, 
  Divider,
  Tag,
  Badge,
  Space,
  InputNumber,
  Drawer,
  List,
  Avatar,
  Tabs,
  message,
  Tooltip,
  Modal
} from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  BarcodeOutlined,
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  CreditCardOutlined,
  DollarOutlined,
  PrinterOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SaveOutlined,
  CheckOutlined
} from '@ant-design/icons';
import './POSTerminal.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

/**
 * Trang POS Terminal cho nhân viên thu ngân
 */
const POSTerminal = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [customerDrawerVisible, setCustomerDrawerVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState(0);
  const [loading, setLoading] = useState(false);

  // Tải dữ liệu sản phẩm và danh mục
  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockProducts = generateMockProducts();
      const mockCategories = [...new Set(mockProducts.map(p => p.category))];
      
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  // Tạo dữ liệu sản phẩm mẫu
  const generateMockProducts = () => {
    return [
      {
        id: 1,
        name: 'Laptop Dell Inspiron 15',
        price: 15000000,
        category: 'Laptop',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799892',
        stock: 25
      },
      {
        id: 2,
        name: 'Màn hình Dell 24"',
        price: 3500000,
        category: 'Màn hình',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799893',
        stock: 42
      },
      {
        id: 3,
        name: 'Chuột không dây Logitech',
        price: 450000,
        category: 'Phụ kiện',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799894',
        stock: 78
      },
      {
        id: 4,
        name: 'Bàn phím cơ AKKO',
        price: 1200000,
        category: 'Phụ kiện',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799895',
        stock: 15
      },
      {
        id: 5,
        name: 'Laptop Acer Nitro 5',
        price: 22000000,
        category: 'Laptop',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799896',
        stock: 12
      },
      {
        id: 6,
        name: 'Tai nghe Sony WH-1000XM4',
        price: 5800000,
        category: 'Âm thanh',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799897',
        stock: 8
      },
      {
        id: 7,
        name: 'Máy tính để bàn HP Pavilion',
        price: 18000000,
        category: 'PC',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799898',
        stock: 10
      },
      {
        id: 8,
        name: 'SSD Samsung 1TB',
        price: 2500000,
        category: 'Linh kiện',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799899',
        stock: 35
      },
      {
        id: 9,
        name: 'RAM Kingston 16GB DDR4',
        price: 1500000,
        category: 'Linh kiện',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799900',
        stock: 28
      },
      {
        id: 10,
        name: 'Card đồ họa NVIDIA RTX 3060',
        price: 9500000,
        category: 'Linh kiện',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799901',
        stock: 5
      },
      {
        id: 11,
        name: 'Máy in HP LaserJet',
        price: 4200000,
        category: 'Máy in',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799902',
        stock: 7
      },
      {
        id: 12,
        name: 'Webcam Logitech C920',
        price: 1800000,
        category: 'Phụ kiện',
        image: 'https://via.placeholder.com/80',
        barcode: '8935236799903',
        stock: 15
      },
    ];
  };

  // Khách hàng mẫu
  const mockCustomers = [
    { id: 1, name: 'Nguyễn Văn A', phone: '0912345678', points: 120 },
    { id: 2, name: 'Trần Thị B', phone: '0923456789', points: 85 },
    { id: 3, name: 'Lê Văn C', phone: '0934567890', points: 210 },
    { id: 4, name: 'Phạm Thị D', phone: '0945678901', points: 45 },
    { id: 5, name: 'Hoàng Văn E', phone: '0956789012', points: 150 },
  ];

  // Lọc sản phẩm dựa trên tìm kiếm và danh mục
  useEffect(() => {
    let result = [...products];
    
    // Lọc theo danh mục
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      const keyword = searchText.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(keyword) || 
          item.barcode.includes(keyword)
      );
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchText, products]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Kiểm tra số lượng tồn kho
      if (existingItem.quantity >= product.stock) {
        message.warning(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
        return;
      }
      
      setCart(
        cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.stock <= 0) {
        message.warning('Sản phẩm đã hết hàng!');
        return;
      }
      
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartItemQuantity = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    
    // Kiểm tra số lượng tồn kho
    if (quantity > product.stock) {
      message.warning(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
      return;
    }
    
    if (quantity <= 0) {
      // Xóa sản phẩm khỏi giỏ hàng nếu số lượng <= 0
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(
        cart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    message.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    Modal.confirm({
      title: 'Xóa giỏ hàng',
      content: 'Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        setCart([]);
        message.success('Đã xóa toàn bộ giỏ hàng');
      }
    });
  };

  // Chọn khách hàng
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDrawerVisible(false);
    message.success(`Đã chọn khách hàng: ${customer.name}`);
  };

  // Tính tổng tiền giỏ hàng
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Xử lý thanh toán
  const handleCheckout = () => {
    setLoading(true);
    
    // Giả lập API call
    setTimeout(() => {
      message.success('Thanh toán thành công!');
      setCart([]);
      setSelectedCustomer(null);
      setCheckoutModalVisible(false);
      setLoading(false);
    }, 1500);
  };

  // Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Tính tiền thối lại
  const calculateChange = () => {
    const total = calculateTotal();
    return amountReceived > total ? amountReceived - total : 0;
  };

  // Cột cho bảng giỏ hàng
  const cartColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={record.image} alt={text} style={{ width: 40, height: 40, marginRight: 10 }} />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.barcode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (
        <div className="quantity-control">
          <Button 
            icon={<MinusOutlined />}
            onClick={() => updateCartItemQuantity(record.id, record.quantity - 1)}
          />
          <InputNumber
            min={1}
            max={record.stock}
            value={text}
            onChange={(value) => updateCartItemQuantity(record.id, value)}
          />
          <Button 
            icon={<PlusOutlined />}
            onClick={() => updateCartItemQuantity(record.id, record.quantity + 1)}
          />
        </div>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'price',
      key: 'total',
      render: (text, record) => formatCurrency(text * record.quantity),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.id)}
        />
      ),
    },
  ];

  // Render sản phẩm theo dạng lưới
  const renderProductGrid = () => {
    return (
      <Row gutter={[16, 16]}>
        {filteredProducts.map((product) => (
          <Col xs={12} sm={8} md={6} lg={6} xl={4} key={product.id}>
            <Card
              hoverable
              cover={<img alt={product.name} src={product.image} style={{ height: 100, objectFit: 'contain' }} />}
              onClick={() => addToCart(product)}
              className="product-card"
            >
              <div className="product-card-content">
                <div className="product-card-title">{product.name}</div>
                <div className="product-card-price">{formatCurrency(product.price)}</div>
                <div className="product-card-stock">
                  <Badge 
                    status={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'} 
                    text={`${product.stock} trong kho`}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Render sản phẩm theo dạng bảng
  const renderProductTable = () => {
    const columns = [
      {
        title: 'Sản phẩm',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={record.image} alt={text} style={{ width: 40, height: 40, marginRight: 10 }} />
            <div>
              <div>{text}</div>
              <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.barcode}</div>
            </div>
          </div>
        ),
      },
      {
        title: 'Danh mục',
        dataIndex: 'category',
        key: 'category',
        render: (text) => <Tag>{text}</Tag>
      },
      {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (text) => formatCurrency(text),
      },
      {
        title: 'Tồn kho',
        dataIndex: 'stock',
        key: 'stock',
        render: (text) => (
          <Badge 
            status={text > 10 ? 'success' : text > 0 ? 'warning' : 'error'} 
            text={text}
          />
        ),
      },
      {
        title: 'Thao tác',
        key: 'action',
        render: (_, record) => (
          <Button 
            type="primary" 
            size="small"
            onClick={() => addToCart(record)}
            disabled={record.stock <= 0}
          >
            Thêm
          </Button>
        ),
      },
    ];
    
    return <Table columns={columns} dataSource={filteredProducts} rowKey="id" pagination={{ pageSize: 6 }} />;
  };

  return (
    <div className="pos-terminal">
      <Row gutter={[16, 16]}>
        {/* Cột trái - Danh sách sản phẩm */}
        <Col xs={24} lg={15}>
          <Card className="full-height-card">
            <div className="pos-header">
              <Title level={4}>Bán hàng</Title>
              <Space>
                <Button 
                  icon={<AppstoreOutlined />} 
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                />
                <Button 
                  icon={<BarsOutlined />}
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                />
              </Space>
            </div>
            
            <div className="pos-search-bar">
              <Search
                placeholder="Nhập tên hoặc quét mã vạch..."
                enterButton={<SearchOutlined />}
                prefix={<BarcodeOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />
            </div>
            
            <div className="pos-categories">
              <Button
                type={selectedCategory === 'all' ? 'primary' : 'default'}
                onClick={() => setSelectedCategory('all')}
              >
                Tất cả
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  type={selectedCategory === category ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <Divider />
            
            <div className="pos-products">
              {viewMode === 'grid' ? renderProductGrid() : renderProductTable()}
            </div>
          </Card>
        </Col>
        
        {/* Cột phải - Giỏ hàng và thanh toán */}
        <Col xs={24} lg={9}>
          <Card className="full-height-card cart-section">
            <div className="cart-header">
              <div className="cart-title">
                <ShoppingCartOutlined />
                <span>Giỏ hàng</span>
                <Badge count={cart.length} showZero />
              </div>
              
              <div className="customer-section">
                <Button 
                  icon={<UserOutlined />} 
                  onClick={() => setCustomerDrawerVisible(true)}
                >
                  {selectedCustomer ? selectedCustomer.name : 'Chọn khách hàng'}
                </Button>
              </div>
            </div>
            
            <div className="cart-content">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <Text type="secondary">Giỏ hàng trống</Text>
                </div>
              ) : (
                <Table
                  columns={cartColumns}
                  dataSource={cart}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </div>
            
            <div className="cart-footer">
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <Text>Tổng sản phẩm:</Text>
                  <Text>{cart.reduce((total, item) => total + item.quantity, 0)} sản phẩm</Text>
                </div>
                
                <div className="cart-summary-row">
                  <Text>Tổng tiền:</Text>
                  <Text strong className="total-amount">{formatCurrency(calculateTotal())}</Text>
                </div>
                
                {selectedCustomer && (
                  <div className="cart-summary-row">
                    <Text>Khách hàng:</Text>
                    <Text>{selectedCustomer.name} ({selectedCustomer.points} điểm)</Text>
                  </div>
                )}
              </div>
              
              <div className="cart-actions">
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  Xóa tất cả
                </Button>
                
                <Button 
                  type="primary"
                  icon={<CreditCardOutlined />}
                  size="large"
                  onClick={() => setCheckoutModalVisible(true)}
                  disabled={cart.length === 0}
                >
                  Thanh toán
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Drawer chọn khách hàng */}
      <Drawer
        title="Chọn khách hàng"
        placement="right"
        onClose={() => setCustomerDrawerVisible(false)}
        visible={customerDrawerVisible}
        width={400}
      >
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm theo tên hoặc SĐT"
            enterButton
          />
        </div>
        
        <List
          itemLayout="horizontal"
          dataSource={mockCustomers}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  type="primary"
                  size="small"
                  onClick={() => selectCustomer(item)}
                >
                  Chọn
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={item.name}
                description={
                  <div>
                    <div>SĐT: {item.phone}</div>
                    <div>Điểm tích lũy: {item.points}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
      
      {/* Modal thanh toán */}
      <Modal
        title="Thanh toán"
        visible={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="checkout-modal">
          <div className="checkout-summary">
            <Title level={4}>Tổng quan đơn hàng</Title>
            
            <div className="checkout-items">
              <div className="checkout-item-header">
                <Text strong>Sản phẩm</Text>
                <Text strong>SL</Text>
                <Text strong>Thành tiền</Text>
              </div>
              
              {cart.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <Text>{item.name}</Text>
                  <Text>{item.quantity}</Text>
                  <Text>{formatCurrency(item.price * item.quantity)}</Text>
                </div>
              ))}
            </div>
            
            <Divider />
            
            <div className="checkout-total">
              <Text strong>Tổng tiền:</Text>
              <Text strong className="checkout-total-amount">
                {formatCurrency(calculateTotal())}
              </Text>
            </div>
            
            {selectedCustomer && (
              <div className="checkout-customer">
                <Text>Khách hàng: {selectedCustomer.name}</Text>
                <Text>Điểm tích lũy: {selectedCustomer.points}</Text>
              </div>
            )}
          </div>
          
          <div className="payment-section">
            <Title level={4}>Phương thức thanh toán</Title>
            
            <div className="payment-methods">
              <div className="payment-method-selection">
                <Button
                  type={paymentMethod === 'cash' ? 'primary' : 'default'}
                  icon={<DollarOutlined />}
                  size="large"
                  onClick={() => setPaymentMethod('cash')}
                >
                  Tiền mặt
                </Button>
                
                <Button
                  type={paymentMethod === 'card' ? 'primary' : 'default'}
                  icon={<CreditCardOutlined />}
                  size="large"
                  onClick={() => setPaymentMethod('card')}
                >
                  Thẻ
                </Button>
              </div>
              
              {paymentMethod === 'cash' && (
                <div className="cash-payment">
                  <div className="amount-input">
                    <Text>Tiền khách đưa:</Text>
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      size="large"
                      min={calculateTotal()}
                      onChange={setAmountReceived}
                    />
                  </div>
                  
                  <div className="change-amount">
                    <Text>Tiền thối lại:</Text>
                    <Text strong>{formatCurrency(calculateChange())}</Text>
                  </div>
                </div>
              )}
            </div>
            
            <div className="payment-actions">
              <Button
                onClick={() => setCheckoutModalVisible(false)}
              >
                Hủy
              </Button>
              
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="large"
                loading={loading}
                onClick={handleCheckout}
              >
                Hoàn tất thanh toán
              </Button>
              
              <Tooltip title="Lưu đơn chờ">
                <Button
                  icon={<SaveOutlined />}
                  onClick={() => {
                    message.success('Đã lưu đơn hàng chờ');
                    setCheckoutModalVisible(false);
                  }}
                >
                  Lưu
                </Button>
              </Tooltip>
              
              <Tooltip title="In hóa đơn">
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => message.info('Đang in hóa đơn...')}
                >
                  In
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default POSTerminal;