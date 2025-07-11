/**
 * Integration Tests for KhoChuan POS System
 * Tests complete workflows and API integrations
 * Trường Phát Computer Hòa Bình
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:8787';

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      failures: []
    };
    this.authToken = null;
  }

  async runTest(name, testFunction) {
    this.results.total++;
    console.log(`\n🧪 Running: ${name}`);
    
    try {
      await testFunction();
      this.results.passed++;
      console.log(`✅ PASSED: ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.failures.push({ name, error: error.message });
      console.log(`❌ FAILED: ${name} - ${error.message}`);
    }
  }

  async apiCall(endpoint, method = 'GET', data = null, useAuth = true) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (useAuth && this.authToken) {
      options.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    return { response, result, status: response.status };
  }

  async authenticate() {
    const { result, status } = await this.apiCall('/auth/login', 'POST', {
      email: 'admin@khochuan.com',
      password: 'admin123'
    }, false);

    if (status === 200 && result.success) {
      this.authToken = result.data.token;
      return true;
    }
    throw new Error('Authentication failed');
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failures.length > 0) {
      console.log('\n💥 FAILURES:');
      this.results.failures.forEach(failure => {
        console.log(`  - ${failure.name}: ${failure.error}`);
      });
    }
    
    console.log('='.repeat(50));
  }
}

// Test Suite
async function runIntegrationTests() {
  const runner = new TestRunner();
  
  console.log('🚀 Starting KhoChuan POS Integration Tests');
  console.log('Target URL:', BASE_URL);

  // Authentication Tests
  await runner.runTest('Authentication - Login', async () => {
    await runner.authenticate();
    if (!runner.authToken) {
      throw new Error('No auth token received');
    }
  });

  await runner.runTest('Authentication - Get User Info', async () => {
    const { result, status } = await runner.apiCall('/auth/me');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to get user info');
    }
  });

  // Products Tests
  await runner.runTest('Products - List Products', async () => {
    const { result, status } = await runner.apiCall('/products');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to list products');
    }
  });

  await runner.runTest('Products - Create Product', async () => {
    const productData = {
      name: 'Test Product Integration',
      sku: 'TEST-INT-001',
      barcode: '1234567890123',
      price: 100000,
      cost_price: 80000,
      stock_quantity: 50,
      reorder_level: 10,
      category_id: 'cat-001'
    };

    const { result, status } = await runner.apiCall('/products', 'POST', productData);
    if (status !== 201 || !result.success) {
      throw new Error('Failed to create product');
    }
    
    // Store product ID for later tests
    runner.testProductId = result.data.id;
  });

  await runner.runTest('Products - Update Product', async () => {
    if (!runner.testProductId) {
      throw new Error('No test product ID available');
    }

    const updateData = {
      name: 'Updated Test Product',
      price: 120000
    };

    const { result, status } = await runner.apiCall(`/products/${runner.testProductId}`, 'PUT', updateData);
    if (status !== 200 || !result.success) {
      throw new Error('Failed to update product');
    }
  });

  await runner.runTest('Products - Search Products', async () => {
    const searchData = {
      query: 'test',
      price_min: 50000,
      price_max: 200000
    };

    const { result, status } = await runner.apiCall('/products/search', 'POST', searchData);
    if (status !== 200 || !result.success) {
      throw new Error('Failed to search products');
    }
  });

  // Categories Tests
  await runner.runTest('Categories - List Categories', async () => {
    const { result, status } = await runner.apiCall('/categories');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to list categories');
    }
  });

  await runner.runTest('Categories - Create Category', async () => {
    const categoryData = {
      name: 'Test Category Integration',
      description: 'Test category for integration testing',
      color: '#ff0000'
    };

    const { result, status } = await runner.apiCall('/categories', 'POST', categoryData);
    if (status !== 201 || !result.success) {
      throw new Error('Failed to create category');
    }
    
    runner.testCategoryId = result.data.id;
  });

  // Customers Tests
  await runner.runTest('Customers - Create Customer', async () => {
    const customerData = {
      name: 'Test Customer Integration',
      email: 'test.integration@example.com',
      phone: '0123456789',
      address: 'Test Address'
    };

    const { result, status } = await runner.apiCall('/customers', 'POST', customerData);
    if (status !== 201 || !result.success) {
      throw new Error('Failed to create customer');
    }
    
    runner.testCustomerId = result.data.id;
  });

  await runner.runTest('Customers - List Customers', async () => {
    const { result, status } = await runner.apiCall('/customers');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to list customers');
    }
  });

  // Orders Tests
  await runner.runTest('Orders - Create Order', async () => {
    if (!runner.testProductId || !runner.testCustomerId) {
      throw new Error('Missing test product or customer ID');
    }

    const orderData = {
      customer_id: runner.testCustomerId,
      items: [
        {
          product_id: runner.testProductId,
          quantity: 2,
          unit_price: 120000
        }
      ],
      payment_method: 'cash',
      discount_amount: 0,
      tax_rate: 10
    };

    const { result, status } = await runner.apiCall('/orders', 'POST', orderData);
    if (status !== 201 || !result.success) {
      throw new Error('Failed to create order');
    }
    
    runner.testOrderId = result.data.order_id;
  });

  await runner.runTest('Orders - List Orders', async () => {
    const { result, status } = await runner.apiCall('/orders');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to list orders');
    }
  });

  await runner.runTest('Orders - Get Order Details', async () => {
    if (!runner.testOrderId) {
      throw new Error('No test order ID available');
    }

    const { result, status } = await runner.apiCall(`/orders/${runner.testOrderId}`);
    if (status !== 200 || !result.success) {
      throw new Error('Failed to get order details');
    }
  });

  // Inventory Tests
  await runner.runTest('Inventory - Current Stock', async () => {
    const { result, status } = await runner.apiCall('/inventory/current');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to get current inventory');
    }
  });

  await runner.runTest('Inventory - Stock Adjustment', async () => {
    if (!runner.testProductId) {
      throw new Error('No test product ID available');
    }

    const adjustmentData = {
      product_id: runner.testProductId,
      adjustment_type: 'in',
      quantity: 10,
      reason: 'Integration test adjustment'
    };

    const { result, status } = await runner.apiCall('/inventory/adjustment', 'POST', adjustmentData);
    if (status !== 200 || !result.success) {
      throw new Error('Failed to adjust inventory');
    }
  });

  // Analytics Tests
  await runner.runTest('Analytics - Daily Sales', async () => {
    const { result, status } = await runner.apiCall('/analytics/sales/daily?days=7');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to get daily sales analytics');
    }
  });

  await runner.runTest('Analytics - Product Performance', async () => {
    const { result, status } = await runner.apiCall('/analytics/sales/products?limit=5');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to get product analytics');
    }
  });

  // AI Tests
  await runner.runTest('AI - Demand Forecast', async () => {
    if (!runner.testProductId) {
      throw new Error('No test product ID available');
    }

    const forecastData = {
      product_id: runner.testProductId,
      forecast_days: 7
    };

    const { result, status } = await runner.apiCall('/ai/forecast/demand', 'POST', forecastData);
    // AI might fail due to insufficient data, so we accept both success and specific failure
    if (status !== 200 && status !== 400) {
      throw new Error('Unexpected error in AI forecast');
    }
  });

  await runner.runTest('AI - Product Recommendations', async () => {
    if (!runner.testCustomerId) {
      throw new Error('No test customer ID available');
    }

    const { result, status } = await runner.apiCall(`/ai/recommendations/${runner.testCustomerId}?limit=3`);
    if (status !== 200 || !result.success) {
      throw new Error('Failed to get product recommendations');
    }
  });

  // Performance Tests
  await runner.runTest('Performance - Concurrent Requests', async () => {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(runner.apiCall('/products?page=1&limit=5'));
    }

    const results = await Promise.all(promises);
    const failedRequests = results.filter(r => r.status !== 200);
    
    if (failedRequests.length > 0) {
      throw new Error(`${failedRequests.length} out of 10 concurrent requests failed`);
    }
  });

  // Cleanup Tests
  await runner.runTest('Cleanup - Delete Test Product', async () => {
    if (!runner.testProductId) {
      return; // Skip if no product to delete
    }

    const { result, status } = await runner.apiCall(`/products/${runner.testProductId}`, 'DELETE');
    if (status !== 200 || !result.success) {
      throw new Error('Failed to delete test product');
    }
  });

  runner.printResults();
  
  // Exit with appropriate code
  process.exit(runner.results.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runIntegrationTests, TestRunner };
