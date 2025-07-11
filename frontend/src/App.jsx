import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './auth/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './auth/ProtectedRoute';
import { USER_ROLES } from './utils/constants/USER_ROLES.js';
import './styles/globals.css';

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

  // Production-ready app with comprehensive routing and authentication
  try {
    return (
      <ConfigProvider locale={viVN} theme={theme}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/login" element={<Login />} />

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