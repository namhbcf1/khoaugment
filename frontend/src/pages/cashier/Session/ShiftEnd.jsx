import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Button, Card, InputNumber, Typography, Space,
  Divider, message, Alert, Steps, Row, Col, Statistic,
  Descriptions, Spin, Result, Table, Tag, Select, Checkbox
} from 'antd';
import {
  DollarOutlined, UserOutlined, CalculatorOutlined, BankOutlined,
  ClockCircleOutlined, CheckOutlined, LoadingOutlined,
  SafetyOutlined, PrinterOutlined, LockOutlined,
  BarChartOutlined, FileDoneOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../../utils/helpers/formatters';
import { useAuth } from '../../../auth/AuthContext';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

/**
 * Component quản lý đóng ca làm việc cho nhân viên thu ngân
 */
const ShiftEnd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shiftData, setShiftData] = useState(null);
  const [drawerAmount, setDrawerAmount] = useState(0);
  const [expectedDrawerAmount, setExpectedDrawerAmount] = useState(0);
  const [discrepancy, setDiscrepancy] = useState(0);
  const [denominationAmounts, setDenominationAmounts] = useState({
    '500000': 0, // 500,000 VND
    '200000': 0, // 200,000 VND
    '100000': 0, // 100,000 VND
    '50000': 0,  // 50,000 VND
    '20000': 0,  // 20,000 VND
    '10000': 0,  // 10,000 VND
    '5000': 0,   // 5,000 VND
    '2000': 0,   // 2,000 VND
    '1000': 0,   // 1,000 VND
    'coins': 0   // Coins
  });
  const [printStatus, setPrintStatus] = useState('idle');

  // Giả lập dữ liệu ca làm việc hiện tại
  useEffect(() => {
    const fetchCurrentShift = async () => {
      setLoading(true);
      
      try {
        // Giả lập call API để lấy thông tin ca làm việc hiện tại
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockShiftData = {
          shiftId: 'SHIFT-235689',
          cashier: user?.name || 'Nguyễn Văn A',
          cashierId: user?.id || 'STAFF-001',
          posTerminal: 'POS-01',
          register: 'REGISTER-01',
          startTime: new Date(Date.now() - 28800000).toISOString(), // 8 giờ trước
          endTime: null,
          startAmount: 5000000, // 5 triệu VND
          status: 'active',
          sales: {
            totalOrders: 48,
            totalSales: 23850000, // 23.85 triệu VND
            cashPayments: 15000000, // 15 triệu VND
            cardPayments: 4500000, // 4.5 triệu VND
            momoPayments: 2500000, // 2.5 triệu VND
            vnpayPayments: 1850000, // 1.85 triệu VND
            returns: 2, 
            returnAmount: 450000, // 450k VND
            discounts: 750000, // 750k VND
          },
          transactions: [
            {
              id: 'TXN-001',
              type: 'sale',
              amount: 850000,
              paymentMethod: 'cash',
              time: '09:15',
              orderId: 'ORD-001'
            },
            {
              id: 'TXN-002',
              type: 'sale',
              amount: 1250000,
              paymentMethod: 'card',
              time: '09:45',
              orderId: 'ORD-002'
            },
            {
              id: 'TXN-003',
              type: 'sale',
              amount: 750000,
              paymentMethod: 'momo',
              time: '10:20',
              orderId: 'ORD-003'
            },
            {
              id: 'TXN-004',
              type: 'return',
              amount: -250000,
              paymentMethod: 'cash',
              time: '11:05',
              orderId: 'ORD-004'
            },
            {
              id: 'TXN-005',
              type: 'sale',
              amount: 2350000,
              paymentMethod: 'cash',
              time: '12:30',
              orderId: 'ORD-005'
            }
          ]
        };
        
        setShiftData(mockShiftData);
        
        // Tính toán số tiền dự kiến trong két
        const expected = mockShiftData.startAmount + 
                         mockShiftData.sales.cashPayments - 
                         mockShiftData.sales.returnAmount;
        setExpectedDrawerAmount(expected);
        
        // Điền thông tin vào form
        form.setFieldsValue({
          shiftId: mockShiftData.shiftId,
          posTerminal: mockShiftData.posTerminal,
          register: mockShiftData.register,
          startTime: dayjs(mockShiftData.startTime).format('DD/MM/YYYY HH:mm'),
          startAmount: mockShiftData.startAmount,
          expectedDrawerAmount: expected
        });
      } catch (error) {
        console.error('Error fetching shift data:', error);
        message.error('Không thể tải dữ liệu ca làm việc!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentShift();
  }, [form, user]);

  // Cập nhật tổng tiền khi thay đổi các mệnh giá
  useEffect(() => {
    let total = 0;
    Object.entries(denominationAmounts).forEach(([denomination, count]) => {
      if (denomination === 'coins') {
        total += count;
      } else {
        total += parseInt(denomination) * count;
      }
    });
    setDrawerAmount(total);
    setDiscrepancy(total - expectedDrawerAmount);
    
    form.setFieldsValue({
      drawerAmount: total,
      discrepancy: total - expectedDrawerAmount
    });
  }, [denominationAmounts, expectedDrawerAmount, form]);

  // Thay đổi số lượng tiền theo mệnh giá
  const handleDenominationChange = (denomination, count) => {
    setDenominationAmounts(prev => ({
      ...prev,
      [denomination]: count
    }));
  };

  // Xử lý khi tiếp tục sang bước tiếp theo
  const handleNextStep = () => {
    form.validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch(info => {
        console.error('Validate Failed:', info);
      });
  };

  // Xử lý khi quay lại bước trước
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Xử lý khi gửi form
  const handleFinish = async (values) => {
    setLoading(true);
    
    try {
      // Giả lập call API để đóng ca
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const endShiftData = {
        ...shiftData,
        endTime: new Date().toISOString(),
        drawerAmount: values.drawerAmount,
        expectedDrawerAmount: values.expectedDrawerAmount,
        discrepancy: values.discrepancy,
        note: values.note,
        status: 'closed',
        denominations: denominationAmounts
      };
      
      setShiftData(endShiftData);
      setCurrentStep(currentStep + 1);
      message.success('Đóng ca làm việc thành công!');
    } catch (error) {
      console.error('Error ending shift:', error);
      message.error('Có lỗi xảy ra khi đóng ca làm việc!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý in báo cáo
  const handlePrintReport = async () => {
    setPrintStatus('printing');
    
    try {
      // Giả lập in báo cáo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('Đã in báo cáo ca làm việc!');
      setPrintStatus('success');
    } catch (error) {
      console.error('Error printing report:', error);
      message.error('Có lỗi xảy ra khi in báo cáo!');
      setPrintStatus('error');
    }
  };

  // Xử lý khi hoàn thành
  const handleComplete = () => {
    navigate('/cashier');
  };

  // Render các bước
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Thông tin ca làm việc
        return (
          <Card title="Thông tin ca làm việc">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Đang tải thông tin ca làm việc...</div>
              </div>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item name="shiftId" label="Mã ca làm việc">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="startTime" label="Thời gian bắt đầu">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="posTerminal" label="Máy POS">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="register" label="Quầy thu ngân">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider orientation="left">Thống kê doanh thu</Divider>
                
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Tổng đơn hàng"
                      value={shiftData?.sales?.totalOrders}
                      prefix={<FileDoneOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Tổng doanh thu"
                      value={formatCurrency(shiftData?.sales?.totalSales)}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Đơn hoàn trả"
                      value={shiftData?.sales?.returns}
                      prefix={<SafetyOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Tiền hoàn trả"
                      value={formatCurrency(shiftData?.sales?.returnAmount)}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
                
                <Divider orientation="left">Thống kê theo phương thức thanh toán</Divider>
                
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Tiền mặt"
                      value={formatCurrency(shiftData?.sales?.cashPayments)}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Thẻ"
                      value={formatCurrency(shiftData?.sales?.cardPayments)}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="MoMo"
                      value={formatCurrency(shiftData?.sales?.momoPayments)}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="VNPay"
                      value={formatCurrency(shiftData?.sales?.vnpayPayments)}
                    />
                  </Col>
                </Row>

                <Divider />
                
                <Form.Item>
                  <Button type="primary" onClick={handleNextStep}>
                    Tiếp tục
                  </Button>
                </Form.Item>
              </>
            )}
          </Card>
        );

      case 1: // Kiểm kê tiền mặt
        return (
          <Card title="Kiểm kê tiền mặt">
            <Alert
              message="Hướng dẫn kiểm kê tiền"
              description="Vui lòng đếm và nhập chính xác số lượng của từng mệnh giá tiền trong két. Hệ thống sẽ tự động tính toán số tiền chênh lệch."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Card title="Chi tiết mệnh giá" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Form.Item label="500,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['500000']}
                          onChange={(value) => handleDenominationChange('500000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="200,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['200000']}
                          onChange={(value) => handleDenominationChange('200000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="100,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['100000']}
                          onChange={(value) => handleDenominationChange('100000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="50,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['50000']}
                          onChange={(value) => handleDenominationChange('50000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="20,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['20000']}
                          onChange={(value) => handleDenominationChange('20000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="10,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['10000']}
                          onChange={(value) => handleDenominationChange('10000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="5,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['5000']}
                          onChange={(value) => handleDenominationChange('5000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="2,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['2000']}
                          onChange={(value) => handleDenominationChange('2000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="1,000 VND">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['1000']}
                          onChange={(value) => handleDenominationChange('1000', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Tiền xu (VND)">
                        <InputNumber
                          min={0}
                          value={denominationAmounts['coins']}
                          onChange={(value) => handleDenominationChange('coins', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Kết quả kiểm kê" size="small">
                  <Form.Item name="startAmount" label="Tiền đầu ca">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      disabled
                    />
                  </Form.Item>
                  
                  <Form.Item name="expectedDrawerAmount" label="Tiền mặt dự kiến">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      disabled
                    />
                  </Form.Item>
                  
                  <Form.Item name="drawerAmount" label="Tiền mặt thực tế">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      disabled
                    />
                  </Form.Item>
                  
                  <Form.Item name="discrepancy" label="Chênh lệch">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      disabled
                    />
                  </Form.Item>
                  
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text 
                      type={discrepancy === 0 ? "success" : discrepancy > 0 ? "warning" : "danger"}
                      strong
                      style={{ fontSize: 16 }}
                    >
                      {discrepancy === 0 ? 'Khớp đúng' : 
                        discrepancy > 0 ? `Thừa ${formatCurrency(discrepancy)}` : 
                        `Thiếu ${formatCurrency(Math.abs(discrepancy))}`}
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Form.Item name="note" label="Ghi chú" rules={[{ required: discrepancy !== 0, message: 'Vui lòng ghi chú lý do chênh lệch!' }]}>
              <Input.TextArea 
                rows={3}
                placeholder={discrepancy !== 0 ? "Vui lòng giải thích lý do chênh lệch..." : "Ghi chú (nếu có)"}
              />
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button onClick={handlePreviousStep}>
                  Quay lại
                </Button>
                <Button type="primary" onClick={handleFinish} loading={loading}>
                  Đóng ca làm việc
                </Button>
              </Space>
            </Form.Item>
          </Card>
        );

      case 2: // Hoàn thành
        return (
          <Card>
            <Result
              status="success"
              title="Đóng ca làm việc thành công!"
              subTitle={`Mã ca: ${shiftData?.shiftId || 'N/A'} - Thời gian kết thúc: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`}
              extra={[
                <Button 
                  type="primary" 
                  key="print" 
                  onClick={handlePrintReport}
                  loading={printStatus === 'printing'}
                  icon={<PrinterOutlined />}
                >
                  In báo cáo
                </Button>,
                <Button 
                  key="complete" 
                  onClick={handleComplete}
                  icon={<CheckOutlined />}
                >
                  Hoàn thành
                </Button>
              ]}
            >
              <Descriptions title="Thông tin ca làm việc" column={2}>
                <Descriptions.Item label="Nhân viên">{shiftData?.cashier}</Descriptions.Item>
                <Descriptions.Item label="Máy POS">{shiftData?.posTerminal}</Descriptions.Item>
                <Descriptions.Item label="Thời gian bắt đầu">
                  {dayjs(shiftData?.startTime).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian kết thúc">
                  {dayjs(shiftData?.endTime).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Tiền đầu ca">
                  {formatCurrency(shiftData?.startAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Tiền cuối ca">
                  {formatCurrency(shiftData?.drawerAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng doanh thu">
                  {formatCurrency(shiftData?.sales?.totalSales)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng đơn hàng">
                  {shiftData?.sales?.totalOrders}
                </Descriptions.Item>
                {shiftData?.discrepancy !== 0 && (
                  <Descriptions.Item label="Chênh lệch" span={2}>
                    <Text type={shiftData?.discrepancy > 0 ? "warning" : "danger"}>
                      {shiftData?.discrepancy > 0 ? 
                        `Thừa ${formatCurrency(shiftData?.discrepancy)}` : 
                        `Thiếu ${formatCurrency(Math.abs(shiftData?.discrepancy))}`}
                    </Text>
                  </Descriptions.Item>
                )}
                {shiftData?.note && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {shiftData?.note}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Result>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
          Đóng ca làm việc
        </Title>
        
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Thông tin doanh thu" description="Thống kê doanh thu" />
          <Step title="Kiểm kê tiền mặt" description="Đếm tiền trong két" />
          <Step title="Hoàn thành" description="Xác nhận thông tin" />
        </Steps>
        
        <Form
          form={form}
          layout="vertical"
        >
          {renderStepContent()}
        </Form>
      </Card>
    </div>
  );
};

export default ShiftEnd; 