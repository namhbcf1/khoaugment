/**
 * Debug test to check actual page content
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://khoaugment.pages.dev';

test.describe('Debug Page Content', () => {
  test('Check login page content', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Get all text content
    const pageContent = await page.textContent('body');
    console.log('=== PAGE CONTENT ===');
    console.log(pageContent);
    
    // Check for specific terms
    const terms = [
      'Barcode Scanner',
      'scanner',
      'quét mã',
      'Multi-Payment',
      'payment',
      'thanh toán',
      'điểm thưởng',
      'tích điểm',
      'loyalty'
    ];
    
    console.log('\n=== TERM SEARCH RESULTS ===');
    for (const term of terms) {
      const found = pageContent.toLowerCase().includes(term.toLowerCase());
      console.log(`${term}: ${found ? '✓ FOUND' : '✗ NOT FOUND'}`);
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
  });
});
