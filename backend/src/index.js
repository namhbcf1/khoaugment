/**
 * KhoChuan POS API - PRODUCTION VERSION
 * Real business system for Trường Phát Computer Hòa Bình
 * Full database integration, authentication, and business logic
 */

// Use Web Crypto API for Cloudflare Workers
// JWT will be handled with simple base64 encoding for now

// CORS headers
function addCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

// Route matcher
function matchRoute(path, pattern) {
  const pathParts = path.split('/').filter(p => p);
  const patternParts = pattern.split('/').filter(p => p);

  if (pathParts.length !== patternParts.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].substring(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return params;
}

// Authentication handlers
async function handleAuthLogin(request, env) {
  try {
    const loginData = await request.json();
    const { email, password } = loginData;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email và password là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = env.DB;
    const user = await db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email hoặc password không đúng'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // PRODUCTION: Real password hashing verification using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(password + (env.SALT || 'truongphat-salt'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (user.password_hash !== passwordHash) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email hoặc password không đúng'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // PRODUCTION: Simple JWT-like token (base64 encoded)
    const tokenData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    const token = btoa(JSON.stringify(tokenData));

    return new Response(JSON.stringify({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      message: 'Đăng nhập thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi đăng nhập'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// Products handlers
async function handleProductsList(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const db = env.DB;

    let query = `
      SELECT
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;

    const params = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const products = await db.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE is_active = 1';
    const countParams = [];

    if (search) {
      countQuery += ` AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countResult = await db.prepare(countQuery).bind(...countParams).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        products: products.results || [],
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
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// Categories handlers
async function handleCategoriesList(request, env) {
  try {
    const db = env.DB;
    const categories = await db.prepare(`
      SELECT * FROM categories
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC
    `).all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        categories: categories.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// Customers handlers
async function handleCustomersList(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const db = env.DB;

    // Simplified query without JOIN to avoid errors
    let query = `
      SELECT * FROM customers
      WHERE is_active = 1
    `;

    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    console.log('Customers query:', query);
    console.log('Customers params:', params);

    const customers = await db.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE is_active = 1';
    const countParams = [];

    if (search) {
      countQuery += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countResult = await db.prepare(countQuery).bind(...countParams).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        customers: customers.results || [],
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
    console.error('Customers API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng: ' + error.message,
      error_details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// Orders handlers
async function handleOrdersList(request, env) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const status = url.searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    const db = env.DB;

    let query = `
      SELECT
        o.*,
        c.name as customer_name,
        u.name as cashier_name,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN users u ON o.cashier_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ` AND o.order_status = ?`;
      params.push(status);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const orders = await db.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ` AND order_status = ?`;
      countParams.push(status);
    }

    const countResult = await db.prepare(countQuery).bind(...countParams).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        orders: orders.results || [],
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
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// Inventory handlers
async function handleInventoryCurrent(request, env) {
  try {
    const url = new URL(request.url);
    const low_stock = url.searchParams.get('low_stock') === 'true';
    const category_id = url.searchParams.get('category_id');

    const db = env.DB;

    let query = `
      SELECT
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.reorder_level,
        p.price,
        p.cost_price,
        c.name as category_name,
        CASE
          WHEN p.stock_quantity <= p.reorder_level THEN 'low'
          WHEN p.stock_quantity <= (p.reorder_level * 2) THEN 'medium'
          ELSE 'good'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;

    const params = [];

    if (low_stock) {
      query += ` AND p.stock_quantity <= p.reorder_level`;
    }

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    query += ` ORDER BY p.stock_quantity ASC, p.name ASC`;

    const inventory = await db.prepare(query).bind(...params).all();

    // Calculate summary statistics
    const summaryQuery = `
      SELECT
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_count,
        SUM(stock_quantity * cost_price) as total_inventory_value
      FROM products
      WHERE is_active = 1
    `;

    const summary = await db.prepare(summaryQuery).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        inventory: inventory.results || [],
        summary: {
          total_products: summary.total_products || 0,
          low_stock_count: summary.low_stock_count || 0,
          total_inventory_value: summary.total_inventory_value || 0
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy thông tin tồn kho'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// Analytics handlers
async function handleAnalyticsSalesDaily(request, env) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days')) || 30;
    const date_from = url.searchParams.get('date_from');
    const date_to = url.searchParams.get('date_to');

    const db = env.DB;

    let dateCondition = '';
    let params = [];

    if (date_from && date_to) {
      dateCondition = 'WHERE DATE(o.created_at) BETWEEN ? AND ?';
      params = [date_from, date_to];
    } else {
      dateCondition = 'WHERE DATE(o.created_at) >= DATE(?, \'-\' || ? || \' days\')';
      params = [new Date().toISOString().split('T')[0], days];
    }

    const query = `
      SELECT
        DATE(o.created_at) as date,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_sales,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM orders o
      ${dateCondition}
      AND o.order_status = 'completed'
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
    `;

    const dailySales = await db.prepare(query).bind(...params).all();

    // Calculate summary statistics
    const summaryQuery = `
      SELECT
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM orders o
      ${dateCondition}
      AND o.order_status = 'completed'
    `;

    const summary = await db.prepare(summaryQuery).bind(...params).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        daily_sales: dailySales.results || [],
        summary: {
          total_orders: summary.total_orders || 0,
          total_revenue: summary.total_revenue || 0,
          avg_order_value: summary.avg_order_value || 0,
          unique_customers: summary.unique_customers || 0
        },
        period: {
          days: days,
          date_from: date_from,
          date_to: date_to
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy thống kê bán hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

function createNotImplementedResponse(feature) {
  return new Response(JSON.stringify({
    success: false,
    message: `${feature} not implemented yet`
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

// TEMPORARY: Setup users with correct password hashes
async function handleSetupUsers(request, env) {
  try {
    const db = env.DB;
    const salt = env.SALT || 'truongphat-computer-hoabinh-salt-2025';

    // Define users with their passwords - FORCE REPLACE ALL USERS
    const users = [
      { id: 'user-001', email: 'admin@truongphat.com', password: 'admin123', name: 'Nguyễn Văn Admin', role: 'admin', phone: '0123456789' },
      { id: 'user-002', email: 'cashier@truongphat.com', password: 'cashier123', name: 'Trần Thị Thu Ngân', role: 'cashier', phone: '0987654321' },
      { id: 'user-003', email: 'staff@truongphat.com', password: 'staff123', name: 'Lê Văn Nhân Viên', role: 'staff', phone: '0369852147' },
      { id: 'user-004', email: 'manager@truongphat.com', password: 'manager123', name: 'Phạm Thị Quản Lý', role: 'admin', phone: '0147258369' }
    ];

    const results = [];

    // Map old emails to new emails for existing users
    const emailMapping = {
      'admin@khochuan.com': 'admin@truongphat.com',
      'cashier@khochuan.com': 'cashier@truongphat.com',
      'staff@khochuan.com': 'staff@truongphat.com',
      'manager@khochuan.com': 'manager@truongphat.com'
    };

    for (const user of users) {
      // Generate password hash using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(user.password + salt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Find corresponding old email
      const oldEmail = Object.keys(emailMapping).find(key => emailMapping[key] === user.email);

      if (oldEmail) {
        // UPDATE existing user by old email
        const result = await db.prepare(`
          UPDATE users
          SET email = ?, password_hash = ?, name = ?, role = ?, phone = ?, updated_at = datetime('now')
          WHERE email = ?
        `).bind(user.email, passwordHash, user.name, user.role, user.phone, oldEmail).run();

        results.push({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          action: 'updated_from_' + oldEmail,
          success: result.success,
          changes: result.changes
        });
      } else {
        // INSERT new user if no mapping found
        const result = await db.prepare(`
          INSERT INTO users (id, email, password_hash, name, role, phone, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        `).bind(user.id, user.email, passwordHash, user.name, user.role, user.phone).run();

        results.push({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          action: 'inserted_new',
          success: result.success,
          changes: result.changes
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Users setup completed successfully',
      data: { users: results }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Setup users error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to setup users: ' + error.message,
      error_details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// TEMPORARY: Debug password hash endpoint
async function handleDebugHash(request, env) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email và password là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const db = env.DB;
    const salt = env.SALT || 'truongphat-computer-hoabinh-salt-2025';

    // Get user from database
    const user = await db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').bind(email).first();

    // Generate hash for provided password
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const generatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return new Response(JSON.stringify({
      success: true,
      debug: {
        email: email,
        password_provided: password,
        salt_used: salt,
        generated_hash: generatedHash,
        user_found: !!user,
        stored_hash: user ? user.password_hash : null,
        hashes_match: user ? (user.password_hash === generatedHash) : false,
        user_data: user ? {
          id: user.id,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at
        } : null
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Debug hash error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to debug hash: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// TEMPORARY: List all users endpoint
async function handleListUsers(request, env) {
  try {
    const db = env.DB;

    // Get all users from database
    const users = await db.prepare('SELECT id, email, name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC').all();

    // Also get table info
    const tableInfo = await db.prepare("PRAGMA table_info(users)").all();

    return new Response(JSON.stringify({
      success: true,
      data: {
        users: users.results || [],
        total_users: users.results?.length || 0,
        table_info: tableInfo.results || []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('List users error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to list users: ' + error.message,
      error_details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    console.log('Request:', method, path);

    try {
      // Handle OPTIONS requests
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: addCorsHeaders()
        });
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({
          success: true,
          message: 'KhoChuan POS API is healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
        });
      }

      // Root endpoint
      if (path === '/') {
        return new Response(JSON.stringify({
          success: true,
          message: 'KhoChuan POS API',
          version: '1.0.0',
          endpoints: [
            'GET /health - Health check',
            'POST /auth/login - User authentication',
            'GET /products - List products',
            'GET /categories - List categories',
            'GET /customers - List customers',
            'GET /orders - List orders',
            'GET /inventory/current - Current inventory',
            'GET /analytics/sales/daily - Sales analytics'
          ]
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
        });
      }

      // Authentication routes
      if (path === '/auth/login' && method === 'POST') {
        return await handleAuthLogin(request, env);
      }

      // TEMPORARY: Setup users endpoint (for fixing authentication)
      if (path === '/auth/setup-users' && method === 'POST') {
        return await handleSetupUsers(request, env);
      }

      // TEMPORARY: Debug password hash endpoint
      if (path === '/auth/debug-hash' && method === 'POST') {
        return await handleDebugHash(request, env);
      }

      // TEMPORARY: List all users endpoint
      if (path === '/auth/list-users' && method === 'GET') {
        return await handleListUsers(request, env);
      }

      // Products routes
      if (path === '/products' && method === 'GET') {
        return await handleProductsList(request, env);
      }

      // Categories routes
      if (path === '/categories' && method === 'GET') {
        return await handleCategoriesList(request, env);
      }

      // Customers routes
      if (path === '/customers' && method === 'GET') {
        return await handleCustomersList(request, env);
      }

      // Orders routes
      if (path === '/orders' && method === 'GET') {
        return await handleOrdersList(request, env);
      }

      // Inventory routes
      if (path === '/inventory/current' && method === 'GET') {
        return await handleInventoryCurrent(request, env);
      }

      // Analytics routes
      if (path === '/analytics/sales/daily' && method === 'GET') {
        return await handleAnalyticsSalesDaily(request, env);
      }

      // 404 for unmatched routes
      return new Response(JSON.stringify({
        success: false,
        message: 'Endpoint not found',
        path: path,
        method: method
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });

    } catch (error) {
      console.error('Error handling request:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }
  }
};

// Export Durable Objects - Temporarily disabled
// export { RealtimeDurableObject };