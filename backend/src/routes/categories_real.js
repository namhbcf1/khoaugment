/**
 * Real Categories Routes - NO MOCK DATA
 * 100% Real Database Operations with D1
 * Trường Phát Computer Hòa Bình
 */

import { Router } from 'itty-router';
import { addCorsHeaders } from '../utils/cors';
import { verifyJWT } from '../utils/jwt';

const router = Router();

/**
 * GET /categories - Get all categories with tree structure
 */
router.get('/categories', async (request) => {
  try {
    const db = request.env.DB;
    
    // Get all categories (flat structure since no parent_id in schema)
    const categories = await db.prepare(`
      SELECT
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        categories: categories.results || [],
        total: categories.results?.length || 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /categories/:id - Get single category
 */
router.get('/categories/:id', async (request) => {
  try {
    const categoryId = request.params.id;
    const db = request.env.DB;
    
    const category = await db.prepare(`
      SELECT
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.id = ? AND c.is_active = 1
      GROUP BY c.id
    `).bind(categoryId).first();

    if (!category) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy danh mục'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        category: category
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get category error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy thông tin danh mục'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /categories - Create new category
 */
router.post('/categories', async (request) => {
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

    const categoryData = await request.json();
    const { name, description, color, icon, sort_order } = categoryData;

    // Validate required fields
    if (!name) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Tên danh mục là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = request.env.DB;
    
    // Check if name already exists
    const existing = await db.prepare('SELECT id FROM categories WHERE name = ? AND is_active = 1').bind(name).first();
    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Tên danh mục đã tồn tại'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Insert new category
    const result = await db.prepare(`
      INSERT INTO categories (
        name, description, color, icon, sort_order,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      name, description || null, color || '#1890ff', icon || null, sort_order || 0
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: { id: result.meta.last_row_id },
      message: 'Tạo danh mục thành công'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Create category error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi tạo danh mục'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * PUT /categories/:id - Update category
 */
router.put('/categories/:id', async (request) => {
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

    const categoryId = request.params.id;
    const updateData = await request.json();
    const db = request.env.DB;

    // Check if category exists
    const existingCategory = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(categoryId).first();
    if (!existingCategory) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy danh mục'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['name', 'description', 'color', 'icon', 'sort_order', 'is_active'];
    
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
    updateValues.push(categoryId);
    
    const updateQuery = `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.prepare(updateQuery).bind(...updateValues).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Cập nhật danh mục thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Update category error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi cập nhật danh mục'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * DELETE /categories/:id - Delete category
 */
router.delete('/categories/:id', async (request) => {
  try {
    // Verify admin permission
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (!payload || payload.role !== 'admin') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Chỉ admin mới có quyền xóa danh mục'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const categoryId = request.params.id;
    const db = request.env.DB;

    // Check if category exists
    const existingCategory = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(categoryId).first();
    if (!existingCategory) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không tìm thấy danh mục'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Check if category has products
    const productCount = await db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1').bind(categoryId).first();
    if (productCount.count > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Không thể xóa danh mục có chứa sản phẩm'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }



    // Soft delete by setting is_active = 0
    await db.prepare(`
      UPDATE categories 
      SET is_active = 0, updated_at = datetime('now') 
      WHERE id = ?
    `).bind(categoryId).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Xóa danh mục thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Delete category error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi xóa danh mục'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

export default router;
