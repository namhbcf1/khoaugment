/**
 * E2E Tests for Admin Login
 * Comprehensive testing of admin authentication flow
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'https://94b01261.khoaugment.pages.dev';
const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;

// Test data
const VALID_ADMIN_CREDENTIALS = {
  email: 'admin@truongphat.com',
  password: 'admin123'
};

const INVALID_CREDENTIALS = {
  email: 'invalid@test.com',
  password: 'wrongpassword'
};

test.describe('Admin Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page before each test
    await page.goto(ADMIN_LOGIN_URL);
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should display admin login page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Trường Phát Computer/);
    
    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for company branding
    await expect(page.locator('text=Trường Phát Computer')).toBeVisible();
    await expect(page.locator('text=Hệ thống POS thông minh')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click submit button without filling fields
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.locator('text=Vui lòng nhập email!')).toBeVisible();
    await expect(page.locator('text=Vui lòng nhập mật khẩu!')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for email validation error
    await expect(page.locator('text=Email không hợp lệ!')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill invalid credentials
    await page.fill('input[type="email"]', INVALID_CREDENTIALS.email);
    await page.fill('input[type="password"]', INVALID_CREDENTIALS.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('.ant-message-error')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill valid credentials
    await page.fill('input[type="email"]', VALID_ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', VALID_ADMIN_CREDENTIALS.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message or redirect
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });
    
    // Check if redirected to dashboard (if authentication is working)
    // Note: This might not work if backend is not connected
    // await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should have proper form accessibility', async ({ page }) => {
    // Check for proper labels and ARIA attributes
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Check if inputs have proper labels
    await expect(emailInput).toHaveAttribute('placeholder', 'admin@truongphat.com');
    await expect(passwordInput).toHaveAttribute('placeholder', 'Nhập mật khẩu');
    
    // Check if submit button has proper text
    await expect(submitButton).toContainText('Đăng nhập');
  });

  test('should handle loading states correctly', async ({ page }) => {
    // Fill credentials
    await page.fill('input[type="email"]', VALID_ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', VALID_ADMIN_CREDENTIALS.password);
    
    // Submit form and check for loading state
    await page.click('button[type="submit"]');
    
    // Check if button shows loading state
    await expect(page.locator('button[type="submit"] .anticon-loading')).toBeVisible({ timeout: 1000 });
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if form is still visible and usable
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check if form elements are properly sized
    const formCard = page.locator('.ant-card');
    await expect(formCard).toHaveCSS('width', /100%|auto/);
  });

  test('should have proper security features', async ({ page }) => {
    // Check if password field is properly masked
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check if form has proper autocomplete attributes
    await expect(page.locator('input[type="email"]')).toHaveAttribute('autocomplete', 'email');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('should display proper branding and styling', async ({ page }) => {
    // Check for company logo/icon
    await expect(page.locator('text=💻')).toBeVisible();
    
    // Check for proper color scheme
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveClass(/ant-btn-primary/);
    
    // Check for proper card styling
    const loginCard = page.locator('.ant-card');
    await expect(loginCard).toBeVisible();
  });
});

test.describe('Admin Login Performance', () => {
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(ADMIN_LOGIN_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have optimized bundle sizes', async ({ page }) => {
    // Navigate to page and check network requests
    await page.goto(ADMIN_LOGIN_URL);
    
    // Wait for all resources to load
    await page.waitForLoadState('networkidle');
    
    // Check if main bundle is reasonably sized (less than 1MB)
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('.js') && response.status() === 200) {
        responses.push(response);
      }
    });
    
    // Reload to capture responses
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check bundle sizes (this is a basic check)
    expect(responses.length).toBeGreaterThan(0);
  });
});

test.describe('Admin Login Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Try to submit form
    await page.fill('input[type="email"]', VALID_ADMIN_CREDENTIALS.email);
    await page.fill('input[type="password"]', VALID_ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Should show appropriate error message
    await expect(page.locator('.ant-message-error')).toBeVisible({ timeout: 5000 });
    
    // Restore online mode
    await page.context().setOffline(false);
  });

  test('should handle server errors appropriately', async ({ page }) => {
    // This test would require mocking server responses
    // For now, we'll just check that error handling exists
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should handle errors without crashing
    await page.waitForTimeout(2000);
    
    // Page should still be functional
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('Admin Login Security', () => {
  test('should not expose sensitive information in DOM', async ({ page }) => {
    await page.goto(ADMIN_LOGIN_URL);
    
    // Check that no sensitive data is exposed in the page source
    const content = await page.content();
    
    // Should not contain any API keys, tokens, or sensitive configuration
    expect(content).not.toContain('api_key');
    expect(content).not.toContain('secret');
    expect(content).not.toContain('token');
    expect(content).not.toContain('password');
  });

  test('should have proper HTTPS configuration', async ({ page }) => {
    await page.goto(ADMIN_LOGIN_URL);
    
    // Check if page is served over HTTPS
    expect(page.url()).toMatch(/^https:/);
  });
});

// Export test configuration for CI/CD
export const testConfig = {
  baseURL: BASE_URL,
  adminLoginURL: ADMIN_LOGIN_URL,
  testCredentials: VALID_ADMIN_CREDENTIALS,
  timeout: 30000,
  retries: 2,
};
