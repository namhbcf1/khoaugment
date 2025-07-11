/**
 * Real Customers Routes - NO MOCK DATA
 * 100% Real Database Operations with D1
 * Trường Phát Computer Hòa Bình
 */

import { Router } from 'itty-router';
import { addCorsHeaders } from '../utils/cors';
import { verifyJWT } from '../utils/jwt';

const router = Router();

/**
 * GET /customers - Get all customers with pagination and search
 */
router.get('/customers', async (request) => {
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
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortOrder = url.searchParams.get('sortOrder') || 'ASC';
    const offset = (page - 1) * limit;

    const db = request.env.DB;
    
    // Build query conditions
    let whereConditions = ['c.is_active = 1'];
    let params = [];
    
    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM customers c 
      WHERE ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first();
    const total = countResult.total;
    
    // Get customers
    const customersQuery = `
      SELECT 
        c.*,
        COUNT(o.id) as order_count,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE ${whereClause}
      GROUP BY c.id
      ORDER BY c.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const customers = await db.prepare(customersQuery)
      .bind(...params, limit, offset)
      .all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        customers: customers.results || [],
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
    console.error('Get customers error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /customers/:id - Get single customer with details
 */
router.get('/customers/:id', async (request) => {
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

    const customerId = request.params.id;
    const db = request.env.DB;
    
    // Get customer details
    const customer = await db.prepare(`
      SELECT 
        c.*,
        COUNT(o.id) as order_count,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE c.id = ? AND c.is_active = 1
      GROUP BY c.id
    `).bind(customerId).first();

    if (!customer) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy khách hàng'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Get recent orders
    const recentOrders = await db.prepare(`
      SELECT 
        o.id, o.order_number, o.total_amount, o.created_at, o.order_status,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).bind(customerId).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        customer: customer,
        recent_orders: recentOrders.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get customer error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy thông tin khách hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /customers - Create new customer
 */
router.post('/customers', async (request) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (!payload || !['admin', 'cashier', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền tạo khách hàng'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const customerData = await request.json();
    const {
      name, email, phone, address, city, postal_code, 
      date_of_birth, notes
    } = customerData;

    // Validate required fields
    if (!name) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Tên khách hàng là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = request.env.DB;
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.prepare('SELECT id FROM customers WHERE email = ? AND is_active = 1').bind(email).first();
      if (existingEmail) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Email đã được sử dụng'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
        });
      }
    }

    // Insert new customer
    const customerId = crypto.randomUUID();
    const result = await db.prepare(`
      INSERT INTO customers (
        id, name, email, phone, address, city, postal_code, 
        date_of_birth, notes, loyalty_points, total_spent, 
        visit_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, datetime('now'), datetime('now'))
    `).bind(
      customerId, name, email || null, phone || null, address || null, 
      city || null, postal_code || null, date_of_birth || null, notes || null
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: { id: customerId },
      message: 'Tạo khách hàng thành công'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Create customer error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi tạo khách hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * PUT /customers/:id - Update customer
 */
router.put('/customers/:id', async (request) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (!payload || !['admin', 'cashier', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền cập nhật khách hàng'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const customerId = request.params.id;
    const updateData = await request.json();
    const db = request.env.DB;

    // Check if customer exists
    const existingCustomer = await db.prepare('SELECT * FROM customers WHERE id = ? AND is_active = 1').bind(customerId).first();
    if (!existingCustomer) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy khách hàng'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = [
      'name', 'email', 'phone', 'address', 'city', 'postal_code', 
      'date_of_birth', 'notes', 'is_active'
    ];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    }
    
    if (updateFields.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có dữ liệu để cập nhật'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }
    
    updateFields.push('updated_at = datetime(\'now\')');
    updateValues.push(customerId);
    
    const updateQuery = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.prepare(updateQuery).bind(...updateValues).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Cập nhật khách hàng thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Update customer error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi cập nhật khách hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /customers/:id/loyalty - Manage loyalty points
 */
router.post('/customers/:id/loyalty', async (request) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);

    if (!payload || !['admin', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền quản lý điểm thưởng'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const customerId = request.params.id;
    const loyaltyData = await request.json();
    const { points, reason, type = 'manual' } = loyaltyData;

    if (!points || !reason) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Số điểm và lý do là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = request.env.DB;

    // Check if customer exists
    const customer = await db.prepare('SELECT * FROM customers WHERE id = ? AND is_active = 1').bind(customerId).first();
    if (!customer) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy khách hàng'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Calculate new points balance
    const newBalance = Math.max(0, customer.loyalty_points + points);

    // Update customer points
    await db.prepare(`
      UPDATE customers
      SET loyalty_points = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newBalance, customerId).run();

    // Log loyalty transaction
    await db.prepare(`
      INSERT INTO loyalty_transactions (
        id, customer_id, points, transaction_type, reason,
        balance_before, balance_after, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      crypto.randomUUID(), customerId, points, type, reason,
      customer.loyalty_points, newBalance, payload.userId
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: {
        previous_balance: customer.loyalty_points,
        points_changed: points,
        new_balance: newBalance
      },
      message: 'Cập nhật điểm thưởng thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Loyalty points error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi cập nhật điểm thưởng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /customers/:id/loyalty-history - Get loyalty points history
 */
router.get('/customers/:id/loyalty-history', async (request) => {
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

    const customerId = request.params.id;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    const db = request.env.DB;

    // Get loyalty transactions
    const transactions = await db.prepare(`
      SELECT
        lt.*,
        u.full_name as created_by_name
      FROM loyalty_transactions lt
      LEFT JOIN users u ON lt.created_by = u.id
      WHERE lt.customer_id = ?
      ORDER BY lt.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(customerId, limit, offset).all();

    // Get total count
    const countResult = await db.prepare(`
      SELECT COUNT(*) as total
      FROM loyalty_transactions
      WHERE customer_id = ?
    `).bind(customerId).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        transactions: transactions.results || [],
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Loyalty history error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy lịch sử điểm thưởng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /customers/:id/analytics - Get customer analytics
 */
router.get('/customers/:id/analytics', async (request) => {
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

    const customerId = request.params.id;
    const db = request.env.DB;

    // Get customer basic info
    const customer = await db.prepare('SELECT * FROM customers WHERE id = ? AND is_active = 1').bind(customerId).first();
    if (!customer) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy khách hàng'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Purchase behavior analysis
    const purchaseStats = await db.prepare(`
      SELECT
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        MIN(o.created_at) as first_order_date,
        MAX(o.created_at) as last_order_date,
        COUNT(DISTINCT DATE(o.created_at)) as unique_purchase_days
      FROM orders o
      WHERE o.customer_id = ?
    `).bind(customerId).first();

    // Monthly purchase trends (last 12 months)
    const monthlyTrends = await db.prepare(`
      SELECT
        strftime('%Y-%m', o.created_at) as month,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_amount
      FROM orders o
      WHERE o.customer_id = ?
        AND o.created_at >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', o.created_at)
      ORDER BY month ASC
    `).bind(customerId).all();

    // Category preferences
    const categoryPreferences = await db.prepare(`
      SELECT
        c.name as category_name,
        COUNT(oi.id) as items_purchased,
        SUM(oi.total_price) as total_spent,
        AVG(oi.unit_price) as avg_price
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE o.customer_id = ?
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC
      LIMIT 10
    `).bind(customerId).all();

    // Favorite products
    const favoriteProducts = await db.prepare(`
      SELECT
        p.name as product_name,
        p.sku,
        COUNT(oi.id) as purchase_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_spent,
        MAX(o.created_at) as last_purchased
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.customer_id = ?
      GROUP BY p.id, p.name, p.sku
      ORDER BY purchase_count DESC, total_spent DESC
      LIMIT 10
    `).bind(customerId).all();

    // Calculate customer lifetime value and visit frequency
    const daysSinceFirstOrder = purchaseStats.first_order_date ?
      Math.ceil((Date.now() - new Date(purchaseStats.first_order_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const visitFrequency = daysSinceFirstOrder > 0 ?
      (purchaseStats.unique_purchase_days / daysSinceFirstOrder * 30).toFixed(2) : 0;

    return new Response(JSON.stringify({
      success: true,
      data: {
        customer_info: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          loyalty_points: customer.loyalty_points,
          total_spent: customer.total_spent,
          visit_count: customer.visit_count
        },
        purchase_behavior: {
          total_orders: purchaseStats.total_orders || 0,
          total_spent: purchaseStats.total_spent || 0,
          avg_order_value: Math.round((purchaseStats.avg_order_value || 0) * 100) / 100,
          first_order_date: purchaseStats.first_order_date,
          last_order_date: purchaseStats.last_order_date,
          days_since_first_order: daysSinceFirstOrder,
          visit_frequency_per_month: parseFloat(visitFrequency)
        },
        monthly_trends: monthlyTrends.results || [],
        category_preferences: categoryPreferences.results || [],
        favorite_products: favoriteProducts.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy phân tích khách hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /customers/segments - Get customer segmentation
 */
router.get('/customers/segments', async (request) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);

    if (!payload || !['admin', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền xem phân khúc khách hàng'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = request.env.DB;

    // Calculate customer segments
    const segments = {};

    // High-value customers (top 20% by total_spent)
    const highValueCustomers = await db.prepare(`
      SELECT
        c.id, c.name, c.email, c.total_spent, c.loyalty_points,
        COUNT(o.id) as order_count
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE c.is_active = 1 AND c.total_spent > 0
      GROUP BY c.id
      ORDER BY c.total_spent DESC
      LIMIT (SELECT CAST(COUNT(*) * 0.2 AS INTEGER) FROM customers WHERE is_active = 1 AND total_spent > 0)
    `).all();

    // Frequent buyers (customers with orders in last 30 days)
    const frequentBuyers = await db.prepare(`
      SELECT DISTINCT
        c.id, c.name, c.email, c.total_spent, c.visit_count,
        COUNT(o.id) as recent_orders
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE c.is_active = 1
        AND o.created_at >= date('now', '-30 days')
      GROUP BY c.id
      HAVING recent_orders >= 2
      ORDER BY recent_orders DESC
    `).all();

    // At-risk customers (no orders in last 90 days but had orders before)
    const atRiskCustomers = await db.prepare(`
      SELECT
        c.id, c.name, c.email, c.total_spent,
        MAX(o.created_at) as last_order_date,
        COUNT(o.id) as total_orders
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE c.is_active = 1
      GROUP BY c.id
      HAVING last_order_date < date('now', '-90 days')
        AND total_orders > 0
      ORDER BY last_order_date ASC
    `).all();

    // New customers (registered in last 30 days)
    const newCustomers = await db.prepare(`
      SELECT
        c.id, c.name, c.email, c.created_at,
        COUNT(o.id) as order_count
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE c.is_active = 1
        AND c.created_at >= date('now', '-30 days')
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `).all();

    // Loyal customers (high loyalty points and frequent visits)
    const loyalCustomers = await db.prepare(`
      SELECT
        c.id, c.name, c.email, c.loyalty_points, c.visit_count, c.total_spent
      FROM customers c
      WHERE c.is_active = 1
        AND c.loyalty_points >= 1000
        AND c.visit_count >= 10
      ORDER BY c.loyalty_points DESC
    `).all();

    // Calculate segment metrics
    const totalCustomers = await db.prepare('SELECT COUNT(*) as total FROM customers WHERE is_active = 1').first();
    const totalRevenue = await db.prepare('SELECT SUM(total_amount) as total FROM orders').first();

    // Calculate revenue contribution by segment
    const highValueRevenue = highValueCustomers.results?.reduce((sum, customer) => sum + (customer.total_spent || 0), 0) || 0;
    const frequentBuyersRevenue = frequentBuyers.results?.reduce((sum, customer) => sum + (customer.total_spent || 0), 0) || 0;

    segments.high_value = {
      customers: highValueCustomers.results || [],
      count: (highValueCustomers.results || []).length,
      revenue_contribution: highValueRevenue,
      revenue_percentage: totalRevenue.total > 0 ? ((highValueRevenue / totalRevenue.total) * 100).toFixed(2) : 0
    };

    segments.frequent_buyers = {
      customers: frequentBuyers.results || [],
      count: (frequentBuyers.results || []).length,
      revenue_contribution: frequentBuyersRevenue,
      revenue_percentage: totalRevenue.total > 0 ? ((frequentBuyersRevenue / totalRevenue.total) * 100).toFixed(2) : 0
    };

    segments.at_risk = {
      customers: atRiskCustomers.results || [],
      count: (atRiskCustomers.results || []).length,
      potential_lost_revenue: (atRiskCustomers.results || []).reduce((sum, customer) => sum + (customer.total_spent || 0), 0)
    };

    segments.new_customers = {
      customers: newCustomers.results || [],
      count: (newCustomers.results || []).length,
      conversion_rate: newCustomers.results ?
        ((newCustomers.results.filter(c => c.order_count > 0).length / newCustomers.results.length) * 100).toFixed(2) : 0
    };

    segments.loyal_customers = {
      customers: loyalCustomers.results || [],
      count: (loyalCustomers.results || []).length,
      avg_loyalty_points: loyalCustomers.results?.length > 0 ?
        Math.round((loyalCustomers.results.reduce((sum, c) => sum + c.loyalty_points, 0) / loyalCustomers.results.length)) : 0
    };

    return new Response(JSON.stringify({
      success: true,
      data: {
        summary: {
          total_customers: totalCustomers.total,
          total_revenue: totalRevenue.total || 0,
          segments_count: Object.keys(segments).length
        },
        segments: segments,
        recommendations: {
          high_value: "Tập trung vào dịch vụ VIP và ưu đãi độc quyền",
          frequent_buyers: "Chương trình loyalty và cross-selling",
          at_risk: "Chiến dịch win-back và ưu đãi đặc biệt",
          new_customers: "Onboarding program và first-purchase incentives",
          loyal_customers: "Referral program và exclusive benefits"
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Customer segments error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy phân khúc khách hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

export default router;
