import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './routes.jsx';
import './styles/globals.css';

// Optimized theme - minimal effects for better performance
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    motionDurationSlow: '0.1s',
    motionDurationMid: '0.1s',
    motionDurationFast: '0.05s',
  },
  components: {
    Card: {
      boxShadow: 'none',
    },
    Button: {
      boxShadow: 'none',
    },
  },
};

function App() {
  console.log('🚀 App component rendering...');

  // Simple and fast app initialization
  try {
    return (
      <ConfigProvider locale={viVN} theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    );
  } catch (error) {
    console.error('❌ Error in App component:', error);
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
}

export default App;