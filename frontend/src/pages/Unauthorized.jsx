import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Typography, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Paragraph, Text } = Typography;

/**
 * Trang Error 403 - Không có quyền truy cập
 */
const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="Rất tiếc, bạn không có quyền truy cập vào trang này."
        extra={
          <>
            <Paragraph>
              <Text type="secondary">
                Bạn không có đủ quyền để truy cập: <Text code>{location.pathname}</Text>
              </Text>
            </Paragraph>
            
            <Space>
              <Button 
                type="primary" 
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
              >
                Trang chủ
              </Button>
              
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
              >
                Quay lại
              </Button>
              
              {!isAuthenticated && (
                <Button
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login', { state: { from: location.pathname } })}
                >
                  Đăng nhập
                </Button>
              )}
            </Space>
          </>
        }
      />
    </div>
  );
};

export default Unauthorized; 