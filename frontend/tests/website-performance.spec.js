import { test, expect } from '@playwright/test';

test.describe('Website Performance Tests', () => {
  const baseURL = 'https://5f42a648.khoaugment.pages.dev';

  test('Simple React App Test', async ({ page }) => {
    console.log('🚀 Testing simple React app...');

    // Capture all errors
    const errors = [];
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
      console.log('❌ Page Error:', error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${msg.text()}`);
        console.log('❌ Console Error:', msg.text());
      } else {
        console.log(`📝 Console ${msg.type()}:`, msg.text());
      }
    });

    const startTime = Date.now();

    // Navigate to homepage
    await page.goto('https://80af592c.khoaugment.pages.dev');

    // Wait for React app to render
    try {
      await page.waitForSelector('div:has-text("React App Works")', { timeout: 15000 });
      const loadTime = Date.now() - startTime;
      console.log(`✅ React app loaded in ${loadTime}ms`);

      // Check if button is clickable
      const buttonVisible = await page.isVisible('button:has-text("Go to Login")');
      console.log(`🎯 Button visible: ${buttonVisible}`);

      expect(loadTime).toBeLessThan(15000);
      expect(buttonVisible).toBe(true);

    } catch (error) {
      const loadTime = Date.now() - startTime;
      console.log(`❌ React app failed to load in ${loadTime}ms`);
      console.log('🔍 Captured errors:', errors);

      // Take screenshot for debugging
      await page.screenshot({ path: 'react-app-error.png' });

      throw error;
    }
  });

  test('POS page loads and is functional', async ({ page }) => {
    console.log('🛒 Testing POS page...');
    
    await page.goto(`${baseURL}/pos`);
    
    // Wait for POS interface
    await page.waitForSelector('text=POS', { timeout: 15000 });
    
    // Check if search input is present
    const searchInput = await page.isVisible('input[placeholder*="Search"], input[placeholder*="search"]');
    console.log(`🔍 Search input present: ${searchInput}`);
    
    expect(searchInput).toBe(true);
  });

  test('Products page loads and displays data', async ({ page }) => {
    console.log('📦 Testing Products page...');
    
    await page.goto(`${baseURL}/products`);
    
    // Wait for products interface
    await page.waitForSelector('text=sản phẩm, text=Products, table, .ant-table', { timeout: 15000 });
    
    // Check if page has content
    const hasContent = await page.isVisible('table, .ant-table, .ant-card');
    console.log(`📋 Products content present: ${hasContent}`);
    
    expect(hasContent).toBe(true);
  });

  test('Customers page loads and displays data', async ({ page }) => {
    console.log('👥 Testing Customers page...');
    
    await page.goto(`${baseURL}/customers`);
    
    // Wait for customers interface
    await page.waitForSelector('text=khách hàng, text=Customers, table, .ant-table', { timeout: 15000 });
    
    // Check if page has content
    const hasContent = await page.isVisible('table, .ant-table, .ant-card');
    console.log(`👤 Customers content present: ${hasContent}`);
    
    expect(hasContent).toBe(true);
  });

  test('Dashboard loads and displays metrics', async ({ page }) => {
    console.log('📊 Testing Dashboard page...');
    
    await page.goto(`${baseURL}/dashboard`);
    
    // Wait for dashboard interface
    await page.waitForSelector('text=Dashboard, text=Trường Phát Computer, .ant-statistic', { timeout: 15000 });
    
    // Check if metrics are displayed
    const hasMetrics = await page.isVisible('.ant-statistic, .ant-card');
    console.log(`📈 Dashboard metrics present: ${hasMetrics}`);
    
    expect(hasMetrics).toBe(true);
  });
});
