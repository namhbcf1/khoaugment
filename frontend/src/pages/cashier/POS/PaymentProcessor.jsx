import React, { useState, useEffect } from 'react';
import {
  Card, Steps, Form, Input, Button, Select, InputNumber, 
  Radio, Space, Row, Col, Divider, Typography, message,
  Descriptions, Tag, Spin, Alert, Result, Statistic
} from 'antd';
import {
  DollarOutlined, CreditCardOutlined, BarcodeOutlined,
  MobileOutlined, CheckCircleOutlined, PrinterOutlined,
  RollbackOutlined, SaveOutlined, ShareAltOutlined,
  SyncOutlined, QrcodeOutlined, UserOutlined, 
  ShoppingCartOutlined, LoadingOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../../utils/helpers/formatters';
import printerService from '../../../services/hardware/printerService';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

/**
 * Component xử lý thanh toán cho POS
 */
const PaymentProcessor = ({ orderData, onComplete, onCancel }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, processing, success, error
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState(0);
  const [printStatus, setPrintStatus] = useState('idle'); // idle, printing, success, error
  const [receiptData, setReceiptData] = useState(null);

  // Danh sách phương thức thanh toán
  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt', icon: <DollarOutlined /> },
    { value: 'card', label: 'Thẻ tín dụng/ghi nợ', icon: <CreditCardOutlined /> },
    { value: 'momo', label: 'Ví MoMo', icon: <MobileOutlined /> },
    { value: 'vnpay', label: 'VNPay', icon: <QrcodeOutlined /> },
    { value: 'zalopay', label: 'ZaloPay', icon: <MobileOutlined /> },
    { value: 'bank_transfer', label: 'Chuyển khoản', icon: <BarcodeOutlined /> },
  ];

  // Giá trị mệnh giá tiền mặt VND
  const cashDenominations = [
    10000, 20000, 50000, 100000, 200000, 500000
  ];

  // Thiết lập giá trị mặc định khi orderData thay đổi
  useEffect(() => {
    if (orderData && orderData.netAmount) {
      setCashAmount(orderData.netAmount);
      form.setFieldsValue({
        amount: orderData.netAmount,
        paymentMethod: 'cash'
      });
    }
  }, [orderData, form]);

  // Xử lý khi chọn phương thức thanh toán
  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
    
    // Reset các trường liên quan
    if (value === 'cash') {
      form.setFieldsValue({ 
        cashAmount: orderData?.netAmount || 0,
        cardNumber: undefined,
        cardHolderName: undefined,
        cardExpiry: undefined,
        cardCVC: undefined
      });
    } else {
      form.setFieldsValue({
        cashAmount: undefined,
        changeAmount: undefined
      });
    }
  };

  // Xử lý khi nhập số tiền khách đưa
  const handleCashAmountChange = (value) => {
    setCashAmount(value);
    const netAmount = orderData?.netAmount || 0;
    const changeAmount = value - netAmount;
    
    form.setFieldsValue({
      changeAmount: changeAmount > 0 ? changeAmount : 0
    });
  };

  // Xử lý khi chọn mệnh giá tiền
  const handleDenominationClick = (value) => {
    const currentValue = cashAmount || 0;
    const newValue = currentValue + value;
    setCashAmount(newValue);
    handleCashAmountChange(newValue);
  };

  // Xử lý khi chọn "Tiền chẵn"
  const handleExactAmountClick = () => {
    const exactAmount = orderData?.netAmount || 0;
    setCashAmount(exactAmount);
    handleCashAmountChange(exactAmount);
  };

  // Xử lý xác nhận thanh toán
  const handlePaymentConfirm = async (values) => {
    setProcessingStatus('processing');
    setLoading(true);

    try {
      // Giả lập call API để xử lý thanh toán
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Xây dựng dữ liệu hóa đơn
      const receipt = {
        id: `HD${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString(),
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        totalDiscount: orderData.totalDiscount,
        netAmount: orderData.netAmount,
        paymentMethod: values.paymentMethod,
        cashAmount: values.cashAmount,
        changeAmount: values.changeAmount,
        customerName: values.customerName || 'Khách lẻ',
        customerPhone: values.customerPhone || '',
        cashier: 'Nguyễn Văn A' // Thực tế sẽ lấy từ user context
      };

      setReceiptData(receipt);
      setProcessingStatus('success');
      setCurrentStep(1);
      message.success('Thanh toán thành công!');
    } catch (error) {
      console.error('Payment error:', error);
      setProcessingStatus('error');
      message.error('Có lỗi xảy ra khi xử lý thanh toán!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý in hóa đơn
  const handlePrintReceipt = async () => {
    if (!receiptData) return;
    
    setPrintStatus('printing');
    
    try {
      // Kết nối và gửi dữ liệu đến máy in
      await printerService.connect();
      
      // Giả lập quá trình in
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In hóa đơn
      await printerService.printReceipt(receiptData);
      
      setPrintStatus('success');
      message.success('Đã in hóa đơn thành công!');
    } catch (error) {
      console.error('Printing error:', error);
      setPrintStatus('error');
      message.error('Có lỗi xảy ra khi in hóa đơn!');
    }
  };

  // Xử lý hoàn thành
  const handleComplete = () => {
    if (typeof onComplete === 'function') {
      onComplete({
        ...receiptData,
        status: 'completed'
      });
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  // Render từng bước thanh toán
  const renderPaymentStep = () => {
    switch (currentStep) {
      case 0: // Bước nhập thông tin thanh toán
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={handlePaymentConfirm}
            initialValues={{
              paymentMethod: 'cash',
              amount: orderData?.netAmount || 0
            }}
          >
            {/* Thông tin đơn hàng */}
            <Card className="order-summary" size="small" style={{ marginBottom: 16 }}>
              <Descriptions title="Thông tin đơn hàng" size="small" column={2}>
                <Descriptions.Item label="Số sản phẩm">{orderData?.items?.length || 0}</Descriptions.Item>
                <Descriptions.Item label="Tổng số lượng">
                  {orderData?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">{formatCurrency(orderData?.totalAmount || 0)}</Descriptions.Item>
                <Descriptions.Item label="Chiết khấu">{formatCurrency(orderData?.totalDiscount || 0)}</Descriptions.Item>
              </Descriptions>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary">Thành tiền:</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {formatCurrency(orderData?.netAmount || 0)}
                </Title>
              </div>
            </Card>

            {/* Thông tin khách hàng */}
            <Card title="Thông tin khách hàng" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    name="customerName"
                    label="Tên khách hàng"
                  >
                    <Input prefix={<UserOutlined />} placeholder="Khách lẻ" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    name="customerPhone"
                    label="Số điện thoại"
                  >
                    <Input prefix={<MobileOutlined />} placeholder="Số điện thoại" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Phương thức thanh toán */}
            <Card title="Phương thức thanh toán" size="small" style={{ marginBottom: 16 }}>
              <Form.Item 
                name="paymentMethod"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
              >
                <Radio.Group 
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  buttonStyle="solid"
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {paymentMethods.map(method => (
                      <Radio.Button 
                        key={method.value} 
                        value={method.value}
                        style={{ width: '100%', height: '40px', lineHeight: '32px' }}
                      >
                        {method.icon} {method.label}
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
              
              {/* Chi tiết phương thức thanh toán */}
              <div className="payment-details">
                {paymentMethod === 'cash' && (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Số tiền khách đưa"
                          name="cashAmount"
                          rules={[
                            { required: true, message: 'Vui lòng nhập số tiền khách đưa!' },
                            { 
                              validator: (_, value) => {
                                if (value < (orderData?.netAmount || 0)) {
                                  return Promise.reject('Số tiền không đủ!');
                                }
                                return Promise.resolve();
                              } 
                            }
                          ]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={orderData?.netAmount || 0}
                            step={10000}
                            value={cashAmount}
                            onChange={handleCashAmountChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Tiền thừa"
                          name="changeAmount"
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            disabled
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    {/* Mệnh giá tiền */}
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Chọn mệnh giá:</Text>
                      <div style={{ marginTop: 8 }}>
                        <Space wrap>
                          {cashDenominations.map(value => (
                            <Button 
                              key={value} 
                              onClick={() => handleDenominationClick(value)}
                            >
                              {formatCurrency(value)}
                            </Button>
                          ))}
                          <Button 
                            type="primary"
                            ghost
                            onClick={handleExactAmountClick}
                          >
                            Tiền chẵn
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'card' && (
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="Số thẻ"
                        name="cardNumber"
                        rules={[{ required: true, message: 'Vui lòng nhập số thẻ!' }]}
                      >
                        <Input placeholder="Số thẻ" maxLength={19} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Tên chủ thẻ"
                        name="cardHolderName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chủ thẻ!' }]}
                      >
                        <Input placeholder="Tên chủ thẻ" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Hạn thẻ"
                        name="cardExpiry"
                        rules={[{ required: true, message: 'Vui lòng nhập hạn thẻ!' }]}
                      >
                        <Input placeholder="MM/YY" maxLength={5} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="CVC/CVV"
                        name="cardCVC"
                        rules={[{ required: true, message: 'Vui lòng nhập mã CVC/CVV!' }]}
                      >
                        <Input placeholder="CVC/CVV" maxLength={4} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {(paymentMethod === 'momo' || paymentMethod === 'vnpay' || paymentMethod === 'zalopay') && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <QrcodeOutlined style={{ fontSize: 100, marginBottom: 16 }} />
                    <Title level={4}>Quét mã QR để thanh toán</Title>
                    <Text type="secondary">
                      Số tiền: {formatCurrency(orderData?.netAmount || 0)}
                    </Text>
                    <br />
                    <Text type="secondary">
                      Sử dụng ứng dụng {
                        paymentMethod === 'momo' ? 'MoMo' : 
                        paymentMethod === 'vnpay' ? 'VNPay' : 'ZaloPay'
                      } để quét mã
                    </Text>
                    <Form.Item
                      name="transactionId"
                      label="Mã giao dịch"
                      style={{ marginTop: 16 }}
                    >
                      <Input placeholder="Nhập mã giao dịch (nếu có)" />
                    </Form.Item>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Space direction="vertical">
                      <Text strong>Thông tin chuyển khoản</Text>
                      <Descriptions column={1}>
                        <Descriptions.Item label="Tên tài khoản">CONG TY TNHH TRUONG PHAT</Descriptions.Item>
                        <Descriptions.Item label="Số tài khoản">0123456789</Descriptions.Item>
                        <Descriptions.Item label="Ngân hàng">Vietcombank - CN Hòa Bình</Descriptions.Item>
                        <Descriptions.Item label="Số tiền">{formatCurrency(orderData?.netAmount || 0)}</Descriptions.Item>
                        <Descriptions.Item label="Nội dung">THANHTOAN HD{Date.now().toString().slice(-6)}</Descriptions.Item>
                      </Descriptions>
                      <QrcodeOutlined style={{ fontSize: 100, margin: '16px 0' }} />
                      <Form.Item
                        name="transactionId"
                        label="Mã giao dịch"
                      >
                        <Input placeholder="Nhập mã giao dịch ngân hàng" />
                      </Form.Item>
                    </Space>
                  </div>
                )}
              </div>
            </Card>

            {/* Ghi chú */}
            <Card title="Ghi chú" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="note">
                <Input.TextArea rows={2} placeholder="Ghi chú cho đơn hàng (nếu có)" />
              </Form.Item>
            </Card>

            {/* Nút điều khiển */}
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button 
                  type="default" 
                  onClick={handleCancel}
                  icon={<RollbackOutlined />}
                >
                  Quay lại
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={processingStatus === 'processing'}
                  icon={<CheckCircleOutlined />}
                >
                  Xác nhận thanh toán
                </Button>
              </Space>
            </Form.Item>
          </Form>
        );

      case 1: // Bước hoàn thành và in hóa đơn
        return (
          <div className="payment-completion">
            <Result
              status="success"
              title="Thanh toán thành công!"
              subTitle={`Mã hóa đơn: ${receiptData?.id || 'HD000000'} - ${receiptData?.date || new Date().toLocaleString()}`}
              extra={[
                <Button 
                  type="primary" 
                  key="print" 
                  onClick={handlePrintReceipt}
                  loading={printStatus === 'printing'}
                  icon={<PrinterOutlined />}
                >
                  In hóa đơn
                </Button>,
                <Button
                  key="complete"
                  onClick={handleComplete}
                  icon={<CheckCircleOutlined />}
                >
                  Hoàn thành
                </Button>,
                <Button 
                  key="new" 
                  type="default"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleComplete}
                >
                  Đơn hàng mới
                </Button>
              ]}
            >
              <div className="receipt-summary">
                <Card title="Chi tiết hóa đơn" style={{ marginTop: 16 }}>
                  <Descriptions column={2}>
                    <Descriptions.Item label="Khách hàng">{receiptData?.customerName || 'Khách lẻ'}</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">{receiptData?.customerPhone || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                      {paymentMethods.find(m => m.value === receiptData?.paymentMethod)?.label || 'Tiền mặt'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thu ngân">{receiptData?.cashier || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: '12px 0' }} />

                  {/* Danh sách sản phẩm */}
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Sản phẩm</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>SL</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Đơn giá</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptData?.items?.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px', textAlign: 'left' }}>{item.name}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Divider style={{ margin: '12px 0' }} />

                  {/* Tổng cộng */}
                  <Row>
                    <Col span={12} offset={12}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Tổng tiền:</Text>
                          <Text>{formatCurrency(receiptData?.totalAmount || 0)}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Chiết khấu:</Text>
                          <Text type="danger">- {formatCurrency(receiptData?.totalDiscount || 0)}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>Thành tiền:</Text>
                          <Text strong>{formatCurrency(receiptData?.netAmount || 0)}</Text>
                        </div>
                        
                        {receiptData?.paymentMethod === 'cash' && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Tiền khách đưa:</Text>
                              <Text>{formatCurrency(receiptData?.cashAmount || 0)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Tiền thừa:</Text>
                              <Text>{formatCurrency(receiptData?.changeAmount || 0)}</Text>
                            </div>
                          </>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </div>
            </Result>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="payment-processor">
      <Steps 
        current={currentStep}
        style={{ marginBottom: 24 }}
      >
        <Step title="Thanh toán" description="Nhập thông tin thanh toán" />
        <Step title="Hoàn thành" description="Xử lý hóa đơn" />
      </Steps>

      <div className="steps-content">
        {renderPaymentStep()}
      </div>
    </div>
  );
};

export default PaymentProcessor; 