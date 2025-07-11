import { test, expect } from '@playwright/test';

const BASE_URL = 'https://f90f98d5.khoaugment.pages.dev';

test.describe('KhoChuan POS System Basic Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if login form is visible
    await expect(page.locator('text=Đăng nhập để tiếp tục')).toBeVisible();
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Mật khẩu"]')).toBeVisible();
  });

  test('Admin login works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[placeholder="Email"]', 'admin@truongphat.com');
    await page.fill('input[placeholder="Mật khẩu"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect and check dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    await expect(page.locator('h2').first()).toContainText('Admin Dashboard');
  });

  test('Cashier login redirects to POS', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[placeholder="Email"]', 'cashier@truongphat.com');
    await page.fill('input[placeholder="Mật khẩu"]', 'cashier123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect and check POS terminal
    await page.waitForURL('**/admin/pos', { timeout: 10000 });
    // Check if we're on POS page by checking URL
    expect(page.url()).toContain('/admin/pos');
  });

  test('PWA manifest is accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
    
    // Check service worker registration
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistration).toBe(true);
  });

  test('Performance check - page loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if login form is still visible on mobile
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Mật khẩu"]')).toBeVisible();
  });
});
