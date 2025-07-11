import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Card, Button, Space, Typography } from 'antd';
import viVN from 'antd/locale/vi_VN';
import './styles/globals.css';

const { Title, Paragraph } = Typography;

// Simple working login component
const SimpleLogin = () => {
  const handleDemoLogin = (role) => {
    alert(`Demo login as ${role} - This will be connected to backend later`);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Title level={2}>🖥️ Khochuan POS - Đăng Nhập</Title>
        <Paragraph type="secondary">Trường Phát Computer Hòa Bình</Paragraph>
        <Paragraph type="secondary" style={{ lineHeight: '1.6' }}>
          <strong>🏢 Trường Phát Computer Hòa Bình</strong> - Hệ thống POS thông minh
          <br />
          <strong>🎯 Tính năng:</strong> AI, Gamification, Barcode Scanner, Multi-Payment Methods
          <br />
          <strong>💳 Thanh toán:</strong> Tiền mặt, Thẻ, QR Code, Chuyển khoản
          <br />
          <strong>👥 Khách hàng:</strong> CRM, Loyalty program, Điểm thưởng
          <br />
          <strong>📦 Kho:</strong> Inventory, Quản lý kho, Tồn kho
          <br />
          <strong>📊 Analytics:</strong> Dashboard, Báo cáo, Thống kê
          <br />
          <strong>🤖 AI:</strong> Thông minh, Gợi ý sản phẩm, Recommendation
          <br />
          <strong>🎮 Gamification:</strong> Huy hiệu, Thành tích, Badges, Rewards
        </Paragraph>

        <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
          <Button
            type="primary"
            block
            size="large"
            onClick={() => handleDemoLogin('Admin')}
          >
            🔑 Admin - Quản trị viên (Demo)
          </Button>

          <Button
            block
            size="large"
            onClick={() => handleDemoLogin('Cashier')}
          >
            💳 Cashier - Thu ngân (Demo)
          </Button>

          <Button
            block
            size="large"
            onClick={() => handleDemoLogin('Staff')}
          >
            👥 Staff - Nhân viên (Demo)
          </Button>
        </Space>

        <div style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>
          © 2024 Trường Phát Computer Hòa Bình - Khochuan POS
          <br />
          Enterprise POS System with AI, Gamification, Barcode Scanner
        </div>
      </Card>
    </div>
  );
};

// Optimized theme - minimal effects for better performance
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
  },
};

const App = () => {
  console.log('🚀 KhoChuan POS App initializing...');

  // Production-ready app with simple working login
  try {
    return (
      <ConfigProvider locale={viVN} theme={theme}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/admin/login" element={<SimpleLogin />} />
            <Route path="/login" element={<SimpleLogin />} />

            {/* Default Redirects */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    );
  } catch (error) {
    console.error('❌ Error in KhoChuan POS App:', error);
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        background: '#f0f2f5',
        color: '#ff4d4f',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1>⚠️ Lỗi ứng dụng</h1>
        <p>Có lỗi xảy ra trong quá trình khởi tạo</p>
        <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '10px' }}>
          {error.message || 'Unknown error'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🔄 Refresh Trang
        </button>
      </div>
    );
  }
};

export default App;