import {
    BarcodeOutlined,
    DollarOutlined,
    PrinterOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Input,
    InputNumber,
    Layout,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tabs,
    Tag,
    Typography,
    message,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import './POSTerminal.css';

// Services
import customerService from '../../../services/api/customerService';
import orderService from '../../../services/api/orderService';
import productService from '../../../services/api/productService';
import barcodeService from '../../../services/hardware/barcodeService';
import printerService from '../../../services/hardware/printerService';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

/**
 * POS Terminal Component
 * Main interface for the Point of Sale system
 */
const POSTerminal = () => {
  // Auth context
  const { user } = useAuth();

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [discount, setDiscount] = useState({
    type: 'none',
    value: 0,
    reason: ''
  });
  
  // Refs
  const barcodeInputRef = useRef(null);
  
  // Setup hardware
  useEffect(() => {
    initHardware();
    
    return () => {
      // Clean up hardware
      barcodeService.disconnect();
    };
  }, []);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Initialize hardware connections
  const initHardware = async () => {
    try {
      // Initialize barcode scanner
      await barcodeService.init((barcode) => {
        handleBarcodeScanned(barcode);
      });
      
      // Initialize receipt printer
      await printerService.init();
      
      message.success('Thiết bị phần cứng đã được kết nối');
    } catch (err) {
      console.error('Hardware initialization error:', err);
      message.warning('Không thể kết nối với một số thiết bị phần cứng. Hệ thống vẫn hoạt động bình thường.');
    }
  };
  
  // Fetch products and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products
      const productsResponse = await productService.getProducts();
      if (!productsResponse.success) {
        throw new Error('Failed to fetch products');
      }
      
      // Fetch categories
      const categoriesResponse = await productService.getCategories();
      if (!categoriesResponse.success) {
        throw new Error('Failed to fetch categories');
      }
      
      setProducts(productsResponse.data);
      setFilteredProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Failed to load POS data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle barcode scanner input
   */
  const handleBarcodeScanned = async (barcode) => {
    try {
      const product = await productService.getProductByBarcode(barcode);
      if (product.success && product.data) {
        addToCart(product.data);
        message.success(`Đã thêm: ${product.data.name}`);
      } else {
        message.error('Không tìm thấy sản phẩm');
      }
    } catch (err) {
      console.error('Barcode scan error:', err);
      message.error('Lỗi khi quét mã vạch');
    }
  };
  
  /**
   * Search products by name or code
   */
  const handleSearch = (value) => {
    setSearchValue(value);
    
    if (!value) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(value.toLowerCase()))
    );
    
    setFilteredProducts(filtered);
  };
  
  /**
   * Filter products by category
   */
  const filterProductsByCategory = (categoryId) => {
    if (!categoryId) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => product.category_id === categoryId);
    setFilteredProducts(filtered);
  };
  
  /**
   * Add product to cart
   */
  const addToCart = (product) => {
    setCart(prevCart => {
      // Check if product already in cart
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if already in cart
        return prevCart.map(item => 
          item.id === product.id 
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price
              } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price
        }];
      }
    });
  };
  
  /**
   * Update cart item quantity
   */
  const updateCartItemQuantity = (productId, quantity) => {
    if (!quantity || quantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { 
              ...item, 
              quantity,
              subtotal: quantity * item.price
            } 
          : item
      )
    );
  };
  
  /**
   * Remove item from cart
   */
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  /**
   * Calculate cart total
   */
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };
  
  /**
   * Search customers by name or phone
   */
  const handleCustomerSearch = async (value) => {
    if (!value || value.length < 2) {
      setCustomerSearchResults([]);
      return;
    }
    
    try {
      const response = await customerService.searchCustomers(value);
      
      if (response.success) {
        setCustomerSearchResults(response.data);
      } else {
        setCustomerSearchResults([]);
      }
    } catch (error) {
      console.error('Customer search error:', error);
      message.error('Lỗi tìm kiếm khách hàng');
    }
  };
  
  /**
   * Select a customer for the order
   */
  const selectCustomer = (selectedCustomer) => {
    setCustomer(selectedCustomer);
    setCustomerModalVisible(false);
  };
  
  /**
   * Clear selected customer
   */
  const clearCustomer = () => {
    setCustomer(null);
  };
  
  /**
   * Open payment modal
   */
  const openPaymentModal = () => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống');
      return;
    }
    
    // Set default cash received amount to the total
    setCashReceived(calculateTotal());
    setPaymentModalVisible(true);
  };
  
  /**
   * Process payment
   */
  const handlePayment = async () => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống');
      return;
    }
    
    setProcessingPayment(true);
    setPaymentResult(null);
    
    try {
      // Calculate totals with tax and discount
      const subtotal = calculateTotal();
      const taxRate = 0.1; // 10% tax
      
      // Apply discount if any
      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = subtotal * (discount.value / 100);
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      }
      
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * taxRate;
      const totalAmount = taxableAmount + taxAmount;
      
      // Create order data
      const orderData = {
        customer_id: customer?.id || null,
        cashier_id: user.id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.subtotal
        })),
        subtotal: subtotal,
        discount_type: discount.type,
        discount_value: discount.value,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        notes: discount.reason || (customer ? `Khách hàng: ${customer.name}` : '')
      };
      
      // Payment data
      const paymentData = {
        payment_method: paymentMethod,
        amount: totalAmount
      };
      
      if (paymentMethod === 'cash') {
        paymentData.amount_received = cashReceived;
        paymentData.change_amount = cashReceived - totalAmount;
      }
      
      // Process order with payment
      const result = await orderService.processPOSOrder(
        orderData,
        paymentData,
        true, // Print receipt
        paymentMethod === 'cash' // Open cash drawer for cash payments
      );
      
      // Set payment result
      setPaymentResult(result);
      setOrderCompleted(true);
      
      // Clear cart after successful payment
      message.success('Thanh toán thành công!');
      
      // Don't clear cart yet, wait for user to start new order
    } catch (error) {
      console.error('Payment error:', error);
      message.error('Lỗi thanh toán: ' + (error.message || 'Không xác định'));
    } finally {
      setProcessingPayment(false);
      setPaymentModalVisible(false);
    }
  };
  
  /**
   * Start a new order after completion
   */
  const startNewOrder = () => {
    setCart([]);
    setCustomer(null);
    setDiscount({ type: 'none', value: 0, reason: '' });
    setOrderCompleted(false);
    setPaymentResult(null);
    message.success('Đã bắt đầu đơn hàng mới');
    
    // Focus barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Function to update order with payment information
  const updateOrderPayment = async (orderData, paymentResult) => {
    // Update order with payment information
    const orderResponse = await orderService.updateOrder({
      ...orderData,
      payment_status: 'completed',
      transaction_id: paymentResult.transaction_id
    });
    
    if (orderResponse.success) {
      // Print receipt
      await printerService.printReceipt({
        storeName: 'KhoChuan POS',
        address: '123 Main Street, Ho Chi Minh City',
        orderNumber: orderResponse.data.order_number,
        date: new Date().toLocaleString(),
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: orderData.subtotal,
        tax: orderData.tax_amount,
        total: orderData.total_amount,
        paymentMethod: paymentMethod === 'cash' ? 'Cash' : 'Card/Digital',
        cashier: user.name
      });
      
      message.success('Payment completed successfully');
      
      // Clear cart and reset
      setCart([]);
      setCustomer(null);
      setPaymentModalVisible(false);
    } else {
      throw new Error('Failed to create order');
    }
  };

  const cartColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: price => `${price.toLocaleString()} ₫`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateCartItemQuantity(record.id, value)}
        />
      ),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: subtotal => `${subtotal.toLocaleString()} ₫`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="text" danger onClick={() => removeFromCart(record.id)}>
          Remove
        </Button>
      ),
    },
  ];

  const productColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: price => `${price.toLocaleString()} ₫`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock',
      render: stock => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => addToCart(record)}
          disabled={record.stock_quantity <= 0}
        >
          Add
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Loading POS Terminal...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Title level={3}>Error Loading POS Terminal</Title>
        <Text type="danger">{error}</Text>
        <Button type="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Layout className="pos-terminal">
      <Row gutter={16}>
        {/* Left Side - Cart */}
        <Col span={12}>
          <Card title="Shopping Cart" className="cart-container">
            <div className="customer-section">
              {customer ? (
                <div className="selected-customer">
                  <UserOutlined /> {customer.name} ({customer.phone})
                  <Button type="link" onClick={clearCustomer}>Change</Button>
                </div>
              ) : (
                <Button 
                  icon={<UserOutlined />} 
                  onClick={() => setCustomerModalVisible(true)}
                >
                  Select Customer
                </Button>
              )}
            </div>
            
            <Table
              dataSource={cart}
              columns={cartColumns}
              rowKey="id"
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}><strong>Total</strong></Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <strong>{calculateTotal().toLocaleString()} ₫</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
            
            <div className="cart-actions">
              <Button 
                type="primary" 
                size="large" 
                icon={<DollarOutlined />} 
                onClick={openPaymentModal}
                disabled={cart.length === 0}
              >
                Payment
              </Button>
              <Button 
                danger 
                size="large" 
                onClick={() => setCart([])}
                disabled={cart.length === 0}
              >
                Clear Cart
              </Button>
            </div>
            
            {/* Order completed message */}
            {orderCompleted && (
              <div className="order-completed">
                <Title level={4}>Order #{paymentResult?.order_number} Completed</Title>
                <p>Total: {paymentResult?.total_amount.toLocaleString()} ₫</p>
                <p>Payment Method: {paymentMethod === 'cash' ? 'Cash' : 'Card/Digital'}</p>
                
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PrinterOutlined />}
                    onClick={() => printerService.printLastReceipt()}
                  >
                    Print Receipt
                  </Button>
                  <Button onClick={startNewOrder}>
                    New Order
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </Col>
        
        {/* Right Side - Products */}
        <Col span={12}>
          <Card title="Products" className="products-container">
            {/* Barcode Scanner Input */}
            <Input
              placeholder="Scan barcode or enter product code"
              prefix={<BarcodeOutlined />}
              className="barcode-input"
              ref={barcodeInputRef}
              onPressEnter={(e) => handleBarcodeScanned(e.target.value)}
            />
            
            {/* Search and Categories */}
            <div className="product-filters">
              <Input
                placeholder="Search products..."
                prefix={<SearchOutlined />}
                className="product-search"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
              />
              
              <Tabs defaultActiveKey="all">
                <TabPane tab="All" key="all" onClick={() => setFilteredProducts(products)} />
                {categories.map(category => (
                  <TabPane 
                    tab={category.name} 
                    key={category.id.toString()} 
                    onClick={() => filterProductsByCategory(category.id)} 
                  />
                ))}
              </Tabs>
            </div>
            
            {/* Products Table */}
            <Table
              dataSource={filteredProducts}
              columns={productColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
      
      {/* Customer Selection Modal */}
      <Modal
        title="Select Customer"
        visible={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        footer={null}
        width={700}
      >
        <Input.Search
          placeholder="Search by name or phone..."
          onSearch={handleCustomerSearch}
          enterButton
        />
        
        <Table
          dataSource={customerSearchResults}
          columns={[
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
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Button type="primary" onClick={() => selectCustomer(record)}>
                  Select
                </Button>
              ),
            },
          ]}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>
      
      {/* Payment Modal */}
      <Modal
        title="Payment"
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={500}
      >
        <Spin spinning={processingPayment}>
          <div className="payment-summary">
            <p>Subtotal: {calculateTotal().toLocaleString()} ₫</p>
            <p>Tax (10%): {(calculateTotal() * 0.1).toLocaleString()} ₫</p>
            <Title level={4}>Total: {(calculateTotal() * 1.1).toLocaleString()} ₫</Title>
          </div>
          
          <div className="payment-method">
            <Title level={5}>Payment Method</Title>
            <Select 
              value={paymentMethod} 
              onChange={value => setPaymentMethod(value)}
              style={{ width: '100%', marginBottom: 16 }}
            >
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="vnpay">VNPay</Option>
              <Option value="momo">MoMo</Option>
              <Option value="zalopay">ZaloPay</Option>
            </Select>
            
            {paymentMethod === 'cash' && (
              <div className="cash-payment">
                <div className="cash-input">
                  <span>Cash Received:</span>
                  <InputNumber
                    min={0}
                    value={cashReceived}
                    onChange={value => setCashReceived(value)}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div className="cash-change">
                  <span>Change:</span>
                  <span className="change-amount">
                    {Math.max(0, cashReceived - (calculateTotal() * 1.1)).toLocaleString()} ₫
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="payment-actions">
            <Button
              type="primary"
              size="large"
              onClick={handlePayment}
              disabled={processingPayment}
              block
            >
              Complete Payment
            </Button>
          </div>
        </Spin>
      </Modal>
    </Layout>
  );
};

export default POSTerminal; 