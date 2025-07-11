import React, { useState, useEffect, useContext } from 'react';
import {
  Card, Table, Button, InputNumber, Space, Typography, Tag,
  Popconfirm, message, Divider, Row, Col, Input, Select,
  Affix, Tooltip, Empty
} from 'antd';
import {
  DeleteOutlined, EditOutlined, PlusOutlined, MinusOutlined,
  ShoppingCartOutlined, CloseOutlined, SaveOutlined,
  PercentageOutlined, GiftOutlined, TagOutlined
} from '@ant-design/icons';
import { useCartContext } from '../../../utils/context/CartContext';
import { formatCurrency } from '../../../utils/helpers/formatters';
import barcodeScanner from '../../../services/hardware/barcodeScanner';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

/**
 * Component quản lý giỏ hàng trong giao diện bán hàng POS
 */
const CartManager = ({ onCheckout, onCustomerSelect }) => {
  // Context giỏ hàng
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount,
    totalAmount,
    totalItems,
    totalDiscount,
    netAmount
  } = useCartContext();

  // State quản lý UI
  const [searchValue, setSearchValue] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [discountType, setDiscountType] = useState('percent'); // 'percent' hoặc 'amount'
  const [discountValue, setDiscountValue] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [barcodeScannerActive, setBarcodeScannerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Xử lý quét mã vạch
  useEffect(() => {
    const handleBarcodeScanned = (barcode) => {
      message.info(`Đã quét mã: ${barcode}`);
      handleProductSearch(barcode);
    };

    if (barcodeScannerActive) {
      barcodeScanner.connect();
      barcodeScanner.onScan(handleBarcodeScanned);
    } else {
      barcodeScanner.disconnect();
    }

    return () => {
      barcodeScanner.disconnect();
    };
  }, [barcodeScannerActive]);

  // Mock data sản phẩm (trong thực tế sẽ fetch từ API)
  const mockProducts = [
    { id: '1', name: 'Laptop Dell XPS 13', price: 25000000, barcode: '8900001', inStock: 15 },
    { id: '2', name: 'Chuột không dây Logitech', price: 450000, barcode: '8900002', inStock: 45 },
    { id: '3', name: 'Bàn phím cơ AKKO', price: 1200000, barcode: '8900003', inStock: 23 },
    { id: '4', name: 'Tai nghe Sony WH-1000XM4', price: 4500000, barcode: '8900004', inStock: 8 },
    { id: '5', name: 'Màn hình LG 27 inch 4K', price: 6500000, barcode: '8900005', inStock: 12 },
  ];

  // Xử lý tìm kiếm sản phẩm
  const handleProductSearch = (value) => {
    setLoading(true);
    setSearchValue(value);

    // Giả lập API call
    setTimeout(() => {
      const results = mockProducts.filter(
        product => product.barcode === value || 
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSelectedProducts(results);
      setLoading(false);
      
      // Tự động thêm vào giỏ nếu là quét mã vạch và chỉ tìm thấy 1 sản phẩm
      if (barcodeScannerActive && results.length === 1) {
        handleAddToCart(results[0]);
      }
    }, 500);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    if (product.inStock <= 0) {
      message.error(`Sản phẩm ${product.name} đã hết hàng!`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      discount: 0,
      maxQuantity: product.inStock
    });

    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (id, quantity) => {
    const item = items.find(item => item.id === id);
    if (item) {
      if (quantity <= 0) {
        message.error('Số lượng phải lớn hơn 0');
        return;
      }

      if (quantity > item.maxQuantity) {
        message.warning(`Chỉ còn ${item.maxQuantity} sản phẩm trong kho!`);
        quantity = item.maxQuantity;
      }

      updateQuantity(id, quantity);
    }
  };

  // Xử lý áp dụng chiết khấu
  const handleApplyDiscount = () => {
    if (discountValue < 0) {
      message.error('Giá trị chiết khấu không hợp lệ');
      return;
    }

    if (discountType === 'percent' && discountValue > 100) {
      message.error('Giá trị chiết khấu không được vượt quá 100%');
      return;
    }

    if (discountType === 'amount' && discountValue > totalAmount) {
      message.error('Giá trị chiết khấu không được vượt quá tổng số tiền');
      return;
    }

    applyDiscount({
      type: discountType,
      value: discountValue
    });

    message.success('Đã áp dụng chiết khấu');
  };

  // Xử lý xóa giỏ hàng
  const handleClearCart = () => {
    clearCart();
    message.info('Đã xóa giỏ hàng');
  };

  // Xử lý thanh toán
  const handleCheckout = () => {
    if (items.length === 0) {
      message.error('Giỏ hàng trống!');
      return;
    }
    
    if (typeof onCheckout === 'function') {
      onCheckout({
        items,
        totalAmount,
        totalDiscount,
        netAmount
      });
    }
  };

  // Cấu hình cột cho bảng giỏ hàng
  const cartColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
      width: 120,
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.maxQuantity}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
          size="small"
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 120,
      render: (_, record) => formatCurrency(record.price * record.quantity),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Xóa sản phẩm này?"
            onConfirm={() => removeItem(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Cấu hình cột cho bảng sản phẩm tìm kiếm
  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price),
      width: 120,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'inStock',
      key: 'inStock',
      width: 80,
      render: (inStock) => (
        <Tag color={inStock > 0 ? 'green' : 'red'}>
          {inStock}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleAddToCart(record)}
          disabled={record.inStock <= 0}
        >
          Thêm
        </Button>
      ),
    },
  ];

  return (
    <div className="cart-manager">
      <Row gutter={[16, 16]}>
        {/* Giỏ hàng */}
        <Col xs={24} md={16}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Giỏ hàng</span>
                <Tag color="blue">{totalItems} sản phẩm</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleClearCart()}
                  disabled={items.length === 0}
                >
                  Xóa giỏ hàng
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  disabled={items.length === 0}
                >
                  Lưu giỏ hàng
                </Button>
              </Space>
            }
          >
            {items.length === 0 ? (
              <Empty description="Giỏ hàng trống" />
            ) : (
              <Table
                columns={cartColumns}
                dataSource={items.map(item => ({ ...item, key: item.id }))}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            )}

            {/* Phần tổng cộng */}
            <div style={{ marginTop: 16 }}>
              <Row justify="end">
                <Col xs={24} md={12} lg={8}>
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row justify="space-between">
                        <Col>Tổng tiền:</Col>
                        <Col><Text strong>{formatCurrency(totalAmount)}</Text></Col>
                      </Row>
                      <Row justify="space-between">
                        <Col>Chiết khấu:</Col>
                        <Col><Text type="danger">- {formatCurrency(totalDiscount)}</Text></Col>
                      </Row>
                      <Divider style={{ margin: '8px 0' }} />
                      <Row justify="space-between">
                        <Col><Text strong>Thành tiền:</Text></Col>
                        <Col><Text strong style={{ fontSize: 18 }}>{formatCurrency(netAmount)}</Text></Col>
                      </Row>

                      {/* Phần chiết khấu */}
                      <Divider style={{ margin: '8px 0' }} />
                      <Row gutter={8}>
                        <Col span={8}>
                          <Select 
                            value={discountType} 
                            onChange={setDiscountType}
                            style={{ width: '100%' }}
                            size="small"
                          >
                            <Option value="percent">%</Option>
                            <Option value="amount">VND</Option>
                          </Select>
                        </Col>
                        <Col span={10}>
                          <InputNumber
                            min={0}
                            max={discountType === 'percent' ? 100 : undefined}
                            value={discountValue}
                            onChange={setDiscountValue}
                            style={{ width: '100%' }}
                            size="small"
                            addonAfter={discountType === 'percent' ? '%' : undefined}
                            formatter={discountType === 'amount' ? value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : undefined}
                            parser={discountType === 'amount' ? value => value.replace(/\$\s?|(,*)/g, '') : undefined}
                          />
                        </Col>
                        <Col span={6}>
                          <Button 
                            type="primary" 
                            size="small" 
                            icon={<PercentageOutlined />}
                            onClick={handleApplyDiscount}
                            style={{ width: '100%' }}
                            disabled={items.length === 0}
                          >
                            Áp dụng
                          </Button>
                        </Col>
                      </Row>

                      <Button
                        type="primary"
                        block
                        size="large"
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                        style={{ marginTop: 16 }}
                      >
                        Thanh toán
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Tìm kiếm sản phẩm */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <TagOutlined />
                <span>Tìm kiếm sản phẩm</span>
              </Space>
            }
            extra={
              <Tooltip title={barcodeScannerActive ? 'Tắt máy quét' : 'Bật máy quét'}>
                <Button
                  type={barcodeScannerActive ? 'primary' : 'default'}
                  icon={barcodeScannerActive ? <CloseOutlined /> : <TagOutlined />}
                  onClick={() => setBarcodeScannerActive(!barcodeScannerActive)}
                />
              </Tooltip>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Search
                placeholder="Nhập tên hoặc mã vạch"
                enterButton="Tìm kiếm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleProductSearch}
                loading={loading}
                allowClear
              />

              <Table
                columns={productColumns}
                dataSource={selectedProducts.map(product => ({ ...product, key: product.id }))}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
                locale={{ emptyText: 'Không có sản phẩm' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartManager; 