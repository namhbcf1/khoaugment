/**
 * Real Products Routes - NO MOCK DATA
 * 100% Real Database Operations with D1
 * Trường Phát Computer Hòa Bình
 */

import { Router } from 'itty-router';
import { addCorsHeaders } from '../utils/cors';
import { verifyJWT } from '../utils/jwt';

const router = Router();

/**
 * GET /products - Get all products from real database
 */
router.get('/products', async (request) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortOrder = url.searchParams.get('sortOrder') || 'ASC';
    const offset = (page - 1) * limit;

    const db = request.env.DB;
    
    // Build query conditions
    let whereConditions = ['p.is_active = 1'];
    let params = [];
    
    if (category) {
      whereConditions.push('p.category_id = ?');
      params.push(category);
    }
    
    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first();
    const total = countResult.total;
    
    // Get products with category info
    const productsQuery = `
      SELECT
        p.id, p.name, p.description, p.sku, p.barcode,
        p.price, p.cost_price, p.stock_quantity, p.reorder_level as min_stock_level,
        p.image_url, p.is_active, p.created_at, p.updated_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const products = await db.prepare(productsQuery)
      .bind(...params, limit, offset)
      .all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        products: products.results || [],
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
    console.error('Get products error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /products/:id - Get single product from database
 */
router.get('/products/:id', async (request) => {
  try {
    const productId = request.params.id;
    const db = request.env.DB;
    
    const product = await db.prepare(`
      SELECT 
        p.*, 
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ? AND p.is_active = 1
    `).bind(productId).first();

    if (!product) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Get recent inventory movements
    const movements = await db.prepare(`
      SELECT 
        im.movement_type, im.quantity, im.notes, im.created_at,
        u.name as user_name
      FROM inventory_movements im
      LEFT JOIN users u ON im.user_id = u.id
      WHERE im.product_id = ?
      ORDER BY im.created_at DESC
      LIMIT 10
    `).bind(productId).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        product: {
          ...product,
          images: product.images ? JSON.parse(product.images) : [],
          dimensions: product.dimensions ? JSON.parse(product.dimensions) : null
        },
        inventory_movements: movements.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get product error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy thông tin sản phẩm'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /products - Create new product in database
 */
router.post('/products', async (request) => {
  try {
    // Verify admin/manager permission
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token không hợp lệ'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (!payload || !['admin', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền thực hiện thao tác này'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const productData = await request.json();
    const {
      name, description, sku, barcode, category_id, price, cost_price,
      stock_quantity, min_stock_level, unit, image_url, supplier_id
    } = productData;

    // Validate required fields
    if (!name || !sku || !price) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Tên sản phẩm, SKU và giá là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = request.env.DB;
    
    // Check if SKU already exists
    const existingSKU = await db.prepare('SELECT id FROM products WHERE sku = ?').bind(sku).first();
    if (existingSKU) {
      return new Response(JSON.stringify({
        success: false,
        message: 'SKU đã tồn tại'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Insert new product
    const result = await db.prepare(`
      INSERT INTO products (
        name, description, sku, barcode, category_id, price, cost_price,
        stock_quantity, reorder_level, image_url,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      name, description, sku, barcode, category_id, price, cost_price,
      stock_quantity || 0, min_stock_level || 0, image_url
    ).run();

    // Log inventory movement if initial stock > 0
    if (stock_quantity > 0) {
      await db.prepare(`
        INSERT INTO inventory_movements (
          product_id, movement_type, quantity, reference_type, notes, user_id, created_at
        ) VALUES (?, 'in', ?, 'initial_stock', 'Nhập kho ban đầu', ?, datetime('now'))
      `).bind(result.meta.last_row_id, stock_quantity, payload.userId).run();
    }

    return new Response(JSON.stringify({
      success: true,
      data: { id: result.meta.last_row_id },
      message: 'Tạo sản phẩm thành công'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Create product error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi tạo sản phẩm'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * PUT /products/:id - Update product in database
 */
router.put('/products/:id', async (request) => {
  try {
    // Verify admin/manager permission
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);

    if (!payload || !['admin', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền thực hiện thao tác này'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const productId = request.params.id;
    const updateData = await request.json();
    const db = request.env.DB;

    // Check if product exists
    const existingProduct = await db.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
    if (!existingProduct) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'name', 'description', 'sku', 'barcode', 'category_id', 'price',
      'cost_price', 'reorder_level', 'image_url', 'is_active'
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
    updateValues.push(productId);

    const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.prepare(updateQuery).bind(...updateValues).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Cập nhật sản phẩm thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Update product error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * DELETE /products/:id - Soft delete product
 */
router.delete('/products/:id', async (request) => {
  try {
    // Verify admin permission
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);

    if (!payload || payload.role !== 'admin') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Chỉ admin mới có quyền xóa sản phẩm'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const productId = request.params.id;
    const db = request.env.DB;

    // Check if product exists
    const existingProduct = await db.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
    if (!existingProduct) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Soft delete by setting is_active = 0
    await db.prepare(`
      UPDATE products
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ?
    `).bind(productId).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Xóa sản phẩm thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi xóa sản phẩm'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /products/barcode/:barcode - Get product by barcode
 */
router.get('/products/barcode/:barcode', async (request) => {
  try {
    const barcode = request.params.barcode;
    const db = request.env.DB;

    const product = await db.prepare(`
      SELECT
        p.*,
        c.name as category_name,
        s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.barcode = ? AND p.is_active = 1
    `).bind(barcode).first();

    if (!product) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy sản phẩm với mã vạch này'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        dimensions: product.dimensions ? JSON.parse(product.dimensions) : null
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get product by barcode error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi tìm kiếm sản phẩm theo mã vạch'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /products/search - Advanced search with multiple criteria
 */
router.post('/products/search', async (request) => {
  try {
    const searchCriteria = await request.json();
    const {
      query, category_ids, price_min, price_max, stock_min, stock_max,
      is_featured, supplier_ids, tags, page = 1, limit = 20
    } = searchCriteria;

    const db = request.env.DB;
    const offset = (page - 1) * limit;

    // Build dynamic WHERE conditions
    let whereConditions = ['p.is_active = 1'];
    let params = [];

    if (query) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)');
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category_ids && category_ids.length > 0) {
      const placeholders = category_ids.map(() => '?').join(',');
      whereConditions.push(`p.category_id IN (${placeholders})`);
      params.push(...category_ids);
    }

    if (price_min !== undefined) {
      whereConditions.push('p.price >= ?');
      params.push(price_min);
    }

    if (price_max !== undefined) {
      whereConditions.push('p.price <= ?');
      params.push(price_max);
    }

    if (stock_min !== undefined) {
      whereConditions.push('p.stock_quantity >= ?');
      params.push(stock_min);
    }

    if (stock_max !== undefined) {
      whereConditions.push('p.stock_quantity <= ?');
      params.push(stock_max);
    }

    if (is_featured !== undefined) {
      whereConditions.push('p.is_featured = ?');
      params.push(is_featured ? 1 : 0);
    }

    if (supplier_ids && supplier_ids.length > 0) {
      const placeholders = supplier_ids.map(() => '?').join(',');
      whereConditions.push(`p.supplier_id IN (${placeholders})`);
      params.push(...supplier_ids);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`;
    const countResult = await db.prepare(countQuery).bind(...params).first();
    const total = countResult.total;

    // Get products
    const productsQuery = `
      SELECT
        p.id, p.name, p.description, p.sku, p.barcode,
        p.price, p.cost_price, p.stock_quantity, p.reorder_level as min_stock_level,
        p.image_url, p.is_active, p.created_at, p.updated_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY p.name ASC
      LIMIT ? OFFSET ?
    `;

    const products = await db.prepare(productsQuery)
      .bind(...params, limit, offset)
      .all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        products: products.results || [],
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
    console.error('Advanced search error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi tìm kiếm nâng cao'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /products/low-stock - Get products below minimum stock level
 */
router.get('/products/low-stock', async (request) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    const db = request.env.DB;

    // Get total count of low stock products
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE p.is_active = 1 AND p.stock_quantity <= p.reorder_level
    `;
    const countResult = await db.prepare(countQuery).first();
    const total = countResult.total;

    // Get low stock products
    const productsQuery = `
      SELECT
        p.id, p.name, p.description, p.sku, p.barcode,
        p.price, p.cost_price, p.stock_quantity, p.reorder_level as min_stock_level,
        p.image_url, p.is_active, p.created_at, p.updated_at,
        c.name as category_name,
        (p.reorder_level - p.stock_quantity) as shortage_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.stock_quantity <= p.reorder_level
      ORDER BY (p.reorder_level - p.stock_quantity) DESC, p.name ASC
      LIMIT ? OFFSET ?
    `;

    const products = await db.prepare(productsQuery)
      .bind(limit, offset)
      .all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        products: products.results || [],
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
    console.error('Get low stock products error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm sắp hết hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /products/bulk-update - Bulk update operations
 */
router.post('/products/bulk-update', async (request) => {
  try {
    // Verify admin/manager permission
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);

    if (!payload || !['admin', 'manager'].includes(payload.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không có quyền thực hiện thao tác này'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const bulkData = await request.json();
    const { operation, product_ids, update_data } = bulkData;

    if (!operation || !product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Dữ liệu bulk update không hợp lệ'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = request.env.DB;
    let updatedCount = 0;

    switch (operation) {
      case 'update_prices':
        if (!update_data.price_adjustment) {
          throw new Error('Thiếu thông tin điều chỉnh giá');
        }

        const { type, value } = update_data.price_adjustment;
        let priceUpdateQuery;

        if (type === 'percentage') {
          priceUpdateQuery = `
            UPDATE products
            SET price = ROUND(price * (1 + ? / 100), 2), updated_at = datetime('now')
            WHERE id = ? AND is_active = 1
          `;
        } else if (type === 'fixed') {
          priceUpdateQuery = `
            UPDATE products
            SET price = ROUND(price + ?, 2), updated_at = datetime('now')
            WHERE id = ? AND is_active = 1
          `;
        } else {
          throw new Error('Loại điều chỉnh giá không hợp lệ');
        }

        for (const productId of product_ids) {
          const result = await db.prepare(priceUpdateQuery).bind(value, productId).run();
          if (result.changes > 0) updatedCount++;
        }
        break;

      case 'update_category':
        if (!update_data.category_id) {
          throw new Error('Thiếu thông tin danh mục');
        }

        for (const productId of product_ids) {
          const result = await db.prepare(`
            UPDATE products
            SET category_id = ?, updated_at = datetime('now')
            WHERE id = ? AND is_active = 1
          `).bind(update_data.category_id, productId).run();
          if (result.changes > 0) updatedCount++;
        }
        break;

      case 'update_status':
        if (update_data.is_active === undefined) {
          throw new Error('Thiếu thông tin trạng thái');
        }

        for (const productId of product_ids) {
          const result = await db.prepare(`
            UPDATE products
            SET is_active = ?, updated_at = datetime('now')
            WHERE id = ?
          `).bind(update_data.is_active ? 1 : 0, productId).run();
          if (result.changes > 0) updatedCount++;
        }
        break;

      case 'update_stock':
        if (!update_data.stock_adjustment) {
          throw new Error('Thiếu thông tin điều chỉnh tồn kho');
        }

        const { adjustment_type, quantity } = update_data.stock_adjustment;
        let stockUpdateQuery;

        if (adjustment_type === 'set') {
          stockUpdateQuery = `
            UPDATE products
            SET stock_quantity = ?, updated_at = datetime('now')
            WHERE id = ? AND is_active = 1
          `;
        } else if (adjustment_type === 'add') {
          stockUpdateQuery = `
            UPDATE products
            SET stock_quantity = stock_quantity + ?, updated_at = datetime('now')
            WHERE id = ? AND is_active = 1
          `;
        } else if (adjustment_type === 'subtract') {
          stockUpdateQuery = `
            UPDATE products
            SET stock_quantity = MAX(0, stock_quantity - ?), updated_at = datetime('now')
            WHERE id = ? AND is_active = 1
          `;
        } else {
          throw new Error('Loại điều chỉnh tồn kho không hợp lệ');
        }

        for (const productId of product_ids) {
          const result = await db.prepare(stockUpdateQuery).bind(quantity, productId).run();
          if (result.changes > 0) {
            updatedCount++;

            // Log inventory movement
            await db.prepare(`
              INSERT INTO inventory_movements (
                product_id, movement_type, quantity, reference_type, notes, user_id, created_at
              ) VALUES (?, ?, ?, 'bulk_update', 'Cập nhật hàng loạt', ?, datetime('now'))
            `).bind(
              productId,
              adjustment_type === 'subtract' ? 'out' : 'in',
              Math.abs(quantity),
              payload.userId
            ).run();
          }
        }
        break;

      default:
        throw new Error('Loại thao tác bulk update không được hỗ trợ');
    }

    return new Response(JSON.stringify({
      success: true,
      data: { updated_count: updatedCount },
      message: `Cập nhật thành công ${updatedCount} sản phẩm`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Lỗi khi cập nhật hàng loạt'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

export default router;
