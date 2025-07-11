/**
 * Real Orders Routes - NO MOCK DATA
 * 100% Real Database Operations with D1
 * Trường Phát Computer Hòa Bình
 */

import { Router } from 'itty-router';
import { addCorsHeaders } from '../utils/cors';
import { verifyJWT } from '../utils/jwt';

const router = Router();

/**
 * GET /orders - Get all orders with pagination and filters
 */
router.get('/orders', async (request) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (!payload) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const status = url.searchParams.get('status');
    const customer_id = url.searchParams.get('customer_id');
    const cashier_id = url.searchParams.get('cashier_id');
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');
    const offset = (page - 1) * limit;

    const db = request.env.DB;
    
    // Build query conditions
    let whereConditions = ['1=1'];
    let params = [];
    
    if (status) {
      whereConditions.push('o.order_status = ?');
      params.push(status);
    }
    
    if (customer_id) {
      whereConditions.push('o.customer_id = ?');
      params.push(customer_id);
    }
    
    if (cashier_id) {
      whereConditions.push('o.cashier_id = ?');
      params.push(cashier_id);
    }
    
    if (date_from) {
      whereConditions.push('DATE(o.created_at) >= ?');
      params.push(date_from);
    }
    
    if (date_to) {
      whereConditions.push('DATE(o.created_at) <= ?');
      params.push(date_to);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM orders o 
      WHERE ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first();
    const total = countResult.total;
    
    // Get orders with customer and cashier info
    const ordersQuery = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        u.name as cashier_name,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.cashier_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const orders = await db.prepare(ordersQuery)
      .bind(...params, limit, offset)
      .all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        orders: orders.results || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /orders/:id - Get single order with details
 */
router.get('/orders/:id', async (request) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (!payload) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const orderId = request.params.id;
    const db = request.env.DB;
    
    // Get order with customer and cashier info
    const order = await db.prepare(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        u.name as cashier_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE o.id = ?
    `).bind(orderId).first();

    if (!order) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Get order items with product details
    const orderItems = await db.prepare(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.sku as product_sku,
        p.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.created_at ASC
    `).bind(orderId).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        order: order,
        items: orderItems.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get order error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy thông tin đơn hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /orders - Create new order
 */
router.post('/orders', async (request) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (!payload || !['admin', 'cashier', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền tạo đơn hàng'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const orderData = await request.json();
    const {
      customer_id, items, payment_method, discount_amount = 0, 
      tax_rate = 0, notes = ''
    } = orderData;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Đơn hàng phải có ít nhất một sản phẩm'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    if (!payment_method || !['cash', 'card', 'digital_wallet', 'loyalty_points'].includes(payment_method)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Phương thức thanh toán không hợp lệ'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = request.env.DB;
    
    // Start transaction-like operations
    let subtotal = 0;
    let validatedItems = [];

    // Validate items and calculate totals
    for (const item of items) {
      const { product_id, quantity, unit_price } = item;
      
      if (!product_id || !quantity || quantity <= 0 || !unit_price || unit_price <= 0) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Thông tin sản phẩm không hợp lệ'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
        });
      }

      // Check product exists and has sufficient stock
      const product = await db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').bind(product_id).first();
      
      if (!product) {
        return new Response(JSON.stringify({
          success: false,
          message: `Sản phẩm ${product_id} không tồn tại`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
        });
      }

      if (product.stock_quantity < quantity) {
        return new Response(JSON.stringify({
          success: false,
          message: `Sản phẩm ${product.name} không đủ tồn kho (còn ${product.stock_quantity})`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
        });
      }

      const itemTotal = quantity * unit_price;
      subtotal += itemTotal;
      
      validatedItems.push({
        product_id,
        quantity,
        unit_price,
        total_price: itemTotal,
        product_name: product.name
      });
    }

    // Calculate totals
    const tax_amount = subtotal * (tax_rate / 100);
    const total_amount = subtotal + tax_amount - discount_amount;

    // Generate order number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderCount = await db.prepare('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE(?)').bind(new Date().toISOString()).first();
    const orderNumber = `ORD-${today}-${String(orderCount.count + 1).padStart(4, '0')}`;

    // Create order
    const orderId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_id, cashier_id, subtotal, tax_amount, 
        discount_amount, total_amount, payment_method, payment_status, 
        order_status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'completed', ?, datetime('now'), datetime('now'))
    `).bind(
      orderId, orderNumber, customer_id || null, payload.userId, 
      subtotal, tax_amount, discount_amount, total_amount, 
      payment_method, notes
    ).run();

    // Create order items and update inventory
    for (const item of validatedItems) {
      // Create order item
      await db.prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, quantity, unit_price, total_price, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        crypto.randomUUID(), orderId, item.product_id, 
        item.quantity, item.unit_price, item.total_price
      ).run();

      // Update product stock
      await db.prepare(`
        UPDATE products 
        SET stock_quantity = stock_quantity - ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(item.quantity, item.product_id).run();

      // Log inventory movement
      await db.prepare(`
        INSERT INTO inventory_movements (
          id, product_id, movement_type, quantity, reference_type, reference_id, 
          notes, user_id, created_at
        ) VALUES (?, ?, 'out', ?, 'order', ?, 'Bán hàng', ?, datetime('now'))
      `).bind(
        crypto.randomUUID(), item.product_id, item.quantity, 
        orderId, payload.userId
      ).run();
    }

    // Update customer stats if customer provided
    if (customer_id) {
      await db.prepare(`
        UPDATE customers 
        SET total_spent = total_spent + ?, visit_count = visit_count + 1, 
            last_visit = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).bind(total_amount, customer_id).run();
    }

    return new Response(JSON.stringify({
      success: true,
      data: { 
        order_id: orderId,
        order_number: orderNumber,
        total_amount: total_amount
      },
      message: 'Tạo đơn hàng thành công'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Create order error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi tạo đơn hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

export default router;
