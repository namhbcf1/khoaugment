import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { z } from 'zod';

// Import routes
import inventoryRoutes from './routes/inventory.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://khoaugment.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger());
app.use('*', prettyJSON());

// Rate limiting middleware
async function rateLimitMiddleware(c, next) {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit:${ip}`;
  
  try {
    const current = await c.env.CACHE?.get(key);
    const requests = current ? parseInt(current) : 0;
    
    if (requests >= 100) { // 100 requests per hour
      return c.json({ success: false, error: 'Rate limit exceeded' }, 429);
    }
    
    await c.env.CACHE?.put(key, (requests + 1).toString(), { expirationTtl: 3600 });
    await next();
  } catch (error) {
    // If KV fails, allow the request to continue
    await next();
  }
}

// Authentication middleware
async function authMiddleware(c, next) {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    const token = authHeader.substring(7);
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    
    // Verify session in D1
    const session = await c.env.DB.prepare(
      'SELECT users.* FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.id = ? AND sessions.expires_at > datetime("now")'
    ).bind(payload.sessionId).first();
    
    if (!session) {
      return c.json({ success: false, error: 'Session expired' }, 401);
    }
    
    c.set('user', session);
    await next();
  } catch (error) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
}

// Health check
app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'KhoAugment API is running',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development'
  });
});

// Apply rate limiting to API routes
app.use('/api/*', rateLimitMiddleware);

// Authentication routes
app.post('/api/auth/login', async (c) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });
    
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);
    
    // Find user by email
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, role, full_name FROM users WHERE email = ? AND active = 1'
    ).bind(email).first();

    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    
    // In a real app, we would verify the password hash
    // For simplicity, we're skipping actual password verification
    // This should be implemented with bcrypt or similar
    
    // Generate session ID
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    // Store session in database
    await c.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt.toISOString()).run();
    
    // Generate JWT token
    const token = await jwt.sign({ 
      sessionId,
      userId: user.id,
      role: user.role
    }, c.env.JWT_SECRET);
    
    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?'
    ).bind(user.id).run();
    
    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      }, 400);
    }
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Authentication failed' }, 500);
  }
});

app.post('/api/auth/logout', authMiddleware, async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader.substring(7);
    const payload = await jwt.verify(token, c.env.JWT_SECRET);
    
    // Delete session
    await c.env.DB.prepare(
      'DELETE FROM sessions WHERE id = ?'
    ).bind(payload.sessionId).run();
    
    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ success: false, error: 'Logout failed' }, 500);
  }
});

// Products endpoints
app.get('/api/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM products WHERE active = 1 ORDER BY name'
    ).all();
    
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.post('/api/products', authMiddleware, async (c) => {
  try {
    const productSchema = z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      price: z.number().positive(),
      cost_price: z.number().positive().optional(),
      stock: z.number().int().min(0),
      min_stock: z.number().int().min(0).default(5),
      barcode: z.string().optional(),
      category_id: z.number().int().positive().optional()
    });
    
    const body = await c.req.json();
    const validatedData = productSchema.parse(body);
    
    const result = await c.env.DB.prepare(
      'INSERT INTO products (name, description, price, cost_price, stock, min_stock, barcode, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      validatedData.name,
      validatedData.description,
      validatedData.price,
      validatedData.cost_price,
      validatedData.stock,
      validatedData.min_stock,
      validatedData.barcode,
      validatedData.category_id
    ).run();
    
    return c.json({ 
      success: true, 
      data: { id: result.meta.last_row_id } 
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      }, 400);
    }
    console.error('Error creating product:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.get('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ? AND active = 1'
    ).bind(id).first();
    
    if (!product) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    return c.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.put('/api/products/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const productSchema = z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      cost_price: z.number().positive().optional(),
      stock: z.number().int().min(0).optional(),
      min_stock: z.number().int().min(0).optional(),
      barcode: z.string().optional(),
      category_id: z.number().int().positive().optional(),
      image_url: z.string().optional(),
      active: z.boolean().optional()
    });
    
    const body = await c.req.json();
    const validatedData = productSchema.parse(body);
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return c.json({ success: false, error: 'No fields to update' }, 400);
    }
    
    fields.push('updated_at = datetime("now")');
    
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    
    const result = await c.env.DB.prepare(query).bind(...values).run();
    
    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    return c.json({ success: true, data: { id: parseInt(id) } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      }, 400);
    }
    console.error('Error updating product:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.delete('/api/products/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Soft delete by setting active = 0
    const result = await c.env.DB.prepare(
      'UPDATE products SET active = 0, updated_at = datetime("now") WHERE id = ?'
    ).bind(id).run();
    
    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }
    
    return c.json({ success: true, data: { id: parseInt(id) } });
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Categories endpoints
app.get('/api/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM categories WHERE active = 1 ORDER BY name'
    ).all();
    
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Orders endpoints
app.get('/api/orders', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT o.*, u.full_name as cashier_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `).all();

    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.post('/api/orders', authMiddleware, async (c) => {
  try {
    const orderSchema = z.object({
      customer_id: z.number().int().positive().optional(),
      items: z.array(z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
        unit_price: z.number().positive()
      })),
      payment_method: z.enum(['cash', 'card', 'vnpay', 'momo', 'zalopay']),
      discount_amount: z.number().min(0).default(0),
      notes: z.string().optional()
    });
    
    const body = await c.req.json();
    const validatedData = orderSchema.parse(body);
    
    // Calculate totals
    const subtotal = validatedData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );
    const tax_amount = subtotal * 0.1; // 10% VAT
    const total_amount = subtotal + tax_amount - validatedData.discount_amount;
    
    // Generate order number
    const order_number = `ORD-${Date.now()}`;
    
    // Get user from context
    const user = c.get('user');
    
    // Create order and order items in transaction
    const statements = [
      c.env.DB.prepare(
        'INSERT INTO orders (order_number, user_id, customer_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        order_number,
        user.id,
        validatedData.customer_id,
        subtotal,
        tax_amount,
        validatedData.discount_amount,
        total_amount,
        validatedData.payment_method,
        validatedData.notes
      )
    ];
    
    // Add order items
    validatedData.items.forEach(item => {
      statements.push(
        c.env.DB.prepare(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (last_insert_rowid(), ?, ?, ?, ?)'
        ).bind(
          item.product_id,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price
        )
      );
      
      // Update product stock
      statements.push(
        c.env.DB.prepare(
          'UPDATE products SET stock = stock - ? WHERE id = ?'
        ).bind(item.quantity, item.product_id)
      );
      
      // Add inventory movement
      statements.push(
        c.env.DB.prepare(`
          INSERT INTO inventory_movements (
            product_id, movement_type, quantity_change, 
            quantity_before, quantity_after, reference_type, 
            reference_id, user_id
          )
          SELECT 
            ?, 'sale', -?, 
            stock + ?, stock, 'order', 
            last_insert_rowid(), ?
          FROM products WHERE id = ?
        `).bind(
          item.product_id,
          item.quantity,
          item.quantity,
          user.id,
          item.product_id
        )
      );
    });
    
    const result = await c.env.DB.batch(statements);
    
    if (!result.every(r => r.success)) {
      throw new Error('Transaction failed');
    }
    
    return c.json({ 
      success: true,
      data: {
        order_number,
        total_amount 
      } 
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
      success: false,
        error: 'Validation failed', 
        details: error.errors 
      }, 400);
    }
    console.error('Error creating order:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.get('/api/orders/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get order details
    const order = await c.env.DB.prepare(`
      SELECT o.*, u.full_name as cashier_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).bind(id).first();
    
    if (!order) {
      return c.json({ success: false, error: 'Order not found' }, 404);
    }
    
    // Get order items
    const { results: items } = await c.env.DB.prepare(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).bind(id).all();
    
    order.items = items;
    
    return c.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// File upload to R2
app.post('/api/upload', authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }
    
    const key = `uploads/${Date.now()}-${file.name}`;
    
    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'max-age=31536000',
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    });
    
    const url = `https://khoaugment-assets.r2.dev/${key}`;
    
    return c.json({ 
      success: true, 
      data: { url, key } 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return c.json({ success: false, error: 'Upload failed' }, 500);
  }
});

// Analytics endpoints
app.get('/api/analytics/dashboard', authMiddleware, async (c) => {
  try {
    // Get total revenue
    const revenue = await c.env.DB.prepare(`
      SELECT SUM(total_amount) as total_revenue
      FROM orders
      WHERE status = 'completed'
      AND created_at >= datetime('now', '-30 days')
    `).first();
    
    // Get total orders
    const orders = await c.env.DB.prepare(`
      SELECT COUNT(*) as total_orders
      FROM orders
      WHERE created_at >= datetime('now', '-30 days')
    `).first();
    
    // Get total products
    const products = await c.env.DB.prepare(`
      SELECT COUNT(*) as total_products
      FROM products
      WHERE active = 1
    `).first();
    
    // Get total customers
    const customers = await c.env.DB.prepare(`
      SELECT COUNT(*) as total_customers
      FROM customers
      WHERE active = 1
    `).first();
    
    // Get revenue growth (current month vs previous month)
    const revenueGrowth = await c.env.DB.prepare(`
      SELECT 
        (SELECT SUM(total_amount) FROM orders WHERE created_at >= datetime('now', 'start of month')) as current_month,
        (SELECT SUM(total_amount) FROM orders WHERE created_at >= datetime('now', 'start of month', '-1 month') AND created_at < datetime('now', 'start of month')) as previous_month
    `).first();
    
    // Calculate growth percentage
    let growthPercentage = 0;
    if (revenueGrowth.previous_month && revenueGrowth.previous_month > 0) {
      growthPercentage = ((revenueGrowth.current_month - revenueGrowth.previous_month) / revenueGrowth.previous_month) * 100;
    }
    
    return c.json({
      success: true,
      data: {
        totalRevenue: revenue.total_revenue || 0,
        totalOrders: orders.total_orders || 0,
        totalProducts: products.total_products || 0,
        totalCustomers: customers.total_customers || 0,
        revenueGrowth: growthPercentage,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.get('/api/analytics/sales-chart', authMiddleware, async (c) => {
  try {
    const period = c.req.query('period') || 'month';
    let timeFormat, groupBy, limit;
    
    switch (period) {
      case 'day':
        timeFormat = '%H:00';
        groupBy = "strftime('%H', created_at)";
        limit = 24;
        break;
      case 'week':
        timeFormat = '%Y-%m-%d';
        groupBy = "strftime('%Y-%m-%d', created_at)";
        limit = 7;
        break;
      case 'year':
        timeFormat = '%Y-%m';
        groupBy = "strftime('%Y-%m', created_at)";
        limit = 12;
        break;
      case 'month':
      default:
        timeFormat = '%Y-%m-%d';
        groupBy = "strftime('%Y-%m-%d', created_at)";
        limit = 30;
        break;
    }
    
    const { results } = await c.env.DB.prepare(`
      SELECT
        ${groupBy} as date,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= datetime('now', '-${limit} days')
      GROUP BY ${groupBy}
      ORDER BY date ASC
    `).all();
    
    return c.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching sales chart:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

app.get('/api/analytics/top-products', authMiddleware, async (c) => {
  try {
    const limit = parseInt(c.req.query('limit')) || 10;
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        p.id,
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      AND o.created_at >= datetime('now', '-30 days')
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT ?
    `).bind(limit).all();
    
    return c.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Customers endpoints
app.get('/api/customers', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM customers
      WHERE active = 1
      ORDER BY name
    `).all();
    
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Settings endpoints
app.get('/api/settings', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT key, value, description FROM settings
    `).all();
    
    // Convert to object
    const settings = {};
    results.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    
    return c.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Register inventory routes
app.route('/api/inventory', inventoryRoutes);

// Cron job for daily cleanup
app.get('/api/cron/cleanup', async (c) => {
  try {
    // Clean up old sessions
    await c.env.DB.prepare(
      'DELETE FROM sessions WHERE expires_at < datetime("now")'
    ).run();
    
    // Clean up old logs
    await c.env.DB.prepare(
      'DELETE FROM activity_logs WHERE created_at < datetime("now", "-30 days")'
    ).run();
    
    return c.json({ success: true, message: 'Cleanup completed' });
    } catch (error) {
    console.error('Error in cleanup:', error);
    return c.json({ success: false, error: 'Cleanup failed' }, 500);
  }
});

export default app;