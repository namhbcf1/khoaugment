import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors';

// Tạo router mới cho Cashier
const router = Router({ base: '/cashier' });

// API endpoints cho Thu ngân
router.get('/', (request) => {
  return new Response(JSON.stringify({
    message: 'Cashier API endpoints'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// API lấy thông tin ca làm việc hiện tại
router.get('/session/current', (request) => {
  return new Response(JSON.stringify({
    id: 'S-20240710-001',
    cashier: 'Nguyen Thi Thu',
    startTime: '2024-07-10T08:00:00Z',
    startingCash: 1000000,
    status: 'active',
    sales: {
      count: 15,
      total: 4500000,
      cash: 2500000,
      card: 1500000,
      momo: 500000
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// API tạo đơn hàng mới
router.post('/orders', async (request) => {
  try {
    // Trong thực tế, chúng ta sẽ xử lý body của request và lưu vào database
    // Đây là ví dụ mock
    
    return new Response(JSON.stringify({
      success: true,
      orderId: 'ORD-' + Date.now(),
      message: 'Đơn hàng đã được tạo thành công'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// API tìm kiếm sản phẩm
router.get('/products/search', (request) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  
  // Mock data - trong thực tế sẽ tìm kiếm trong database
  const products = [
    { id: 'P001', name: 'Áo thun nam', price: 250000, barcode: '8936112110123', stock: 50 },
    { id: 'P002', name: 'Quần jean nữ', price: 450000, barcode: '8936112110124', stock: 30 },
    { id: 'P003', name: 'Áo khoác dù', price: 550000, barcode: '8936112110125', stock: 25 },
  ].filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.barcode.includes(query)
  );
  
  return new Response(JSON.stringify({
    success: true,
    products
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