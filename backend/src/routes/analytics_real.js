/**
 * Real Analytics Routes - NO MOCK DATA
 * 100% Real Database Operations with D1
 * Trường Phát Computer Hòa Bình
 */

import { Router } from 'itty-router';
import { addCorsHeaders } from '../utils/cors';
import { verifyJWT } from '../utils/jwt';

const router = Router();

/**
 * GET /analytics/sales/daily - Daily sales trends
 */
router.get('/analytics/sales/daily', async (request) => {
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
    const days = parseInt(url.searchParams.get('days')) || 30;
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');

    const db = request.env.DB;
    
    let dateCondition = '';
    let params = [];
    
    if (date_from && date_to) {
      dateCondition = 'WHERE DATE(o.created_at) BETWEEN ? AND ?';
      params = [date_from, date_to];
    } else {
      dateCondition = 'WHERE DATE(o.created_at) >= DATE(?, \'-\' || ? || \' days\')';
      params = [new Date().toISOString().split('T')[0], days];
    }
    
    // Get daily sales data
    const dailySalesQuery = `
      SELECT 
        DATE(o.created_at) as sale_date,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM orders o
      ${dateCondition}
      GROUP BY DATE(o.created_at)
      ORDER BY sale_date ASC
    `;
    
    const dailySales = await db.prepare(dailySalesQuery).bind(...params).all();

    // Calculate trends
    const salesData = dailySales.results || [];
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalCustomers = 0;

    salesData.forEach(day => {
      totalRevenue += day.total_revenue || 0;
      totalOrders += day.order_count || 0;
      totalCustomers += day.unique_customers || 0;
    });

    const avgDailyRevenue = salesData.length > 0 ? totalRevenue / salesData.length : 0;
    const avgDailyOrders = salesData.length > 0 ? totalOrders / salesData.length : 0;

    return new Response(JSON.stringify({
      success: true,
      data: {
        daily_sales: salesData,
        summary: {
          total_revenue: totalRevenue,
          total_orders: totalOrders,
          unique_customers: totalCustomers,
          avg_daily_revenue: avgDailyRevenue,
          avg_daily_orders: avgDailyOrders,
          avg_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Daily sales analytics error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy dữ liệu bán hàng hàng ngày'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /analytics/sales/products - Top selling products
 */
router.get('/analytics/sales/products', async (request) => {
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
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const days = parseInt(url.searchParams.get('days')) || 30;
    const category_id = url.searchParams.get('category_id');

    const db = request.env.DB;
    
    let whereConditions = ['DATE(o.created_at) >= DATE(?, \'-\' || ? || \' days\')'];
    let params = [new Date().toISOString().split('T')[0], days];
    
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get top selling products
    const topProductsQuery = `
      SELECT 
        p.id, p.name, p.sku, p.price, p.cost_price,
        c.name as category_name,
        SUM(oi.quantity) as total_quantity_sold,
        SUM(oi.total_price) as total_revenue,
        COUNT(DISTINCT o.id) as order_count,
        AVG(oi.unit_price) as avg_selling_price,
        (SUM(oi.total_price) - (SUM(oi.quantity) * p.cost_price)) as total_profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      GROUP BY p.id, p.name, p.sku, p.price, p.cost_price, c.name
      ORDER BY total_quantity_sold DESC
      LIMIT ?
    `;
    
    const topProducts = await db.prepare(topProductsQuery).bind(...params, limit).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        top_products: topProducts.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Product analytics error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy dữ liệu sản phẩm bán chạy'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /analytics/sales/customers - Customer analysis
 */
router.get('/analytics/sales/customers', async (request) => {
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
    const days = parseInt(url.searchParams.get('days')) || 30;

    const db = request.env.DB;
    
    // Get customer analytics
    const customerAnalyticsQuery = `
      SELECT 
        COUNT(DISTINCT o.customer_id) as total_customers,
        COUNT(DISTINCT CASE WHEN o.customer_id IS NULL THEN o.id END) as guest_orders,
        AVG(customer_stats.order_count) as avg_orders_per_customer,
        AVG(customer_stats.total_spent) as avg_spent_per_customer
      FROM orders o
      LEFT JOIN (
        SELECT 
          customer_id,
          COUNT(*) as order_count,
          SUM(total_amount) as total_spent
        FROM orders 
        WHERE DATE(created_at) >= DATE(?, '-' || ? || ' days')
        AND customer_id IS NOT NULL
        GROUP BY customer_id
      ) customer_stats ON o.customer_id = customer_stats.customer_id
      WHERE DATE(o.created_at) >= DATE(?, '-' || ? || ' days')
    `;
    
    const customerAnalytics = await db.prepare(customerAnalyticsQuery)
      .bind(new Date().toISOString().split('T')[0], days, new Date().toISOString().split('T')[0], days)
      .first();

    // Get top customers
    const topCustomersQuery = `
      SELECT 
        c.id, c.name, c.email, c.phone,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        MAX(o.created_at) as last_order_date
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE DATE(o.created_at) >= DATE(?, '-' || ? || ' days')
      GROUP BY c.id, c.name, c.email, c.phone
      ORDER BY total_spent DESC
      LIMIT 10
    `;
    
    const topCustomers = await db.prepare(topCustomersQuery)
      .bind(new Date().toISOString().split('T')[0], days)
      .all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        summary: customerAnalytics,
        top_customers: topCustomers.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy dữ liệu phân tích khách hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /analytics/inventory/turnover - Inventory turnover analysis
 */
router.get('/analytics/inventory/turnover', async (request) => {
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
    const days = parseInt(url.searchParams.get('days')) || 30;

    const db = request.env.DB;
    
    // Calculate inventory turnover
    const turnoverQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock_quantity, p.cost_price,
        c.name as category_name,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        CASE 
          WHEN p.stock_quantity > 0 THEN 
            ROUND(COALESCE(SUM(oi.quantity), 0) * 1.0 / p.stock_quantity, 2)
          ELSE 0 
        END as turnover_ratio,
        CASE 
          WHEN COALESCE(SUM(oi.quantity), 0) > 0 THEN 
            ROUND(? * 1.0 / (COALESCE(SUM(oi.quantity), 0) / p.stock_quantity), 1)
          ELSE 999 
        END as days_of_inventory
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND DATE(o.created_at) >= DATE(?, '-' || ? || ' days')
      WHERE p.is_active = 1
      GROUP BY p.id, p.name, p.sku, p.stock_quantity, p.cost_price, c.name
      ORDER BY turnover_ratio DESC
    `;
    
    const turnoverData = await db.prepare(turnoverQuery)
      .bind(days, new Date().toISOString().split('T')[0], days)
      .all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        inventory_turnover: turnoverData.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Inventory turnover analytics error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy dữ liệu vòng quay tồn kho'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

export default router;
