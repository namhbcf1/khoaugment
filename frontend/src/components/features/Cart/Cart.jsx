/**
 * Shopping Cart Component
 * Interactive shopping cart with item management and checkout
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Space, 
  Typography, 
  Divider,
  Empty,
  Image,
  Tooltip,
  Badge,
  Row,
  Col,
  message,
  Popconfirm,
  Tag
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  ClearOutlined,
  CheckOutlined,
  GiftOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';
import { formatCurrency } from '../../../utils/helpers/formatHelpers.js';
import errorHandler from '../../../utils/helpers/errorHandler.js';
import './Cart.css';

const { Title, Text } = Typography;

/**
 * Cart Component
 * @param {Object} props - Component props
 * @param {Array} props.items - Cart items array
 * @param {Function} props.onUpdateQuantity - Update item quantity callback
 * @param {Function} props.onRemoveItem - Remove item callback
 * @param {Function} props.onClearCart - Clear cart callback
 * @param {Function} props.onCheckout - Checkout callback
 * @param {Object} props.discounts - Applied discounts
 * @param {Object} props.customer - Selected customer
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.readonly - Read-only mode
 * @returns {JSX.Element} Shopping cart component
 */
const Cart = ({
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  discounts = {},
  customer = null,
  loading = false,
  readonly = false,
  className = ''
}) => {
  const { hasPermission } = useAuth();
  
  // State management
  const [processingItems, setProcessingItems] = useState(new Set());

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    const discountAmount = Object.values(discounts).reduce((sum, discount) => 
      sum + (discount.amount || 0), 0
    );
    
    const tax = subtotal * 0.1; // 10% VAT
    const total = subtotal - discountAmount + tax;
    
    return {
      subtotal,
      discountAmount,
      tax,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [items, discounts]);

  // Handle quantity update
  const handleQuantityUpdate = useCallback(async (item, newQuantity) => {
    if (readonly || newQuantity < 0) return;
    
    const itemId = item.id;
    setProcessingItems(prev => new Set(prev).add(itemId));
    
    try {
      if (newQuantity === 0) {
        await onRemoveItem?.(item);
      } else {
        await onUpdateQuantity?.(item, newQuantity);
      }
    } catch (error) {
      errorHandler.handle(error, { 
        component: 'Cart',
        action: 'updateQuantity',
        itemId 
      });
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [readonly, onUpdateQuantity, onRemoveItem]);

  // Handle item removal
  const handleRemoveItem = useCallback(async (item) => {
    if (readonly) return;
    
    const itemId = item.id;
    setProcessingItems(prev => new Set(prev).add(itemId));
    
    try {
      await onRemoveItem?.(item);
      message.success(`Đã xóa ${item.name} khỏi giỏ hàng`);
    } catch (error) {
      errorHandler.handle(error, { 
        component: 'Cart',
        action: 'removeItem',
        itemId 
      });
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [readonly, onRemoveItem]);

  // Handle clear cart
  const handleClearCart = useCallback(async () => {
    if (readonly) return;
    
    try {
      await onClearCart?.();
      message.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
    } catch (error) {
      errorHandler.handle(error, { 
        component: 'Cart',
        action: 'clearCart' 
      });
    }
  }, [readonly, onClearCart]);

  // Handle checkout
  const handleCheckout = useCallback(async () => {
    if (readonly || items.length === 0) return;
    
    try {
      await onCheckout?.({
        items,
        totals,
        customer,
        discounts
      });
    } catch (error) {
      errorHandler.handle(error, { 
        component: 'Cart',
        action: 'checkout' 
      });
    }
  }, [readonly, items, totals, customer, discounts, onCheckout]);

  // Render cart item
  const renderCartItem = useCallback((item) => {
    const isProcessing = processingItems.has(item.id);
    const stockWarning = item.quantity > (item.stock || 0);
    
    return (
      <List.Item
        key={item.id}
        className={`cart-item ${isProcessing ? 'processing' : ''}`}
        actions={!readonly ? [
          <Tooltip title="Xóa sản phẩm" key="delete">
            <Popconfirm
              title="Xóa sản phẩm khỏi giỏ hàng?"
              onConfirm={() => handleRemoveItem(item)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={isProcessing}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        ] : []}
      >
        <List.Item.Meta
          avatar={
            <Image
              width={60}
              height={60}
              src={item.image || '/assets/images/product-placeholder.png'}
              alt={item.name}
              className="cart-item-image"
              preview={false}
            />
          }
          title={
            <div className="cart-item-title">
              <Text strong className="item-name">{item.name}</Text>
              {stockWarning && (
                <Tag color="warning" size="small">
                  Vượt tồn kho
                </Tag>
              )}
            </div>
          }
          description={
            <div className="cart-item-details">
              <Text type="secondary" className="item-sku">
                SKU: {item.sku}
              </Text>
              <div className="item-price">
                {formatCurrency(item.price)}
              </div>
            </div>
          }
        />
        
        <div className="cart-item-controls">
          <div className="quantity-controls">
            {!readonly ? (
              <Space.Compact>
                <Button
                  icon={<MinusOutlined />}
                  onClick={() => handleQuantityUpdate(item, item.quantity - 1)}
                  disabled={isProcessing || item.quantity <= 1}
                  size="small"
                />
                <InputNumber
                  min={1}
                  max={item.stock || 999}
                  value={item.quantity}
                  onChange={(value) => handleQuantityUpdate(item, value)}
                  disabled={isProcessing}
                  size="small"
                  style={{ width: 60 }}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleQuantityUpdate(item, item.quantity + 1)}
                  disabled={isProcessing || item.quantity >= (item.stock || 999)}
                  size="small"
                />
              </Space.Compact>
            ) : (
              <Text strong>Số lượng: {item.quantity}</Text>
            )}
          </div>
          
          <div className="item-total">
            <Text strong className="total-price">
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </div>
        </div>
      </List.Item>
    );
  }, [readonly, processingItems, handleQuantityUpdate, handleRemoveItem]);

  return (
    <Card 
      className={`cart-container ${className}`}
      title={
        <div className="cart-header">
          <Space>
            <ShoppingCartOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Giỏ hàng
            </Title>
            <Badge count={totals.itemCount} showZero />
          </Space>
        </div>
      }
      extra={
        !readonly && items.length > 0 && (
          <Popconfirm
            title="Xóa tất cả sản phẩm?"
            onConfirm={handleClearCart}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              icon={<ClearOutlined />}
              size="small"
            >
              Xóa tất cả
            </Button>
          </Popconfirm>
        )
      }
    >
      {items.length > 0 ? (
        <>
          {/* Cart Items */}
          <List
            className="cart-items"
            dataSource={items}
            renderItem={renderCartItem}
            split={false}
          />
          
          {/* Discounts */}
          {Object.keys(discounts).length > 0 && (
            <div className="cart-discounts">
              <Divider orientation="left" orientationMargin="0">
                <Space>
                  <GiftOutlined />
                  <Text>Khuyến mãi</Text>
                </Space>
              </Divider>
              {Object.entries(discounts).map(([key, discount]) => (
                <Row key={key} justify="space-between" className="discount-item">
                  <Col>
                    <Space>
                      <PercentageOutlined />
                      <Text>{discount.name}</Text>
                    </Space>
                  </Col>
                  <Col>
                    <Text type="success">
                      -{formatCurrency(discount.amount)}
                    </Text>
                  </Col>
                </Row>
              ))}
            </div>
          )}
          
          {/* Totals */}
          <div className="cart-totals">
            <Divider />
            
            <Row justify="space-between" className="total-row">
              <Col><Text>Tạm tính:</Text></Col>
              <Col><Text>{formatCurrency(totals.subtotal)}</Text></Col>
            </Row>
            
            {totals.discountAmount > 0 && (
              <Row justify="space-between" className="total-row">
                <Col><Text>Giảm giá:</Text></Col>
                <Col><Text type="success">-{formatCurrency(totals.discountAmount)}</Text></Col>
              </Row>
            )}
            
            <Row justify="space-between" className="total-row">
              <Col><Text>Thuế VAT (10%):</Text></Col>
              <Col><Text>{formatCurrency(totals.tax)}</Text></Col>
            </Row>
            
            <Divider />
            
            <Row justify="space-between" className="total-row final-total">
              <Col><Title level={4}>Tổng cộng:</Title></Col>
              <Col><Title level={4} type="danger">{formatCurrency(totals.total)}</Title></Col>
            </Row>
          </div>
          
          {/* Checkout Button */}
          {!readonly && hasPermission('orders.create') && (
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              onClick={handleCheckout}
              loading={loading}
              block
              className="checkout-button"
            >
              Thanh toán
            </Button>
          )}
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Giỏ hàng trống"
          className="empty-cart"
        >
          {!readonly && (
            <Text type="secondary">
              Thêm sản phẩm vào giỏ hàng để bắt đầu
            </Text>
          )}
        </Empty>
      )}
    </Card>
  );
};

export default Cart;
