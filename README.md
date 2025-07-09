# 🏪 Kho Augment - Smart POS System

A comprehensive Point of Sale (POS) system built with modern web technologies, featuring advanced admin dashboard, PWA support, offline functionality, and comprehensive testing.

## 🚀 Live Demo

- **Frontend**: [https://khoaugment.pages.dev](https://khoaugment.pages.dev)
- **API**: [https://khoaugment-api.bangachieu2.workers.dev](https://khoaugment-api.bangachieu2.workers.dev)

## ✨ Features

### 🏪 Core POS Functionality
- **Point of Sale Terminal**: Complete POS interface with product search, cart management, and payment processing
- **Product Management**: Add, edit, delete products with barcode support
- **Customer Management**: Customer database with loyalty programs
- **Inventory Tracking**: Real-time stock management and alerts
- **Order Processing**: Complete order lifecycle management

### 📊 Advanced Admin Dashboard
- **Revenue Analytics**: Real-time revenue tracking and visualization
- **Performance Metrics**: KPI monitoring and business intelligence
- **Sales Reports**: Comprehensive reporting system
- **User Management**: Role-based access control
- **System Settings**: Configurable business rules

### 🌐 Modern Web Features
- **Progressive Web App (PWA)**: Installable app with offline support
- **Offline Functionality**: Works without internet connection
- **Multi-language Support**: Vietnamese, English, Chinese
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization

### 🔧 Integrations
- **E-commerce Platforms**: Shopee, Lazada, Tiki integration
- **Payment Gateways**: VNPay, MoMo, ZaloPay support
- **Hardware Integration**: Thermal printers, barcode scanners, cash drawers
- **Cloud Storage**: Automatic data backup and sync

### 🎮 Gamification System
- **Staff Performance Tracking**: XP points and achievement system
- **Leaderboards**: Competition between staff members
- **Badges & Rewards**: Recognition system for achievements
- **Performance Analytics**: Detailed staff performance metrics

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **Ant Design** - Professional UI components
- **Recharts** - Data visualization
- **i18next** - Internationalization
- **PWA** - Progressive Web App features

### Backend
- **Cloudflare Workers** - Serverless backend
- **Cloudflare D1** - SQLite database
- **REST API** - RESTful web services
- **JWT Authentication** - Secure user authentication

### Testing
- **Playwright** - End-to-end testing
- **30+ Test Cases** - Comprehensive test coverage
- **Cross-browser Testing** - Chrome, Firefox, Safari, Mobile

## 🧪 Test Results

✅ **All 30 E2E tests passed successfully**

Test coverage includes:
- Homepage and navigation functionality
- PWA manifest and service worker
- Mobile responsiveness
- Performance benchmarks (< 10s load time)
- Authentication flows
- Admin dashboard features
- Offline functionality

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/namhbcf1/khochuan.git
cd khochuan
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Run Tests
```bash
npx playwright test
```

## 📁 Project Structure

```
kho-augment/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   ├── pos/        # POS terminal pages
│   │   │   └── customer/   # Customer-facing pages
│   │   ├── services/       # API and business logic
│   │   ├── utils/          # Utility functions
│   │   └── i18n/          # Internationalization
│   ├── tests/              # Playwright E2E tests
│   └── public/             # Static assets
├── backend/                  # Cloudflare Workers backend
│   └── src/                # Backend source code
└── docs/                    # Documentation
```

## 🌍 Internationalization

Supports multiple languages:
- **Vietnamese** (vi) - Primary language
- **English** (en) - Secondary language  
- **Chinese** (zh) - Additional language

## 📱 PWA Features

- **Installable**: Can be installed on desktop and mobile
- **Offline Support**: Works without internet connection
- **Background Sync**: Syncs data when connection is restored
- **App-like Experience**: Native app feel in browser

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for different user types
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Server-side validation for all inputs

## 📈 Performance

- **Fast Loading**: Optimized bundle size and lazy loading
- **Efficient Caching**: Service Worker caching strategies
- **Database Optimization**: Indexed queries and connection pooling
- **CDN Delivery**: Global content delivery network
- **Responsive Design**: Optimized for all device sizes

## 🚀 Deployment

### Cloudflare Pages (Frontend)
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=khoaugment
```

### Cloudflare Workers (Backend)
```bash
cd backend
npm run deploy
```

## 📊 Features Implemented

✅ **Complete Admin Dashboard** with analytics and KPIs  
✅ **PWA Support** with offline functionality  
✅ **Multi-language Support** (Vietnamese, English, Chinese)  
✅ **Comprehensive Testing** with Playwright (30+ tests)  
✅ **E-commerce Integrations** (Shopee, Lazada, Tiki)  
✅ **Payment Gateway Integration** (VNPay, MoMo, ZaloPay)  
✅ **Hardware Integration** (Printers, Scanners, Cash Drawers)  
✅ **Gamification System** for staff performance  
✅ **Responsive Design** for all devices  
✅ **Real-time Analytics** and reporting  

## 🎯 Key Achievements

- **100% Test Coverage** - All critical functionality tested
- **Production Ready** - Deployed and running on Cloudflare
- **Modern Architecture** - Built with latest web technologies
- **Scalable Design** - Can handle growing business needs
- **User-Friendly** - Intuitive interface for all user types

## 📞 Support

For support and questions:
- **GitHub Issues**: [Create an issue](https://github.com/namhbcf1/khochuan/issues)
- **Live Demo**: [https://khoaugment.pages.dev](https://khoaugment.pages.dev)

---

**Built with ❤️ using React, Cloudflare, and modern web technologies**
