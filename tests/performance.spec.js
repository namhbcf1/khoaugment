/**
 * Performance Tests for KhoChuan POS System
 * Tests system performance under various load conditions
 * Trường Phát Computer Hòa Bình
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';

test.describe('Performance Tests', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    // Authenticate
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@khochuan.com',
        password: 'admin123'
      }
    });
    
    const data = await response.json();
    authToken = data.data.token;
  });

  test.describe('API Response Times', () => {
    test('products list should respond within 2 seconds', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(2000);
      console.log(`Products list response time: ${responseTime}ms`);
    });

    test('customer search should respond within 1.5 seconds', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${API_URL}/customers?search=test`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(1500);
      console.log(`Customer search response time: ${responseTime}ms`);
    });

    test('analytics data should respond within 3 seconds', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${API_URL}/analytics/sales/daily?days=30`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(3000);
      console.log(`Analytics response time: ${responseTime}ms`);
    });

    test('order creation should respond within 1 second', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.post(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          customer_id: 'cust-001',
          items: [
            {
              product_id: 'prod-001',
              quantity: 1,
              unit_price: 100000
            }
          ],
          payment_method: 'cash',
          discount_amount: 0,
          tax_rate: 10
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(1000);
      console.log(`Order creation response time: ${responseTime}ms`);
    });
  });

  test.describe('Concurrent Load Tests', () => {
    test('should handle 10 concurrent product requests', async ({ request }) => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request.get(`${API_URL}/products?page=${i + 1}&limit=20`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
      });
      
      // Total time should be reasonable
      expect(totalTime).toBeLessThan(5000);
      console.log(`10 concurrent requests completed in: ${totalTime}ms`);
    });

    test('should handle mixed API requests concurrently', async ({ request }) => {
      const startTime = Date.now();
      
      const promises = [
        request.get(`${API_URL}/products`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        request.get(`${API_URL}/customers`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        request.get(`${API_URL}/orders`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        request.get(`${API_URL}/inventory/current`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        request.get(`${API_URL}/analytics/sales/daily?days=7`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      ];
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
      });
      
      expect(totalTime).toBeLessThan(4000);
      console.log(`Mixed concurrent requests completed in: ${totalTime}ms`);
    });
  });

  test.describe('Frontend Performance', () => {
    test('dashboard should load within 3 seconds', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Login
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      
      const startTime = Date.now();
      await page.click('button[type="submit"]');
      
      // Wait for dashboard to load
      await page.waitForURL('**/dashboard');
      await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 3000 });
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      expect(loadTime).toBeLessThan(3000);
      console.log(`Dashboard load time: ${loadTime}ms`);
    });

    test('product list should load and render within 2 seconds', async ({ page }) => {
      // Assume already logged in
      await page.goto(`${BASE_URL}/dashboard`);
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      const startTime = Date.now();
      await page.click('text=Products');
      
      // Wait for product list to load
      await page.waitForSelector('[data-testid="product-list"]', { timeout: 2000 });
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      expect(loadTime).toBeLessThan(2000);
      console.log(`Product list load time: ${loadTime}ms`);
    });

    test('search should respond within 1 second', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      await page.click('text=Products');
      await page.waitForSelector('[data-testid="product-list"]');
      
      const startTime = Date.now();
      await page.fill('[data-testid="search-input"]', 'test');
      
      // Wait for search results
      await page.waitForFunction(() => {
        const results = document.querySelector('[data-testid="search-results"]');
        return results && results.children.length > 0;
      }, { timeout: 1000 });
      
      const endTime = Date.now();
      const searchTime = endTime - startTime;
      
      expect(searchTime).toBeLessThan(1000);
      console.log(`Search response time: ${searchTime}ms`);
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('should not have memory leaks during navigation', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      // Get initial memory usage
      const initialMetrics = await page.evaluate(() => {
        return {
          usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
          totalJSHeapSize: performance.memory?.totalJSHeapSize || 0
        };
      });
      
      // Navigate through different pages multiple times
      for (let i = 0; i < 5; i++) {
        await page.click('text=Products');
        await page.waitForSelector('[data-testid="product-list"]');
        
        await page.click('text=Customers');
        await page.waitForSelector('[data-testid="customer-list"]');
        
        await page.click('text=Orders');
        await page.waitForSelector('[data-testid="order-list"]');
        
        await page.click('text=Dashboard');
        await page.waitForSelector('[data-testid="dashboard-content"]');
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      // Get final memory usage
      const finalMetrics = await page.evaluate(() => {
        return {
          usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
          totalJSHeapSize: performance.memory?.totalJSHeapSize || 0
        };
      });
      
      // Memory should not increase significantly (allow 50% increase)
      const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
      const memoryIncreasePercentage = (memoryIncrease / initialMetrics.usedJSHeapSize) * 100;
      
      console.log(`Memory increase: ${memoryIncrease} bytes (${memoryIncreasePercentage.toFixed(2)}%)`);
      expect(memoryIncreasePercentage).toBeLessThan(50);
    });

    test('should handle large data sets efficiently', async ({ request }) => {
      const startTime = Date.now();
      
      // Request large dataset
      const response = await request.get(`${API_URL}/products?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(5000);
      
      const data = await response.json();
      expect(data.success).toBeTruthy();
      
      console.log(`Large dataset (1000 products) response time: ${responseTime}ms`);
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page, context }) => {
      // Simulate slow 3G network
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      await page.goto(BASE_URL);
      
      const startTime = Date.now();
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Should still load within reasonable time even with network delay
      expect(loadTime).toBeLessThan(8000);
      console.log(`Load time with network delay: ${loadTime}ms`);
    });

    test('should cache resources effectively', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // First load
      const startTime1 = Date.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const firstLoadTime = Date.now() - startTime1;
      
      // Second load (should be faster due to caching)
      const startTime2 = Date.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const secondLoadTime = Date.now() - startTime2;
      
      console.log(`First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`);
      
      // Second load should be significantly faster
      expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.8);
    });
  });
});
