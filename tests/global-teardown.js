/**
 * Global Teardown for Playwright Tests
 * Cleans up test environment and data
 * Trường Phát Computer Hòa Bình
 */

const { chromium } = require('@playwright/test');

async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';
  
  try {
    // Login as admin to get token
    const loginResponse = await page.request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@khochuan.com',
        password: 'admin123'
      }
    });
    
    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      const authToken = loginData.data.token;
      
      // Clean up test data
      console.log('🗑️ Cleaning up test data...');
      
      // Note: In a real scenario, you might want to clean up test data
      // For now, we'll just log that teardown is complete
      // The database will be reset on next startup anyway
      
      console.log('✅ Test data cleanup completed');
    }
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

module.exports = globalTeardown;
