import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors';

// Tạo router mới cho Admin
const router = Router({ base: '/admin' });

// API endpoints cho Admin
router.get('/', (request) => {
  return new Response(JSON.stringify({
    message: 'Admin API endpoints'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Dashboard API
router.get('/dashboard', (request) => {
  return new Response(JSON.stringify({
    sales: {
      daily: 32500000,
      weekly: 147800000,
      monthly: 652300000
    },
    products: {
      total: 378,
      lowStock: 24
    },
    orders: {
      pending: 15,
      completed: 286,
      canceled: 7
    },
    customers: {
      total: 1245,
      new: 78
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Quản lý nhân viên API
router.get('/staff', (request) => {
  return new Response(JSON.stringify({
    staff: [
      { id: 1, name: 'Nguyen Van A', role: 'cashier', performance: 92 },
      { id: 2, name: 'Tran Thi B', role: 'inventory', performance: 87 },
      { id: 3, name: 'Le Van C', role: 'cashier', performance: 95 },
    ]
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Cấu hình hệ thống API
router.get('/settings', (request) => {
  return new Response(JSON.stringify({
    storeInfo: {
      name: 'Khochuan Store',
      address: '123 Nguyen Hue, District 1, HCMC',
      phone: '+84901234567',
      taxId: '0123456789'
    },
    receiptSettings: {
      headerText: 'Khochuan Store - Hóa đơn bán hàng',
      footerText: 'Cảm ơn quý khách đã mua hàng!',
      showLogo: true
    },
    taxSettings: {
      vatRate: 10,
      applyVatByDefault: true
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Export router handler
export default {
  handle: (request, env, ctx) => router.handle(request, env, ctx)
}; 