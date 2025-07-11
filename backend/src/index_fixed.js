/**
 * Fixed KhoChuan POS API - Manual Routing
 * Working version without itty-router to avoid hanging issues
 * Trường Phát Computer Hòa Bình
 */

// Import route handlers
import authRoutes from './routes/auth_real.js';
import productsRoutes from './routes/products_real.js';
import categoriesRoutes from './routes/categories_real.js';
import ordersRoutes from './routes/orders_real.js';
import customersRoutes from './routes/customers_real.js';
import inventoryRoutes from './routes/inventory_real.js';
import analyticsRoutes from './routes/analytics_real.js';
import aiRoutes from './routes/ai_real.js';

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

// Main request handler
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

    // Simple password check (in production, use proper hashing)
    if (password !== 'admin123' && password !== 'cashier123' && password !== 'staff123') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email hoặc password không đúng'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Create simple JWT-like token
    const token = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));

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

async function handleAuthRegister(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Registration not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleAuthMe(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Auth me not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
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

async function handleProductsCreate(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Product creation not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleProductsSearch(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Product search not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleProductsLowStock(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Low stock not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleProductsGet(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Product get not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleProductsUpdate(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Product update not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleProductsDelete(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Product delete not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleProductsBarcode(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Barcode lookup not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

// Placeholder handlers for other routes
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

async function handleCategoriesCreate(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Categories create not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleCategoriesUpdate(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Categories update not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

async function handleCategoriesDelete(request, env) {
  return new Response(JSON.stringify({
    success: false,
    message: 'Categories delete not implemented yet'
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
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

    let query = `
      SELECT
        c.*,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent_calculated
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE c.is_active = 1
    `;

    const params = [];

    if (search) {
      query += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

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
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
}
async function handleCustomersCreate(request, env) { return createNotImplementedResponse('Customers create'); }
async function handleCustomersSegments(request, env) { return createNotImplementedResponse('Customers segments'); }
async function handleCustomersGet(request, env) { return createNotImplementedResponse('Customers get'); }
async function handleCustomersUpdate(request, env) { return createNotImplementedResponse('Customers update'); }
async function handleCustomersLoyalty(request, env) { return createNotImplementedResponse('Customers loyalty'); }
async function handleCustomersLoyaltyHistory(request, env) { return createNotImplementedResponse('Customers loyalty history'); }
async function handleCustomersAnalytics(request, env) { return createNotImplementedResponse('Customers analytics'); }
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
async function handleOrdersCreate(request, env) { return createNotImplementedResponse('Orders create'); }
async function handleOrdersGet(request, env) { return createNotImplementedResponse('Orders get'); }
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
async function handleInventoryMovements(request, env) { return createNotImplementedResponse('Inventory movements'); }
async function handleInventoryAlerts(request, env) { return createNotImplementedResponse('Inventory alerts'); }
async function handleInventoryAdjustment(request, env) { return createNotImplementedResponse('Inventory adjustment'); }
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
async function handleAnalyticsSalesProducts(request, env) { return createNotImplementedResponse('Analytics sales products'); }
async function handleAnalyticsSalesCustomers(request, env) { return createNotImplementedResponse('Analytics sales customers'); }
async function handleAnalyticsInventoryTurnover(request, env) { return createNotImplementedResponse('Analytics inventory turnover'); }
async function handleAIForecastDemand(request, env) { return createNotImplementedResponse('AI forecast demand'); }
async function handleAIRecommendations(request, env) { return createNotImplementedResponse('AI recommendations'); }

function createNotImplementedResponse(feature) {
  return new Response(JSON.stringify({
    success: false,
    message: `${feature} not implemented yet`
  }), {
    status: 501,
    headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
  });
}

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
      
      // Create a mock request object for route handlers
      const mockRequest = {
        ...request,
        params: {},
        query: Object.fromEntries(url.searchParams.entries())
      };
      
      // Authentication routes
      if (path.startsWith('/auth')) {
        if (path === '/auth/login' && method === 'POST') {
          return await handleAuthLogin(request, env);
        }
        if (path === '/auth/register' && method === 'POST') {
          return await handleAuthRegister(request, env);
        }
        if (path === '/auth/me' && method === 'GET') {
          return await handleAuthMe(request, env);
        }
      }
      
      // Products routes
      if (path.startsWith('/products')) {
        if (path === '/products' && method === 'GET') {
          return await handleProductsList(request, env);
        }
        if (path === '/products' && method === 'POST') {
          return await handleProductsCreate(request, env);
        }
        if (path === '/products/search' && method === 'POST') {
          return await handleProductsSearch(request, env);
        }
        if (path === '/products/low-stock' && method === 'GET') {
          return await handleProductsLowStock(request, env);
        }
        
        // Dynamic routes with ID
        const productIdMatch = matchRoute(path, '/products/:id');
        if (productIdMatch && method === 'GET') {
          mockRequest.params = productIdMatch;
          return await handleProductsGet(mockRequest, env);
        }
        if (productIdMatch && method === 'PUT') {
          mockRequest.params = productIdMatch;
          return await handleProductsUpdate(mockRequest, env);
        }
        if (productIdMatch && method === 'DELETE') {
          mockRequest.params = productIdMatch;
          return await handleProductsDelete(mockRequest, env);
        }
        
        // Barcode lookup
        const barcodeMatch = matchRoute(path, '/products/barcode/:barcode');
        if (barcodeMatch && method === 'GET') {
          mockRequest.params = barcodeMatch;
          return await handleProductsBarcode(mockRequest, env);
        }
      }
      
      // Categories routes
      if (path.startsWith('/categories')) {
        if (path === '/categories' && method === 'GET') {
          return await handleCategoriesList(request, env);
        }
        if (path === '/categories' && method === 'POST') {
          return await handleCategoriesCreate(request, env);
        }
        
        const categoryIdMatch = matchRoute(path, '/categories/:id');
        if (categoryIdMatch && method === 'PUT') {
          mockRequest.params = categoryIdMatch;
          return await handleCategoriesUpdate(mockRequest, env);
        }
        if (categoryIdMatch && method === 'DELETE') {
          mockRequest.params = categoryIdMatch;
          return await handleCategoriesDelete(mockRequest, env);
        }
      }
      
      // Customers routes
      if (path.startsWith('/customers')) {
        if (path === '/customers' && method === 'GET') {
          return await handleCustomersList(request, env);
        }
        if (path === '/customers' && method === 'POST') {
          return await handleCustomersCreate(request, env);
        }
        if (path === '/customers/segments' && method === 'GET') {
          return await handleCustomersSegments(request, env);
        }
        
        const customerIdMatch = matchRoute(path, '/customers/:id');
        if (customerIdMatch && method === 'GET') {
          mockRequest.params = customerIdMatch;
          return await handleCustomersGet(mockRequest, env);
        }
        if (customerIdMatch && method === 'PUT') {
          mockRequest.params = customerIdMatch;
          return await handleCustomersUpdate(mockRequest, env);
        }
        
        // Customer loyalty routes
        const loyaltyMatch = matchRoute(path, '/customers/:id/loyalty');
        if (loyaltyMatch && method === 'POST') {
          mockRequest.params = loyaltyMatch;
          return await handleCustomersLoyalty(mockRequest, env);
        }
        
        const loyaltyHistoryMatch = matchRoute(path, '/customers/:id/loyalty-history');
        if (loyaltyHistoryMatch && method === 'GET') {
          mockRequest.params = loyaltyHistoryMatch;
          return await handleCustomersLoyaltyHistory(mockRequest, env);
        }
        
        const analyticsMatch = matchRoute(path, '/customers/:id/analytics');
        if (analyticsMatch && method === 'GET') {
          mockRequest.params = analyticsMatch;
          return await handleCustomersAnalytics(mockRequest, env);
        }
      }
      
      // Orders routes
      if (path.startsWith('/orders')) {
        if (path === '/orders' && method === 'GET') {
          return await handleOrdersList(request, env);
        }
        if (path === '/orders' && method === 'POST') {
          return await handleOrdersCreate(request, env);
        }
        
        const orderIdMatch = matchRoute(path, '/orders/:id');
        if (orderIdMatch && method === 'GET') {
          mockRequest.params = orderIdMatch;
          return await handleOrdersGet(mockRequest, env);
        }
      }
      
      // Inventory routes
      if (path.startsWith('/inventory')) {
        if (path === '/inventory/current' && method === 'GET') {
          return await handleInventoryCurrent(request, env);
        }
        if (path === '/inventory/movements' && method === 'GET') {
          return await handleInventoryMovements(request, env);
        }
        if (path === '/inventory/alerts' && method === 'GET') {
          return await handleInventoryAlerts(request, env);
        }
        if (path === '/inventory/adjustment' && method === 'POST') {
          return await handleInventoryAdjustment(request, env);
        }
      }
      
      // Analytics routes
      if (path.startsWith('/analytics')) {
        if (path === '/analytics/sales/daily' && method === 'GET') {
          return await handleAnalyticsSalesDaily(request, env);
        }
        if (path === '/analytics/sales/products' && method === 'GET') {
          return await handleAnalyticsSalesProducts(request, env);
        }
        if (path === '/analytics/sales/customers' && method === 'GET') {
          return await handleAnalyticsSalesCustomers(request, env);
        }
        if (path === '/analytics/inventory/turnover' && method === 'GET') {
          return await handleAnalyticsInventoryTurnover(request, env);
        }
      }
      
      // AI routes
      if (path.startsWith('/ai')) {
        if (path === '/ai/forecast/demand' && method === 'POST') {
          return await handleAIForecastDemand(request, env);
        }
        
        const recommendationsMatch = matchRoute(path, '/ai/recommendations/:customer_id');
        if (recommendationsMatch && method === 'GET') {
          mockRequest.params = recommendationsMatch;
          return await handleAIRecommendations(mockRequest, env);
        }
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
