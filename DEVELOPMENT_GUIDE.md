# 🛠️ KhoChuan POS - Development Guide

> **Hướng dẫn phát triển chi tiết cho đội ngũ developer**

## 📋 **Table of Contents**

1. [Project Structure](#project-structure)
2. [Development Rules](#development-rules)
3. [Coding Standards](#coding-standards)
4. [API Integration](#api-integration)
5. [Component Guidelines](#component-guidelines)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Process](#deployment-process)
8. [Troubleshooting](#troubleshooting)

## 🏗️ **Project Structure**

### **Frontend Architecture**
```
frontend/src/
├── 🔐 auth/                    # Authentication & Authorization
│   ├── AuthContext.jsx         # Global auth state management
│   ├── ProtectedRoute.jsx      # Route protection wrapper
│   ├── RoleBasedAccess.jsx     # Component-level access control
│   └── permissions.js          # Permission matrix & role definitions
│
├── 🎨 components/              # Reusable Components
│   ├── common/                 # Layout & Navigation
│   │   ├── Layout/
│   │   │   ├── AdminLayout.jsx     # Admin dashboard layout
│   │   │   ├── CashierLayout.jsx   # POS terminal layout
│   │   │   └── StaffLayout.jsx     # Staff interface layout
│   │   ├── Header/             # Navigation headers
│   │   ├── Sidebar/            # Navigation sidebars
│   │   └── Footer/             # Page footers
│   │
│   ├── ui/                     # UI Components
│   │   ├── DataTable/          # Enhanced data tables
│   │   ├── Charts/             # Chart components
│   │   ├── Forms/              # Form components
│   │   ├── Modals/             # Modal dialogs
│   │   └── Notifications/      # Alert & notification system
│   │
│   └── features/               # Feature-specific Components
│       ├── ProductGrid/        # Product selection grid
│       ├── Cart/               # Shopping cart
│       ├── PaymentTerminal/    # Payment processing
│       ├── InventoryTracker/   # Real-time inventory
│       ├── AIRecommendations/  # AI-powered suggestions
│       └── GamificationWidgets/ # Gamification elements
│
├── 📱 pages/                   # Page Components
│   ├── admin/                  # Admin Dashboard Pages
│   │   ├── Dashboard/          # Analytics & overview
│   │   ├── Products/           # Product management
│   │   ├── Inventory/          # Inventory management
│   │   ├── Orders/             # Order management
│   │   ├── Reports/            # Reporting & analytics
│   │   ├── Staff/              # Staff management
│   │   ├── Customers/          # Customer management
│   │   ├── Integrations/       # Third-party integrations
│   │   └── Settings/           # System configuration
│   │
│   ├── cashier/                # Cashier Interface Pages
│   │   ├── POS/                # Point of sale terminal
│   │   ├── Orders/             # Order processing
│   │   ├── Customers/          # Customer lookup
│   │   └── Session/            # Shift management
│   │
│   └── staff/                  # Staff Interface Pages
│       ├── Dashboard/          # Personal dashboard
│       ├── Gamification/       # Achievements & rewards
│       ├── Sales/              # Sales tracking
│       ├── Training/           # Training modules
│       └── Profile/            # Personal profile
│
├── 🤖 services/                # API Services
│   ├── api/                    # REST API clients
│   │   ├── auth.js             # Authentication API
│   │   ├── products.js         # Product management API
│   │   ├── orders.js           # Order management API
│   │   ├── inventory.js        # Inventory API
│   │   ├── customers.js        # Customer management API
│   │   ├── analytics.js        # Analytics API
│   │   └── gamification.js     # Gamification API
│   │
│   ├── ai/                     # AI/ML Services
│   │   ├── demandForecasting.js    # Demand prediction
│   │   ├── recommendationEngine.js # Product recommendations
│   │   ├── priceOptimization.js    # Price optimization
│   │   └── customerSegmentation.js # Customer analysis
│   │
│   ├── hardware/               # Hardware Integrations
│   │   ├── printerService.js   # Receipt printer
│   │   ├── barcodeScanner.js   # Barcode scanning
│   │   ├── cashDrawer.js       # Cash drawer control
│   │   └── paymentTerminal.js  # Payment terminal
│   │
│   └── ecommerce/              # E-commerce Integrations
│       ├── shopeeIntegration.js    # Shopee API
│       ├── lazadaIntegration.js    # Lazada API
│       ├── tikiIntegration.js      # Tiki API
│       └── unifiedCommerce.js      # Unified commerce layer
│
├── 🛠️ utils/                   # Utilities & Helpers
│   ├── constants/              # Application constants
│   ├── helpers/                # Helper functions
│   ├── hooks/                  # Custom React hooks
│   └── context/                # React contexts
│
├── 🎨 styles/                  # Styling
│   ├── globals.css             # Global styles
│   ├── themes/                 # Theme definitions
│   └── components/             # Component-specific styles
│
└── 📦 assets/                  # Static Assets
    ├── images/                 # Images & graphics
    ├── icons/                  # Icon files
    ├── sounds/                 # Audio files
    └── animations/             # Animation files
```

## 📝 **Development Rules**

### **🚫 Strict Prohibitions**
- **NO Mock Data**: Chỉ sử dụng API thật, không mock/demo data
- **NO Test Files**: Không tạo file test/demo trong production code
- **NO Placeholder Content**: Mọi content phải thật và có ý nghĩa
- **NO Temporary Solutions**: Chỉ implement giải pháp production-ready

### **✅ Required Practices**
- **Real API Integration**: Kết nối với backend API thật 100%
- **Production Quality**: Code phải đạt chất lượng production
- **Performance First**: Tối ưu performance từ đầu
- **Security Focus**: Implement security best practices
- **Mobile Responsive**: Thiết kế mobile-first

### **🔄 Workflow Process**
1. **Planning**: Phân tích requirement chi tiết
2. **Design**: Thiết kế component/page structure
3. **Implementation**: Code theo standards
4. **Testing**: Test functionality đầy đủ
5. **Review**: Code review và feedback
6. **Deployment**: Deploy và monitor

## 💻 **Coding Standards**

### **File Naming Conventions**
```bash
# Components: PascalCase
AdminDashboard.jsx
ProductManagement.jsx
CustomerSegmentation.jsx

# Utilities & Services: camelCase
authUtils.js
apiClient.js
formatHelpers.js

# Constants: UPPER_SNAKE_CASE
API_ENDPOINTS.js
USER_ROLES.js
BUSINESS_RULES.js

# Styles: kebab-case
admin-dashboard.css
product-grid.css
payment-terminal.css
```

### **Component Structure Template**
```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, message } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { productAPI } from '../../services/api/products';
import './ComponentName.css';

/**
 * ComponentName - Brief description of component purpose
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Component title
 * @param {Function} props.onAction - Action callback
 * @returns {JSX.Element} Rendered component
 */
const ComponentName = ({ title, onAction }) => {
  // 1. State declarations
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // 2. Hooks
  const { user, hasPermission } = useAuth();

  // 3. Effects
  useEffect(() => {
    loadData();
  }, []);

  // 4. Event handlers
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productAPI.getAll();
      setData(response.data);
    } catch (err) {
      setError(err.message);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = useCallback(() => {
    onAction?.();
  }, [onAction]);

  // 5. Conditional rendering
  if (!hasPermission('products.view')) {
    return <div>Bạn không có quyền truy cập</div>;
  }

  // 6. Main render
  return (
    <Card 
      title={title}
      loading={loading}
      className="component-name"
    >
      {error ? (
        <div className="error-state">
          <p>Lỗi: {error}</p>
          <Button onClick={loadData}>Thử lại</Button>
        </div>
      ) : (
        <div className="content">
          {/* Component content */}
        </div>
      )}
    </Card>
  );
};

export default ComponentName;
```

### **API Service Template**
```javascript
import apiClient from './index';

/**
 * Module API Service
 * Handles all module-related API operations
 */
export const moduleAPI = {
  // Get all items with pagination and filters
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/module', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải dữ liệu');
    }
  },

  // Get single item by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/module/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải thông tin');
    }
  },

  // Create new item
  create: async (data) => {
    try {
      const response = await apiClient.post('/module', data);
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo mới');
    }
  },

  // Update existing item
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/module/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật');
    }
  },

  // Delete item
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/module/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa');
    }
  }
};

export default moduleAPI;
```

## 🎨 **UI/UX Guidelines**

### **Design Principles**
- **Consistency**: Sử dụng design system thống nhất
- **Accessibility**: Tuân thủ WCAG 2.1 AA standards
- **Performance**: Optimize cho loading speed
- **Mobile-First**: Thiết kế mobile trước, desktop sau

### **Color System**
```css
:root {
  /* Brand Colors */
  --primary-blue: #1890ff;
  --primary-green: #52c41a;
  --primary-purple: #722ed1;
  --primary-orange: #fa8c16;

  /* Status Colors */
  --success: #52c41a;
  --warning: #faad14;
  --error: #ff4d4f;
  --info: #1890ff;

  /* Neutral Colors */
  --text-primary: #262626;
  --text-secondary: #8c8c8c;
  --text-disabled: #bfbfbf;
  --background: #f0f2f5;
  --surface: #ffffff;
  --border: #d9d9d9;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #1890ff, #36cfc9);
  --gradient-success: linear-gradient(135deg, #52c41a, #73d13d);
  --gradient-warning: linear-gradient(135deg, #faad14, #ffc53d);
}
```

### **Typography Scale**
```css
/* Heading Styles */
.h1 { font-size: 32px; font-weight: 700; line-height: 1.2; }
.h2 { font-size: 24px; font-weight: 600; line-height: 1.3; }
.h3 { font-size: 20px; font-weight: 600; line-height: 1.4; }
.h4 { font-size: 16px; font-weight: 600; line-height: 1.4; }

/* Body Text */
.body-large { font-size: 16px; line-height: 1.5; }
.body-medium { font-size: 14px; line-height: 1.5; }
.body-small { font-size: 12px; line-height: 1.4; }

/* Special Text */
.caption { font-size: 12px; color: var(--text-secondary); }
.overline { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
```

## 🧪 **Testing Strategy**

### **Test Types**
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright automation
- **Performance Tests**: Lighthouse CI
- **Security Tests**: OWASP compliance

### **Test Coverage Requirements**
- **Components**: 80% minimum coverage
- **Services**: 90% minimum coverage
- **Utils**: 95% minimum coverage
- **Critical Paths**: 100% coverage

### **E2E Test Scenarios**
```javascript
// tests/e2e/admin-login.spec.js
test('Admin can login successfully', async ({ page }) => {
  await page.goto('/admin/login');
  
  await page.fill('[data-testid="email"]', 'admin@truongphat.com');
  await page.fill('[data-testid="password"]', 'admin123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/admin/dashboard');
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
});
```

## 🚀 **Deployment Process**

### **Environment Setup**
```bash
# Development
npm run dev:frontend    # Port 5173
npm run dev:backend     # Port 3000

# Production Build
npm run build:frontend
npm run build:backend

# Deployment
npm run deploy:frontend  # Cloudflare Pages
npm run deploy:backend   # Cloudflare Workers
npm run deploy:all       # Full deployment
```

### **CI/CD Pipeline**
1. **Code Push**: Developer pushes to feature branch
2. **Automated Tests**: Run unit, integration, E2E tests
3. **Code Quality**: ESLint, Prettier, type checking
4. **Security Scan**: Dependency vulnerability check
5. **Build**: Create production builds
6. **Deploy**: Deploy to staging/production
7. **Health Check**: Verify deployment success

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### **API Connection Issues**
```javascript
// Check API endpoint configuration
console.log('API URL:', import.meta.env.VITE_API_URL);

// Verify authentication token
console.log('Auth Token:', localStorage.getItem('khochuan_token'));
```

#### **Performance Issues**
```javascript
// Enable React DevTools Profiler
// Check for unnecessary re-renders
// Optimize with React.memo, useMemo, useCallback
```

### **Debug Tools**
- **React DevTools**: Component inspection
- **Redux DevTools**: State management debugging
- **Network Tab**: API call monitoring
- **Lighthouse**: Performance analysis
- **Sentry**: Error tracking

---

**📞 Support**: info@truongphat.com | **📱 Phone**: +84-123-456-789
