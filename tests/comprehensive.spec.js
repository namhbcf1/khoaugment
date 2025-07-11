/**
 * Comprehensive End-to-End Tests for KhoChuan POS System
 * Tests all major functionality and user workflows
 * Trường Phát Computer Hòa Bình
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';

// Test data
const testUser = {
  email: 'admin@khochuan.com',
  password: 'admin123',
  role: 'admin'
};

const testProduct = {
  name: 'Test Product E2E',
  sku: 'TEST-E2E-001',
  barcode: '1234567890123',
  price: 100000,
  cost_price: 80000,
  stock_quantity: 50,
  reorder_level: 10
};

const testCustomer = {
  name: 'Test Customer E2E',
  email: 'test.e2e@example.com',
  phone: '0123456789',
  address: 'Test Address E2E'
};

test.describe('KhoChuan POS System - Comprehensive Tests', () => {
  let authToken;
  let testProductId;
  let testCustomerId;
  let testOrderId;

  test.beforeAll(async ({ request }) => {
    // Authenticate and get token
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
    authToken = data.data.token;
  });

  test.describe('Authentication System', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Check if login form is present
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // Fill login form
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      
      // Submit login
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard');
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(BASE_URL);
      
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Logout');
      
      // Should redirect to login
      await page.waitForURL('**/login');
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });

  test.describe('Product Management', () => {
    test('should create a new product', async ({ request }) => {
      const response = await request.post(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: testProduct
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
      testProductId = data.data.id;
    });

    test('should list products with pagination', async ({ request }) => {
      const response = await request.get(`${API_URL}/products?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
      expect(data.data.products).toBeDefined();
      expect(data.data.pagination).toBeDefined();
    });

    test('should search products', async ({ request }) => {
      const response = await request.post(`${API_URL}/products/search`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          query: 'test',
          price_min: 50000,
          price_max: 200000
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
    });

    test('should update product', async ({ request }) => {
      const response = await request.put(`${API_URL}/products/${testProductId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Updated Test Product E2E',
          price: 120000
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
    });

    test('should get product by barcode', async ({ request }) => {
      const response = await request.get(`${API_URL}/products/barcode/${testProduct.barcode}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
    });
  });

  test.describe('Customer Management', () => {
    test('should create a new customer', async ({ request }) => {
      const response = await request.post(`${API_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: testCustomer
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
      testCustomerId = data.data.id;
    });

    test('should list customers', async ({ request }) => {
      const response = await request.get(`${API_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
      expect(data.data.customers).toBeDefined();
    });

    test('should get customer details', async ({ request }) => {
      const response = await request.get(`${API_URL}/customers/${testCustomerId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
      expect(data.data.customer).toBeDefined();
    });

    test('should manage loyalty points', async ({ request }) => {
      const response = await request.post(`${API_URL}/customers/${testCustomerId}/loyalty`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          points: 100,
          reason: 'Test bonus points',
          type: 'bonus'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
    });

    test('should get customer analytics', async ({ request }) => {
      const response = await request.get(`${API_URL}/customers/${testCustomerId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
    });
  });

  test.describe('Order Processing', () => {
    test('should create a new order', async ({ request }) => {
      const response = await request.post(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          customer_id: testCustomerId,
          items: [
            {
              product_id: testProductId,
              quantity: 2,
              unit_price: 120000
            }
          ],
          payment_method: 'cash',
          discount_amount: 0,
          tax_rate: 10
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
      testOrderId = data.data.order_id;
    });

    test('should list orders', async ({ request }) => {
      const response = await request.get(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
      expect(data.data.orders).toBeDefined();
    });

    test('should get order details', async ({ request }) => {
      const response = await request.get(`${API_URL}/orders/${testOrderId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
      expect(data.data.order).toBeDefined();
    });
  });

  test.describe('Inventory Management', () => {
    test('should get current inventory', async ({ request }) => {
      const response = await request.get(`${API_URL}/inventory/current`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
    });

    test('should adjust inventory', async ({ request }) => {
      const response = await request.post(`${API_URL}/inventory/adjustment`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          product_id: testProductId,
          adjustment_type: 'in',
          quantity: 10,
          reason: 'Test adjustment'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
    });

    test('should get inventory movements', async ({ request }) => {
      const response = await request.get(`${API_URL}/inventory/movements`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBeTruthy();
    });
  });

  test.afterAll(async ({ request }) => {
    // Cleanup: Delete test product
    if (testProductId) {
      await request.delete(`${API_URL}/products/${testProductId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    }
  });
});
