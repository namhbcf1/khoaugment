# KhoAugment POS System

A comprehensive Point of Sale (POS) system optimized for the Vietnamese market, built with Cloudflare's edge computing platform.

## 🌟 Features

- 📦 **Product Management**: Barcode support, categories, and inventory tracking
- 🛒 **Order Processing**: Quick checkout, receipts, and order history
- 💰 **Payment Integration**: Support for Vietnamese payment methods (VNPay, MoMo, ZaloPay)
- 👥 **Customer Management**: Customer profiles, purchase history, and loyalty programs
- 📊 **Analytics**: Sales reports, inventory insights, and business metrics
- 👮 **User Roles**: Admin, cashier, and staff roles with appropriate permissions
- 🌐 **Multi-language**: Full Vietnamese and English language support
- 🔄 **Real-time Updates**: Inventory and order status updates in real-time

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **State Management**: Zustand & React Query
- **Deployment**: Cloudflare Pages

### Backend

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Cache**: Cloudflare KV

## 📋 Requirements

- Node.js 16.0.0 or higher
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with Workers, D1, R2, and KV access

## 🚀 Getting Started

### Quick Start

Run the local development environment:

```bash
./scripts/start-local.sh
```

This script will:

1. Install all dependencies
2. Set up the local database
3. Apply migrations and seed data
4. Start both frontend and backend servers

### Manual Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/khoaugment-pos.git
cd khoaugment-pos
```

2. Install dependencies:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

3. Set up environment variables:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your Cloudflare credentials.

4. Set up local development database:

```bash
cd backend
wrangler d1 create khoaugment-db --local
npm run db:migrate
npm run db:seed
cd ..
```

5. Start development servers:

```bash
npm run dev
```

## 🌐 Deployment

Refer to [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

Quick deployment:

```bash
# Set up Cloudflare environment
./scripts/setup-cloudflare-env.sh

# Deploy both frontend and backend
npm run deploy
```

## 📚 Documentation

- [System Overview](docs/SYSTEM_OVERVIEW.md)
- [API Documentation](backend/docs/api-endpoints.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Development Guide](DEVELOPMENT_GUIDE.md)

## 🧪 Testing

Run tests for both frontend and backend:

```bash
npm test
```

Run end-to-end tests:

```bash
npm run e2e
```

## 🔒 Security

- Input validation with Zod schemas
- JWT authentication with proper session management
- Rate limiting using Cloudflare KV
- CORS handling for cross-origin requests
- Cloudflare WAF and Bot Protection

## 📜 License

This project is proprietary and not licensed for public use.

## 🙏 Acknowledgments

- Cloudflare for their amazing edge computing platform
- Hono.js for the lightweight and powerful API framework
- Ant Design team for the comprehensive UI components
- React team for the excellent frontend library
