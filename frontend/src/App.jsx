import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './routes';
import './styles/globals.css';

// Enhanced theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  components: {
    Card: {
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
  },
};

function App() {
  console.log('🚀 App component rendering...');

  // Test mode - bypass AuthContext temporarily
  const isTestMode = window.location.search.includes('test=true');

  if (isTestMode) {
    console.log('🧪 Test mode enabled - bypassing AuthContext');
    return (
      <ConfigProvider locale={viVN} theme={theme}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1890ff 0%, #0958d9 100%)',
          color: 'white'
        }}>
          <h1>🖥️ Trường Phát Computer Hòa Bình</h1>
          <p>Test mode - App is working!</p>
          <p>React app initialized successfully</p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#1890ff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Go to Login
          </button>
        </div>
      </ConfigProvider>
    );
  }

  // Add error boundary for AuthProvider
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
      <ConfigProvider locale={viVN} theme={theme}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
          color: 'white',
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
              background: 'white',
              color: '#ff4d4f',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            🔄 Refresh Trang
          </button>
        </div>
      </ConfigProvider>
    );
  }
}

export default App;