import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button, Typography, Space } from 'antd';
import { HomeOutlined, ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

/**
 * Trang Error 500 - Lỗi máy chủ
 */
const ServerError = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Result
        status="500"
        title="500"
        subTitle="Rất tiếc, máy chủ đã gặp lỗi."
        extra={
          <>
            <Paragraph>
              <Text type="secondary">
                Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.
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
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </Button>
              
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
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

export default ServerError; 