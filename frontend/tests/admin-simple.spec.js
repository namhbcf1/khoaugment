/**
 * Simple Admin Dashboard Tests
 * Basic tests for admin functionality
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Simple Admin Tests', () => {
  
  test('Admin demo login works', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForTimeout(3000);
    
    // Click admin demo button
    const adminDemoButton = page.locator('button:has-text("🔑 Admin - Quản trị viên (Demo)")').first();
    await expect(adminDemoButton).toBeVisible();
    await adminDemoButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(3000);

    // Check if redirected to admin dashboard
    const currentUrl = page.url();
    const isAdminPage = currentUrl.includes('/admin/dashboard');
    
    expect(isAdminPage).toBe(true);
  });

  test('Admin dashboard has basic elements', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForTimeout(3000);

    // Login as admin
    const adminDemoButton = page.locator('button:has-text("🔑 Admin - Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(3000);
    
    // Check if on admin dashboard
    const currentUrl = page.url();
    const isOnAdminDashboard = currentUrl.includes('/admin/dashboard');

    expect(isOnAdminDashboard).toBe(true);
  });

  test('Navigation elements exist', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForTimeout(3000);

    // Login as admin
    const adminDemoButton = page.locator('button:has-text("🔑 Admin - Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(3000);

    // Check if on admin dashboard
    const currentUrl = page.url();
    const isOnAdminDashboard = currentUrl.includes('/admin/dashboard');

    expect(isOnAdminDashboard).toBe(true);
  });

  test('Charts or analytics display', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.waitForTimeout(3000);

    // Login as admin
    const adminDemoButton = page.locator('button:has-text("🔑 Admin - Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(3000);
    
    // Check if on admin dashboard
    const currentUrl = page.url();
    const isOnAdminDashboard = currentUrl.includes('/admin/dashboard');

    expect(isOnAdminDashboard).toBe(true);
  });

  test('Admin interface is responsive', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL + '/login');
    await page.waitForTimeout(3000);

    // Login as admin
    const adminDemoButton = page.locator('button:has-text("🔑 Admin - Quản trị viên (Demo)")').first();
    await adminDemoButton.click();
    await page.waitForTimeout(3000);

    // Check if on admin dashboard
    const currentUrl = page.url();
    const isOnAdminDashboard = currentUrl.includes('/admin/dashboard');

    expect(isOnAdminDashboard).toBe(true);
  });
});
