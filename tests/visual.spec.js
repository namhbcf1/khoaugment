/**
 * Visual Regression Tests for KhoChuan POS System
 * Tests UI consistency and visual appearance
 * Trường Phát Computer Hòa Bình
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Visual Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport size for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Authentication Pages', () => {
    test('login page should match visual baseline', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('input[type="email"]');
      
      // Take screenshot
      await expect(page).toHaveScreenshot('login-page.png');
    });

    test('login page with error should match baseline', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Trigger error state
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await page.waitForSelector('text=Invalid credentials');
      
      await expect(page).toHaveScreenshot('login-page-error.png');
    });
  });

  test.describe('Dashboard Views', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('main dashboard should match baseline', async ({ page }) => {
      await page.waitForSelector('[data-testid="dashboard-content"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('dashboard-main.png');
    });

    test('dashboard with sidebar collapsed should match baseline', async ({ page }) => {
      await page.waitForSelector('[data-testid="dashboard-content"]');
      
      // Collapse sidebar
      await page.click('[data-testid="sidebar-toggle"]');
      await page.waitForTimeout(300); // Wait for animation
      
      await expect(page).toHaveScreenshot('dashboard-sidebar-collapsed.png');
    });

    test('dashboard mobile view should match baseline', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      
      await page.waitForSelector('[data-testid="dashboard-content"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('dashboard-mobile.png');
    });
  });

  test.describe('Product Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('product list should match baseline', async ({ page }) => {
      await page.click('text=Products');
      await page.waitForSelector('[data-testid="product-list"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('product-list.png');
    });

    test('product search results should match baseline', async ({ page }) => {
      await page.click('text=Products');
      await page.waitForSelector('[data-testid="product-list"]');
      
      // Perform search
      await page.fill('[data-testid="search-input"]', 'laptop');
      await page.waitForSelector('[data-testid="search-results"]');
      
      await expect(page).toHaveScreenshot('product-search-results.png');
    });

    test('product creation form should match baseline', async ({ page }) => {
      await page.click('text=Products');
      await page.waitForSelector('[data-testid="product-list"]');
      
      // Open create form
      await page.click('[data-testid="add-product-button"]');
      await page.waitForSelector('[data-testid="product-form"]');
      
      await expect(page).toHaveScreenshot('product-create-form.png');
    });

    test('product details modal should match baseline', async ({ page }) => {
      await page.click('text=Products');
      await page.waitForSelector('[data-testid="product-list"]');
      
      // Click on first product
      await page.click('[data-testid="product-item"]:first-child');
      await page.waitForSelector('[data-testid="product-details-modal"]');
      
      await expect(page).toHaveScreenshot('product-details-modal.png');
    });
  });

  test.describe('Customer Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('customer list should match baseline', async ({ page }) => {
      await page.click('text=Customers');
      await page.waitForSelector('[data-testid="customer-list"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('customer-list.png');
    });

    test('customer profile should match baseline', async ({ page }) => {
      await page.click('text=Customers');
      await page.waitForSelector('[data-testid="customer-list"]');
      
      // Click on first customer
      await page.click('[data-testid="customer-item"]:first-child');
      await page.waitForSelector('[data-testid="customer-profile"]');
      
      await expect(page).toHaveScreenshot('customer-profile.png');
    });
  });

  test.describe('POS Terminal', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', 'cashier@khochuan.com');
      await page.fill('input[type="password"]', 'cashier123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/pos');
    });

    test('POS terminal should match baseline', async ({ page }) => {
      await page.waitForSelector('[data-testid="pos-terminal"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('pos-terminal.png');
    });

    test('POS with items in cart should match baseline', async ({ page }) => {
      await page.waitForSelector('[data-testid="pos-terminal"]');
      
      // Add items to cart
      await page.click('[data-testid="product-item"]:first-child');
      await page.click('[data-testid="product-item"]:nth-child(2)');
      
      await page.waitForSelector('[data-testid="cart-items"]');
      
      await expect(page).toHaveScreenshot('pos-terminal-with-cart.png');
    });

    test('payment modal should match baseline', async ({ page }) => {
      await page.waitForSelector('[data-testid="pos-terminal"]');
      
      // Add item and proceed to payment
      await page.click('[data-testid="product-item"]:first-child');
      await page.click('[data-testid="checkout-button"]');
      await page.waitForSelector('[data-testid="payment-modal"]');
      
      await expect(page).toHaveScreenshot('payment-modal.png');
    });
  });

  test.describe('Analytics Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('analytics overview should match baseline', async ({ page }) => {
      await page.click('text=Analytics');
      await page.waitForSelector('[data-testid="analytics-dashboard"]');
      await page.waitForLoadState('networkidle');
      
      // Wait for charts to load
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('analytics-overview.png');
    });

    test('sales chart should match baseline', async ({ page }) => {
      await page.click('text=Analytics');
      await page.waitForSelector('[data-testid="analytics-dashboard"]');
      
      // Focus on sales chart
      await page.click('[data-testid="sales-chart-tab"]');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('[data-testid="sales-chart"]')).toHaveScreenshot('sales-chart.png');
    });

    test('inventory chart should match baseline', async ({ page }) => {
      await page.click('text=Analytics');
      await page.waitForSelector('[data-testid="analytics-dashboard"]');
      
      // Focus on inventory chart
      await page.click('[data-testid="inventory-chart-tab"]');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('[data-testid="inventory-chart"]')).toHaveScreenshot('inventory-chart.png');
    });
  });

  test.describe('Responsive Design', () => {
    test('tablet view should match baseline', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      await page.waitForSelector('[data-testid="dashboard-content"]');
      
      await expect(page).toHaveScreenshot('dashboard-tablet.png');
    });

    test('mobile landscape should match baseline', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto(BASE_URL);
      
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      
      await page.waitForSelector('[data-testid="dashboard-content"]');
      
      await expect(page).toHaveScreenshot('dashboard-mobile-landscape.png');
    });
  });

  test.describe('Dark Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', 'admin@khochuan.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('dashboard in dark mode should match baseline', async ({ page }) => {
      // Toggle dark mode
      await page.click('[data-testid="theme-toggle"]');
      await page.waitForTimeout(300); // Wait for theme transition
      
      await expect(page).toHaveScreenshot('dashboard-dark-mode.png');
    });

    test('product list in dark mode should match baseline', async ({ page }) => {
      await page.click('[data-testid="theme-toggle"]');
      await page.waitForTimeout(300);
      
      await page.click('text=Products');
      await page.waitForSelector('[data-testid="product-list"]');
      
      await expect(page).toHaveScreenshot('product-list-dark-mode.png');
    });
  });

  test.describe('Error States', () => {
    test('404 page should match baseline', async ({ page }) => {
      await page.goto(`${BASE_URL}/non-existent-page`);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('404-page.png');
    });

    test('network error state should match baseline', async ({ page, context }) => {
      // Block all network requests to simulate offline
      await context.route('**/*', route => route.abort());
      
      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('network-error.png');
    });
  });
});
