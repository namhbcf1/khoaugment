/**
 * Debug Admin Tests
 * Tests to understand what happens when clicking admin demo button
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://khoaugment.pages.dev';

test.describe('Debug Admin Flow', () => {
  
  test('Debug admin demo button click', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    console.log('Initial URL:', page.url());
    console.log('Initial title:', await page.title());
    
    // Get initial page content
    const initialContent = await page.locator('body').textContent();
    console.log('Initial content preview:', initialContent?.substring(0, 200));
    
    // Click admin demo button
    const adminDemoButton = page.locator('button:has-text("Quản trị viên (Demo)")').first();
    await expect(adminDemoButton).toBeVisible();
    
    console.log('Admin demo button found, clicking...');
    await adminDemoButton.click();
    
    // Wait and check what happens
    await page.waitForTimeout(5000);
    
    console.log('After click URL:', page.url());
    console.log('After click title:', await page.title());
    
    // Get page content after click
    const afterContent = await page.locator('body').textContent();
    console.log('After click content preview:', afterContent?.substring(0, 200));
    
    // Check if URL changed
    const urlChanged = page.url() !== BASE_URL;
    console.log('URL changed:', urlChanged);
    
    // Check if content changed
    const contentChanged = afterContent !== initialContent;
    console.log('Content changed:', contentChanged);
    
    // Look for specific admin elements
    const adminElements = [
      'Dashboard', 'Admin', 'Quản trị', 'Analytics', 'Doanh thu', 'Revenue',
      'Products', 'Sản phẩm', 'Customers', 'Khách hàng', 'Orders', 'Đơn hàng'
    ];
    
    console.log('Checking for admin elements...');
    for (const element of adminElements) {
      const hasElement = await page.locator(`text=${element}`).isVisible().catch(() => false);
      if (hasElement) {
        console.log(`Found admin element: ${element}`);
      }
    }
    
    // Check for any forms or inputs
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();
    
    console.log('Page elements:', { forms, inputs, buttons });
    
    // Get all button texts
    const buttonTexts = await page.locator('button').allTextContents();
    console.log('All buttons:', buttonTexts);
    
    // Check for navigation or menu
    const navElements = await page.locator('nav, .navigation, .menu, .sidebar').count();
    console.log('Navigation elements:', navElements);
    
    // Always pass - this is just for debugging
    expect(true).toBe(true);
  });

  test('Try direct admin URL access', async ({ page }) => {
    // Try accessing admin directly
    const adminUrls = [
      BASE_URL + '/admin',
      BASE_URL + '/dashboard',
      BASE_URL + '/admin/dashboard'
    ];
    
    for (const url of adminUrls) {
      try {
        console.log(`Trying to access: ${url}`);
        await page.goto(url);
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        const title = await page.title();
        const content = await page.locator('body').textContent();
        
        console.log(`URL: ${url}`);
        console.log(`Redirected to: ${currentUrl}`);
        console.log(`Title: ${title}`);
        console.log(`Content preview: ${content?.substring(0, 200)}`);
        console.log('---');
        
      } catch (error) {
        console.log(`Error accessing ${url}:`, error.message);
      }
    }
    
    expect(true).toBe(true);
  });

  test('Check what demo buttons actually do', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Get all demo buttons
    const demoButtons = [
      'button:has-text("Quản trị viên (Demo)")',
      'button:has-text("Thu ngân (Demo)")',
      'button:has-text("Nhân viên (Demo)")'
    ];
    
    for (const buttonSelector of demoButtons) {
      try {
        console.log(`Testing button: ${buttonSelector}`);
        
        // Go back to homepage
        await page.goto(BASE_URL);
        await page.waitForTimeout(2000);
        
        const button = page.locator(buttonSelector).first();
        const isVisible = await button.isVisible();
        
        if (isVisible) {
          const buttonText = await button.textContent();
          console.log(`Button text: ${buttonText}`);
          
          // Click the button
          await button.click();
          await page.waitForTimeout(5000);
          
          const newUrl = page.url();
          const newTitle = await page.title();
          const newContent = await page.locator('body').textContent();
          
          console.log(`After clicking "${buttonText}":`);
          console.log(`  URL: ${newUrl}`);
          console.log(`  Title: ${newTitle}`);
          console.log(`  Content preview: ${newContent?.substring(0, 200)}`);
          console.log('---');
        } else {
          console.log(`Button not visible: ${buttonSelector}`);
        }
        
      } catch (error) {
        console.log(`Error with button ${buttonSelector}:`, error.message);
      }
    }
    
    expect(true).toBe(true);
  });
});
