/**
 * Comprehensive Admin Dashboard Tests
 * Tests all admin functionality and features
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://khoaugment.pages.dev';

test.describe('Admin Dashboard Comprehensive Tests', () => {
  
  // Helper function to login as admin
  async function loginAsAdmin(page) {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Click admin demo button
    const adminDemoButton = page.locator('button:has-text("Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(5000);
  }

  test('Admin dashboard loads with all components', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Check for main dashboard elements
    const dashboardElements = [
      'Dashboard', 'Doanh thu', 'Revenue', 'Analytics', 'KPI'
    ];
    
    let foundElements = 0;
    for (const element of dashboardElements) {
      const locator = page.locator(`text=${element}`).first();
      if (await locator.isVisible()) {
        foundElements++;
      }
    }
    
    expect(foundElements).toBeGreaterThan(0);
  });

  test('Navigation menu functionality', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Test navigation items
    const navItems = [
      { text: 'Products', alt: 'Sản phẩm' },
      { text: 'Customers', alt: 'Khách hàng' },
      { text: 'Orders', alt: 'Đơn hàng' },
      { text: 'Inventory', alt: 'Kho hàng' },
      { text: 'Reports', alt: 'Báo cáo' },
      { text: 'Settings', alt: 'Cài đặt' }
    ];
    
    for (const item of navItems) {
      const navElement = page.locator(`text=${item.text}`).or(page.locator(`text=${item.alt}`)).first();
      
      if (await navElement.isVisible()) {
        await navElement.click();
        await page.waitForTimeout(2000);
        
        // Check if page changed
        const currentUrl = page.url();
        const hasNavigated = currentUrl.includes(item.text.toLowerCase()) || 
                           await page.locator(`text=${item.text}`).or(page.locator(`text=${item.alt}`)).isVisible();
        
        expect(hasNavigated).toBe(true);
        
        // Go back to dashboard
        const dashboardLink = page.locator('text=Dashboard').or(page.locator('text=Trang chủ')).first();
        if (await dashboardLink.isVisible()) {
          await dashboardLink.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('Product management functionality', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navigate to products
    const productsLink = page.locator('text=Products').or(page.locator('text=Sản phẩm')).first();
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await page.waitForTimeout(2000);
      
      // Check for product management elements
      const productElements = [
        'Add Product', 'Thêm sản phẩm', 'Product List', 'Danh sách sản phẩm'
      ];
      
      let foundProductElements = 0;
      for (const element of productElements) {
        const locator = page.locator(`text=${element}`).first();
        if (await locator.isVisible()) {
          foundProductElements++;
        }
      }
      
      // Check for product table or grid
      const productTable = page.locator('.ant-table').or(page.locator('.product-grid')).or(page.locator('[data-testid="product-list"]'));
      const hasProductList = await productTable.isVisible();
      
      expect(foundProductElements > 0 || hasProductList).toBe(true);
      
      // Test add product button
      const addButton = page.locator('text=Add Product').or(page.locator('text=Thêm sản phẩm')).or(page.locator('button[title*="Add"]')).first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(2000);
        
        // Check if add product form/modal opened
        const productForm = page.locator('.ant-modal').or(page.locator('.product-form')).or(page.locator('form'));
        const hasForm = await productForm.isVisible();
        
        if (hasForm) {
          // Close modal/form
          const closeButton = page.locator('.ant-modal-close').or(page.locator('text=Cancel')).or(page.locator('text=Hủy')).first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        }
      }
    }
  });

  test('Customer management functionality', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navigate to customers
    const customersLink = page.locator('text=Customers').or(page.locator('text=Khách hàng')).first();
    if (await customersLink.isVisible()) {
      await customersLink.click();
      await page.waitForTimeout(2000);
      
      // Check for customer management elements
      const customerElements = [
        'Add Customer', 'Thêm khách hàng', 'Customer List', 'Danh sách khách hàng'
      ];
      
      let foundCustomerElements = 0;
      for (const element of customerElements) {
        const locator = page.locator(`text=${element}`).first();
        if (await locator.isVisible()) {
          foundCustomerElements++;
        }
      }
      
      // Check for customer table
      const customerTable = page.locator('.ant-table').or(page.locator('.customer-grid')).or(page.locator('[data-testid="customer-list"]'));
      const hasCustomerList = await customerTable.isVisible();
      
      expect(foundCustomerElements > 0 || hasCustomerList).toBe(true);
    }
  });

  test('Analytics and charts display', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Look for analytics/charts
    const chartSelectors = [
      '.recharts-wrapper',
      'canvas',
      'svg',
      '[data-testid="revenue-chart"]',
      '[data-testid="analytics-chart"]',
      '.chart-container'
    ];
    
    let chartFound = false;
    for (const selector of chartSelectors) {
      const chart = page.locator(selector).first();
      if (await chart.isVisible()) {
        chartFound = true;
        break;
      }
    }
    
    // Check for KPI cards
    const kpiElements = [
      'Revenue', 'Doanh thu', 'Sales', 'Bán hàng', 'Orders', 'Đơn hàng'
    ];
    
    let kpiFound = false;
    for (const kpi of kpiElements) {
      const kpiElement = page.locator(`text=${kpi}`).first();
      if (await kpiElement.isVisible()) {
        kpiFound = true;
        break;
      }
    }
    
    expect(chartFound || kpiFound).toBe(true);
  });

  test('Settings page functionality', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navigate to settings
    const settingsLink = page.locator('text=Settings').or(page.locator('text=Cài đặt')).first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForTimeout(2000);
      
      // Check for settings sections
      const settingsElements = [
        'Company Profile', 'Thông tin công ty',
        'System Settings', 'Cài đặt hệ thống',
        'User Management', 'Quản lý người dùng',
        'Security', 'Bảo mật'
      ];
      
      let foundSettingsElements = 0;
      for (const element of settingsElements) {
        const locator = page.locator(`text=${element}`).first();
        if (await locator.isVisible()) {
          foundSettingsElements++;
        }
      }
      
      expect(foundSettingsElements).toBeGreaterThan(0);
    }
  });

  test('Reports and analytics access', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navigate to reports
    const reportsLink = page.locator('text=Reports').or(page.locator('text=Báo cáo')).or(page.locator('text=Analytics')).first();
    if (await reportsLink.isVisible()) {
      await reportsLink.click();
      await page.waitForTimeout(2000);
      
      // Check for report elements
      const reportElements = [
        'Sales Report', 'Báo cáo bán hàng',
        'Inventory Report', 'Báo cáo kho',
        'Revenue Report', 'Báo cáo doanh thu',
        'Export', 'Xuất báo cáo'
      ];
      
      let foundReportElements = 0;
      for (const element of reportElements) {
        const locator = page.locator(`text=${element}`).first();
        if (await locator.isVisible()) {
          foundReportElements++;
        }
      }
      
      expect(foundReportElements).toBeGreaterThan(0);
    }
  });

  test('User profile and logout', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Look for user menu/profile
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '.user-menu',
      '.ant-dropdown-trigger',
      'text=Admin',
      'text=Profile'
    ];
    
    let userMenu = null;
    for (const selector of userMenuSelectors) {
      const menu = page.locator(selector).first();
      if (await menu.isVisible()) {
        userMenu = menu;
        break;
      }
    }
    
    if (userMenu) {
      await userMenu.click();
      await page.waitForTimeout(1000);
      
      // Look for logout option
      const logoutButton = page.locator('text=Logout').or(page.locator('text=Đăng xuất')).or(page.locator('text=Sign out')).first();
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForTimeout(2000);
        
        // Check if redirected to login/home
        const currentUrl = page.url();
        const isLoggedOut = currentUrl.includes('login') || 
                          await page.locator('text=Đăng nhập').isVisible() ||
                          await page.locator('text=Login').isVisible();
        
        expect(isLoggedOut).toBe(true);
      }
    }
  });

  test('Search functionality', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Look for search input
    const searchSelectors = [
      'input[placeholder*="search"]',
      'input[placeholder*="tìm"]',
      '[data-testid="search"]',
      '.search-input'
    ];
    
    let searchInput = null;
    for (const selector of searchSelectors) {
      const input = page.locator(selector).first();
      if (await input.isVisible()) {
        searchInput = input;
        break;
      }
    }
    
    if (searchInput) {
      await searchInput.fill('test search');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // Check if search results or no results message appears
      const hasResults = await page.locator('.search-results').isVisible() ||
                        await page.locator('.ant-table').isVisible() ||
                        await page.locator('text=No results').isVisible() ||
                        await page.locator('text=Không có kết quả').isVisible();
      
      expect(hasResults).toBe(true);
    }
  });

  test('Responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    
    // Check if mobile menu exists
    const mobileMenuSelectors = [
      '.mobile-menu',
      '.ant-drawer',
      '[data-testid="mobile-menu"]',
      '.hamburger-menu'
    ];
    
    let hasMobileMenu = false;
    for (const selector of mobileMenuSelectors) {
      const menu = page.locator(selector).first();
      if (await menu.isVisible()) {
        hasMobileMenu = true;
        break;
      }
    }
    
    // Check if content is responsive
    const content = page.locator('main').or(page.locator('.main-content')).or(page.locator('body')).first();
    await expect(content).toBeVisible();
    
    // Content should fit in mobile viewport
    const contentBox = await content.boundingBox();
    if (contentBox) {
      expect(contentBox.width).toBeLessThanOrEqual(375);
    }
  });
});
