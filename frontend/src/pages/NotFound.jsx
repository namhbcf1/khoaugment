import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Result, Button, Typography, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

/**
 * Trang Error 404 - Không tìm thấy
 */
const NotFound = () => {
  const location = useLocation();

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Rất tiếc, trang bạn tìm kiếm không tồn tại."
        extra={
          <>
            <Paragraph>
              <Text type="secondary">
                Không thể tìm thấy URL: <Text code>{location.pathname}</Text>
              </Text>
            </Paragraph>
            
            <Space>
              <Button 
                type="primary" 
                icon={<HomeOutlined />}
                onClick={() => window.location.href = '/'}
              >
                Trang chủ
              </Button>
              
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => window.history.back()}
              >
                Quay lại
              </Button>
            </Space>
          </>
        }
      />
    </div>
  );
};

export default NotFound; 