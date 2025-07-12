/**
 * Inventory Routes
 * Endpoints for inventory management, stock tracking, and movement history
 */

import { Hono } from 'hono';
import { z } from 'zod';
import createInventoryService from '../services/inventoryService.js';
import createProductService from '../services/productService.js';

// Validation schemas
const StockUpdateSchema = z.object({
  product_id: z.number().positive(),
  new_stock: z.number().int().min(0),
  notes: z.string().optional(),
});

const MovementRecordSchema = z.object({
  product_id: z.number().positive(),
  movement_type: z.enum(['sale', 'purchase', 'adjustment', 'return']),
  quantity_change: z.number().int(),
  reference_id: z.number().positive().optional(),
  reference_type: z.string().optional(),
  notes: z.string().optional(),
});

const BatchMovementSchema = z.object({
  movements: z.array(MovementRecordSchema),
});

// Create router
const inventory = new Hono();

/**
 * Get current inventory levels
 * GET /api/inventory?category_id&low_stock&search&page&limit
 */
inventory.get('/', async (c) => {
  try {
    const inventoryService = createInventoryService(c.env.DB);
    const productService = createProductService(c.env.DB);
    
    // Parse query parameters
    const category_id = c.req.query('category_id') ? parseInt(c.req.query('category_id')) : undefined;
    const lowStock = c.req.query('low_stock') === 'true';
    const search = c.req.query('search') || '';
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    
    // Get products with inventory info
    const filters = {
      category_id,
      lowStock,
      search,
      page,
      limit,
      active: true,
      sortBy: 'p.name',
    };
    
    const result = await productService.getAllProducts(filters);
    
    // Get summary statistics
    const lowStockCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM products WHERE stock <= min_stock AND active = 1'
    ).first();
    
    const outOfStockCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM products WHERE stock = 0 AND active = 1'
    ).first();
    
    const totalValue = await c.env.DB.prepare(
      'SELECT SUM(stock * cost_price) as total FROM products WHERE active = 1'
    ).first();
    
    const summary = {
      total_products: result.pagination.total,
      low_stock: lowStockCount?.count || 0,
      out_of_stock: outOfStockCount?.count || 0,
      total_value: totalValue?.total || 0,
    };
    
    return c.json({
      success: true,
      data: {
        products: result.data,
        summary,
        pagination: result.pagination,
      }
    });
  } catch (error) {
    console.error('Error getting inventory:', error);
    return c.json({ success: false, error: 'Failed to retrieve inventory data' }, 500);
  }
});

/**
 * Get low stock products
 * GET /api/inventory/low-stock?limit
 */
inventory.get('/low-stock', async (c) => {
  try {
    const inventoryService = createInventoryService(c.env.DB);
    const limit = parseInt(c.req.query('limit') || '20');
    
    const products = await inventoryService.getLowStockProducts(limit);
    
    return c.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return c.json({ success: false, error: 'Failed to retrieve low stock products' }, 500);
  }
});

/**
 * Get inventory movements for a product
 * GET /api/inventory/movements/:productId?limit&offset
 */
inventory.get('/movements/:productId', async (c) => {
  try {
    const inventoryService = createInventoryService(c.env.DB);
    const productId = parseInt(c.req.param('productId'));
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    
    if (!productId || isNaN(productId)) {
      return c.json({ success: false, error: 'Invalid product ID' }, 400);
    }
    
    const movements = await inventoryService.getProductMovements(productId, { limit, offset });
    
    return c.json({
      success: true,
      data: movements
    });
  } catch (error) {
    console.error('Error getting inventory movements:', error);
    return c.json({ success: false, error: 'Failed to retrieve inventory movements' }, 500);
  }
});

/**
 * Update stock level for a product
 * PUT /api/inventory/stock
 */
inventory.put('/stock', async (c) => {
  try {
    const inventoryService = createInventoryService(c.env.DB);
    const user = c.get('user');
    
    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    
    // Only admin and manager roles can update stock
    if (!['admin', 'manager'].includes(user.role)) {
      return c.json({ success: false, error: 'Insufficient permissions to update stock' }, 403);
    }
    
    const body = await c.req.json();
    const validatedData = StockUpdateSchema.parse(body);
    
    const result = await inventoryService.updateStock(
      validatedData.product_id,
      validatedData.new_stock,
      user.id,
      validatedData.notes || 'Manual stock update'
    );
    
    return c.json({
      success: result,
      message: 'Stock updated successfully'
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation error', details: error.errors }, 400);
    }
    
    return c.json({ success: false, error: 'Failed to update stock' }, 500);
  }
});

/**
 * Record inventory movement
 * POST /api/inventory/movement
 */
inventory.post('/movement', async (c) => {
  try {
    const inventoryService = createInventoryService(c.env.DB);
    const user = c.get('user');
    
    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    
    // Only admin and manager roles can create movements
    if (!['admin', 'manager'].includes(user.role)) {
      return c.json({ success: false, error: 'Insufficient permissions to record movements' }, 403);
    }
    
    const body = await c.req.json();
    const validatedData = MovementRecordSchema.parse(body);
    
    // Add user ID to movement data
    const movementData = {
      ...validatedData,
      user_id: user.id
    };
    
    const result = await inventoryService.recordMovement(movementData);
    
    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error recording movement:', error);
    
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation error', details: error.errors }, 400);
    }
    
    return c.json({ success: false, error: 'Failed to record movement' }, 500);
  }
});

/**
 * Record batch inventory movements
 * POST /api/inventory/batch-movement
 */
inventory.post('/batch-movement', async (c) => {
  try {
    const inventoryService = createInventoryService(c.env.DB);
    const user = c.get('user');
    
    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    
    // Only admin and manager roles can create movements
    if (!['admin', 'manager'].includes(user.role)) {
      return c.json({ success: false, error: 'Insufficient permissions to record movements' }, 403);
    }
    
    const body = await c.req.json();
    const validatedData = BatchMovementSchema.parse(body);
    
    const results = [];
    
    // Process each movement in sequence
    for (const movement of validatedData.movements) {
      const result = await inventoryService.recordMovement({
        ...movement,
        user_id: user.id
      });
      
      results.push({
        product_id: movement.product_id,
        success: result.success,
        new_stock: result.new_stock,
        movement_id: result.movement_id
      });
    }
    
    return c.json({
      success: true,
      data: {
        results,
        total_processed: results.length,
        successful: results.filter(r => r.success).length
      }
    });
  } catch (error) {
    console.error('Error processing batch movements:', error);
    
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation error', details: error.errors }, 400);
    }
    
    return c.json({ success: false, error: 'Failed to process batch movements' }, 500);
  }
});

/**
 * Get inventory valuation report
 * GET /api/inventory/valuation?category_id
 */
inventory.get('/valuation', async (c) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    
    // Only admin and manager roles can view valuation reports
    if (!['admin', 'manager'].includes(user.role)) {
      return c.json({ success: false, error: 'Insufficient permissions to view inventory valuation' }, 403);
    }
    
    const category_id = c.req.query('category_id') ? parseInt(c.req.query('category_id')) : undefined;
    
    // Build WHERE clause
    let whereClause = 'p.active = 1';
    const params = [];
    
    if (category_id) {
      whereClause += ' AND p.category_id = ?';
      params.push(category_id);
    }
    
    // Query for inventory valuation
    const query = `
      SELECT 
        c.name as category_name,
        SUM(p.stock) as total_items,
        SUM(p.stock * p.cost_price) as total_value,
        COUNT(*) as product_count,
        AVG(p.cost_price) as average_cost
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      GROUP BY p.category_id
      ORDER BY total_value DESC
    `;
    
    const { results } = await c.env.DB.prepare(query)
      .bind(...params)
      .all();
    
    // Calculate summary
    const summary = {
      total_products: 0,
      total_items: 0,
      total_value: 0
    };
    
    (results || []).forEach(row => {
      summary.total_products += row.product_count;
      summary.total_items += row.total_items;
      summary.total_value += row.total_value;
    });
    
    return c.json({
      success: true,
      data: {
        categories: results || [],
        summary
      }
    });
  } catch (error) {
    console.error('Error generating inventory valuation report:', error);
    return c.json({ success: false, error: 'Failed to generate inventory valuation report' }, 500);
  }
});

/**
 * Get inventory alerts (low stock, expiring, etc.)
 * GET /api/inventory/alerts
 */
inventory.get('/alerts', async (c) => {
  try {
    const inventoryService = createInventoryService(c.env.DB);
    
    // Get low stock products
    const lowStockProducts = await inventoryService.getLowStockProducts(10);
    
    // Get stock history for top low stock items
    const stockHistoryPromises = lowStockProducts.slice(0, 5).map(async product => {
      const movements = await inventoryService.getProductMovements(product.id, { limit: 5 });
      return {
        product_id: product.id,
        product_name: product.name,
        movements
      };
    });
    
    const stockHistory = await Promise.all(stockHistoryPromises);
    
    // Get recent alerts from activity log
    const alertsQuery = `
      SELECT * FROM activity_logs 
      WHERE action = 'low_stock_alert'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const { results: recentAlerts } = await c.env.DB.prepare(alertsQuery).all();
    
    return c.json({
      success: true,
      data: {
        low_stock: lowStockProducts,
        stock_history: stockHistory,
        recent_alerts: recentAlerts || []
      }
    });
  } catch (error) {
    console.error('Error getting inventory alerts:', error);
    return c.json({ success: false, error: 'Failed to retrieve inventory alerts' }, 500);
  }
});

export default inventory;