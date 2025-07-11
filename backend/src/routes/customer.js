/**
 * Customer API Routes
 * Handles customer-facing endpoints for product lookup, warranty information, and order details
 */

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors';

// Create router for customer routes
const router = Router({ base: '/customer' });

// API endpoints for Customer
router.get('/', (request) => {
  return new Response(JSON.stringify({
    message: 'Customer API endpoints'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Get customer information
router.get('/:id', (request) => {
  const { id } = request.params;
  
  // Mock data - in reality this would come from the database
  return new Response(JSON.stringify({
    id: id,
    name: 'Nguyễn Văn Khách Hàng',
    email: 'customer@example.com',
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Quận 1, TPHCM',
    memberSince: '2023-01-15',
    loyaltyPoints: 450,
    tier: 'silver',
    totalSpent: 8500000,
    lastPurchase: '2024-06-28',
    preferences: {
      categories: ['quần áo', 'giày dép'],
      sizes: ['M', 'L'],
      contactMethod: 'email'
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Get customer purchase history
router.get('/:id/history', (request) => {
  const { id } = request.params;
  
  // Mock data for purchase history
  return new Response(JSON.stringify({
    customerId: id,
    purchases: [
      {
        orderId: 'ORD-20240628-001',
        date: '2024-06-28',
        total: 850000,
        items: [
          { name: 'Áo thun nam', quantity: 2, price: 250000 },
          { name: 'Quần jean nam', quantity: 1, price: 350000 }
        ],
        status: 'completed'
      },
      {
        orderId: 'ORD-20240601-034',
        date: '2024-06-01',
        total: 1200000,
        items: [
          { name: 'Giày thể thao', quantity: 1, price: 1200000 }
        ],
        status: 'completed'
      },
      {
        orderId: 'ORD-20240515-078',
        date: '2024-05-15',
        total: 750000,
        items: [
          { name: 'Áo khoác dù', quantity: 1, price: 550000 },
          { name: 'Nón lưỡi trai', quantity: 2, price: 100000 }
        ],
        status: 'completed'
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 3,
      pages: 1
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Get customer loyalty information
router.get('/:id/loyalty', (request) => {
  const { id } = request.params;
  
  return new Response(JSON.stringify({
    customerId: id,
    pointsBalance: 450,
    tier: {
      name: 'Silver',
      requiredPoints: 300,
      nextTier: {
        name: 'Gold',
        requiredPoints: 1000,
        pointsNeeded: 550
      },
      benefits: [
        '5% giảm giá mọi đơn hàng',
        'Tích 2x điểm vào sinh nhật',
        'Đổi điểm lấy voucher'
      ]
    },
    transactions: [
      { date: '2024-06-28', type: 'earn', points: 85, source: 'purchase', reference: 'ORD-20240628-001' },
      { date: '2024-06-01', type: 'earn', points: 120, source: 'purchase', reference: 'ORD-20240601-034' },
      { date: '2024-05-15', type: 'earn', points: 75, source: 'purchase', reference: 'ORD-20240515-078' },
      { date: '2024-04-20', type: 'redeem', points: -200, source: 'voucher', reference: 'VC-20240420-001' }
    ],
    availableRewards: [
      { id: 1, name: 'Voucher giảm 50.000đ', points: 100, description: 'Áp dụng cho đơn hàng từ 300.000đ' },
      { id: 2, name: 'Voucher giảm 10%', points: 200, description: 'Tối đa 100.000đ, hết hạn sau 30 ngày' },
      { id: 3, name: 'Miễn phí vận chuyển', points: 150, description: 'Áp dụng cho mọi đơn hàng trong vòng 3 tháng' }
    ]
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