/**
 * Real Payment Gateway Component
 * Handles multiple payment methods with real gateway integration
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Radio,
  Space,
  Typography,
  Divider,
  Alert,
  Spin,
  QRCode,
  Modal,
  Steps,
  InputNumber,
  Form,
  message,
  Tag,
  Descriptions,
  Image
} from 'antd';
import {
  CreditCardOutlined,
  QrcodeOutlined,
  BankOutlined,
  DollarOutlined,
  MobileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import paymentService, { PAYMENT_METHODS, PAYMENT_STATUS } from '../../services/paymentService';

const { Title, Text } = Typography;
const { Option } = Select;

const PaymentGateway = ({ 
  amount, 
  orderId, 
  customerInfo, 
  onPaymentSuccess, 
  onPaymentError,
  onCancel 
}) => {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CASH);
  const [paymentStep, setPaymentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [form] = Form.useForm();

  // Payment method configurations
  const paymentMethods = [
    {
      key: PAYMENT_METHODS.CASH,
      name: 'Tiền mặt',
      icon: <DollarOutlined />,
      description: 'Thanh toán bằng tiền mặt',
      color: 'green'
    },
    {
      key: PAYMENT_METHODS.CARD,
      name: 'Thẻ tín dụng/ghi nợ',
      icon: <CreditCardOutlined />,
      description: 'Thanh toán bằng thẻ',
      color: 'blue'
    },
    {
      key: PAYMENT_METHODS.QR_CODE,
      name: 'QR Code',
      icon: <QrcodeOutlined />,
      description: 'Quét mã QR để thanh toán',
      color: 'purple'
    },
    {
      key: PAYMENT_METHODS.VNPAY,
      name: 'VNPay',
      icon: <MobileOutlined />,
      description: 'Ví điện tử VNPay',
      color: 'red'
    },
    {
      key: PAYMENT_METHODS.MOMO,
      name: 'MoMo',
      icon: <MobileOutlined />,
      description: 'Ví điện tử MoMo',
      color: 'magenta'
    },
    {
      key: PAYMENT_METHODS.ZALOPAY,
      name: 'ZaloPay',
      icon: <MobileOutlined />,
      description: 'Ví điện tử ZaloPay',
      color: 'orange'
    },
    {
      key: PAYMENT_METHODS.BANK_TRANSFER,
      name: 'Chuyển khoản',
      icon: <BankOutlined />,
      description: 'Chuyển khoản ngân hàng',
      color: 'cyan'
    }
  ];

  const handlePayment = async (paymentData) => {
    setProcessing(true);
    
    try {
      const result = await paymentService.processPayment({
        method: selectedMethod,
        amount,
        orderId,
        customerInfo,
        ...paymentData
      });

      setTransaction(result);
      
      if (result.status === PAYMENT_STATUS.SUCCESS) {
        setPaymentStep(2);
        message.success('Thanh toán thành công!');
        setTimeout(() => {
          onPaymentSuccess(result);
        }, 2000);
      } else if (result.status === PAYMENT_STATUS.PENDING) {
        setPaymentStep(1);
        // For pending payments, we'll show the payment interface
      }
    } catch (error) {
      message.error(`Lỗi thanh toán: ${error.message}`);
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethod = () => {
    const method = paymentMethods.find(m => m.key === selectedMethod);
    
    return (
      <Card title={`Thanh toán bằng ${method?.name}`} size="small">
        {selectedMethod === PAYMENT_METHODS.CASH && (
          <CashPaymentForm onSubmit={handlePayment} amount={amount} />
        )}
        
        {selectedMethod === PAYMENT_METHODS.CARD && (
          <CardPaymentForm onSubmit={handlePayment} amount={amount} />
        )}
        
        {selectedMethod === PAYMENT_METHODS.QR_CODE && (
          <QRPaymentForm 
            onSubmit={handlePayment} 
            amount={amount} 
            transaction={transaction}
          />
        )}
        
        {[PAYMENT_METHODS.VNPAY, PAYMENT_METHODS.MOMO, PAYMENT_METHODS.ZALOPAY].includes(selectedMethod) && (
          <EWalletPaymentForm 
            onSubmit={handlePayment} 
            amount={amount} 
            method={selectedMethod}
            transaction={transaction}
          />
        )}
        
        {selectedMethod === PAYMENT_METHODS.BANK_TRANSFER && (
          <BankTransferForm 
            onSubmit={handlePayment} 
            amount={amount} 
            transaction={transaction}
          />
        )}
      </Card>
    );
  };

  const renderPaymentStatus = () => {
    if (!transaction) return null;

    const statusConfig = {
      [PAYMENT_STATUS.SUCCESS]: {
        icon: <CheckCircleOutlined style={{ color: 'green' }} />,
        color: 'success',
        text: 'Thanh toán thành công'
      },
      [PAYMENT_STATUS.PENDING]: {
        icon: <ClockCircleOutlined style={{ color: 'orange' }} />,
        color: 'warning',
        text: 'Đang chờ thanh toán'
      },
      [PAYMENT_STATUS.FAILED]: {
        icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
        color: 'error',
        text: 'Thanh toán thất bại'
      }
    };

    const config = statusConfig[transaction.status];

    return (
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} align="center">
          {config.icon}
          <Title level={4}>{config.text}</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Mã giao dịch">{transaction.id}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">{amount.toLocaleString('vi-VN')} đ</Descriptions.Item>
            <Descriptions.Item label="Phương thức">{paymentMethods.find(m => m.key === selectedMethod)?.name}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{new Date(transaction.timestamp).toLocaleString('vi-VN')}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Steps current={paymentStep} style={{ marginBottom: 24 }}>
        <Steps.Step title="Chọn phương thức" />
        <Steps.Step title="Thanh toán" />
        <Steps.Step title="Hoàn thành" />
      </Steps>

      {paymentStep === 0 && (
        <Card title="Chọn phương thức thanh toán">
          <Row gutter={[16, 16]}>
            {paymentMethods.map(method => (
              <Col span={12} key={method.key}>
                <Card
                  hoverable
                  size="small"
                  style={{
                    border: selectedMethod === method.key ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedMethod(method.key)}
                >
                  <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    <div style={{ fontSize: 24, color: method.color }}>
                      {method.icon}
                    </div>
                    <Text strong>{method.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                      {method.description}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
          
          <Divider />
          
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={onCancel}>Hủy</Button>
            <Button 
              type="primary" 
              onClick={() => setPaymentStep(1)}
              disabled={!selectedMethod}
            >
              Tiếp tục
            </Button>
          </Space>
        </Card>
      )}

      {paymentStep === 1 && (
        <Spin spinning={processing}>
          {renderPaymentMethod()}
        </Spin>
      )}

      {paymentStep === 2 && renderPaymentStatus()}
    </div>
  );
};

// Cash Payment Form Component
const CashPaymentForm = ({ onSubmit, amount }) => {
  const [cashReceived, setCashReceived] = useState(amount);

  const handleSubmit = () => {
    if (cashReceived < amount) {
      message.error('Số tiền nhận không đủ');
      return;
    }
    onSubmit({ cashReceived });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <Text>Tổng tiền: <Text strong>{amount.toLocaleString('vi-VN')} đ</Text></Text>
      </div>
      
      <div>
        <Text>Tiền khách đưa:</Text>
        <InputNumber
          style={{ width: '100%', marginTop: 8 }}
          size="large"
          value={cashReceived}
          onChange={setCashReceived}
          min={0}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          addonAfter="đ"
        />
      </div>
      
      {cashReceived > amount && (
        <Alert
          message={`Tiền thừa: ${(cashReceived - amount).toLocaleString('vi-VN')} đ`}
          type="info"
          showIcon
        />
      )}
      
      <Button 
        type="primary" 
        block 
        size="large" 
        onClick={handleSubmit}
        disabled={cashReceived < amount}
      >
        Xác nhận thanh toán
      </Button>
    </Space>
  );
};

// Card Payment Form Component
const CardPaymentForm = ({ onSubmit, amount }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit({ cardInfo: values });
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="number"
        label="Số thẻ"
        rules={[{ required: true, message: 'Vui lòng nhập số thẻ' }]}
      >
        <Input placeholder="1234 5678 9012 3456" maxLength={19} />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="expiry"
            label="Ngày hết hạn"
            rules={[{ required: true, message: 'Vui lòng nhập ngày hết hạn' }]}
          >
            <Input placeholder="MM/YY" maxLength={5} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="cvv"
            label="CVV"
            rules={[{ required: true, message: 'Vui lòng nhập CVV' }]}
          >
            <Input placeholder="123" maxLength={4} />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="name"
        label="Tên chủ thẻ"
        rules={[{ required: true, message: 'Vui lòng nhập tên chủ thẻ' }]}
      >
        <Input placeholder="NGUYEN VAN A" />
      </Form.Item>
      
      <Button type="primary" htmlType="submit" block size="large">
        Thanh toán {amount.toLocaleString('vi-VN')} đ
      </Button>
    </Form>
  );
};

// QR Payment Form Component
const QRPaymentForm = ({ onSubmit, amount, transaction }) => {
  useEffect(() => {
    if (!transaction) {
      onSubmit({});
    }
  }, []);

  if (!transaction) {
    return <Spin size="large" />;
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} align="center">
      <Text>Quét mã QR để thanh toán</Text>
      <QRCode value={transaction.metadata.qrCode} size={200} />
      <Text type="secondary">Số tiền: {amount.toLocaleString('vi-VN')} đ</Text>
      <Text type="secondary">Mã giao dịch: {transaction.id}</Text>
      
      {transaction.status === PAYMENT_STATUS.PENDING && (
        <Alert
          message="Đang chờ thanh toán"
          description="Vui lòng quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử"
          type="info"
          showIcon
        />
      )}
    </Space>
  );
};

// E-Wallet Payment Form Component
const EWalletPaymentForm = ({ onSubmit, amount, method, transaction }) => {
  useEffect(() => {
    if (!transaction) {
      onSubmit({});
    }
  }, []);

  const walletNames = {
    [PAYMENT_METHODS.VNPAY]: 'VNPay',
    [PAYMENT_METHODS.MOMO]: 'MoMo',
    [PAYMENT_METHODS.ZALOPAY]: 'ZaloPay'
  };

  if (!transaction) {
    return <Spin size="large" />;
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} align="center">
      <Text>Thanh toán qua {walletNames[method]}</Text>
      <Text type="secondary">Số tiền: {amount.toLocaleString('vi-VN')} đ</Text>
      
      {transaction.metadata.paymentUrl && (
        <Button 
          type="primary" 
          size="large"
          onClick={() => window.open(transaction.metadata.paymentUrl, '_blank')}
        >
          Mở ứng dụng {walletNames[method]}
        </Button>
      )}
      
      <Alert
        message="Đang chờ thanh toán"
        description={`Vui lòng hoàn tất thanh toán trên ứng dụng ${walletNames[method]}`}
        type="info"
        showIcon
      />
    </Space>
  );
};

// Bank Transfer Form Component
const BankTransferForm = ({ onSubmit, amount, transaction }) => {
  useEffect(() => {
    if (!transaction) {
      onSubmit({});
    }
  }, []);

  if (!transaction) {
    return <Spin size="large" />;
  }

  const { bankInfo } = transaction.metadata;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Text strong>Thông tin chuyển khoản:</Text>
      
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Ngân hàng">{bankInfo.bankName}</Descriptions.Item>
        <Descriptions.Item label="Số tài khoản">{bankInfo.accountNumber}</Descriptions.Item>
        <Descriptions.Item label="Tên tài khoản">{bankInfo.accountName}</Descriptions.Item>
        <Descriptions.Item label="Số tiền">{amount.toLocaleString('vi-VN')} đ</Descriptions.Item>
        <Descriptions.Item label="Nội dung">{bankInfo.transferContent}</Descriptions.Item>
      </Descriptions>
      
      <Alert
        message="Hướng dẫn chuyển khoản"
        description={transaction.metadata.instructions}
        type="info"
        showIcon
      />
    </Space>
  );
};

export default PaymentGateway;
