import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../stores/authStore';

const { Title } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, loading, error } = useAuthStore();
  const [form] = Form.useForm();
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setLocalLoading(true);
    try {
      await login(values.email, values.password);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
    }}>
      <Helmet>
        <title>Đăng nhập - KhoAugment POS</title>
      </Helmet>
      
      <Card 
        style={{ 
          width: 400, 
          borderRadius: 8, 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img 
            src="/logo.svg" 
            alt="KhoAugment POS" 
            style={{ height: 64, marginBottom: 16 }}
          />
          <Title level={2} style={{ margin: 0 }}>KhoAugment POS</Title>
          <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Hệ thống quản lý bán hàng</p>
        </div>
        
        {error && (
          <Alert
            message="Lỗi đăng nhập"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Mật khẩu" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              loading={loading || localLoading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 13 }}>
            Thông tin đăng nhập mặc định:
          </p>
          <p style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: 13 }}>
            Admin: admin@khoaugment.com / admin123<br />
            Thu ngân: cashier@khoaugment.com / admin123
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage; 