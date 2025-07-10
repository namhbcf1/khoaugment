import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'https://khoaugment.pages.dev';

// Test data
const TEST_USERS = {
  admin: {
    email: 'admin@khochuan.com',
    password: 'admin123'
  },
  cashier: {
    email: 'cashier@khochuan.com', 
    password: 'cashier123'
  },
  staff: {
    email: 'staff@khochuan.com',
    password: 'staff123'
  }
};

test.describe('Critical Business Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Authentication Flow', () => {
    test('admin can login and access dashboard', async ({ page }) => {
      // Navigate to login
      await page.click('text=Đăng nhập');
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', TEST_USERS.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
      
      // Submit login
      await page.click('[data-testid="login-button"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/admin/dashboard');
      
      // Verify dashboard elements
      await expect(page.locator('text=Dashboard Quản trị')).toBeVisible();
      await expect(page.locator('[data-testid="metric-card"]')).toHaveCount(4);
    });

    test('shows error for invalid credentials', async ({ page }) => {
      await page.click('text=Đăng nhập');
      
      await page.fill('[data-testid="email-input"]', 'invalid@email.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      
      await page.click('[data-testid="login-button"]');
      
      // Should show error message
      await expect(page.locator('.ant-message-error')).toBeVisible();
    });

    test('logout works correctly', async ({ page }) => {
      // Login first
      await page.click('text=Đăng nhập');
      await page.fill('[data-testid="email-input"]', TEST_USERS.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('**/admin/dashboard');
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Đăng xuất');
      
      // Should redirect to login
      await page.waitForURL('**/login');
      await expect(page.locator('text=Đăng nhập')).toBeVisible();
    });
  });

  test.describe('POS Terminal Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login as cashier
      await page.click('text=Đăng nhập');
      await page.fill('[data-testid="email-input"]', TEST_USERS.cashier.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.cashier.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('**/cashier/pos');
    });

    test('cashier can complete a sale transaction', async ({ page }) => {
      // Wait for POS to load
      await expect(page.locator('text=KhoChuan POS Terminal')).toBeVisible();
      
      // Add products to cart
      await page.click('[data-testid="product-item"]:first-child');
      await page.click('[data-testid="product-item"]:nth-child(2)');
      
      // Verify cart has items
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
      
      // Verify total is calculated
      const total = await page.locator('[data-testid="cart-total"]').textContent();
      expect(total).toMatch(/\d+,\d+/); // Should show formatted currency
      
      // Process payment
      await page.click('[data-testid="payment-button"]');
      
      // Select payment method
      await page.click('[data-testid="cash-payment"]');
      
      // Enter cash amount
      await page.fill('[data-testid="cash-amount"]', '100000');
      
      // Complete transaction
      await page.click('[data-testid="complete-payment"]');
      
      // Verify success message
      await expect(page.locator('.ant-message-success')).toBeVisible();
      
      // Verify cart is cleared
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0);
    });

    test('can search and filter products', async ({ page }) => {
      // Search for product
      await page.fill('[data-testid="product-search"]', 'Coca');
      
      // Wait for search results
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const products = page.locator('[data-testid="product-item"]');
      await expect(products).toHaveCount(1);
      await expect(products.first()).toContainText('Coca');
      
      // Clear search
      await page.fill('[data-testid="product-search"]', '');
      
      // Verify all products shown again
      await expect(page.locator('[data-testid="product-item"]')).toHaveCountGreaterThan(1);
    });

    test('can apply discounts', async ({ page }) => {
      // Add product to cart
      await page.click('[data-testid="product-item"]:first-child');
      
      // Apply discount
      await page.click('[data-testid="discount-button"]');
      await page.fill('[data-testid="discount-percentage"]', '10');
      await page.click('[data-testid="apply-discount"]');
      
      // Verify discount is applied
      await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
    });
  });

  test.describe('Inventory Management Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.click('text=Đăng nhập');
      await page.fill('[data-testid="email-input"]', TEST_USERS.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('**/admin/dashboard');
      
      // Navigate to inventory
      await page.click('text=Quản lý kho hàng');
      await page.waitForURL('**/admin/inventory');
    });

    test('admin can add new product', async ({ page }) => {
      // Click add product button
      await page.click('[data-testid="add-product-button"]');
      
      // Fill product form
      await page.fill('[data-testid="product-name"]', 'Test Product E2E');
      await page.fill('[data-testid="product-sku"]', 'TEST-E2E-001');
      await page.fill('[data-testid="product-price"]', '25000');
      await page.fill('[data-testid="product-stock"]', '100');
      
      // Select category
      await page.click('[data-testid="product-category"]');
      await page.click('text=Beverages');
      
      // Save product
      await page.click('[data-testid="save-product"]');
      
      // Verify success message
      await expect(page.locator('.ant-message-success')).toBeVisible();
      
      // Verify product appears in list
      await expect(page.locator('text=Test Product E2E')).toBeVisible();
    });

    test('can edit existing product', async ({ page }) => {
      // Click edit on first product
      await page.click('[data-testid="edit-product"]:first-child');
      
      // Update product name
      await page.fill('[data-testid="product-name"]', 'Updated Product Name');
      
      // Save changes
      await page.click('[data-testid="save-product"]');
      
      // Verify success message
      await expect(page.locator('.ant-message-success')).toBeVisible();
    });

    test('can filter products by category', async ({ page }) => {
      // Apply category filter
      await page.click('[data-testid="category-filter"]');
      await page.click('text=Beverages');
      
      // Verify filtered results
      const products = page.locator('[data-testid="product-row"]');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Analytics Dashboard Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.click('text=Đăng nhập');
      await page.fill('[data-testid="email-input"]', TEST_USERS.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL('**/admin/dashboard');
      
      // Navigate to analytics
      await page.click('text=Analytics');
      await page.waitForURL('**/admin/analytics');
    });

    test('displays analytics data correctly', async ({ page }) => {
      // Verify page header
      await expect(page.locator('text=Analytics & Business Intelligence')).toBeVisible();
      
      // Verify KPI cards
      await expect(page.locator('[data-testid="metric-card"]')).toHaveCount(4);
      
      // Verify charts are rendered
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="orders-chart"]')).toBeVisible();
    });

    test('can change date range', async ({ page }) => {
      // Click date range picker
      await page.click('[data-testid="date-range-picker"]');
      
      // Select last 30 days
      await page.click('text=Last 30 days');
      
      // Verify data updates
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="metric-card"]').first()).toBeVisible();
    });

    test('can export data', async ({ page }) => {
      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-button"]');
      
      // Verify download starts
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/analytics.*\.xlsx/);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('mobile navigation works correctly', async ({ page }) => {
      // Login
      await page.click('text=Đăng nhập');
      await page.fill('[data-testid="email-input"]', TEST_USERS.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Verify mobile menu button is visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      
      // Verify menu drawer opens
      await expect(page.locator('[data-testid="mobile-menu-drawer"]')).toBeVisible();
      
      // Navigate to inventory
      await page.click('text=Quản lý kho hàng');
      
      // Verify navigation works
      await page.waitForURL('**/admin/inventory');
      await expect(page.locator('text=Quản lý kho hàng')).toBeVisible();
    });

    test('POS works on mobile', async ({ page }) => {
      // Login as cashier
      await page.click('text=Đăng nhập');
      await page.fill('[data-testid="email-input"]', TEST_USERS.cashier.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.cashier.password);
      await page.click('[data-testid="login-button"]');
      
      // Verify POS interface is mobile-friendly
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-panel"]')).toBeVisible();
      
      // Test touch interactions
      await page.tap('[data-testid="product-item"]:first-child');
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    });
  });

  test.describe('Performance Tests', () => {
    test('page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('dashboard renders quickly after login', async ({ page }) => {
      await page.click('text=Đăng nhập');
      await page.fill('[data-testid="email-input"]', TEST_USERS.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_USERS.admin.password);
      
      const startTime = Date.now();
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('**/admin/dashboard');
      await expect(page.locator('[data-testid="metric-card"]').first()).toBeVisible();
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(3000); // Dashboard should render within 3 seconds
    });
  });
});
