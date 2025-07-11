/**
 * Mock API Service for Development
 * Provides fake data and responses when backend is not available
 */

// Mock users data
const mockUsers = [
  {
    id: 1,
    email: 'admin@truongphat.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    avatar_url: null,
    permissions: ['all'],
    total_points: 1500,
    current_level: 5,
    department: 'Management'
  },
  {
    id: 2,
    email: 'cashier@truongphat.com',
    password: 'cashier123',
    name: 'Cashier User',
    role: 'cashier',
    avatar_url: null,
    permissions: ['pos', 'customers'],
    total_points: 800,
    current_level: 3,
    department: 'Sales'
  },
  {
    id: 3,
    email: 'staff@truongphat.com',
    password: 'staff123',
    name: 'Staff User',
    role: 'staff',
    avatar_url: null,
    permissions: ['inventory', 'products'],
    total_points: 600,
    current_level: 2,
    department: 'Warehouse'
  }
];

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    sku: 'IP15P-128',
    barcode: '1234567890123',
    price: 29990000,
    cost_price: 25000000,
    stock_quantity: 15,
    category_id: 1,
    category_name: 'Điện thoại',
    description: 'iPhone 15 Pro 128GB',
    image_url: null,
    is_active: true
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    sku: 'SGS24-256',
    barcode: '1234567890124',
    price: 22990000,
    cost_price: 19000000,
    stock_quantity: 8,
    category_id: 1,
    category_name: 'Điện thoại',
    description: 'Samsung Galaxy S24 256GB',
    image_url: null,
    is_active: true
  },
  {
    id: 3,
    name: 'MacBook Air M3',
    sku: 'MBA-M3-512',
    barcode: '1234567890125',
    price: 34990000,
    cost_price: 30000000,
    stock_quantity: 5,
    category_id: 2,
    category_name: 'Laptop',
    description: 'MacBook Air M3 512GB',
    image_url: null,
    is_active: true
  }
];

// Mock orders data
const mockOrders = [
  {
    id: 1,
    order_number: 'ORD-001',
    customer_id: 1,
    customer_name: 'Nguyễn Văn A',
    total_amount: 29990000,
    status: 'completed',
    payment_method: 'cash',
    created_at: new Date().toISOString(),
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: 'iPhone 15 Pro',
        quantity: 1,
        unit_price: 29990000,
        total_price: 29990000
      }
    ]
  }
];

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockApi = {
  // Authentication
  async login(email, password) {
    console.log('🎭 MockAPI: Login attempt', { email, password });
    console.log('🎭 MockAPI: Available users', mockUsers.map(u => ({ email: u.email, password: u.password })));

    await delay();

    const user = mockUsers.find(u => u.email === email && u.password === password);
    console.log('🎭 MockAPI: User found?', !!user);

    if (!user) {
      console.error('🎭 MockAPI: Invalid credentials');
      throw new Error('Invalid credentials');
    }

    const token = `mock-jwt-token-${user.id}`;
    const { password: _, ...userWithoutPassword } = user;

    const response = {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refresh_token: `mock-refresh-token-${user.id}`
      }
    };

    console.log('🎭 MockAPI: Login successful', response);
    return response;
  },

  async logout() {
    await delay(200);
    return { success: true };
  },

  async getProfile() {
    await delay();
    const token = localStorage.getItem('access_token');
    if (!token || !token.startsWith('mock-jwt-token-')) {
      throw new Error('Unauthorized');
    }

    const userId = parseInt(token.split('-').pop());
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      data: { user: userWithoutPassword }
    };
  },

  // Products
  async getProducts(params = {}) {
    await delay();
    let products = [...mockProducts];
    
    // Apply filters
    if (params.search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(params.search.toLowerCase()) ||
        p.sku.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    if (params.category_id) {
      products = products.filter(p => p.category_id === parseInt(params.category_id));
    }

    return {
      success: true,
      data: products,
      pagination: {
        total: products.length,
        page: 1,
        limit: 20
      }
    };
  },

  async getProduct(id) {
    await delay();
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (!product) {
      throw new Error('Product not found');
    }
    
    return {
      success: true,
      data: product
    };
  },

  // Orders
  async getOrders(params = {}) {
    await delay();
    return {
      success: true,
      data: mockOrders,
      pagination: {
        total: mockOrders.length,
        page: 1,
        limit: 20
      }
    };
  },

  async createOrder(orderData) {
    await delay();
    const newOrder = {
      id: mockOrders.length + 1,
      order_number: `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
      ...orderData,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    
    mockOrders.push(newOrder);
    
    return {
      success: true,
      data: newOrder
    };
  },

  // Dashboard stats
  async getDashboardStats() {
    await delay();
    return {
      success: true,
      data: {
        today_sales: 52990000,
        today_orders: 3,
        total_products: mockProducts.length,
        low_stock_products: 2,
        monthly_revenue: 1250000000,
        monthly_growth: 15.5,
        top_products: mockProducts.slice(0, 3),
        recent_orders: mockOrders.slice(0, 5)
      }
    };
  },

  // Categories
  async getCategories() {
    await delay();
    return {
      success: true,
      data: [
        { id: 1, name: 'Điện thoại', description: 'Smartphone và phụ kiện' },
        { id: 2, name: 'Laptop', description: 'Máy tính xách tay' },
        { id: 3, name: 'Phụ kiện', description: 'Phụ kiện điện tử' }
      ]
    };
  }
};

// Check if we should use mock API
export const shouldUseMockApi = () => {
  const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';
  const isLocalhost = import.meta.env.VITE_API_URL?.includes('localhost:8787');
  const isOffline = !navigator.onLine;
  const enableMockData = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

  const result = useMock || isLocalhost || isOffline || enableMockData;

  console.log('🎭 MockAPI: shouldUseMockApi check', {
    VITE_USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API,
    VITE_ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    useMock,
    isLocalhost,
    isOffline,
    enableMockData,
    result
  });

  return result;
};
