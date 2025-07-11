/**
 * Real Inventory Routes - NO MOCK DATA
 * 100% Real Database Operations with D1
 * Trường Phát Computer Hòa Bình
 */

import { Router } from 'itty-router';
import { addCorsHeaders } from '../utils/cors';
import { verifyJWT } from '../utils/jwt';

const router = Router();

/**
 * GET /inventory/current - Get current stock levels for all products
 */
router.get('/inventory/current', async (request) => {
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
    const category_id = url.searchParams.get('category_id');
    const low_stock_only = url.searchParams.get('low_stock_only') === 'true';

    const db = request.env.DB;
    
    // Build query conditions
    let whereConditions = ['p.is_active = 1'];
    let params = [];
    
    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }
    
    if (low_stock_only) {
      whereConditions.push('p.stock_quantity <= p.reorder_level');
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get inventory data
    const inventoryQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock_quantity, p.reorder_level,
        p.cost_price, p.price, p.created_at, p.updated_at,
        c.name as category_name,
        (p.stock_quantity * p.cost_price) as inventory_value,
        CASE 
          WHEN p.stock_quantity <= 0 THEN 'out_of_stock'
          WHEN p.stock_quantity <= p.reorder_level THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY p.name ASC
    `;
    
    const inventory = await db.prepare(inventoryQuery).bind(...params).all();

    // Calculate summary statistics
    const summary = {
      total_products: 0,
      in_stock: 0,
      low_stock: 0,
      out_of_stock: 0,
      total_inventory_value: 0
    };

    for (const item of inventory.results || []) {
      summary.total_products++;
      summary.total_inventory_value += item.inventory_value || 0;
      
      if (item.stock_status === 'out_of_stock') {
        summary.out_of_stock++;
      } else if (item.stock_status === 'low_stock') {
        summary.low_stock++;
      } else {
        summary.in_stock++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        inventory: inventory.results || [],
        summary: summary
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy thông tin tồn kho'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /inventory/movements - Get inventory movement history
 */
router.get('/inventory/movements', async (request) => {
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
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const product_id = url.searchParams.get('product_id');
    const movement_type = url.searchParams.get('movement_type');
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');
    const offset = (page - 1) * limit;

    const db = request.env.DB;
    
    // Build query conditions
    let whereConditions = ['1=1'];
    let params = [];
    
    if (product_id) {
      whereConditions.push('im.product_id = ?');
      params.push(product_id);
    }
    
    if (movement_type) {
      whereConditions.push('im.movement_type = ?');
      params.push(movement_type);
    }
    
    if (date_from) {
      whereConditions.push('DATE(im.created_at) >= ?');
      params.push(date_from);
    }
    
    if (date_to) {
      whereConditions.push('DATE(im.created_at) <= ?');
      params.push(date_to);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM inventory_movements im 
      WHERE ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first();
    const total = countResult.total;
    
    // Get movements
    const movementsQuery = `
      SELECT 
        im.*,
        p.name as product_name,
        p.sku as product_sku,
        u.name as user_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.user_id = u.id
      WHERE ${whereClause}
      ORDER BY im.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const movements = await db.prepare(movementsQuery)
      .bind(...params, limit, offset)
      .all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        movements: movements.results || [],
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
    console.error('Get inventory movements error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy lịch sử xuất nhập kho'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /inventory/adjustment - Manual inventory adjustment
 */
router.post('/inventory/adjustment', async (request) => {
  try {
    // Verify authentication and permissions
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (!payload || !['admin', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền điều chỉnh tồn kho'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const adjustmentData = await request.json();
    const {
      product_id, adjustment_type, quantity, reason, notes
    } = adjustmentData;

    // Validate required fields
    if (!product_id || !adjustment_type || !quantity || quantity <= 0 || !reason) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Thiếu thông tin bắt buộc cho điều chỉnh tồn kho'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    if (!['in', 'out', 'set'].includes(adjustment_type)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Loại điều chỉnh không hợp lệ'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = request.env.DB;
    
    // Check if product exists
    const product = await db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').bind(product_id).first();
    if (!product) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Sản phẩm không tồn tại'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const oldQuantity = product.stock_quantity;
    let newQuantity;

    // Calculate new quantity based on adjustment type
    switch (adjustment_type) {
      case 'in':
        newQuantity = oldQuantity + quantity;
        break;
      case 'out':
        newQuantity = Math.max(0, oldQuantity - quantity);
        break;
      case 'set':
        newQuantity = quantity;
        break;
    }

    // Update product stock
    await db.prepare(`
      UPDATE products 
      SET stock_quantity = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newQuantity, product_id).run();

    // Log inventory movement
    const movementType = adjustment_type === 'out' ? 'out' : 'in';
    const movementQuantity = adjustment_type === 'set' ? Math.abs(newQuantity - oldQuantity) : quantity;
    
    await db.prepare(`
      INSERT INTO inventory_movements (
        id, product_id, movement_type, quantity, reference_type, 
        notes, user_id, created_at
      ) VALUES (?, ?, ?, ?, 'adjustment', ?, ?, datetime('now'))
    `).bind(
      crypto.randomUUID(), product_id, movementType, movementQuantity,
      `${reason}: ${notes || ''}`, payload.userId
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: {
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        adjustment: newQuantity - oldQuantity
      },
      message: 'Điều chỉnh tồn kho thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Inventory adjustment error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi điều chỉnh tồn kho'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /inventory/alerts - Get inventory alerts (low stock, etc.)
 */
router.get('/inventory/alerts', async (request) => {
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

    const db = request.env.DB;
    
    // Get low stock products
    const lowStockQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock_quantity, p.reorder_level,
        c.name as category_name,
        (p.reorder_level - p.stock_quantity) as shortage_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.stock_quantity <= p.reorder_level
      ORDER BY (p.reorder_level - p.stock_quantity) DESC
    `;
    
    const lowStockProducts = await db.prepare(lowStockQuery).all();

    // Get out of stock products
    const outOfStockQuery = `
      SELECT 
        p.id, p.name, p.sku, p.stock_quantity,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.stock_quantity <= 0
      ORDER BY p.name ASC
    `;
    
    const outOfStockProducts = await db.prepare(outOfStockQuery).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        low_stock: lowStockProducts.results || [],
        out_of_stock: outOfStockProducts.results || [],
        summary: {
          low_stock_count: lowStockProducts.results?.length || 0,
          out_of_stock_count: outOfStockProducts.results?.length || 0
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get inventory alerts error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy cảnh báo tồn kho'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

export default router;
