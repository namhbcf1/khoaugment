/**
 * Website Inspection Tests
 * Tests to understand the actual structure of the website
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://khoaugment.pages.dev';

test.describe('Website Structure Inspection', () => {
  
  test('Inspect homepage structure', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Get all visible text content
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains text:', bodyText?.substring(0, 500));
    
    // Check for common elements
    const hasHeader = await page.locator('header').isVisible();
    const hasNav = await page.locator('nav').isVisible();
    const hasMain = await page.locator('main').isVisible();
    const hasFooter = await page.locator('footer').isVisible();
    
    console.log('Page structure:', { hasHeader, hasNav, hasMain, hasFooter });
    
    // Look for login-related elements
    const loginElements = await page.locator('text=Đăng nhập').or(page.locator('text=Login')).count();
    console.log('Login elements found:', loginElements);
    
    // Look for buttons
    const buttons = await page.locator('button').count();
    console.log('Total buttons:', buttons);
    
    // Look for links
    const links = await page.locator('a').count();
    console.log('Total links:', links);
    
    // Look for forms
    const forms = await page.locator('form').count();
    console.log('Total forms:', forms);
    
    // Look for inputs
    const inputs = await page.locator('input').count();
    console.log('Total inputs:', inputs);
    
    // Get all button texts
    const buttonTexts = await page.locator('button').allTextContents();
    console.log('Button texts:', buttonTexts);
    
    // Get all link texts
    const linkTexts = await page.locator('a').allTextContents();
    console.log('Link texts:', linkTexts.slice(0, 10)); // First 10 links
    
    expect(true).toBe(true); // Always pass, this is just for inspection
  });

  test('Check for authentication system', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Look for authentication-related elements
    const authElements = [
      'Đăng nhập', 'Login', 'Sign in', 'Đăng ký', 'Register', 'Sign up',
      'Logout', 'Đăng xuất', 'Profile', 'Account', 'Dashboard'
    ];
    
    for (const element of authElements) {
      const count = await page.locator(`text=${element}`).count();
      if (count > 0) {
        console.log(`Found "${element}": ${count} times`);
      }
    }
    
    // Check for input fields that might be login-related
    const emailInputs = await page.locator('input[type="email"]').count();
    const passwordInputs = await page.locator('input[type="password"]').count();
    const textInputs = await page.locator('input[type="text"]').count();
    
    console.log('Input fields:', { emailInputs, passwordInputs, textInputs });
    
    // Check for modals or overlays
    const modals = await page.locator('.modal, .ant-modal, [role="dialog"]').count();
    console.log('Modals found:', modals);
    
    expect(true).toBe(true);
  });

  test('Navigate through available pages', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Get all navigation links
    const navLinks = await page.locator('nav a, header a, .navigation a').all();
    
    for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
      try {
        const link = navLinks[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        console.log(`Checking link: "${text}" -> ${href}`);
        
        if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
          await link.click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          const currentTitle = await page.title();
          
          console.log(`Navigated to: ${currentUrl} - Title: ${currentTitle}`);
          
          // Go back to homepage
          await page.goto(BASE_URL);
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`Error with link ${i}:`, error.message);
      }
    }
    
    expect(true).toBe(true);
  });

  test('Check for admin or dashboard access', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Try direct navigation to common admin paths
    const adminPaths = ['/admin', '/dashboard', '/login', '/auth'];
    
    for (const path of adminPaths) {
      try {
        await page.goto(BASE_URL + path);
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const title = await page.title();
        const hasContent = await page.locator('body').textContent();
        
        console.log(`Path ${path}:`);
        console.log(`  URL: ${currentUrl}`);
        console.log(`  Title: ${title}`);
        console.log(`  Has content: ${hasContent ? 'Yes' : 'No'}`);
        console.log(`  Content preview: ${hasContent?.substring(0, 200)}`);
        
        // Check for login form on this page
        const hasEmailInput = await page.locator('input[type="email"]').isVisible();
        const hasPasswordInput = await page.locator('input[type="password"]').isVisible();
        const hasLoginButton = await page.locator('button:has-text("Login"), button:has-text("Đăng nhập")').isVisible();
        
        console.log(`  Login form: email=${hasEmailInput}, password=${hasPasswordInput}, button=${hasLoginButton}`);
        
      } catch (error) {
        console.log(`Error accessing ${path}:`, error.message);
      }
    }
    
    expect(true).toBe(true);
  });

  test('Check for POS functionality', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Look for POS-related elements
    const posElements = [
      'POS', 'Point of Sale', 'Bán hàng', 'Terminal', 'Cashier',
      'Cart', 'Giỏ hàng', 'Product', 'Sản phẩm', 'Customer', 'Khách hàng'
    ];
    
    for (const element of posElements) {
      const count = await page.locator(`text=${element}`).count();
      if (count > 0) {
        console.log(`Found POS element "${element}": ${count} times`);
      }
    }
    
    // Try to access POS path
    try {
      await page.goto(BASE_URL + '/pos');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const title = await page.title();
      const content = await page.locator('body').textContent();
      
      console.log('POS page:');
      console.log(`  URL: ${currentUrl}`);
      console.log(`  Title: ${title}`);
      console.log(`  Content preview: ${content?.substring(0, 200)}`);
      
    } catch (error) {
      console.log('Error accessing POS page:', error.message);
    }
    
    expect(true).toBe(true);
  });
});
