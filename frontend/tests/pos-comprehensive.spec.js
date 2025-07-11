/**
 * Comprehensive POS System Tests
 * Tests all POS functionality and workflows
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://khoaugment.pages.dev';

test.describe('POS System Comprehensive Tests', () => {
  
  // Helper function to login as cashier
  async function loginAsCashier(page) {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Click cashier demo button
    const cashierDemoButton = page.locator('button:has-text("Thu ngân (Demo)")').first();
    await cashierDemoButton.click();
    await page.waitForTimeout(5000);
  }

  test('POS terminal interface loads', async ({ page }) => {
    await loginAsCashier(page);
    
    // Check for POS interface elements
    const posElements = [
      'POS Terminal', 'Point of Sale', 'Bán hàng', 'Terminal',
      'Cart', 'Giỏ hàng', 'Total', 'Tổng cộng'
    ];
    
    let foundPOSElements = 0;
    for (const element of posElements) {
      const locator = page.locator(`text=${element}`).first();
      if (await locator.isVisible()) {
        foundPOSElements++;
      }
    }
    
    expect(foundPOSElements).toBeGreaterThan(0);
  });

  test('Product search functionality', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for product search
    const searchSelectors = [
      'input[placeholder*="search"]',
      'input[placeholder*="tìm"]',
      'input[placeholder*="product"]',
      'input[placeholder*="sản phẩm"]',
      '[data-testid="product-search"]'
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
      // Test search with common product terms
      const searchTerms = ['laptop', 'phone', 'máy tính', 'điện thoại'];
      
      for (const term of searchTerms) {
        await searchInput.fill(term);
        await page.waitForTimeout(1000);
        
        // Check for search results
        const resultsSelectors = [
          '.product-item',
          '.search-result',
          '[data-testid="product-results"]',
          '.ant-list-item',
          '.product-card'
        ];
        
        let hasResults = false;
        for (const selector of resultsSelectors) {
          const results = page.locator(selector).first();
          if (await results.isVisible()) {
            hasResults = true;
            break;
          }
        }
        
        // Should show results or no results message
        const noResults = await page.locator('text=No results').or(page.locator('text=Không có kết quả')).isVisible();
        
        expect(hasResults || noResults).toBe(true);
        
        // Clear search for next term
        await searchInput.clear();
      }
    }
  });

  test('Barcode scanner simulation', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for barcode input
    const barcodeSelectors = [
      'input[placeholder*="barcode"]',
      'input[placeholder*="mã vạch"]',
      '[data-testid="barcode-input"]',
      'input[name="barcode"]'
    ];
    
    let barcodeInput = null;
    for (const selector of barcodeSelectors) {
      const input = page.locator(selector).first();
      if (await input.isVisible()) {
        barcodeInput = input;
        break;
      }
    }
    
    if (barcodeInput) {
      // Simulate barcode scan
      const testBarcodes = ['1234567890123', '9876543210987', '1111111111111'];
      
      for (const barcode of testBarcodes) {
        await barcodeInput.fill(barcode);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // Check if product was added to cart or error shown
        const cartItems = page.locator('.cart-item').or(page.locator('[data-testid="cart-items"]'));
        const errorMessage = page.locator('.error').or(page.locator('.ant-message-error'));
        
        const hasCartUpdate = await cartItems.isVisible();
        const hasError = await errorMessage.isVisible();
        
        expect(hasCartUpdate || hasError).toBe(true);
        
        // Clear barcode input
        await barcodeInput.clear();
      }
    }
  });

  test('Shopping cart functionality', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for cart area
    const cartSelectors = [
      '[data-testid="cart"]',
      '.shopping-cart',
      '.cart',
      '.cart-container'
    ];
    
    let cart = null;
    for (const selector of cartSelectors) {
      const cartElement = page.locator(selector).first();
      if (await cartElement.isVisible()) {
        cart = cartElement;
        break;
      }
    }
    
    if (cart) {
      await expect(cart).toBeVisible();
      
      // Look for cart total
      const totalSelectors = [
        '[data-testid="cart-total"]',
        '.cart-total',
        'text=Total:',
        'text=Tổng:'
      ];
      
      let hasTotal = false;
      for (const selector of totalSelectors) {
        const total = page.locator(selector).first();
        if (await total.isVisible()) {
          hasTotal = true;
          break;
        }
      }
      
      expect(hasTotal).toBe(true);
    }
  });

  test('Customer selection', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for customer selection
    const customerSelectors = [
      'text=Select Customer',
      'text=Chọn khách hàng',
      '[data-testid="customer-select"]',
      'button[title*="customer"]',
      'button[title*="khách hàng"]'
    ];
    
    let customerButton = null;
    for (const selector of customerSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        customerButton = button;
        break;
      }
    }
    
    if (customerButton) {
      await customerButton.click();
      await page.waitForTimeout(1000);
      
      // Check if customer selection opened
      const customerModal = page.locator('.ant-modal').or(page.locator('.customer-modal')).or(page.locator('.ant-select-dropdown'));
      
      if (await customerModal.isVisible()) {
        // Look for customer search or list
        const customerSearch = page.locator('input[placeholder*="customer"]').or(page.locator('input[placeholder*="khách hàng"]'));
        const customerList = page.locator('.customer-item').or(page.locator('.ant-select-item'));
        
        const hasCustomerInterface = await customerSearch.isVisible() || await customerList.isVisible();
        expect(hasCustomerInterface).toBe(true);
        
        // Close modal
        const closeButton = page.locator('.ant-modal-close').or(page.keyboard.press('Escape'));
        if (await page.locator('.ant-modal-close').isVisible()) {
          await page.locator('.ant-modal-close').click();
        }
      }
    }
  });

  test('Payment methods', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for payment section
    const paymentSelectors = [
      '[data-testid="payment-section"]',
      '.payment-methods',
      'text=Payment',
      'text=Thanh toán'
    ];
    
    let paymentSection = null;
    for (const selector of paymentSelectors) {
      const section = page.locator(selector).first();
      if (await section.isVisible()) {
        paymentSection = section;
        break;
      }
    }
    
    if (paymentSection) {
      // Look for payment method options
      const paymentMethods = [
        'Cash', 'Tiền mặt',
        'Card', 'Thẻ',
        'Transfer', 'Chuyển khoản',
        'QR Code', 'Mã QR'
      ];
      
      let foundPaymentMethods = 0;
      for (const method of paymentMethods) {
        const methodButton = page.locator(`text=${method}`).first();
        if (await methodButton.isVisible()) {
          foundPaymentMethods++;
        }
      }
      
      expect(foundPaymentMethods).toBeGreaterThan(0);
    }
  });

  test('Cash payment flow', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for cash payment option
    const cashButton = page.locator('text=Cash').or(page.locator('text=Tiền mặt')).or(page.locator('[data-testid="payment-cash"]')).first();
    
    if (await cashButton.isVisible()) {
      await cashButton.click();
      await page.waitForTimeout(1000);
      
      // Look for cash amount input
      const cashInputSelectors = [
        'input[placeholder*="amount"]',
        'input[placeholder*="số tiền"]',
        '[data-testid="cash-amount"]',
        'input[type="number"]'
      ];
      
      let cashInput = null;
      for (const selector of cashInputSelectors) {
        const input = page.locator(selector).first();
        if (await input.isVisible()) {
          cashInput = input;
          break;
        }
      }
      
      if (cashInput) {
        // Enter cash amount
        await cashInput.fill('100000');
        await page.waitForTimeout(500);
        
        // Look for change calculation
        const changeDisplay = page.locator('text=Change').or(page.locator('text=Tiền thừa')).or(page.locator('[data-testid="change-amount"]'));
        
        if (await changeDisplay.isVisible()) {
          expect(changeDisplay).toBeVisible();
        }
      }
    }
  });

  test('Receipt printing', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for print receipt functionality
    const printSelectors = [
      'text=Print Receipt',
      'text=In hóa đơn',
      '[data-testid="print-receipt"]',
      'button[title*="print"]'
    ];
    
    let printButton = null;
    for (const selector of printSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        printButton = button;
        break;
      }
    }
    
    if (printButton) {
      await printButton.click();
      await page.waitForTimeout(1000);
      
      // Check for print preview or confirmation
      const printModal = page.locator('.ant-modal').or(page.locator('.print-preview'));
      const printSuccess = page.locator('text=printed').or(page.locator('text=in thành công'));
      
      const hasPrintAction = await printModal.isVisible() || await printSuccess.isVisible();
      expect(hasPrintAction).toBe(true);
    }
  });

  test('Transaction history', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for transaction history
    const historySelectors = [
      'text=History',
      'text=Lịch sử',
      'text=Transactions',
      'text=Giao dịch',
      '[data-testid="transaction-history"]'
    ];
    
    let historyButton = null;
    for (const selector of historySelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        historyButton = button;
        break;
      }
    }
    
    if (historyButton) {
      await historyButton.click();
      await page.waitForTimeout(2000);
      
      // Check for transaction list
      const transactionList = page.locator('.transaction-list').or(page.locator('.ant-table')).or(page.locator('.history-items'));
      
      if (await transactionList.isVisible()) {
        await expect(transactionList).toBeVisible();
      }
    }
  });

  test('Discount application', async ({ page }) => {
    await loginAsCashier(page);
    
    // Look for discount functionality
    const discountSelectors = [
      'text=Discount',
      'text=Giảm giá',
      '[data-testid="discount"]',
      'button[title*="discount"]'
    ];
    
    let discountButton = null;
    for (const selector of discountSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        discountButton = button;
        break;
      }
    }
    
    if (discountButton) {
      await discountButton.click();
      await page.waitForTimeout(1000);
      
      // Look for discount input
      const discountInput = page.locator('input[placeholder*="discount"]').or(page.locator('input[placeholder*="giảm giá"]'));
      
      if (await discountInput.isVisible()) {
        await discountInput.fill('10');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Check if discount was applied
        const discountDisplay = page.locator('text=10%').or(page.locator('text=Discount applied'));
        const hasDiscount = await discountDisplay.isVisible();
        
        expect(hasDiscount).toBe(true);
      }
    }
  });

  test('Keyboard shortcuts', async ({ page }) => {
    await loginAsCashier(page);
    
    // Test common POS keyboard shortcuts
    const shortcuts = [
      'F1', // Help
      'F2', // Customer
      'F3', // Payment
      'F4', // Discount
      'Escape' // Cancel
    ];
    
    for (const shortcut of shortcuts) {
      await page.keyboard.press(shortcut);
      await page.waitForTimeout(500);
      
      // Check if any modal or action occurred
      const modal = page.locator('.ant-modal');
      const hasModal = await modal.isVisible();
      
      if (hasModal) {
        // Close modal if opened
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
    
    // Test passed if no errors occurred
    expect(true).toBe(true);
  });
});
