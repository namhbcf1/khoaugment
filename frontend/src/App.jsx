import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './auth/AuthContext';
import { CartProvider } from './utils/context/CartContext';
import AppRoutes from './routes.jsx';
import { initPerformanceMonitoring, PerformanceMonitor } from './utils/performance';
import { SmartLoader } from './components/common/LoadingOptimizer';
import './styles/globals.css';

// Enhanced loading component
const LoadingFallback = () => (
  <SmartLoader
    context="page"
    tip="Đang tải KhoAugment POS..."
    size="large"
  />
);

// Ant Design theme - Using design tokens for consistency
const theme = {
  token: {
    // Colors from design tokens
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    // Typography from design tokens
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeightStrong: 600,

    // Spacing from design tokens
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 2,

    // Layout
    controlHeight: 32,
    controlHeightSM: 24,
    controlHeightLG: 40,
  },
  components: {
    Layout: {
      bodyBg: '#f0f2f5',
      headerBg: '#001529',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
    },
    Button: {
      fontWeight: 500,
    },
    Table: {
      headerBg: '#fafafa',
    },
    Card: {
      borderRadius: 12,
    },
  },
};

function App() {
  useEffect(() => {
    // Initialize performance monitoring
    PerformanceMonitor.mark('app-init');
    initPerformanceMonitoring();

    // Mark app as ready
    const handleLoad = () => {
      PerformanceMonitor.measure('app-init');
      console.log('🚀 KhoAugment POS loaded successfully');
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="app">
              <Suspense fallback={<LoadingFallback />}>
                <AppRoutes />
              </Suspense>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;