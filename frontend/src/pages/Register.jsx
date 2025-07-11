import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Select, 
  Checkbox, 
  Divider, 
  Alert, 
  Space,
  message 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  SafetyOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * Trang đăng ký tài khoản mới
 */
const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Xác thực mật khẩu trùng khớp
  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue('password');
    if (!value || password === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
  };

  // Xử lý đăng ký
  const handleRegister = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Đăng ký với thông tin:', values);
      
      // Giả lập đăng ký thành công
      message.success('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.');
      navigate('/login');
    } catch (err) {
      console.error('Đăng ký thất bại:', err);
      setError('Đăng ký thất bại. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f0f2f5', 
      padding: '40px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center' 
    }}>
      <Row justify="center" style={{ width: '100%' }}>
        <Col xs={23} sm={20} md={16} lg={10} xl={8}>
          <Card
            bordered={false}
            style={{ 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={2}>🖥️ Trường Phát Computer</Title>
              <Paragraph type="secondary">
                Tạo tài khoản mới
              </Paragraph>
            </div>

            {error && (
              <Alert
                message="Lỗi đăng ký"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
                closable
              />
            )}

            <Form
              form={form}
              name="register"
              layout="vertical"
              onFinish={handleRegister}
              scrollToFirstError
              initialValues={{
                role: 'customer',
                agreement: false,
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="Họ"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập họ!',
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Nguyễn" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Tên"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập tên!',
                      },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Văn A" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập email!',
                  },
                  {
                    type: 'email',
                    message: 'Email không hợp lệ!',
                  },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập số điện thoại!',
                  },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ!',
                  },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu!',
                  },
                  {
                    min: 8,
                    message: 'Mật khẩu phải có ít nhất 8 ký tự!',
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng xác nhận mật khẩu!',
                  },
                  {
                    validator: validateConfirmPassword,
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="role"
                label="Vai trò"
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="customer">Khách hàng</Option>
                  <Option value="business">Doanh nghiệp</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản!')),
                  },
                ]}
              >
                <Checkbox>
                  Tôi đã đọc và đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link> và{' '}
                  <Link to="/privacy">Chính sách bảo mật</Link>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  icon={<SafetyOutlined />}
                  loading={loading}
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <Divider>
                <Text type="secondary">hoặc</Text>
              </Divider>

              <div style={{ textAlign: 'center' }}>
                <Space>
                  <Text>Đã có tài khoản?</Text>
                  <Link to="/login">Đăng nhập ngay</Link>
                </Space>
              </div>
            </Form>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Text type="secondary">
              © {new Date().getFullYear()} Trường Phát Computer Hòa Bình
            </Text>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Register; 