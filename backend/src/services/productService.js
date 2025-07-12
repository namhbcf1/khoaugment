/**
 * Product Service
 * Handles product management operations with inventory integration
 */

import { z } from 'zod';
import createInventoryService from './inventoryService.js';

// Product validation schemas
const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  cost_price: z.number().min(0, 'Cost price must be non-negative').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  min_stock: z.number().int().min(0, 'Min stock cannot be negative').default(5),
  barcode: z.string().optional(),
  category_id: z.number().int().positive().optional(),
  image_url: z.string().url().optional(),
  active: z.boolean().default(true),
});

export class ProductService {
  constructor(db) {
    this.db = db;
    this.inventoryService = createInventoryService(db);
  }

  /**
   * Get all products with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Products
   */
  async getAllProducts(filters = {}) {
    try {
      // Build WHERE conditions
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.category_id) {
        whereClause += ' AND p.category_id = ?';
        params.push(filters.category_id);
      }
      
      if (filters.active !== undefined) {
        whereClause += ' AND p.active = ?';
        params.push(filters.active ? 1 : 0);
      }
      
      if (filters.search) {
        whereClause += ' AND (p.name LIKE ? OR p.barcode LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      if (filters.lowStock) {
        whereClause += ' AND p.stock <= p.min_stock';
      }
      
      // Build pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;
      
      // Build query
      const query = `
        SELECT 
          p.*,
          c.name as category_name,
          CASE WHEN p.stock <= p.min_stock THEN 1 ELSE 0 END as is_low_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY ${filters.sortBy || 'p.name'} ${filters.sortDir || 'ASC'}
        LIMIT ? OFFSET ?
      `;
      
      // Execute query
      const { results } = await this.db.prepare(query)
        .bind(...params, limit, offset)
        .all();
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        ${whereClause}
      `;
      
      const countResult = await this.db.prepare(countQuery)
        .bind(...params)
        .first();
      
      const total = countResult?.total || 0;
      
      // Return paginated result
      return {
        data: results || [],
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to retrieve products');
    }
  }

  /**
   * Get a product by ID
   * @param {number} productId - Product ID
   * @returns {Promise<Object|null>} Product
   */
  async getProductById(productId) {
    try {
      const product = await this.db.prepare(`
        SELECT 
          p.*,
          c.name as category_name,
          CASE WHEN p.stock <= p.min_stock THEN 1 ELSE 0 END as is_low_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `).bind(productId).first();
      
      if (!product) {
        return null;
      }
      
      // Get recent inventory movements
      const movements = await this.inventoryService.getProductMovements(productId, { limit: 5 });
      
      return {
        ...product,
        recent_movements: movements
      };
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to retrieve product');
    }
  }

  /**
   * Get a product by barcode
   * @param {string} barcode - Product barcode
   * @returns {Promise<Object|null>} Product
   */
  async getProductByBarcode(barcode) {
    try {
      const product = await this.db.prepare(`
        SELECT 
          p.*,
          c.name as category_name,
          CASE WHEN p.stock <= p.min_stock THEN 1 ELSE 0 END as is_low_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.barcode = ?
      `).bind(barcode).first();
      
      return product || null;
    } catch (error) {
      console.error('Error getting product by barcode:', error);
      throw new Error('Failed to retrieve product by barcode');
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {number} userId - User creating the product
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData, userId) {
    try {
      // Validate input data
      const validatedData = ProductSchema.parse(productData);
      
      // Insert product
      const result = await this.db.prepare(`
        INSERT INTO products (
          name,
          description,
          price,
          cost_price,
          stock,
          min_stock,
          barcode,
          category_id,
          image_url,
          active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        validatedData.name,
        validatedData.description,
        validatedData.price,
        validatedData.cost_price || null,
        validatedData.stock,
        validatedData.min_stock,
        validatedData.barcode || null,
        validatedData.category_id || null,
        validatedData.image_url || null,
        validatedData.active ? 1 : 0
      ).run();
      
      const newProductId = result.meta.last_row_id;
      
      // Log initial inventory if stock > 0
      if (validatedData.stock > 0) {
        await this.inventoryService.recordMovement({
          product_id: newProductId,
          movement_type: 'purchase',
          quantity_change: validatedData.stock,
          notes: 'Initial inventory for new product',
          user_id: userId
        });
      }
      
      // Return new product
      return this.getProductById(newProductId);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${JSON.stringify(error.errors)}`);
      }
      throw new Error('Failed to create product');
    }
  }

  /**
   * Update a product
   * @param {number} productId - Product ID
   * @param {Object} productData - Product data
   * @param {number} userId - User updating the product
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productId, productData, userId) {
    try {
      // First, get the current product
      const currentProduct = await this.getProductById(productId);
      
      if (!currentProduct) {
        throw new Error('Product not found');
      }
      
      // Prepare update data, filtering out undefined values
      const updateData = {};
      const allowedFields = [
        'name', 'description', 'price', 'cost_price', 'min_stock',
        'barcode', 'category_id', 'image_url', 'active'
      ];
      
      allowedFields.forEach(field => {
        if (productData[field] !== undefined) {
          updateData[field] = productData[field];
        }
      });
      
      // Handle stock changes separately via inventory service
      const stockChanged = productData.stock !== undefined && 
                         productData.stock !== currentProduct.stock;
      
      // Build update query
      if (Object.keys(updateData).length > 0) {
        const setClause = Object.keys(updateData)
          .map(field => `${field} = ?`)
          .join(', ');
        
        const query = `
          UPDATE products
          SET ${setClause}, updated_at = datetime('now')
          WHERE id = ?
        `;
        
        const params = [
          ...Object.values(updateData),
          productId
        ];
        
        await this.db.prepare(query).bind(...params).run();
      }
      
      // Handle stock change through inventory service
      if (stockChanged) {
        await this.inventoryService.updateStock(
          productId,
          productData.stock,
          userId,
          productData.stock_notes || 'Stock adjustment'
        );
      }
      
      // Return updated product
      return this.getProductById(productId);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  /**
   * Delete a product (soft delete)
   * @param {number} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProduct(productId) {
    try {
      await this.db.prepare(`
        UPDATE products
        SET active = 0, updated_at = datetime('now')
        WHERE id = ?
      `).bind(productId).run();
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Get low stock products
   * @param {number} limit - Maximum number of products to return
   * @returns {Promise<Array>} Low stock products
   */
  async getLowStockProducts(limit = 10) {
    return this.inventoryService.getLowStockProducts(limit);
  }

  /**
   * Get top selling products
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Top products
   */
  async getTopProducts(options = {}) {
    try {
      const limit = options.limit || 10;
      const period = options.period || 30; // days
      
      const query = `
        SELECT 
          p.id,
          p.name,
          p.price,
          p.image_url,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total_price) as total_revenue
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= datetime('now', '-${period} days')
          AND o.status = 'completed'
        GROUP BY p.id
        ORDER BY total_quantity DESC
        LIMIT ?
      `;
      
      const { results } = await this.db.prepare(query)
        .bind(limit)
        .all();
      
      return results || [];
    } catch (error) {
      console.error('Error getting top products:', error);
      throw new Error('Failed to retrieve top products');
    }
  }
}

export default function createProductService(db) {
  return new ProductService(db);
} 