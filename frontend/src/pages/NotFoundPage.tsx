import { Button, Result } from 'antd';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
    }}>
      <Helmet>
        <title>404 - Không tìm thấy trang | KhoAugment POS</title>
      </Helmet>
      
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn đang tìm kiếm không tồn tại."
        extra={
          <Link to="/">
            <Button type="primary" size="large">
              Quay lại trang chủ
            </Button>
          </Link>
        }
        style={{ 
          background: 'white', 
          borderRadius: 8, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      />
    </div>
  );
};

export default NotFoundPage; 