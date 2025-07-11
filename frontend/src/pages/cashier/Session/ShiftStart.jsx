import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Button, Card, InputNumber, Typography, Space,
  DatePicker, TimePicker, Select, Divider, message, Alert,
  Descriptions, Spin, Result, Steps, Row, Col
} from 'antd';
import {
  DollarOutlined, UserOutlined, KeyOutlined, BankOutlined,
  ClockCircleOutlined, CheckOutlined, LoadingOutlined,
  LockOutlined, SaveOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../../utils/helpers/formatters';
import { useAuth } from '../../../auth/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

/**
 * Component quản lý mở ca làm việc cho nhân viên thu ngân
 */
const ShiftStart = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shiftData, setShiftData] = useState(null);
  const [drawerAmount, setDrawerAmount] = useState(0);
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
    form.setFieldsValue({ drawerAmount: total });
  }, [denominationAmounts, form]);

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
      // Giả lập gọi API để mở ca
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newShiftData = {
        shiftId: `SHIFT-${Date.now().toString().slice(-6)}`,
        cashier: user?.name || 'Nhân viên thu ngân',
        cashierId: user?.id,
        startTime: new Date().toISOString(),
        startAmount: values.drawerAmount,
        posTerminal: values.posTerminal,
        register: values.register,
        note: values.note,
        status: 'active',
        denominations: denominationAmounts
      };
      
      setShiftData(newShiftData);
      setCurrentStep(currentStep + 1);
      message.success('Mở ca làm việc thành công!');
    } catch (error) {
      console.error('Error starting shift:', error);
      message.error('Có lỗi xảy ra khi mở ca làm việc!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi hoàn thành
  const handleComplete = () => {
    navigate('/cashier/pos');
  };

  // Render các bước
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Thông tin ca làm việc
        return (
          <Card title="Thông tin ca làm việc">
            <Form.Item
              name="posTerminal"
              label="Máy POS"
              rules={[{ required: true, message: 'Vui lòng chọn máy POS!' }]}
            >
              <Select placeholder="Chọn máy POS">
                <Option value="POS-01">POS-01 (Quầy chính)</Option>
                <Option value="POS-02">POS-02 (Quầy phụ)</Option>
                <Option value="POS-03">POS-03 (Tầng 2)</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="register"
              label="Quầy thu ngân"
              rules={[{ required: true, message: 'Vui lòng chọn quầy thu ngân!' }]}
            >
              <Select placeholder="Chọn quầy thu ngân">
                <Option value="REGISTER-01">Quầy 1</Option>
                <Option value="REGISTER-02">Quầy 2</Option>
                <Option value="REGISTER-03">Quầy 3</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="shiftType"
              label="Loại ca"
              rules={[{ required: true, message: 'Vui lòng chọn loại ca!' }]}
              initialValue="morning"
            >
              <Select placeholder="Chọn loại ca">
                <Option value="morning">Ca sáng (8:00 - 14:00)</Option>
                <Option value="afternoon">Ca chiều (14:00 - 20:00)</Option>
                <Option value="evening">Ca tối (20:00 - 23:00)</Option>
                <Option value="full">Ca đầy đủ (8:00 - 20:00)</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="note"
              label="Ghi chú"
            >
              <Input.TextArea rows={2} placeholder="Ghi chú (nếu có)" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" onClick={handleNextStep}>
                Tiếp tục
              </Button>
            </Form.Item>
          </Card>
        );

      case 1: // Khai báo tiền đầu ca
        return (
          <Card title="Khai báo tiền đầu ca">
            <Alert
              message="Hướng dẫn khai báo tiền đầu ca"
              description="Vui lòng nhập chính xác số lượng của từng mệnh giá tiền trong két. Hệ thống sẽ tự động tính tổng số tiền."
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
                <Card title="Tổng tiền" size="small">
                  <Form.Item
                    name="drawerAmount"
                    label="Tổng tiền trong két"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      disabled
                    />
                  </Form.Item>
                  
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Title level={3}>{formatCurrency(drawerAmount)}</Title>
                    <Text type="secondary">Tổng tiền đầu ca</Text>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Form.Item>
              <Space>
                <Button onClick={handlePreviousStep}>
                  Quay lại
                </Button>
                <Button type="primary" onClick={handleFinish} loading={loading}>
                  Mở ca làm việc
                </Button>
              </Space>
            </Form.Item>
          </Card>
        );

      case 2: // Xác nhận ca làm việc
        return (
          <Card>
            <Result
              status="success"
              title="Mở ca làm việc thành công!"
              subTitle={`Mã ca: ${shiftData?.shiftId || 'N/A'} - Thời gian bắt đầu: ${dayjs(shiftData?.startTime).format('DD/MM/YYYY HH:mm:ss')}`}
              extra={[
                <Button 
                  type="primary" 
                  key="console" 
                  onClick={handleComplete}
                  icon={<CheckOutlined />}
                >
                  Bắt đầu bán hàng
                </Button>,
              ]}
            >
              <Descriptions title="Thông tin ca làm việc">
                <Descriptions.Item label="Nhân viên">{shiftData?.cashier}</Descriptions.Item>
                <Descriptions.Item label="Máy POS">{shiftData?.posTerminal}</Descriptions.Item>
                <Descriptions.Item label="Quầy thu ngân">{shiftData?.register}</Descriptions.Item>
                <Descriptions.Item label="Tiền đầu ca">{formatCurrency(shiftData?.startAmount)}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <span style={{ color: '#52c41a' }}>Đang hoạt động</span>
                </Descriptions.Item>
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
          Mở ca làm việc
        </Title>
        
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Thông tin ca" description="Nhập thông tin ca làm việc" />
          <Step title="Khai báo tiền" description="Khai báo tiền đầu ca" />
          <Step title="Hoàn thành" description="Xác nhận thông tin" />
        </Steps>
        
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            shiftType: 'morning',
            drawerAmount: 0
          }}
        >
          {renderStepContent()}
        </Form>
      </Card>
    </div>
  );
};

export default ShiftStart; 