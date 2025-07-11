import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Row,
  Col,
  Divider,
  Input,
  Select,
  Form,
  Statistic,
  Tag,
  Alert,
  Steps,
  Modal,
  Result,
  Spin,
  Tabs,
  Radio,
  Tooltip,
  List,
  Avatar,
  Badge
} from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  MobileOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  MailOutlined,
  UserOutlined,
  LockOutlined,
  LoadingOutlined,
  WalletOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  BarcodeOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;

// Mock data for payment methods
const paymentMethods = [
  {
    id: 'cash',
    name: 'Tiền mặt',
    icon: <DollarOutlined />,
    enabled: true,
    requiresConfirmation: false
  },
  {
    id: 'card',
    name: 'Thẻ tín dụng/ghi nợ',
    icon: <CreditCardOutlined />,
    enabled: true,
    requiresConfirmation: true,
    supportedCards: ['visa', 'mastercard', 'jcb', 'amex']
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: <BankOutlined />,
    enabled: true,
    requiresConfirmation: true
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: <MobileOutlined />,
    enabled: true,
    requiresConfirmation: true
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: <QrcodeOutlined />,
    enabled: true,
    requiresConfirmation: true
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: <WalletOutlined />,
    enabled: true,
    requiresConfirmation: true
  }
];

// Mock data for payment terminal status
const terminalStatus = {
  connected: true,
  lastSync: '2023-07-20 10:15:30',
  version: '2.5.1',
  deviceId: 'POS-TERM-001'
};

const PaymentTerminal = ({ 
  orderTotal = 1250000, 
  onPaymentComplete,
  onPaymentCancel,
  orderItems = [
    { id: 1, name: 'Chuột Logitech G102', price: 400000, quantity: 1 },
    { id: 2, name: 'Bàn phím cơ Keychron K2', price: 850000, quantity: 1 }
  ]
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [changeDue, setChangeDue] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', null
  const [paymentError, setPaymentError] = useState(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [terminalConnected, setTerminalConnected] = useState(terminalStatus.connected);
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(orderTotal);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    form.resetFields();
    
    // If cash payment, set default amount paid to order total
    if (method.id === 'cash') {
      form.setFieldsValue({ amount: orderTotal });
      setAmountPaid(orderTotal);
      calculateChange(orderTotal);
    } else {
      setAmountPaid(0);
      setChangeDue(0);
    }
    
    setCurrentStep(1);
  };

  // Handle amount paid change
  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setAmountPaid(value);
    calculateChange(value);
  };

  // Calculate change due
  const calculateChange = (amount) => {
    const change = amount - (splitPayment ? remainingAmount : orderTotal);
    setChangeDue(change >= 0 ? change : 0);
  };

  // Handle payment processing
  const handleProcessPayment = () => {
    setProcessingPayment(true);
    setPaymentError(null);
    
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        if (splitPayment) {
          // Add to split payments
          const newPayment = {
            method: selectedPaymentMethod.id,
            amount: remainingAmount,
            timestamp: new Date().toISOString()
          };
          
          setSplitPayments([...splitPayments, newPayment]);
          setRemainingAmount(0);
        }
        
        setPaymentStatus('success');
        setCurrentStep(2);
      } else {
        setPaymentStatus('failed');
        setPaymentError('Giao dịch bị từ chối. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.');
      }
      
      setProcessingPayment(false);
    }, 2000);
  };

  // Handle payment completion
  const handleComplete = () => {
    if (onPaymentComplete) {
      onPaymentComplete({
        paymentMethod: selectedPaymentMethod.id,
        amountPaid,
        changeDue,
        splitPayments: splitPayment ? splitPayments : []
      });
    }
  };

  // Handle payment cancellation
  const handleCancel = () => {
    if (onPaymentCancel) {
      onPaymentCancel();
    }
  };

  // Handle split payment toggle
  const handleSplitPaymentToggle = (e) => {
    setSplitPayment(e.target.checked);
    if (e.target.checked) {
      setRemainingAmount(orderTotal);
    } else {
      setRemainingAmount(0);
      setSplitPayments([]);
    }
  };

  // Handle adding a split payment
  const handleAddSplitPayment = () => {
    const newPayment = {
      method: selectedPaymentMethod.id,
      amount: amountPaid,
      timestamp: new Date().toISOString()
    };
    
    setSplitPayments([...splitPayments, newPayment]);
    setRemainingAmount(remainingAmount - amountPaid);
    setSelectedPaymentMethod(null);
    setCurrentStep(0);
  };

  // Handle terminal reconnect
  const handleTerminalReconnect = () => {
    setTerminalConnected(false);
    
    // Simulate reconnection
    setTimeout(() => {
      setTerminalConnected(true);
    }, 2000);
  };

  // Render payment method options
  const renderPaymentMethods = () => {
    return (
      <Row gutter={[16, 16]}>
        {paymentMethods.map(method => (
          <Col xs={12} sm={8} md={8} lg={6} key={method.id}>
            <Card
              hoverable
              className={`payment-method-card ${selectedPaymentMethod?.id === method.id ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodSelect(method)}
              style={{ 
                textAlign: 'center',
                opacity: method.enabled ? 1 : 0.5,
                cursor: method.enabled ? 'pointer' : 'not-allowed'
              }}
              bodyStyle={{ padding: '16px 8px' }}
              disabled={!method.enabled}
            >
              <Space direction="vertical" size="small">
                <Avatar size={48} icon={method.icon} />
                <Text strong>{method.name}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Render payment form based on selected method
  const renderPaymentForm = () => {
    if (!selectedPaymentMethod) return null;

    switch (selectedPaymentMethod.id) {
      case 'cash':
        return (
          <Form form={form} layout="vertical" initialValues={{ amount: orderTotal }}>
            <Form.Item
              label="Số tiền khách trả"
              name="amount"
              rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
            >
              <Input
                prefix={<DollarOutlined />}
                suffix="VNĐ"
                type="number"
                onChange={handleAmountChange}
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Tổng thanh toán"
                    value={splitPayment ? remainingAmount : orderTotal}
                    precision={0}
                    formatter={(value) => formatCurrency(value)}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Tiền thừa"
                    value={changeDue}
                    precision={0}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ color: changeDue > 0 ? '#3f8600' : '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
                <Button 
                  type="primary" 
                  onClick={handleProcessPayment}
                  disabled={amountPaid < (splitPayment ? remainingAmount : orderTotal)}
                >
                  Xác nhận thanh toán
                </Button>
              </Space>
            </div>
          </Form>
        );
        
      case 'card':
        return (
          <div>
            <Alert
              message="Kết nối máy quẹt thẻ"
              description="Vui lòng quẹt thẻ hoặc chạm thẻ vào máy đọc thẻ để tiếp tục."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Space>
                <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" height="30" />
                <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="MasterCard" height="30" />
                <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" alt="JCB" height="30" />
                <img src="https://cdn-icons-png.flaticon.com/512/196/196539.png" alt="Amex" height="30" />
              </Space>
            </div>
            
            <Card size="small" style={{ marginBottom: 16 }}>
              <Statistic
                title="Số tiền cần thanh toán"
                value={splitPayment ? remainingAmount : orderTotal}
                precision={0}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
            
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
                <Button 
                  type="primary" 
                  onClick={handleProcessPayment}
                >
                  Xác nhận thanh toán
                </Button>
              </Space>
            </div>
          </div>
        );
        
      case 'momo':
      case 'vnpay':
      case 'zalopay':
        return (
          <div>
            <Alert
              message={`Thanh toán qua ${selectedPaymentMethod.name}`}
              description="Quét mã QR bên dưới để thanh toán."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <QrcodeOutlined style={{ fontSize: 150, color: '#1890ff' }} />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Mã QR có hiệu lực trong 5:00 phút</Text>
              </div>
            </div>
            
            <Card size="small" style={{ marginBottom: 16 }}>
              <Statistic
                title="Số tiền cần thanh toán"
                value={splitPayment ? remainingAmount : orderTotal}
                precision={0}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
            
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
                <Button 
                  type="primary" 
                  onClick={handleProcessPayment}
                >
                  Đã quét mã & thanh toán
                </Button>
              </Space>
            </div>
          </div>
        );
        
      case 'bank_transfer':
        return (
          <div>
            <Alert
              message="Thanh toán chuyển khoản ngân hàng"
              description="Khách hàng có thể chuyển khoản vào tài khoản ngân hàng của cửa hàng."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Thông tin tài khoản:</Text>
              </div>
              <div>
                <Text>Ngân hàng: Vietcombank</Text>
              </div>
              <div>
                <Text>Số tài khoản: 1234567890</Text>
              </div>
              <div>
                <Text>Chủ tài khoản: CÔNG TY TNHH TRƯỜNG PHÁT COMPUTER</Text>
              </div>
              <div>
                <Text>Nội dung: Thanh toán đơn hàng #123456</Text>
              </div>
            </Card>
            
            <Card size="small" style={{ marginBottom: 16 }}>
              <Statistic
                title="Số tiền cần thanh toán"
                value={splitPayment ? remainingAmount : orderTotal}
                precision={0}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
            
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
                <Button 
                  type="primary" 
                  onClick={handleProcessPayment}
                >
                  Xác nhận đã nhận thanh toán
                </Button>
              </Space>
            </div>
          </div>
        );
        
      default:
        return (
          <div>
            <Alert
              message="Phương thức thanh toán không được hỗ trợ"
              description="Vui lòng chọn phương thức thanh toán khác."
              type="error"
              showIcon
            />
            <div style={{ marginTop: 16 }}>
              <Button onClick={() => setCurrentStep(0)}>Quay lại</Button>
            </div>
          </div>
        );
    }
  };

  // Render payment result
  const renderPaymentResult = () => {
    if (paymentStatus === 'success') {
      return (
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle={`Đã thanh toán ${formatCurrency(splitPayment ? remainingAmount : orderTotal)} bằng ${selectedPaymentMethod.name}`}
          extra={[
            <Button 
              key="receipt" 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={() => setReceiptModalVisible(true)}
            >
              In hóa đơn
            </Button>,
            <Button 
              key="email" 
              icon={<MailOutlined />}
            >
              Gửi hóa đơn qua email
            </Button>,
            <Button 
              key="done" 
              type="primary"
              onClick={handleComplete}
            >
              Hoàn tất
            </Button>
          ]}
        />
      );
    } else if (paymentStatus === 'failed') {
      return (
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={paymentError || "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại."}
          extra={[
            <Button 
              key="retry" 
              type="primary" 
              onClick={() => {
                setPaymentStatus(null);
                setPaymentError(null);
              }}
            >
              Thử lại
            </Button>,
            <Button 
              key="change" 
              onClick={() => setCurrentStep(0)}
            >
              Đổi phương thức thanh toán
            </Button>
          ]}
        />
      );
    }
    
    return null;
  };

  // Render split payment summary
  const renderSplitPaymentSummary = () => {
    if (!splitPayment || splitPayments.length === 0) return null;
    
    const totalPaid = splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return (
      <div style={{ marginBottom: 16 }}>
        <Divider>Thanh toán đã thực hiện</Divider>
        <List
          size="small"
          bordered
          dataSource={splitPayments}
          renderItem={(payment, index) => {
            const method = paymentMethods.find(m => m.id === payment.method);
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={method?.icon || <DollarOutlined />} />}
                  title={`Thanh toán ${index + 1}: ${method?.name || payment.method}`}
                  description={new Date(payment.timestamp).toLocaleString()}
                />
                <div>{formatCurrency(payment.amount)}</div>
              </List.Item>
            );
          }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Đã thanh toán:</Text>
              <Text strong>{formatCurrency(totalPaid)}</Text>
            </div>
          }
        />
        
        {remainingAmount > 0 && (
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <Text strong type="danger">Còn lại:</Text>
            <Text strong type="danger">{formatCurrency(remainingAmount)}</Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="payment-terminal">
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <CreditCardOutlined />
              <span>Thanh toán</span>
            </Space>
            <Space>
              <Badge 
                status={terminalConnected ? 'success' : 'error'} 
                text={terminalConnected ? 'Đã kết nối' : 'Mất kết nối'} 
              />
              <Tooltip title="Kết nối lại thiết bị">
                <Button 
                  icon={<SyncOutlined spin={!terminalConnected} />} 
                  size="small"
                  onClick={handleTerminalReconnect}
                />
              </Tooltip>
            </Space>
          </div>
        }
        extra={
          <Space>
            <Button icon={<HistoryOutlined />} size="small">
              Lịch sử
            </Button>
            <Button icon={<SettingOutlined />} size="small">
              Cài đặt
            </Button>
          </Space>
        }
      >
        {/* Order Summary */}
        <div style={{ marginBottom: 16 }}>
          <Card size="small" title="Tóm tắt đơn hàng">
            <List
              size="small"
              dataSource={orderItems}
              renderItem={item => (
                <List.Item>
                  <div>{item.name} x{item.quantity}</div>
                  <div>{formatCurrency(item.price * item.quantity)}</div>
                </List.Item>
              )}
            />
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Tổng cộng:</Text>
              <Text strong>{formatCurrency(orderTotal)}</Text>
            </div>
          </Card>
        </div>

        {/* Split Payment Option */}
        <div style={{ marginBottom: 16 }}>
          <Radio.Group 
            onChange={(e) => handleSplitPaymentToggle(e.target)}
            value={splitPayment}
          >
            <Radio value={false}>Thanh toán đầy đủ</Radio>
            <Radio value={true}>Thanh toán chia nhỏ</Radio>
          </Radio.Group>
        </div>

        {/* Split Payment Summary */}
        {renderSplitPaymentSummary()}

        {/* Payment Steps */}
        <Steps current={currentStep} style={{ marginBottom: 16 }}>
          <Step title="Chọn phương thức" />
          <Step title="Thông tin thanh toán" />
          <Step title="Hoàn tất" />
        </Steps>

        <Divider />

        {/* Step Content */}
        <div className="payment-step-content">
          {processingPayment ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} 
                tip="Đang xử lý thanh toán..."
              />
            </div>
          ) : (
            <>
              {currentStep === 0 && renderPaymentMethods()}
              {currentStep === 1 && renderPaymentForm()}
              {currentStep === 2 && renderPaymentResult()}
            </>
          )}
        </div>

        {/* Bottom Actions */}
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            danger
            onClick={handleCancel}
          >
            Hủy thanh toán
          </Button>
          
          {splitPayment && currentStep === 1 && remainingAmount > 0 && (
            <Button 
              type="primary" 
              onClick={handleAddSplitPayment}
              disabled={amountPaid < remainingAmount || processingPayment}
            >
              Thêm thanh toán này
            </Button>
          )}
        </div>
      </Card>

      {/* Receipt Modal */}
      <Modal
        title="Hóa đơn"
        open={receiptModalVisible}
        onCancel={() => setReceiptModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setReceiptModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />}>
            In hóa đơn
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={4}>TRƯỜNG PHÁT COMPUTER</Title>
          <Text>123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM</Text>
          <br />
          <Text>Điện thoại: 028.1234.5678</Text>
          <br />
          <Text>MST: 0123456789</Text>
        </div>
        
        <Divider>HÓA ĐƠN BÁN HÀNG</Divider>
        
        <div style={{ marginBottom: 16 }}>
          <Row>
            <Col span={12}>
              <Text>Số HĐ: #123456</Text>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Text>Ngày: {new Date().toLocaleDateString()}</Text>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Text>Khách hàng: Khách lẻ</Text>
            </Col>
          </Row>
        </div>
        
        <Table
          dataSource={orderItems}
          columns={[
            {
              title: 'Sản phẩm',
              dataIndex: 'name',
              key: 'name'
            },
            {
              title: 'SL',
              dataIndex: 'quantity',
              key: 'quantity',
              width: 60,
              align: 'right'
            },
            {
              title: 'Đơn giá',
              dataIndex: 'price',
              key: 'price',
              width: 120,
              align: 'right',
              render: (price) => formatCurrency(price)
            },
            {
              title: 'Thành tiền',
              key: 'total',
              width: 120,
              align: 'right',
              render: (_, record) => formatCurrency(record.price * record.quantity)
            }
          ]}
          pagination={false}
          size="small"
          bordered
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={3} align="right">
                <Text strong>Tổng cộng:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell align="right">
                <Text strong>{formatCurrency(orderTotal)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
        
        <div style={{ marginTop: 16 }}>
          <Row>
            <Col span={12}>
              <Text strong>Phương thức thanh toán:</Text>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Text>{selectedPaymentMethod?.name || 'Tiền mặt'}</Text>
            </Col>
          </Row>
          {changeDue > 0 && (
            <>
              <Row>
                <Col span={12}>
                  <Text>Tiền khách đưa:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text>{formatCurrency(amountPaid)}</Text>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Text>Tiền thừa:</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text>{formatCurrency(changeDue)}</Text>
                </Col>
              </Row>
            </>
          )}
        </div>
        
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Text>Cảm ơn quý khách đã mua hàng!</Text>
          <br />
          <Text type="secondary">Quý khách vui lòng kiểm tra hàng trước khi rời khỏi cửa hàng</Text>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentTerminal; 