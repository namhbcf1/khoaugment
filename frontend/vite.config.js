import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }

          // Ant Design core
          if (id.includes('node_modules/antd')) {
            return 'antd-core';
          }

          // Ant Design icons (separate chunk due to size)
          if (id.includes('node_modules/@ant-design/icons')) {
            return 'antd-icons';
          }

          // Charts library (Recharts is large)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'charts';
          }

          // Date/time utilities
          if (id.includes('node_modules/dayjs') || id.includes('node_modules/moment')) {
            return 'datetime';
          }

          // HTTP client
          if (id.includes('node_modules/axios')) {
            return 'http';
          }

          // Utility libraries
          if (id.includes('node_modules/lodash') || id.includes('node_modules/ramda')) {
            return 'utils';
          }

          // React Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query';
          }

          // Split large vendor libraries individually
          if (id.includes('node_modules/@babel/') || id.includes('node_modules/core-js/')) {
            return 'polyfills';
          }

          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/history/')) {
            return 'router';
          }

          if (id.includes('node_modules/react-query/') || id.includes('node_modules/@tanstack/')) {
            return 'react-query';
          }

          if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
            return 'i18n';
          }

          // Other vendor libraries - split into smaller chunks
          if (id.includes('node_modules/')) {
            // Split by first level package name to avoid huge vendor chunk
            const chunks = id.split('node_modules/')[1].split('/')[0];
            if (chunks.startsWith('@')) {
              // Scoped packages
              const scopedName = id.split('node_modules/')[1].split('/').slice(0, 2).join('-');
              return `vendor-${scopedName.replace('@', '')}`;
            }
            return `vendor-${chunks}`;
          }

          // App pages - split by feature
          if (id.includes('/src/pages/admin/')) {
            return 'admin-pages';
          }

          if (id.includes('/src/pages/cashier/') || id.includes('/src/pages/POS')) {
            return 'pos-pages';
          }

          if (id.includes('/src/pages/customer/')) {
            return 'customer-pages';
          }

          if (id.includes('/src/pages/staff/')) {
            return 'staff-pages';
          }

          // AI and Analytics features
          if (id.includes('/src/components/AI/') || id.includes('/src/pages/AIFeatures')) {
            return 'ai-features';
          }

          if (id.includes('/src/pages/Analytics') || id.includes('/src/pages/admin/Reports/')) {
            return 'analytics';
          }

          // Common components
          if (id.includes('/src/components/common/') || id.includes('/src/components/ui/')) {
            return 'common-components';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = (chunkInfo && chunkInfo.facadeModuleId) ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 500, // Lower threshold to catch issues earlier
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    '__DEV__': JSON.stringify(process.env.NODE_ENV === 'development')
  }
});