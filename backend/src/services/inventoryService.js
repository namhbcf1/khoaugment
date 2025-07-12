/**
 * Inventory Service
 * Handles inventory management operations, stock tracking, and movements
 */

import { z } from 'zod';

// Inventory movement schema for validation
const InventoryMovementSchema = z.object({
  product_id: z.number().positive(),
  movement_type: z.enum(['sale', 'purchase', 'adjustment', 'return']),
  quantity_change: z.number().int(),
  reference_id: z.number().positive().optional(),
  reference_type: z.string().optional(),
  notes: z.string().optional(),
  user_id: z.number().positive(),
});

export class InventoryService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get current stock level for a product
   * @param {number} productId - Product ID
   * @returns {Promise<number>} Current stock quantity
   */
  async getProductStock(productId) {
    try {
      const product = await this.db.prepare(
        'SELECT stock FROM products WHERE id = ?'
      ).bind(productId).first();

      return product ? product.stock : 0;
    } catch (error) {
      console.error('Error getting product stock:', error);
      throw new Error('Failed to retrieve product stock');
    }
  }

  /**
   * Update stock level for a product
   * @param {number} productId - Product ID
   * @param {number} newStock - New stock level
   * @param {number} userId - User making the change
   * @param {string} notes - Notes about the change
   * @returns {Promise<boolean>} Success status
   */
  async updateStock(productId, newStock, userId, notes = 'Manual stock update') {
    try {
      // Get current stock
      const currentStock = await this.getProductStock(productId);
      
      // Calculate change
      const quantityChange = newStock - currentStock;
      
      if (quantityChange === 0) {
        return true; // No change needed
      }

      // Create movement record and update stock in transaction
      const result = await this.db.batch([
        // Update product stock
        this.db.prepare(
          'UPDATE products SET stock = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind(newStock, productId),
        
        // Log movement
        this.db.prepare(`
          INSERT INTO inventory_movements (
            product_id, 
            movement_type, 
            quantity_change, 
            quantity_before, 
            quantity_after, 
            notes, 
            user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          productId, 
          quantityChange > 0 ? 'purchase' : 'adjustment', 
          quantityChange, 
          currentStock, 
          newStock, 
          notes, 
          userId
        )
      ]);

      // Check if stock is low after update
      if (newStock <= await this.getReorderLevel(productId)) {
        await this.triggerLowStockAlert(productId, newStock);
      }

      return result.every(r => r.success);
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error('Failed to update product stock');
    }
  }

  /**
   * Handle stock changes from sales
   * @param {Array} items - Array of order items
   * @param {number} orderId - Order ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async processOrderStock(items, orderId, userId) {
    try {
      const statements = [];
      
      for (const item of items) {
        // Get current stock
        const product = await this.db.prepare(
          'SELECT id, stock FROM products WHERE id = ?'
        ).bind(item.product_id).first();
        
        if (!product) {
          throw new Error(`Product not found: ${item.product_id}`);
        }
        
        const currentStock = product.stock;
        const newStock = currentStock - item.quantity;
        
        if (newStock < 0) {
          throw new Error(`Insufficient stock for product: ${item.product_id}`);
        }
        
        // Add stock update statement
        statements.push(
          this.db.prepare(
            'UPDATE products SET stock = ?, updated_at = datetime("now") WHERE id = ?'
          ).bind(newStock, item.product_id)
        );
        
        // Add movement record
        statements.push(
          this.db.prepare(`
            INSERT INTO inventory_movements (
              product_id, 
              movement_type, 
              quantity_change, 
              quantity_before, 
              quantity_after, 
              reference_id, 
              reference_type, 
              notes, 
              user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            item.product_id, 
            'sale', 
            -item.quantity, 
            currentStock, 
            newStock, 
            orderId, 
            'order', 
            'Sale from order', 
            userId
          )
        );
        
        // Check if we need to generate a low stock alert
        if (newStock <= await this.getReorderLevel(item.product_id)) {
          // We'll handle alerts outside the transaction to ensure stock updates complete
          setTimeout(() => {
            this.triggerLowStockAlert(item.product_id, newStock).catch(
              err => console.error('Error triggering low stock alert:', err)
            );
          }, 0);
        }
      }
      
      // Execute all statements in a transaction
      const result = await this.db.batch(statements);
      return result.every(r => r.success);
    } catch (error) {
      console.error('Error processing order stock:', error);
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  }

  /**
   * Handle returns and refunds
   * @param {Array} items - Array of returned items
   * @param {number} returnId - Return reference ID
   * @param {number} userId - User making the return
   * @returns {Promise<boolean>} Success status
   */
  async processReturnStock(items, returnId, userId) {
    try {
      const statements = [];
      
      for (const item of items) {
        // Get current stock
        const product = await this.db.prepare(
          'SELECT id, stock FROM products WHERE id = ?'
        ).bind(item.product_id).first();
        
        if (!product) {
          throw new Error(`Product not found: ${item.product_id}`);
        }
        
        const currentStock = product.stock;
        const newStock = currentStock + item.quantity;
        
        // Add stock update statement
        statements.push(
          this.db.prepare(
            'UPDATE products SET stock = ?, updated_at = datetime("now") WHERE id = ?'
          ).bind(newStock, item.product_id)
        );
        
        // Add movement record
        statements.push(
          this.db.prepare(`
            INSERT INTO inventory_movements (
              product_id, 
              movement_type, 
              quantity_change, 
              quantity_before, 
              quantity_after, 
              reference_id, 
              reference_type, 
              notes, 
              user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            item.product_id, 
            'return', 
            item.quantity, 
            currentStock, 
            newStock, 
            returnId, 
            'return', 
            item.return_reason || 'Product return', 
            userId
          )
        );
      }
      
      // Execute all statements in a transaction
      const result = await this.db.batch(statements);
      return result.every(r => r.success);
    } catch (error) {
      console.error('Error processing return stock:', error);
      throw new Error(`Failed to update stock from returns: ${error.message}`);
    }
  }

  /**
   * Record an inventory movement
   * @param {Object} movementData - Movement data
   * @returns {Promise<Object>} Movement record
   */
  async recordMovement(movementData) {
    try {
      // Validate input
      const validatedData = InventoryMovementSchema.parse(movementData);
      
      // Get current stock
      const product = await this.db.prepare(
        'SELECT id, stock FROM products WHERE id = ?'
      ).bind(validatedData.product_id).first();
      
      if (!product) {
        throw new Error(`Product not found: ${validatedData.product_id}`);
      }
      
      const currentStock = product.stock;
      const newStock = currentStock + validatedData.quantity_change;
      
      // Prevent negative stock unless explicitly allowed
      if (newStock < 0 && validatedData.movement_type !== 'adjustment') {
        throw new Error(`Operation would result in negative stock (${newStock}) for product ${validatedData.product_id}`);
      }
      
      // Execute transaction
      const result = await this.db.batch([
        // Update product stock
        this.db.prepare(
          'UPDATE products SET stock = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind(newStock, validatedData.product_id),
        
        // Insert movement record
        this.db.prepare(`
          INSERT INTO inventory_movements (
            product_id, 
            movement_type, 
            quantity_change, 
            quantity_before, 
            quantity_after, 
            reference_id, 
            reference_type, 
            notes, 
            user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          validatedData.product_id, 
          validatedData.movement_type, 
          validatedData.quantity_change, 
          currentStock, 
          newStock, 
          validatedData.reference_id || null, 
          validatedData.reference_type || null, 
          validatedData.notes || null, 
          validatedData.user_id
        )
      ]);
      
      if (newStock <= await this.getReorderLevel(validatedData.product_id)) {
        await this.triggerLowStockAlert(validatedData.product_id, newStock);
      }
      
      return {
        success: result.every(r => r.success),
        movement_id: result[1].meta.last_row_id,
        new_stock: newStock
      };
    } catch (error) {
      console.error('Error recording inventory movement:', error);
      throw new Error(`Failed to record inventory movement: ${error.message}`);
    }
  }

  /**
   * Get inventory movement history for a product
   * @param {number} productId - Product ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Inventory movements
   */
  async getProductMovements(productId, options = {}) {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      
      const query = `
        SELECT 
          im.*,
          u.full_name as user_name
        FROM inventory_movements im
        LEFT JOIN users u ON im.user_id = u.id
        WHERE im.product_id = ?
        ORDER BY im.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const { results } = await this.db.prepare(query)
        .bind(productId, limit, offset)
        .all();
      
      return results || [];
    } catch (error) {
      console.error('Error getting product movements:', error);
      throw new Error('Failed to retrieve inventory movements');
    }
  }

  /**
   * Get reorder level for a product
   * @param {number} productId - Product ID
   * @returns {Promise<number>} Reorder level
   */
  async getReorderLevel(productId) {
    try {
      const product = await this.db.prepare(
        'SELECT min_stock FROM products WHERE id = ?'
      ).bind(productId).first();
      
      return product ? product.min_stock : 5; // Default to 5
    } catch (error) {
      console.error('Error getting reorder level:', error);
      return 5; // Default to 5 on error
    }
  }

  /**
   * Get low stock products
   * @param {number} limit - Maximum number of products to return
   * @returns {Promise<Array>} Low stock products
   */
  async getLowStockProducts(limit = 20) {
    try {
      const query = `
        SELECT 
          p.*,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.stock <= p.min_stock AND p.active = 1
        ORDER BY (p.min_stock - p.stock) DESC
        LIMIT ?
      `;
      
      const { results } = await this.db.prepare(query)
        .bind(limit)
        .all();
      
      return results || [];
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw new Error('Failed to retrieve low stock products');
    }
  }

  /**
   * Trigger low stock alert
   * @param {number} productId - Product ID
   * @param {number} currentStock - Current stock level
   * @returns {Promise<void>}
   */
  async triggerLowStockAlert(productId, currentStock) {
    try {
      const product = await this.db.prepare(`
        SELECT 
          p.*,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `).bind(productId).first();
      
      if (!product) return;
      
      // Log alert to activities table
      await this.db.prepare(`
        INSERT INTO activity_logs (
          action,
          entity_type,
          entity_id,
          details
        ) VALUES (?, ?, ?, ?)
      `).bind(
        'low_stock_alert',
        'product',
        productId,
        JSON.stringify({
          product_name: product.name,
          current_stock: currentStock,
          min_stock: product.min_stock,
          category: product.category_name,
        })
      ).run();
      
      // In a real implementation, we would also:
      // 1. Send email notifications
      // 2. Create system notifications for admins
      // 3. Maybe trigger automatic reordering
      
    } catch (error) {
      console.error('Error triggering low stock alert:', error);
      // We don't throw here to avoid disrupting the main operation
    }
  }
}

export default function createInventoryService(db) {
  return new InventoryService(db);
} 