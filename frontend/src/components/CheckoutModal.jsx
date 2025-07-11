import React from 'react';
import { Modal, Button, Card, Divider, Row, Col, Typography, Space, QRCode } from 'antd';
import { 
  PrinterOutlined, 
  MailOutlined, 
  PlusOutlined, 
  CheckCircleOutlined,
  ShopOutlined,
  UserOutlined,
  CreditCardOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CheckoutModal = ({ visible, order, onClose, onPrintReceipt, onNewOrder }) => {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      card: '💳',
      qr: '📱',
      mobile: '📲'
    };
    return icons[method] || '💵';
  };

  const getPaymentMethodName = (method) => {
    const names = {
      cash: 'Tiền mặt',
      card: 'Thẻ tín dụng',
      qr: 'QR Code',
      mobile: 'Ví điện tử'
    };
    return names[method] || 'Tiền mặt';
  };

  const handlePrint = () => {
    onPrintReceipt?.(order);
    window.print();
  };

  const handleEmailReceipt = () => {
    // In real implementation, call API to send email
    Modal.info({
      title: 'Gửi hóa đơn qua email',
      content: 'Hóa đơn đã được gửi qua email thành công!',
    });
  };

  const handleNewOrder = () => {
    onNewOrder?.();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>Thanh toán thành công</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      className="receipt-modal"
    >
      <div className="receipt-content" style={{ fontFamily: 'monospace', lineHeight: 1.6 }}>
        {/* Store Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            <ShopOutlined /> KhoChuan Store
          </Title>
          <Text type="secondary">123 Main Street, Ho Chi Minh City</Text><br />
          <Text type="secondary">Tel: +84 901 234 567</Text>
        </div>

        <Divider style={{ margin: '16px 0', borderStyle: 'dashed' }} />

        {/* Receipt Info */}
        <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Text strong>Hóa đơn: {order.order_number}</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text>
              <CalendarOutlined /> {dayjs(order.created_at).format('DD/MM/YYYY HH:mm')}
            </Text>
          </Col>
          <Col span={12}>
            <Text>Thu ngân: {order.cashier_name}</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text>Khu vực: {order.location_name || 'Main Store'}</Text>
          </Col>
        </Row>

        {/* Customer Info */}
        {order.customer_name && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ marginBottom: 16 }}>
              <Text strong>
                <UserOutlined /> Khách hàng: {order.customer_name}
              </Text>
              {order.customer_phone && (
                <div><Text type="secondary">SĐT: {order.customer_phone}</Text></div>
              )}
            </div>
          </>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Order Items */}
        <div style={{ marginBottom: 16 }}>
          <Text strong>Chi tiết đơn hàng:</Text>
          <div style={{ marginTop: 8 }}>
            {order.items?.map((item, index) => (
              <Row key={index} style={{ marginBottom: 8 }}>
                <Col span={12}>
                  <div>
                    <Text strong>{item.product_name || item.name}</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.product_sku || item.sku}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={4} style={{ textAlign: 'center' }}>
                  <Text>{item.quantity}</Text>
                </Col>
                <Col span={4} style={{ textAlign: 'right' }}>
                  <Text>{formatCurrency(item.unit_price || item.price)}</Text>
                </Col>
                <Col span={4} style={{ textAlign: 'right' }}>
                  <Text strong>{formatCurrency(item.total_price || (item.price * item.quantity))}</Text>
                </Col>
              </Row>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '12px 0', borderStyle: 'dashed' }} />

        {/* Order Summary */}
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><Text>Tạm tính:</Text></Col>
            <Col><Text>{formatCurrency(order.subtotal)}</Text></Col>
          </Row>
          {order.tax_amount > 0 && (
            <Row justify="space-between" style={{ marginBottom: 4 }}>
              <Col><Text>Thuế VAT:</Text></Col>
              <Col><Text>{formatCurrency(order.tax_amount)}</Text></Col>
            </Row>
          )}
          {order.discount_amount > 0 && (
            <Row justify="space-between" style={{ marginBottom: 4 }}>
              <Col><Text>Giảm giá:</Text></Col>
              <Col><Text>-{formatCurrency(order.discount_amount)}</Text></Col>
            </Row>
          )}
          <Divider style={{ margin: '8px 0' }} />
          <Row justify="space-between">
            <Col><Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text></Col>
            <Col><Text strong style={{ fontSize: '16px' }}>{formatCurrency(order.total)}</Text></Col>
          </Row>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Payment Info */}
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <CreditCardOutlined />
                <Text>
                  {getPaymentMethodIcon(order.payment_method)} {getPaymentMethodName(order.payment_method)}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ color: '#52c41a' }}>Đã thanh toán</Text>
              </Space>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '12px 0', borderStyle: 'dashed' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Text type="secondary">Cảm ơn quý khách đã mua hàng!</Text><br />
          <Text type="secondary">Hẹn gặp lại quý khách lần sau.</Text>
        </div>

        {/* QR Code */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <QRCode 
            value={`${window.location.origin}/receipt/${order.id}`}
            size={80}
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Quét QR để xem hóa đơn online
            </Text>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 24 }}>
        <Row gutter={[8, 8]}>
          <Col span={8}>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              block
            >
              In hóa đơn
            </Button>
          </Col>
          {order.customer_email && (
            <Col span={8}>
              <Button 
                icon={<MailOutlined />}
                onClick={handleEmailReceipt}
                block
              >
                Gửi email
              </Button>
            </Col>
          )}
          <Col span={order.customer_email ? 8 : 16}>
            <Button 
              type="default"
              icon={<PlusOutlined />}
              onClick={handleNewOrder}
              block
            >
              Đơn hàng mới
            </Button>
          </Col>
        </Row>
      </div>

      <style jsx global>{`
        @media print {
          .receipt-modal .ant-modal-mask,
          .receipt-modal .ant-modal-wrap {
            position: static !important;
          }
          
          .receipt-modal .ant-modal {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          
          .receipt-modal .ant-modal-content {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          .receipt-modal .ant-modal-header,
          .receipt-modal .ant-modal-footer,
          .receipt-modal .ant-btn {
            display: none !important;
          }
          
          .receipt-content {
            padding: 0 !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default CheckoutModal;
