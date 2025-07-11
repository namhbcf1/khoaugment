import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Debug Login Flow', () => {
  test('Debug admin demo login step by step', async ({ page }) => {
    console.log('🔍 Starting debug login test...');
    
    // Go to homepage
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    // Check if we need to navigate to login
    const currentUrl = page.url();
    console.log('🔍 Current URL after goto:', currentUrl);

    // If not on login page, try to navigate to login
    if (!currentUrl.includes('/login')) {
      console.log('🔍 Not on login page, trying to navigate to /login');
      await page.goto(BASE_URL + '/login');
      await page.waitForTimeout(2000);
      console.log('🔍 URL after /login navigation:', page.url());
    }
    
    console.log('🔍 Page loaded, current URL:', page.url());
    
    // Check if we're on login page
    const isLoginPage = await page.locator('h2:has-text("Đăng Nhập")').isVisible();
    console.log('🔍 Is login page visible?', isLoginPage);
    
    // Check all buttons on page
    const allButtons = await page.locator('button').allTextContents();
    console.log('🔍 All buttons on page:', allButtons);

    // Check demo buttons
    const adminButton = page.locator('button:has-text("🔑 Admin - Quản trị viên (Demo)")').first();
    const isAdminButtonVisible = await adminButton.isVisible();
    console.log('🔍 Is admin demo button visible?', isAdminButtonVisible);

    // Try alternative selectors
    const adminButtonAlt1 = page.locator('button').filter({ hasText: 'Admin' }).first();
    const isAdminButtonAlt1Visible = await adminButtonAlt1.isVisible();
    console.log('🔍 Is admin button (alt1) visible?', isAdminButtonAlt1Visible);

    const adminButtonAlt2 = page.locator('button').filter({ hasText: 'Quản trị' }).first();
    const isAdminButtonAlt2Visible = await adminButtonAlt2.isVisible();
    console.log('🔍 Is admin button (alt2) visible?', isAdminButtonAlt2Visible);
    
    if (isAdminButtonVisible || isAdminButtonAlt1Visible || isAdminButtonAlt2Visible) {
      const buttonToClick = isAdminButtonVisible ? adminButton :
                           isAdminButtonAlt1Visible ? adminButtonAlt1 : adminButtonAlt2;
      console.log('🔍 Clicking admin demo button...');
      await buttonToClick.click();
      await page.waitForTimeout(1000);
      
      // Wait for any processing/redirect
      await page.waitForTimeout(3000);

      // Check if still on login page or redirected
      const currentUrlAfterClick = page.url();
      console.log('🔍 URL after demo button click:', currentUrlAfterClick);

      // If still on login page, check form values
      if (currentUrlAfterClick.includes('/login')) {
        try {
          const emailValue = await page.locator('input[name="email"]').inputValue();
          const passwordValue = await page.locator('input[name="password"]').inputValue();
          console.log('🔍 Form values after demo button click:', { emailValue, passwordValue });
        } catch (e) {
          console.log('🔍 Could not get form values:', e.message);
        }
      }
      
      // Check current URL after login attempt
      const currentUrl = page.url();
      console.log('🔍 Current URL after login attempt:', currentUrl);
      
      // Check for any error messages
      const errorMessage = await page.locator('.ant-alert-error').textContent().catch(() => null);
      console.log('🔍 Error message (if any):', errorMessage);
      
      // Check if we're redirected to admin dashboard
      const isAdminDashboard = currentUrl.includes('/admin/dashboard');
      console.log('🔍 Is admin dashboard?', isAdminDashboard);
      
      // Check page content
      const pageContent = await page.locator('body').textContent();
      const hasAdminContent = pageContent.includes('Dashboard') || 
                             pageContent.includes('Admin') || 
                             pageContent.includes('Doanh thu');
      console.log('🔍 Has admin content?', hasAdminContent);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-login-result.png', fullPage: true });
      console.log('🔍 Screenshot saved as debug-login-result.png');
      
      expect(isAdminDashboard || hasAdminContent).toBe(true);
    } else {
      console.log('❌ Admin demo button not found!');
      await page.screenshot({ path: 'debug-no-button.png', fullPage: true });
      expect(isAdminButtonVisible || isAdminButtonAlt1Visible || isAdminButtonAlt2Visible).toBe(true);
    }
  });
  
  test('Check mock API configuration', async ({ page }) => {
    console.log('🔍 Checking mock API configuration...');
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Check console logs for mock API
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('MockAPI') || msg.text().includes('AuthService')) {
        logs.push(msg.text());
        console.log('🔍 Console log:', msg.text());
      }
    });
    
    // Try to trigger login to see logs
    const adminButton = page.locator('button:has-text("Quản trị viên (Demo)")').first();
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(3000);
    }
    
    console.log('🔍 All relevant logs:', logs);
    
    // Check if mock API is being used
    const hasMockLogs = logs.some(log => log.includes('MockAPI'));
    console.log('🔍 Mock API logs found?', hasMockLogs);
    
    expect(logs.length).toBeGreaterThan(0);
  });
});
