/**
 * Global Setup for Playwright Tests
 * Prepares test environment and data
 * Trường Phát Computer Hòa Bình
 */

const { chromium } = require('@playwright/test');

async function globalSetup() {
  console.log('🚀 Starting global test setup...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const API_URL = process.env.API_URL || 'https://khoaugment-api.bangachieu2.workers.dev';
  
  try {
    // Wait for backend to be ready
    console.log('⏳ Waiting for backend to be ready...');
    let backendReady = false;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!backendReady && attempts < maxAttempts) {
      try {
        const response = await page.request.get(`${API_URL}/health`);
        if (response.ok()) {
          backendReady = true;
          console.log('✅ Backend is ready');
        }
      } catch (error) {
        attempts++;
        console.log(`⏳ Backend not ready, attempt ${attempts}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!backendReady) {
      throw new Error('Backend failed to start within timeout');
    }
    
    // Setup test data
    console.log('📊 Setting up test data...');
    
    // Login as admin to get token
    const loginResponse = await page.request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@truongphat.com',
        password: 'admin123'
      }
    });
    
    if (!loginResponse.ok()) {
      throw new Error('Failed to authenticate admin user');
    }
    
    const loginData = await loginResponse.json();
    const authToken = loginData.data.token;
    
    // Create test categories
    console.log('📂 Creating test categories...');
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and accessories', color: '#3B82F6' },
      { name: 'Clothing', description: 'Apparel and fashion items', color: '#EF4444' },
      { name: 'Books', description: 'Books and educational materials', color: '#10B981' },
      { name: 'Home & Garden', description: 'Home improvement and garden supplies', color: '#F59E0B' }
    ];
    
    for (const category of categories) {
      await page.request.post(`${API_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: category
      });
    }
    
    // Create test products
    console.log('📦 Creating test products...');
    const products = [
      {
        name: 'Laptop Dell XPS 13',
        sku: 'LAPTOP-001',
        barcode: '1234567890123',
        price: 25000000,
        cost_price: 20000000,
        stock_quantity: 10,
        reorder_level: 2,
        category_id: 'cat-001'
      },
      {
        name: 'iPhone 15 Pro',
        sku: 'PHONE-001',
        barcode: '2345678901234',
        price: 30000000,
        cost_price: 25000000,
        stock_quantity: 15,
        reorder_level: 3,
        category_id: 'cat-001'
      },
      {
        name: 'T-Shirt Cotton',
        sku: 'SHIRT-001',
        barcode: '3456789012345',
        price: 200000,
        cost_price: 150000,
        stock_quantity: 50,
        reorder_level: 10,
        category_id: 'cat-002'
      },
      {
        name: 'Programming Book',
        sku: 'BOOK-001',
        barcode: '4567890123456',
        price: 500000,
        cost_price: 400000,
        stock_quantity: 25,
        reorder_level: 5,
        category_id: 'cat-003'
      }
    ];
    
    for (const product of products) {
      await page.request.post(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: product
      });
    }
    
    // Create test customers
    console.log('👥 Creating test customers...');
    const customers = [
      {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM'
      },
      {
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM'
      },
      {
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0369258147',
        address: '789 Đường DEF, Quận 3, TP.HCM'
      }
    ];
    
    for (const customer of customers) {
      await page.request.post(`${API_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: customer
      });
    }
    
    // Create test orders
    console.log('🛒 Creating test orders...');
    const orders = [
      {
        customer_id: 'cust-001',
        items: [
          { product_id: 'prod-001', quantity: 1, unit_price: 25000000 },
          { product_id: 'prod-003', quantity: 2, unit_price: 200000 }
        ],
        payment_method: 'cash',
        discount_amount: 0,
        tax_rate: 10
      },
      {
        customer_id: 'cust-002',
        items: [
          { product_id: 'prod-002', quantity: 1, unit_price: 30000000 }
        ],
        payment_method: 'card',
        discount_amount: 1000000,
        tax_rate: 10
      }
    ];
    
    for (const order of orders) {
      await page.request.post(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: order
      });
    }
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
