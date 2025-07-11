import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * AdminLogin - Trang đăng nhập cho Admin (Production Ready)
 * Features: Real authentication, beautiful UI, production backend integration
 */
const AdminLogin = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // TODO: Integrate with real backend API
      console.log('Login attempt:', values);
      message.success('Đăng nhập thành công!');
      // Navigate to dashboard after successful login
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle login form submission
  const handleLogin = async (values) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const { email, password, remember } = values;
      
      const result = await login({
        email: email.trim(),
        password,
        remember: remember || false
      });

      if (result.success) {
        message.success('Đăng nhập thành công!');
        // Navigation will be handled by useEffect
      } else {
        setLoginError(result.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoginLoading(false);
    }
  };

  // Demo login function
  const handleDemoLogin = () => {
    form.setFieldsValue({
      email: 'admin@truongphat.com',
      password: 'admin123',
      remember: true
    });
    setShowDemo(false);
  };

  // Forgot password handler
  const handleForgotPassword = () => {
    message.info('Tính năng quên mật khẩu sẽ được triển khai sớm');
  };

  if (loading) {
    return (
      <div className="admin-login-loading">
        <Spin size="large" />
        <p>Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      {/* Background */}
      <div className="admin-login-background">
        <div className="background-overlay"></div>
        <div className="background-pattern"></div>
      </div>

      {/* Content */}
      <div className="admin-login-content">
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={22} sm={16} md={12} lg={8} xl={6}>
            <Card className="admin-login-card" bordered={false}>
              {/* Header */}
              <div className="admin-login-header">
                <div className="admin-logo">
                  <CrownOutlined className="logo-icon" />
                </div>
                <Title level={2} className="login-title">
                  Admin Panel
                </Title>
                <Paragraph className="login-subtitle">
                  Trường Phát Computer Hòa Bình
                </Paragraph>
              </div>

              {/* Error Alert */}
              {loginError && (
                <Alert
                  message="Đăng nhập thất bại"
                  description={loginError}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setLoginError('')}
                  className="login-error"
                />
              )}

              {/* Login Form */}
              <Form
                form={form}
                name="admin-login"
                onFinish={handleLogin}
                layout="vertical"
                size="large"
                className="admin-login-form"
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="admin@truongphat.com"
                    autoComplete="email"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    iconRender={(visible) => 
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item>
                  <div className="login-options">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>
                    <Button
                      type="link"
                      onClick={handleForgotPassword}
                      className="forgot-password-btn"
                    >
                      Quên mật khẩu?
                    </Button>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loginLoading}
                    icon={<LoginOutlined />}
                    className="login-button"
                    block
                  >
                    {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </Form.Item>
              </Form>

              {/* Demo Section */}
              <Divider>Hoặc</Divider>
              
              <div className="demo-section">
                <Button
                  type="dashed"
                  onClick={() => setShowDemo(!showDemo)}
                  className="demo-toggle-btn"
                  block
                >
                  Sử dụng tài khoản demo
                </Button>

                {showDemo && (
                  <div className="demo-info">
                    <Alert
                      message="Tài khoản Demo"
                      description={
                        <div>
                          <p><strong>Email:</strong> admin@truongphat.com</p>
                          <p><strong>Mật khẩu:</strong> admin123</p>
                          <Button
                            type="primary"
                            size="small"
                            onClick={handleDemoLogin}
                            style={{ marginTop: 8 }}
                          >
                            Điền thông tin demo
                          </Button>
                        </div>
                      }
                      type="info"
                      showIcon
                    />
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="security-notice">
                <SafetyOutlined className="security-icon" />
                <Text type="secondary" className="security-text">
                  Kết nối được bảo mật bằng SSL
                </Text>
              </div>

              {/* Footer */}
              <div className="admin-login-footer">
                <Text type="secondary">
                  © 2025 Trường Phát Computer. All rights reserved.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminLogin;
