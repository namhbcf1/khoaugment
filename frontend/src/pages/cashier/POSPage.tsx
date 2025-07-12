import { DeleteOutlined, MinusOutlined, PlusOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, List, Modal, Row, Select, Spin, Tabs, Tag, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Customer, Product, customersAPI, ordersAPI, productsAPI } from '../../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface CheckoutFormValues {
  customer_id?: number;
  payment_method: 'cash' | 'card' | 'vnpay' | 'momo' | 'zalopay';
  discount_amount: number;
  notes?: string;
}

const POSPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [checkoutForm] = Form.useForm<CheckoutFormValues>();

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + tax;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsData = await productsAPI.getAll();
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Extract categories from products
        const uniqueCategories = Array.from(
          new Set(
            productsData
              .filter(p => p.category_id)
              .map(p => p.category_id)
          )
        );
        
        // Create categories array
        const categoriesData = uniqueCategories.map(id => {
          const product = productsData.find(p => p.category_id === id);
          return {
            id: id!,
            name: product?.category_name || `Danh mục ${id}`
          };
        });
        
        setCategories(categoriesData);
        
        // Fetch customers
        const customersData = await customersAPI.getAll();
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter products based on search and category
  useEffect(() => {
    let filtered = [...products];
    
    // Filter by search term
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.barcode?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchValue, selectedCategory, products]);
  
  // Add product to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Increment quantity if already in cart
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { id: product.id, product, quantity: 1 }];
      }
    });
    
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };
  
  // Remove product from cart
  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  
  // Update cart item quantity
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  // Handle checkout
  const handleCheckout = async (values: CheckoutFormValues) => {
    if (cart.length === 0) {
      message.error('Giỏ hàng trống. Vui lòng thêm sản phẩm để thanh toán.');
      return;
    }
    
    setCheckoutLoading(true);
    
    try {
      // Prepare order data
      const orderData = {
        customer_id: values.customer_id,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price
        })),
        payment_method: values.payment_method,
        discount_amount: values.discount_amount || 0,
        notes: values.notes
      };
      
      // Create order
      const result = await ordersAPI.create(orderData);
      
      // Show success message
      message.success(`Đơn hàng #${result.order_number} đã được tạo thành công!`);
      
      // Reset cart and close modal
      setCart([]);
      setCheckoutModalVisible(false);
      checkoutForm.resetFields();
      
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Không thể tạo đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="pos-container">
      <Row gutter={[16, 16]}>
        {/* Product listing */}
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Input
                placeholder="Tìm kiếm sản phẩm theo tên hoặc mã vạch"
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                style={{ marginBottom: 16 }}
                allowClear
              />
              
              <Tabs 
                defaultActiveKey="all"
                onChange={key => setSelectedCategory(key === 'all' ? null : Number(key))}
              >
                <TabPane tab="Tất cả" key="all" />
                {categories.map(category => (
                  <TabPane tab={category.name} key={category.id.toString()} />
                ))}
              </Tabs>
            </div>
            
            <div className="products-grid">
              <Row gutter={[16, 16]}>
                {filteredProducts.map(product => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Card
                      hoverable
                      onClick={() => addToCart(product)}
                      style={{ height: '100%' }}
                      cover={
                        product.image_url ? (
                          <img 
                            alt={product.name} 
                            src={product.image_url} 
                            style={{ height: 120, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ 
                            height: 120, 
                            background: '#f5f5f5', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <ShoppingCartOutlined style={{ fontSize: 36, color: '#d9d9d9' }} />
                          </div>
                        )
                      }
                    >
                      <Card.Meta 
                        title={product.name} 
                        description={
                          <>
                            <div>{formatCurrency(product.price)}</div>
                            {product.stock <= 0 ? (
                              <Tag color="red">Hết hàng</Tag>
                            ) : product.stock <= product.min_stock ? (
                              <Tag color="orange">Sắp hết ({product.stock})</Tag>
                            ) : (
                              <Tag color="green">Còn hàng ({product.stock})</Tag>
                            )}
                          </>
                        } 
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>
        
        {/* Shopping cart */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Giỏ hàng</span>
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    if (cart.length > 0) {
                      Modal.confirm({
                        title: 'Xóa giỏ hàng',
                        content: 'Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?',
                        onOk: () => setCart([]),
                      });
                    }
                  }}
                  disabled={cart.length === 0}
                >
                  Xóa tất cả
                </Button>
              </div>
            }
            style={{ height: '100%' }}
          >
            <List
              dataSource={cart}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />} 
                      onClick={() => removeFromCart(item.product.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={item.product.name}
                    description={formatCurrency(item.product.price)}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button 
                        icon={<MinusOutlined />} 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        size="small"
                      />
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={value => updateQuantity(item.product.id, value || 1)}
                        style={{ width: 60, margin: '0 8px' }}
                        size="small"
                      />
                      <Button 
                        icon={<PlusOutlined />} 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        size="small"
                      />
                    </div>
                    <Text strong style={{ display: 'block', textAlign: 'right', marginTop: 8 }}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </Text>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: 'Giỏ hàng trống' }}
              style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}
            />
            
            <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col>Tạm tính:</Col>
                <Col>{formatCurrency(subtotal)}</Col>
              </Row>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col>Thuế (10%):</Col>
                <Col>{formatCurrency(tax)}</Col>
              </Row>
              <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Col>
                  <Text strong>Tổng cộng:</Text>
                </Col>
                <Col>
                  <Text strong style={{ fontSize: 18 }}>{formatCurrency(total)}</Text>
                </Col>
              </Row>
              
              <Button 
                type="primary" 
                size="large" 
                block
                icon={<ShoppingCartOutlined />}
                onClick={() => setCheckoutModalVisible(true)}
                disabled={cart.length === 0}
              >
                Thanh toán
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Checkout Modal */}
      <Modal
        title="Thanh toán"
        open={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={checkoutForm}
          layout="vertical"
          onFinish={handleCheckout}
          initialValues={{
            payment_method: 'cash',
            discount_amount: 0
          }}
        >
          <Form.Item
            name="customer_id"
            label="Khách hàng"
          >
            <Select
              placeholder="Chọn khách hàng (không bắt buộc)"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {customers.map(customer => (
                <Select.Option key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone ? `- ${customer.phone}` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payment_method"
            label="Phương thức thanh toán"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
          >
            <Select>
              <Select.Option value="cash">Tiền mặt</Select.Option>
              <Select.Option value="card">Thẻ tín dụng/ghi nợ</Select.Option>
              <Select.Option value="vnpay">VNPay</Select.Option>
              <Select.Option value="momo">MoMo</Select.Option>
              <Select.Option value="zalopay">ZaloPay</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="discount_amount"
            label="Giảm giá"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              min={0}
              step={1000}
            />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <div style={{ marginBottom: 16 }}>
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Col>Tạm tính:</Col>
              <Col>{formatCurrency(subtotal)}</Col>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Col>Thuế (10%):</Col>
              <Col>{formatCurrency(tax)}</Col>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Col>Giảm giá:</Col>
              <Col>{formatCurrency(checkoutForm.getFieldValue('discount_amount') || 0)}</Col>
            </Row>
            <Row justify="space-between" style={{ marginBottom: 16 }}>
              <Col>
                <Text strong>Tổng cộng:</Text>
              </Col>
              <Col>
                <Text strong style={{ fontSize: 18 }}>
                  {formatCurrency(total - (checkoutForm.getFieldValue('discount_amount') || 0))}
                </Text>
              </Col>
            </Row>
          </div>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={checkoutLoading} block>
              Hoàn tất thanh toán
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default POSPage; 