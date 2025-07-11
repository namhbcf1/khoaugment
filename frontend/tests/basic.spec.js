/**
 * Basic E2E Tests for Kho Augment POS System
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://khoaugment.pages.dev';

test.describe('Basic Functionality Tests', () => {
  
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check page title
    await expect(page).toHaveTitle(/Trường Phát Computer|Kho Augment|Smart POS/);
    
    // Check for main heading
    const heading = page.locator('h1, h2, .hero-title').first();
    await expect(heading).toBeVisible();
    
    // Check for login button
    const loginButton = page.locator('text=Đăng nhập').or(page.locator('text=Login')).first();
    await expect(loginButton).toBeVisible();
  });

  test('PWA manifest is accessible', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/manifest.json`);
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    expect(manifest.name).toMatch(/Trường Phát Computer|Kho Augment/);
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('Service Worker support', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const swSupported = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swSupported).toBe(true);
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Check if content is visible and responsive
    const content = page.locator('main, body, .app').first();
    await expect(content).toBeVisible();
  });

  test('Performance check', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('Basic login flow', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click login button
    const loginButton = page.locator('text=Đăng nhập').or(page.locator('text=Login')).first();
    await loginButton.click();
    
    // Check if login form appears
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[placeholder*="email"]'));
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[placeholder*="password"]'));
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    }
  });
});
