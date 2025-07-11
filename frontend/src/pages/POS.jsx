import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import BarcodeScanner from '../components/BarcodeScanner';
import CustomerModal from '../components/CustomerModal';
import CheckoutModal from '../components/CheckoutModal';
import {
  Row, Col, Card, Button, Input, Space, Table, Tag, Avatar, Empty,
  Typography, Divider, Form, Select, Radio, InputNumber, Modal,
  Drawer, notification, message, Alert
} from 'antd';
import {
  ShoppingCartOutlined, SearchOutlined, DeleteOutlined, PlusOutlined,
  MinusOutlined, ClearOutlined, CreditCardOutlined, DollarOutlined,
  QrcodeOutlined, UserOutlined, UserAddOutlined, PrinterOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ShopOutlined
} from '@ant-design/icons';
import { api } from '../services/api';
import { MetricCard, PageHeader, LoadingSkeleton } from '../components/ui/DesignSystem';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const POS = () => {
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [customerDrawer, setCustomerDrawer] = useState(false);
  const [paymentForm] = Form.useForm();
  
  // New modal states
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCustomers();
  }, []);

  // Filter products when search term or category changes
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: { page: 1, limit: 50 }
      });
      if (response.data.success) {
        setProducts(response.data.data.products || []);
      } else {
        setProducts(getMockProducts());
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories([
          { id: 'all', name: 'All Products' },
          ...(response.data.data.categories || [])
        ]);
      } else {
        setCategories([
          { id: 'all', name: 'All Products' },
          ...getMockCategories()
        ]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([
        { id: 'all', name: 'All Products' },
        ...getMockCategories()
      ]);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers', {
        params: { limit: 100 }
      });
      if (response.data.success) {
        setCustomers(response.data.data.customers || []);
      } else {
        setCustomers(getMockCustomers());
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers(getMockCustomers());
    }
  };

  const filterProducts = () => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  };

  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
  }, []);

  // Calculate order summary
  const orderSummary = React.useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const discount = selectedCustomer?.discount || 0;
    const total = subtotal + tax - discount;
    
    return { subtotal, tax, discount, total };
  }, [cart, selectedCustomer]);

  // Handle barcode scanning
  const handleBarcodeScanned = useCallback(async (barcode) => {
    try {
      const product = products.find(p => p.barcode === barcode || p.sku === barcode);
      if (product) {
        addToCart(product);
        notification.success({
          message: 'Sản phẩm đã được thêm',
          description: `${product.name} đã được thêm vào giỏ hàng`
        });
        return;
      }

      const response = await api.get(`/products/${barcode}`);
      if (response.data.success) {
        addToCart(response.data.data);
        notification.success({
          message: 'Sản phẩm đã được thêm',
          description: `${response.data.data.name} đã được thêm vào giỏ hàng`
        });
      } else {
        notification.error({
          message: 'Không tìm thấy sản phẩm',
          description: 'Không tìm thấy sản phẩm với mã vạch này'
        });
      }
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi tìm sản phẩm'
      });
    }
  }, [products, addToCart]);

  // Handle customer creation
  const handleCustomerCreated = useCallback((newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    setSelectedCustomer(newCustomer);
    notification.success({
      message: 'Khách hàng đã được tạo',
      description: `${newCustomer.name} đã được thêm vào hệ thống`
    });
  }, []);

  // Handle payment
  const handlePayment = async (paymentData) => {
    try {
      setLoading(true);

      const orderData = {
        customer_id: selectedCustomer?.id || null,
        cashier_id: user.id,
        location_id: 'loc-001',
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          discount_amount: 0,
          total_price: item.price * item.quantity
        })),
        subtotal: orderSummary.subtotal,
        tax_amount: orderSummary.tax,
        discount_amount: orderSummary.discount,
        total: orderSummary.total,
        payment_method: paymentData.method,
        notes: paymentData.notes || '',
        metadata: {
          payment_method: paymentData.method,
          cashier_name: user.name,
          customer_name: selectedCustomer?.name
        }
      };

      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        const order = {
          ...response.data.data,
          items: cart,
          customer_name: selectedCustomer?.name,
          customer_email: selectedCustomer?.email,
          customer_phone: selectedCustomer?.phone,
          cashier_name: user.name,
          location_name: 'KhoChuan Store Main',
          payment_method: paymentData.method
        };

        setCurrentOrder(order);
        setShowCheckoutModal(true);
        
        clearCart();
        setPaymentModal(false);
        paymentForm.resetFields();
        
        notification.success({
          message: 'Thanh toán thành công',
          description: `Đơn hàng #${response.data.data.order_number} đã được xử lý thành công!`
        });
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi xử lý đơn hàng');
      }
    } catch (error) {
      console.error('Payment error:', error);
      notification.error({
        message: 'Payment Failed',
        description: error.message || 'An error occurred while processing payment'
      });
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (order) => {
    console.log('Printing receipt for order:', order);
  };

  const handleNewOrder = () => {
    setSelectedCustomer(null);
    setCurrentOrder(null);
    setTimeout(() => {
      const searchInput = document.querySelector('.ant-input[placeholder*="Search"]');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Mock data functions
  const getMockProducts = () => [
    { id: 1, name: 'Coca Cola 330ml', price: 12000, category: 'Beverages', stock: 50, sku: 'CC-330', barcode: '8934673123456' },
    { id: 2, name: 'Pepsi 330ml', price: 11000, category: 'Beverages', stock: 30, sku: 'PP-330', barcode: '8934673123457' },
    { id: 3, name: 'Bánh mì sandwich', price: 25000, category: 'Food', stock: 20, sku: 'BM-SW', barcode: '8934673123458' },
    { id: 4, name: 'Mì tôm Hảo Hảo', price: 5000, category: 'Food', stock: 100, sku: 'MT-HH', barcode: '8934673123459' },
    { id: 5, name: 'Cà phê đen', price: 20000, category: 'Beverages', stock: 25, sku: 'CF-BK', barcode: '8934673123460' }
  ];

  const getMockCategories = () => [
    { id: 1, name: 'Beverages' },
    { id: 2, name: 'Food' },
    { id: 3, name: 'Snacks' }
  ];

  const getMockCustomers = () => [
    { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@email.com' },
    { id: 2, name: 'Trần Thị B', phone: '0907654321', email: 'tranthib@email.com' },
    { id: 3, name: 'Lê Văn C', phone: '0912345678', email: 'levanc@email.com' }
  ];

  // Customer table columns
  const customerColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Action',
      key: 'action',
      render: (record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedCustomer(record);
            setCustomerDrawer(false);
          }}
        >
          Select
        </Button>
      )
    }
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Header */}
      <div style={{
        padding: '16px 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
            <ShoppingCartOutlined /> KhoChuan POS
          </Title>
          <Text type="secondary">Cashier: {user?.name}</Text>
        </div>
        <Space>
          <Button
            icon={<QrcodeOutlined />}
            onClick={() => setShowBarcodeScanner(true)}
            type="primary"
          >
            Quét mã
          </Button>
          <Button
            icon={<UserAddOutlined />}
            onClick={() => setShowCustomerModal(true)}
          >
            Khách hàng
          </Button>
        </Space>
      </div>

      <div style={{ padding: '16px', flex: 1 }}>

      <Row gutter={16} style={{ flex: 1 }}>
        {/* Products Section */}
        <Col span={16}>
          <Card
            title="Products"
            style={{ height: '100%' }}
            bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' }}
          >
            {/* Search */}
            <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <Input.Group compact>
                <Search
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onPressEnter={(e) => {
                    const value = e.target.value.trim();
                    if (value.length >= 8) {
                      handleBarcodeScanned(value);
                    }
                  }}
                  prefix={<QrcodeOutlined />}
                  enterButton={<SearchOutlined />}
                  size="large"
                  style={{ width: 'calc(100% - 50px)' }}
                />
                <Button
                  type="primary"
                  icon={<QrcodeOutlined />}
                  size="large"
                  onClick={() => setShowBarcodeScanner(true)}
                  style={{ width: '50px' }}
                  title="Quét mã vạch"
                />
              </Input.Group>
            </div>

            {/* Categories */}
            <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
              <Space wrap>
                <Button
                  type={selectedCategory === 'all' ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    type={selectedCategory === category.name ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </Button>
                ))}
              </Space>
            </div>

            {/* Products Grid */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              <Row gutter={[8, 8]}>
                {filteredProducts.map(product => (
                  <Col xs={12} sm={8} md={6} lg={4} key={product.id}>
                    <Card
                      hoverable
                      size="small"
                      onClick={() => addToCart(product)}
                      style={{
                        height: '120px',
                        cursor: 'pointer',
                        border: cart.find(item => item.id === product.id) ? '2px solid #1890ff' : '1px solid #d9d9d9'
                      }}
                      bodyStyle={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <Text strong style={{ fontSize: '12px', lineHeight: '14px' }}>
                          {product.name}
                        </Text>
                      </div>
                      <div>
                        <Text type="primary" strong>
                          {formatCurrency(product.price)}
                        </Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: '10px' }}>
                            Stock: {product.stock || 0}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>

        {/* Cart Section */}
        <Col span={8}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Cart ({cart.length})</span>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => setCustomerDrawer(true)}
                  type={selectedCustomer ? 'primary' : 'default'}
                >
                  {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  danger
                >
                  Clear
                </Button>
              </Space>
            }
            style={{ height: '100%' }}
            bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' }}
          >
            {/* Cart Items */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              {cart.length === 0 ? (
                <Empty description="Cart is empty" />
              ) : (
                cart.map((item) => (
                  <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                    <Row align="middle">
                      <Col span={12}>
                        <div>
                          <Text strong>{item.name}</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {formatCurrency(item.price)} each
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <Space>
                          <Button
                            size="small"
                            icon={<MinusOutlined />}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          />
                          <Text>{item.quantity}</Text>
                          <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          />
                        </Space>
                      </Col>
                      <Col span={4}>
                        <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                      </Col>
                      <Col span={2}>
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeFromCart(item.id)}
                          danger
                        />
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row justify="space-between">
                  <Col>Subtotal:</Col>
                  <Col>{formatCurrency(orderSummary.subtotal)}</Col>
                </Row>
                <Row justify="space-between">
                  <Col>Tax:</Col>
                  <Col>{formatCurrency(orderSummary.tax)}</Col>
                </Row>
                <Row justify="space-between">
                  <Col>Discount:</Col>
                  <Col>{formatCurrency(orderSummary.discount)}</Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between">
                  <Col><Text strong>Total:</Text></Col>
                  <Col><Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                    {formatCurrency(orderSummary.total)}
                  </Text></Col>
                </Row>
              </Space>
            </div>

            {/* Checkout Button */}
            <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
              <Button
                type="primary"
                size="large"
                block
                icon={<CreditCardOutlined />}
                onClick={() => setPaymentModal(true)}
                disabled={cart.length === 0}
                loading={loading}
              >
                Checkout
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Customer Drawer */}
      <Drawer
        title="Select Customer"
        placement="right"
        onClose={() => setCustomerDrawer(false)}
        open={customerDrawer}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="Search customers..."
            enterButton="Search"
            size="large"
          />

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setShowCustomerModal(true);
              setCustomerDrawer(false);
            }}
            block
            style={{ marginBottom: 16 }}
          >
            Thêm khách hàng mới
          </Button>

          <Table
            columns={customerColumns}
            dataSource={customers}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
          />

          <Button
            block
            onClick={() => {
              setSelectedCustomer(null);
              setCustomerDrawer(false);
            }}
          >
            Continue without customer
          </Button>
        </Space>
      </Drawer>

      {/* Payment Modal */}
      <Modal
        title="Payment"
        open={paymentModal}
        onCancel={() => setPaymentModal(false)}
        footer={null}
        width={500}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePayment}
        >
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row justify="space-between">
              <Col><Text strong>Total Amount:</Text></Col>
              <Col><Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                {formatCurrency(orderSummary.total)}
              </Text></Col>
            </Row>
          </Card>

          <Form.Item
            name="method"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="cash">
                  <Space>
                    <DollarOutlined />
                    Cash
                  </Space>
                </Radio>
                <Radio value="card">
                  <Space>
                    <CreditCardOutlined />
                    Credit Card
                  </Space>
                </Radio>
                <Radio value="qr">
                  <Space>
                    <QrcodeOutlined />
                    QR Code
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount Received"
            rules={[{ required: true, message: 'Please enter amount' }]}
            initialValue={orderSummary.total}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={orderSummary.total}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setPaymentModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Process Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modals */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
      />

      <CustomerModal
        visible={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />

      <CheckoutModal
        visible={showCheckoutModal}
        order={currentOrder}
        onClose={() => setShowCheckoutModal(false)}
        onPrintReceipt={printReceipt}
        onNewOrder={handleNewOrder}
      />
      </div>
    </div>
  );
};

export default POS;
