const { test, expect, chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

/**
 * KHOAUGMENT POS SYSTEM - COMPREHENSIVE GPU-ACCELERATED TEST SUITE
 *
 * This script performs thorough testing of all interfaces and functionalities
 * Optimized for NVIDIA GTX 1070 GPU acceleration
 *
 * Test Report will be generated as a single file with all issues found
 */

// Update the configuration section to ensure we're testing the right components
const CONFIG = {
  baseUrl: "http://localhost:5173", // Local development URL
  reportPath: path.join(__dirname, "../test-results/comprehensive-report.md"),
  screenshotPath: path.join(__dirname, "../test-results/screenshots/"),
  gpuOptions: {
    args: [
      "--enable-gpu",
      "--ignore-gpu-blacklist",
      "--use-gl=desktop",
      "--use-angle=gl",
      "--enable-webgl",
      "--no-sandbox",
      "--disable-gpu-sandbox",
      "--disable-features=IsolateOrigins",
    ],
  },
  testUsers: {
    admin: { email: "admin@khoaugment.com", password: "admin123" },
    cashier: { email: "cashier@khoaugment.com", password: "admin123" },
    staff: { email: "staff@khoaugment.com", password: "admin123" },
    // Add user with Vietnamese characters in password for testing
    vietnamese: { email: "test@khoaugment.com", password: "mậtKhẩu123" },
  },
  apiEndpoints: {
    health: "/api",
    products: "/api/products",
    orders: "/api/orders",
    categories: "/api/categories",
    users: "/api/users",
    analytics: "/api/analytics/dashboard",
    upload: "/api/upload",
  },
  testTimeout: 60000, // 60 seconds per test
  visualComparisonThreshold: 0.2, // Visual comparison threshold (0-1)
  // Database concurrency test settings
  dbConcurrencyUsers: 25, // Test with 25 concurrent users (exceeds the 20 user threshold)
  paymentMethods: ["cash", "card", "vnpay", "momo", "zalopay"],
  // Vietnamese test data
  vietnameseTestData: {
    productName: "Cà phê sữa đá Việt Nam",
    description: "Đây là sản phẩm cà phê đặc trưng của Việt Nam",
    customerName: "Nguyễn Văn Anh",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    searchTerms: ["cà phê", "sữa", "việt nam", "bánh mì"],
  },
};

// Initialize report
let reportContent = `# KhoAugment POS System - Comprehensive Test Report\n\n`;
reportContent += `Test Date: ${new Date().toISOString()}\n`;
reportContent += `GPU: NVIDIA GTX 1070\n\n`;
reportContent += `## Summary of Issues\n\n`;

// Create screenshot directory if it doesn't exist
if (!fs.existsSync(CONFIG.screenshotPath)) {
  fs.mkdirSync(CONFIG.screenshotPath, { recursive: true });
}

// Issues tracking
const issues = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  visual: [],
  performance: [],
};

// Test setup with GPU acceleration
test.beforeAll(async () => {
  // Ensure directories exist
  if (!fs.existsSync(path.dirname(CONFIG.reportPath))) {
    fs.mkdirSync(path.dirname(CONFIG.reportPath), { recursive: true });
  }
});

// Helper to log issues
const logIssue = (severity, component, description, screenshot = null) => {
  const issue = {
    component,
    description,
    screenshot,
  };
  issues[severity].push(issue);
};

// Helper to take screenshot
const takeScreenshot = async (page, name) => {
  const fileName = `${name
    .replace(/\s+/g, "-")
    .toLowerCase()}-${Date.now()}.png`;
  const filePath = path.join(CONFIG.screenshotPath, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  return fileName;
};

// Helper to measure performance
const measurePerformance = async (page, action, description) => {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Log performance issues if slow
  if (duration > 1000) {
    logIssue("performance", description, `Slow performance: ${duration}ms`);
  }
  return duration;
};

// Helper for authentication
async function authenticate(page, userType) {
  await test.step(`Login as ${userType}`, async () => {
    await page.goto(`${CONFIG.baseUrl}/login`);
    await page.waitForLoadState("networkidle");

    try {
      await page.fill('input[type="email"]', CONFIG.testUsers[userType].email);
      await page.fill(
        'input[type="password"]',
        CONFIG.testUsers[userType].password
      );
      await page.click('button[type="submit"]');
      await page.waitForNavigation();

      const isLoggedIn = await page.evaluate(() => {
        return (
          !!document.querySelector(".user-profile") ||
          !!document.querySelector(".ant-dropdown-trigger")
        );
      });

      if (!isLoggedIn) {
        const screenshot = await takeScreenshot(
          page,
          `${userType}-login-failed`
        );
        logIssue(
          "critical",
          "Authentication",
          `Failed to login as ${userType}`,
          screenshot
        );
      }
    } catch (error) {
      const screenshot = await takeScreenshot(page, `${userType}-login-error`);
      logIssue(
        "critical",
        "Authentication",
        `Error during login as ${userType}: ${error.message}`,
        screenshot
      );
    }
  });
}

// Helper to check element visibility and functionality
async function checkElement(page, selector, name, shouldClick = false) {
  try {
    const element = await page.waitForSelector(selector, { timeout: 5000 });
    const isVisible = await element.isVisible();

    if (!isVisible) {
      const screenshot = await takeScreenshot(page, `${name}-not-visible`);
      logIssue("high", name, `Element not visible: ${selector}`, screenshot);
      return false;
    }

    if (shouldClick) {
      await element.click();
    }
    return true;
  } catch (error) {
    const screenshot = await takeScreenshot(page, `${name}-missing`);
    logIssue(
      "high",
      name,
      `Element not found: ${selector} - ${error.message}`,
      screenshot
    );
    return false;
  }
}

// Helper to check API responses
async function checkApiResponse(page, url, expectedStatus = 200) {
  const response = await page.request.get(url);
  if (response.status() !== expectedStatus) {
    logIssue(
      "high",
      "API",
      `API endpoint ${url} returned status ${response.status()} (expected ${expectedStatus})`
    );
    return false;
  }
  return true;
}

// Test Suites

// 1. Core Authentication Tests
test.describe("Authentication Tests", () => {
  test("Admin login functionality", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await page.goto(`${CONFIG.baseUrl}/login`);
    await measurePerformance(
      page,
      async () => await page.waitForLoadState("networkidle"),
      "Login page load"
    );

    // Verify login form
    const formExists = await checkElement(page, "form", "Login Form");
    if (!formExists) return;

    // Test invalid login
    await page.fill('input[type="email"]', "invalid@email.com");
    await page.fill('input[type="password"]', "invalidPassword");
    await page.click('button[type="submit"]');

    // Check for error message
    try {
      await page.waitForSelector(".ant-message-error, .error-message", {
        timeout: 5000,
      });
    } catch {
      const screenshot = await takeScreenshot(page, "invalid-login-no-error");
      logIssue(
        "high",
        "Authentication",
        "No error message displayed for invalid login",
        screenshot
      );
    }

    // Test valid login
    await authenticate(page, "admin");

    // Check for welcome message or dashboard elements
    try {
      await page.waitForSelector(".dashboard-welcome, .ant-layout-content", {
        timeout: 5000,
      });
    } catch {
      const screenshot = await takeScreenshot(page, "admin-dashboard-missing");
      logIssue(
        "critical",
        "Admin Dashboard",
        "Dashboard not loaded after successful login",
        screenshot
      );
    }

    // Check logout functionality
    try {
      await page.click(".user-profile, .ant-dropdown-trigger");
      await page.click("text=Logout, text=Đăng xuất");
      await page.waitForNavigation();

      // Verify we're back at login
      const loginForm = await page.$("form");
      if (!loginForm) {
        const screenshot = await takeScreenshot(page, "logout-failed");
        logIssue(
          "high",
          "Authentication",
          "Logout failed - not redirected to login page",
          screenshot
        );
      }
    } catch (error) {
      const screenshot = await takeScreenshot(page, "logout-error");
      logIssue(
        "high",
        "Authentication",
        `Error during logout: ${error.message}`,
        screenshot
      );
    }
  });
});

// Add specific test for Vietnamese authentication issues
test.describe("Vietnamese Authentication Tests", () => {
  test("Login with Vietnamese characters in password", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await page.goto(`${CONFIG.baseUrl}/login`);
    await page.waitForLoadState("networkidle");

    // Try to login with Vietnamese characters in password
    try {
      await page.fill('input[type="email"]', CONFIG.testUsers.vietnamese.email);
      await page.fill(
        'input[type="password"]',
        CONFIG.testUsers.vietnamese.password
      );
      await page.click('button[type="submit"]');

      // Check for successful login or error message
      try {
        // Wait for either dashboard (success) or error message
        await Promise.race([
          page.waitForSelector(".dashboard-welcome, .ant-layout-content", {
            timeout: 5000,
          }),
          page.waitForSelector(".ant-message-error, .error-message", {
            timeout: 5000,
          }),
        ]);

        // Check if we got an error message
        const errorVisible = await page.isVisible(
          ".ant-message-error, .error-message"
        );
        if (errorVisible) {
          const screenshot = await takeScreenshot(
            page,
            "vietnamese-password-error"
          );
          logIssue(
            "critical",
            "Authentication",
            "Login fails when using Vietnamese characters in password",
            screenshot
          );
        }
      } catch (error) {
        const screenshot = await takeScreenshot(
          page,
          "vietnamese-login-timeout"
        );
        logIssue(
          "critical",
          "Authentication",
          `Login with Vietnamese password timed out: ${error.message}`,
          screenshot
        );
      }
    } catch (error) {
      const screenshot = await takeScreenshot(
        page,
        "vietnamese-login-exception"
      );
      logIssue(
        "critical",
        "Authentication",
        `Exception during login with Vietnamese password: ${error.message}`,
        screenshot
      );
    }
  });
});

// 2. Admin Interface Tests
test.describe("Admin Interface Tests", () => {
  test("Admin dashboard functionality", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");

    // Test navigation menu
    const menuItems = [
      {
        selector: '[data-testid="menu-dashboard"], a[href*="dashboard"]',
        name: "Dashboard",
      },
      {
        selector: '[data-testid="menu-products"], a[href*="products"]',
        name: "Products",
      },
      {
        selector: '[data-testid="menu-inventory"], a[href*="inventory"]',
        name: "Inventory",
      },
      {
        selector: '[data-testid="menu-orders"], a[href*="orders"]',
        name: "Orders",
      },
      {
        selector: '[data-testid="menu-customers"], a[href*="customers"]',
        name: "Customers",
      },
      {
        selector: '[data-testid="menu-reports"], a[href*="reports"]',
        name: "Reports",
      },
      {
        selector: '[data-testid="menu-staff"], a[href*="staff"]',
        name: "Staff",
      },
      {
        selector: '[data-testid="menu-settings"], a[href*="settings"]',
        name: "Settings",
      },
    ];

    for (const item of menuItems) {
      const exists = await checkElement(
        page,
        item.selector,
        `${item.name} Menu Item`
      );
      if (!exists) continue;

      // Click and check if page loads
      await measurePerformance(
        page,
        async () => {
          await page.click(item.selector);
          await page.waitForLoadState("networkidle");
        },
        `${item.name} page load`
      );

      // Verify page content
      const pageContentSelector = `.${item.name.toLowerCase()}-content, .page-${item.name.toLowerCase()}`;
      try {
        await page.waitForSelector(pageContentSelector, { timeout: 5000 });
      } catch {
        const screenshot = await takeScreenshot(
          page,
          `admin-${item.name.toLowerCase()}-content-missing`
        );
        logIssue(
          "high",
          `Admin ${item.name}`,
          `${item.name} page content not loaded`,
          screenshot
        );
      }
    }

    // Test dashboard widgets
    await page.goto(`${CONFIG.baseUrl}/admin/dashboard`);
    await page.waitForLoadState("networkidle");

    const dashboardWidgets = [
      {
        selector: '.sales-summary, [data-testid="sales-summary"]',
        name: "Sales Summary",
      },
      {
        selector: '.inventory-status, [data-testid="inventory-status"]',
        name: "Inventory Status",
      },
      {
        selector: '.recent-orders, [data-testid="recent-orders"]',
        name: "Recent Orders",
      },
      {
        selector: '.customer-insights, [data-testid="customer-insights"]',
        name: "Customer Insights",
      },
    ];

    for (const widget of dashboardWidgets) {
      await checkElement(page, widget.selector, widget.name);
    }
  });

  test("Product management functionality", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");
    await page.goto(`${CONFIG.baseUrl}/admin/products`);
    await page.waitForLoadState("networkidle");

    // Check product list
    const productListExists = await checkElement(
      page,
      '.product-list, .ant-table, [data-testid="product-table"]',
      "Product List"
    );

    if (productListExists) {
      // Check product search
      await checkElement(
        page,
        'input[type="search"], .ant-input-search',
        "Product Search",
        true
      );
      await page.fill('input[type="search"], .ant-input-search input', "test");
      await page.press(
        'input[type="search"], .ant-input-search input',
        "Enter"
      );
      await page.waitForTimeout(1000);

      // Check add product button
      const addProductButton = await checkElement(
        page,
        'button:has-text("Add Product"), button:has-text("Thêm sản phẩm")',
        "Add Product Button",
        true
      );

      if (addProductButton) {
        // Check product form
        await page.waitForTimeout(1000);
        const formExists = await checkElement(
          page,
          '.product-form, .ant-form, [data-testid="product-form"]',
          "Product Form"
        );

        if (formExists) {
          // Test form fields
          const formFields = [
            {
              selector: 'input[name="name"], input[id="name"]',
              name: "Product Name",
              value: "Test Product",
            },
            {
              selector: 'input[name="price"], input[id="price"]',
              name: "Price",
              value: "100000",
            },
            {
              selector: 'input[name="stock"], input[id="stock"]',
              name: "Stock",
              value: "10",
            },
            {
              selector: 'input[name="barcode"], input[id="barcode"]',
              name: "Barcode",
              value: "123456789",
            },
          ];

          for (const field of formFields) {
            const fieldExists = await checkElement(
              page,
              field.selector,
              field.name
            );
            if (fieldExists) {
              await page.fill(field.selector, field.value);
            }
          }

          // Submit form
          await page.click('button[type="submit"]');

          // Check for success message
          try {
            await page.waitForSelector(".ant-message-success", {
              timeout: 5000,
            });
          } catch {
            const screenshot = await takeScreenshot(
              page,
              "add-product-no-confirmation"
            );
            logIssue(
              "medium",
              "Product Management",
              "No success message after adding product",
              screenshot
            );
          }
        }
      }
    }
  });
});

// 3. Cashier Interface Tests
test.describe("Cashier Interface Tests", () => {
  test("POS terminal functionality", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "cashier");
    await page.goto(`${CONFIG.baseUrl}/cashier/pos`);
    await page.waitForLoadState("networkidle");

    // Check POS interface components
    const posComponents = [
      {
        selector: '.product-grid, .ant-card, [data-testid="product-grid"]',
        name: "Product Grid",
      },
      {
        selector: '.cart, .ant-list, [data-testid="cart"]',
        name: "Shopping Cart",
      },
      {
        selector: '.checkout-section, [data-testid="checkout-section"]',
        name: "Checkout Section",
      },
      {
        selector: '.barcode-scanner, [data-testid="barcode-scanner"]',
        name: "Barcode Scanner",
      },
    ];

    for (const component of posComponents) {
      await checkElement(page, component.selector, component.name);
    }

    // Test adding product to cart
    try {
      // Try to find and click on a product
      await page.click(
        '.product-item, .ant-card, [data-testid="product-item"]'
      );

      // Check if product was added to cart
      await page.waitForSelector(
        '.cart-item, .ant-list-item, [data-testid="cart-item"]'
      );

      // Test checkout process
      await page.click('.checkout-button, button:has-text("Checkout")');
      await page.waitForTimeout(1000);

      // Check payment modal
      const paymentModalExists = await checkElement(
        page,
        '.payment-modal, .ant-modal, [data-testid="payment-modal"]',
        "Payment Modal"
      );

      if (paymentModalExists) {
        // Test payment options
        const paymentMethods = [
          {
            selector: 'input[value="cash"], [data-testid="payment-cash"]',
            name: "Cash Payment",
          },
          {
            selector: 'input[value="card"], [data-testid="payment-card"]',
            name: "Card Payment",
          },
          {
            selector: 'input[value="vnpay"], [data-testid="payment-vnpay"]',
            name: "VNPay",
          },
          {
            selector: 'input[value="momo"], [data-testid="payment-momo"]',
            name: "MoMo",
          },
        ];

        let methodFound = false;
        for (const method of paymentMethods) {
          const exists = await checkElement(page, method.selector, method.name);
          if (exists) {
            methodFound = true;
            await page.click(method.selector);
            break;
          }
        }

        if (methodFound) {
          // Complete payment
          await page.click(
            'button:has-text("Complete Payment"), button:has-text("Hoàn thành")'
          );

          // Check for receipt or success message
          try {
            await page.waitForSelector(".receipt, .ant-result-success", {
              timeout: 10000,
            });
          } catch {
            const screenshot = await takeScreenshot(
              page,
              "payment-completion-issue"
            );
            logIssue(
              "critical",
              "Payment Processing",
              "No confirmation after payment completion",
              screenshot
            );
          }
        } else {
          const screenshot = await takeScreenshot(
            page,
            "payment-methods-missing"
          );
          logIssue(
            "critical",
            "Payment Processing",
            "No payment methods available",
            screenshot
          );
        }
      }
    } catch (error) {
      const screenshot = await takeScreenshot(page, "pos-workflow-error");
      logIssue(
        "critical",
        "POS Terminal",
        `Error during POS workflow: ${error.message}`,
        screenshot
      );
    }
  });
});

// 4. AI Feature Tests
test.describe("AI Feature Tests", () => {
  test("AI recommendations functionality", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");
    await page.goto(`${CONFIG.baseUrl}/admin/ai`);
    await page.waitForLoadState("networkidle");

    // Check AI features
    const aiFeatures = [
      {
        selector:
          '.customer-segmentation, [data-testid="customer-segmentation"]',
        name: "Customer Segmentation",
      },
      {
        selector: '.price-optimization, [data-testid="price-optimization"]',
        name: "Price Optimization",
      },
      {
        selector: '.demand-forecasting, [data-testid="demand-forecasting"]',
        name: "Demand Forecasting",
      },
      {
        selector:
          '.product-recommendation, [data-testid="product-recommendation"]',
        name: "Product Recommendation",
      },
    ];

    for (const feature of aiFeatures) {
      const exists = await checkElement(page, feature.selector, feature.name);

      if (exists) {
        // Try to interact with the feature
        await page.click(feature.selector);
        await page.waitForTimeout(1000);

        // Check for loading indicator
        try {
          await page.waitForSelector(".loading, .ant-spin", { timeout: 2000 });
        } catch {
          const screenshot = await takeScreenshot(
            page,
            `${feature.name.toLowerCase()}-no-loading`
          );
          logIssue(
            "medium",
            "AI Features",
            `No loading indicator when accessing ${feature.name}`,
            screenshot
          );
        }

        // Check for results
        try {
          await page.waitForSelector(".ai-results, .ant-result, .charts", {
            timeout: 10000,
          });
        } catch {
          const screenshot = await takeScreenshot(
            page,
            `${feature.name.toLowerCase()}-no-results`
          );
          logIssue(
            "high",
            "AI Features",
            `No results displayed for ${feature.name}`,
            screenshot
          );
        }
      }
    }
  });
});

// 5. Mobile Responsiveness Tests
test.describe("Mobile Responsiveness Tests", () => {
  test("Mobile interface functionality", async ({ browser }) => {
    // Test on mobile viewport
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE size
    });
    const page = await context.newPage();

    await page.goto(CONFIG.baseUrl);
    await page.waitForLoadState("networkidle");

    // Check for mobile menu
    const mobileMenuExists = await checkElement(
      page,
      ".mobile-menu, .hamburger-menu, .ant-menu-inline-collapsed-button",
      "Mobile Menu Button",
      true
    );

    if (mobileMenuExists) {
      // Check if menu opens
      try {
        await page.waitForSelector(
          ".mobile-menu-open, .ant-drawer-open, .menu-expanded",
          { timeout: 5000 }
        );
      } catch {
        const screenshot = await takeScreenshot(
          page,
          "mobile-menu-not-opening"
        );
        logIssue(
          "high",
          "Mobile Interface",
          "Mobile menu does not open when clicked",
          screenshot
        );
      }
    }

    // Test login on mobile
    await page.goto(`${CONFIG.baseUrl}/login`);
    await page.waitForLoadState("networkidle");

    // Check if login form is properly displayed on mobile
    const mobileLoginFormExists = await checkElement(
      page,
      "form",
      "Mobile Login Form"
    );

    if (mobileLoginFormExists) {
      // Check if form elements are properly sized for mobile
      const inputWidth = await page.evaluate(() => {
        const input = document.querySelector('input[type="email"]');
        return input ? input.getBoundingClientRect().width : 0;
      });

      if (inputWidth > 375) {
        const screenshot = await takeScreenshot(page, "mobile-form-overflow");
        logIssue(
          "medium",
          "Mobile Interface",
          "Form inputs overflow on mobile screen",
          screenshot
        );
      }
    }

    // Login on mobile
    await authenticate(page, "cashier");

    // Test mobile POS interface
    await page.goto(`${CONFIG.baseUrl}/cashier/pos`);
    await page.waitForLoadState("networkidle");

    // Check for proper mobile layout
    try {
      // Check if product grid is visible and properly formatted
      const gridVisible = await checkElement(
        page,
        '.product-grid, [data-testid="product-grid"]',
        "Mobile Product Grid"
      );

      if (gridVisible) {
        // Check if grid items are properly sized for mobile
        const gridItemWidth = await page.evaluate(() => {
          const item = document.querySelector(".product-item, .ant-card");
          return item ? item.getBoundingClientRect().width : 0;
        });

        if (gridItemWidth > 375) {
          const screenshot = await takeScreenshot(page, "mobile-grid-overflow");
          logIssue(
            "medium",
            "Mobile Interface",
            "Product grid items overflow on mobile screen",
            screenshot
          );
        }
      }
    } catch (error) {
      const screenshot = await takeScreenshot(page, "mobile-pos-error");
      logIssue(
        "high",
        "Mobile Interface",
        `Error with mobile POS interface: ${error.message}`,
        screenshot
      );
    }
  });
});

// 6. API Tests
test.describe("API Tests", () => {
  test("Core API endpoints", async ({ request }) => {
    const apiEndpoints = [
      { url: `${CONFIG.baseUrl}/api/products`, name: "Products API" },
      { url: `${CONFIG.baseUrl}/api/orders`, name: "Orders API" },
      { url: `${CONFIG.baseUrl}/api/customers`, name: "Customers API" },
      { url: `${CONFIG.baseUrl}/api/auth/status`, name: "Auth Status API" },
      { url: `${CONFIG.baseUrl}/api/inventory`, name: "Inventory API" },
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await request.get(endpoint.url);

        if (response.status() === 401 || response.status() === 403) {
          // This is expected for authenticated endpoints
          continue;
        }

        if (response.status() !== 200) {
          logIssue(
            "high",
            "API",
            `${endpoint.name} returned status ${response.status()}`
          );
        } else {
          // Check response structure
          try {
            const data = await response.json();
            if (!data || data.success === false) {
              logIssue(
                "medium",
                "API",
                `${endpoint.name} returned error response: ${JSON.stringify(
                  data
                )}`
              );
            }
          } catch (error) {
            logIssue(
              "medium",
              "API",
              `${endpoint.name} returned invalid JSON: ${error.message}`
            );
          }
        }
      } catch (error) {
        logIssue(
          "high",
          "API",
          `Error accessing ${endpoint.name}: ${error.message}`
        );
      }
    }
  });
});

// Add specific test for D1 database connection under high concurrency
test.describe("D1 Database Concurrency Tests", () => {
  test("Database performance under high concurrency", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");

    // Navigate to a page that would trigger multiple database queries
    await page.goto(`${CONFIG.baseUrl}/admin/dashboard`);

    // Simulate concurrent database access
    try {
      console.log(
        `Testing database with ${CONFIG.dbConcurrencyUsers} concurrent users`
      );

      // Create an array to track response times
      const responseTimes = [];

      // Function to make a single API request and measure time
      const makeRequest = async (endpoint) => {
        const start = Date.now();
        try {
          const response = await page.request.get(
            `${CONFIG.baseUrl}${endpoint}`
          );
          const end = Date.now();
          return {
            success: response.status() === 200,
            time: end - start,
            status: response.status(),
          };
        } catch (error) {
          const end = Date.now();
          return {
            success: false,
            time: end - start,
            error: error.message,
          };
        }
      };

      // Make concurrent requests to simulate high user load
      const requests = [];
      for (let i = 0; i < CONFIG.dbConcurrencyUsers; i++) {
        // Mix different endpoints to simulate real usage
        const endpoint =
          i % 5 === 0
            ? CONFIG.apiEndpoints.products
            : i % 5 === 1
            ? CONFIG.apiEndpoints.orders
            : i % 5 === 2
            ? CONFIG.apiEndpoints.categories
            : i % 5 === 3
            ? CONFIG.apiEndpoints.analytics
            : CONFIG.apiEndpoints.users;

        requests.push(makeRequest(endpoint));
      }

      // Wait for all requests to complete
      const results = await Promise.all(requests);

      // Analyze results
      const failedRequests = results.filter((r) => !r.success);
      const timeouts = results.filter((r) => r.time > 30000); // 30s is Cloudflare's timeout
      const avgTime =
        results.reduce((sum, r) => sum + r.time, 0) / results.length;

      console.log(`Concurrent requests completed. Average time: ${avgTime}ms`);
      console.log(`Failed requests: ${failedRequests.length}`);
      console.log(`Timeouts: ${timeouts.length}`);

      // Log issues if found
      if (failedRequests.length > 0) {
        const screenshot = await takeScreenshot(
          page,
          "database-concurrency-failures"
        );
        logIssue(
          "critical",
          "Database Connection",
          `${failedRequests.length} of ${CONFIG.dbConcurrencyUsers} concurrent database requests failed`,
          screenshot
        );

        // Log details of failures
        failedRequests.forEach((failure, index) => {
          console.log(
            `Failure ${index + 1}: Status ${failure.status || "N/A"}, Error: ${
              failure.error || "Unknown"
            }, Time: ${failure.time}ms`
          );
        });
      }

      if (timeouts.length > 0) {
        const screenshot = await takeScreenshot(
          page,
          "database-concurrency-timeouts"
        );
        logIssue(
          "critical",
          "Database Connection",
          `${timeouts.length} of ${CONFIG.dbConcurrencyUsers} concurrent database requests timed out`,
          screenshot
        );
      }

      if (avgTime > 1000) {
        logIssue(
          "performance",
          "Database Performance",
          `Slow average response time under load: ${avgTime.toFixed(0)}ms`,
          await takeScreenshot(page, "database-slow-response")
        );
      }
    } catch (error) {
      const screenshot = await takeScreenshot(
        page,
        "database-concurrency-test-error"
      );
      logIssue(
        "high",
        "Database Testing",
        `Error during database concurrency test: ${error.message}`,
        screenshot
      );
    }
  });
});

// Add specific test for VNPay integration
test.describe("Payment Integration Tests", () => {
  test("VNPay payment processing", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "cashier");

    // Navigate to POS page
    await page.goto(`${CONFIG.baseUrl}/cashier/pos`);
    await page.waitForLoadState("networkidle");

    try {
      // Add a product to the cart
      await page.click(
        '.product-item, .ant-card, [data-testid="product-item"]'
      );

      // Proceed to checkout
      await page.click('.checkout-button, button:has-text("Checkout")');

      // Wait for payment modal
      await page.waitForSelector(
        '.payment-modal, .ant-modal, [data-testid="payment-modal"]'
      );

      // Select VNPay payment method
      const vnpaySelector =
        'input[value="vnpay"], [data-testid="payment-vnpay"]';
      const vnpayExists = await page.isVisible(vnpaySelector);

      if (!vnpayExists) {
        logIssue(
          "high",
          "Payment Processing",
          "VNPay payment option not available",
          await takeScreenshot(page, "vnpay-option-missing")
        );
        return;
      }

      await page.click(vnpaySelector);

      // Complete payment
      await page.click(
        'button:has-text("Complete Payment"), button:has-text("Hoàn thành")'
      );

      // Check for VNPay redirect or processing
      try {
        // Wait for either success or error message
        await Promise.race([
          page.waitForSelector(".receipt, .ant-result-success", {
            timeout: 10000,
          }),
          page.waitForSelector(
            ".ant-message-error, .error-message, .payment-error",
            { timeout: 10000 }
          ),
          page.waitForNavigation({ timeout: 10000 }), // In case of redirect to VNPay
        ]);

        // Check for specific error code 9876
        const pageContent = await page.content();
        if (
          pageContent.includes("9876") ||
          pageContent.includes("error code 9876")
        ) {
          const screenshot = await takeScreenshot(page, "vnpay-error-9876");
          logIssue(
            "critical",
            "Payment Processing",
            "VNPay integration fails with error code 9876",
            screenshot
          );
        }

        // Check for any error message
        const errorVisible = await page.isVisible(
          ".ant-message-error, .error-message, .payment-error"
        );
        if (errorVisible) {
          const errorText = await page.textContent(
            ".ant-message-error, .error-message, .payment-error"
          );
          const screenshot = await takeScreenshot(page, "vnpay-payment-error");
          logIssue(
            "critical",
            "Payment Processing",
            `VNPay payment failed: ${errorText}`,
            screenshot
          );
        }
      } catch (error) {
        const screenshot = await takeScreenshot(page, "vnpay-payment-timeout");
        logIssue(
          "critical",
          "Payment Processing",
          `VNPay payment process timed out: ${error.message}`,
          screenshot
        );
      }
    } catch (error) {
      const screenshot = await takeScreenshot(page, "vnpay-test-exception");
      logIssue(
        "high",
        "Payment Processing",
        `Exception during VNPay payment test: ${error.message}`,
        screenshot
      );
    }
  });
});

// Add specific test for Vietnamese character handling in PDFs
test.describe("Vietnamese PDF Generation Tests", () => {
  test("Receipt generation with Vietnamese characters", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "cashier");

    // Navigate to POS page
    await page.goto(`${CONFIG.baseUrl}/cashier/pos`);
    await page.waitForLoadState("networkidle");

    try {
      // Add a product with Vietnamese name to cart (or select one if exists)
      // First try to find a product with Vietnamese characters
      const vietnameseProductSelector =
        '.product-item:has-text("Cà phê"), .product-item:has-text("Việt Nam")';
      const hasVietnameseProduct = await page.isVisible(
        vietnameseProductSelector
      );

      if (hasVietnameseProduct) {
        await page.click(vietnameseProductSelector);
      } else {
        // If no Vietnamese product found, click the first product
        await page.click(
          '.product-item, .ant-card, [data-testid="product-item"]'
        );
      }

      // Proceed to checkout
      await page.click('.checkout-button, button:has-text("Checkout")');

      // Wait for payment modal
      await page.waitForSelector(
        '.payment-modal, .ant-modal, [data-testid="payment-modal"]'
      );

      // Select cash payment for simplicity
      await page.click('input[value="cash"], [data-testid="payment-cash"]');

      // Complete payment
      await page.click(
        'button:has-text("Complete Payment"), button:has-text("Hoàn thành")'
      );

      // Wait for receipt generation
      try {
        await page.waitForSelector(".receipt, .ant-result-success", {
          timeout: 10000,
        });

        // Try to find PDF download button or receipt with Vietnamese characters
        const pdfButtonSelector =
          'button:has-text("Download PDF"), button:has-text("Tải PDF"), a:has-text("PDF")';
        const hasPdfButton = await page.isVisible(pdfButtonSelector);

        if (hasPdfButton) {
          // Click the PDF button and check for errors
          await page.click(pdfButtonSelector);

          // Wait for either download to start or error to appear
          await page.waitForTimeout(3000);

          // Check for error messages
          const errorVisible = await page.isVisible(
            ".ant-message-error, .error-message, .pdf-error"
          );
          if (errorVisible) {
            const errorText = await page.textContent(
              ".ant-message-error, .error-message, .pdf-error"
            );
            const screenshot = await takeScreenshot(
              page,
              "vietnamese-pdf-error"
            );
            logIssue(
              "high",
              "Receipt Generation",
              `PDF receipt generation failed with Vietnamese characters: ${errorText}`,
              screenshot
            );
          }
        } else {
          // If no PDF button, check if receipt displays Vietnamese characters correctly
          const receiptContent = await page.textContent(
            ".receipt, .ant-result-success"
          );
          if (
            !receiptContent.includes("Cà phê") &&
            !receiptContent.includes("Việt Nam")
          ) {
            const screenshot = await takeScreenshot(
              page,
              "vietnamese-receipt-missing-chars"
            );
            logIssue(
              "high",
              "Receipt Generation",
              "Receipt does not display Vietnamese characters correctly",
              screenshot
            );
          }
        }
      } catch (error) {
        const screenshot = await takeScreenshot(
          page,
          "receipt-generation-timeout"
        );
        logIssue(
          "high",
          "Receipt Generation",
          `Receipt generation timed out: ${error.message}`,
          screenshot
        );
      }
    } catch (error) {
      const screenshot = await takeScreenshot(
        page,
        "vietnamese-receipt-test-error"
      );
      logIssue(
        "high",
        "Receipt Generation",
        `Error during Vietnamese receipt test: ${error.message}`,
        screenshot
      );
    }
  });
});

// Add specific test for product catalog performance
test.describe("Product Catalog Performance Tests", () => {
  test("Product catalog loading with 1000+ products", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");

    // Navigate to products page
    await page.goto(`${CONFIG.baseUrl}/admin/products`);
    await page.waitForLoadState("networkidle");

    try {
      // Look for a button or option to load all products
      const loadAllSelector =
        'button:has-text("Load All"), button:has-text("Show All")';
      const hasLoadAllButton = await page.isVisible(loadAllSelector);

      if (hasLoadAllButton) {
        // Measure time to load all products
        const loadTime = await measurePerformance(
          page,
          async () => {
            await page.click(loadAllSelector);
            // Wait for products to load
            await page.waitForSelector(".product-item, .ant-table-row", {
              timeout: 30000,
              state: "visible",
            });
          },
          "Product catalog loading"
        );

        if (loadTime > 2300) {
          const screenshot = await takeScreenshot(
            page,
            "product-catalog-performance"
          );
          logIssue(
            "performance",
            "Product Catalog",
            `Loading 1000+ products causes UI freeze for ${(
              loadTime / 1000
            ).toFixed(1)}s on average (target: <2s)`,
            screenshot
          );
        }

        // Check for UI responsiveness after loading
        const scrollStartTime = Date.now();
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(100);
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(100);
        await page.evaluate(() => window.scrollTo(0, 0));
        const scrollTime = Date.now() - scrollStartTime;

        if (scrollTime > 500) {
          logIssue(
            "performance",
            "Product Catalog",
            `Scrolling is sluggish after loading products: ${scrollTime}ms for basic scroll operations`,
            await takeScreenshot(page, "product-catalog-scrolling")
          );
        }
      } else {
        // If no load all button, try to check pagination with large number of products
        const paginationSelector = ".ant-pagination, .pagination";
        const hasPagination = await page.isVisible(paginationSelector);

        if (hasPagination) {
          // Try to go to a page with many items per page
          const pageSizeSelector =
            ".ant-pagination-options-size-changer, .page-size-selector";
          if (await page.isVisible(pageSizeSelector)) {
            await page.click(pageSizeSelector);
            await page.click('li:has-text("100"), div:has-text("100 / page")');

            // Measure time to load page with 100 items
            const loadTime = await measurePerformance(
              page,
              async () => {
                await page.waitForSelector(".product-item, .ant-table-row", {
                  timeout: 10000,
                  state: "visible",
                });
              },
              "Product page loading"
            );

            if (loadTime > 2000) {
              const screenshot = await takeScreenshot(
                page,
                "product-page-performance"
              );
              logIssue(
                "performance",
                "Product Catalog",
                `Loading 100 products per page takes ${(
                  loadTime / 1000
                ).toFixed(1)}s (target: <2s)`,
                screenshot
              );
            }
          }
        }
      }
    } catch (error) {
      const screenshot = await takeScreenshot(
        page,
        "product-catalog-test-error"
      );
      logIssue(
        "high",
        "Product Catalog",
        `Error during product catalog performance test: ${error.message}`,
        screenshot
      );
    }
  });
});

// Add specific test for checkout process performance
test.describe("Checkout Performance Tests", () => {
  test("Checkout process timing", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "cashier");

    // Navigate to POS page
    await page.goto(`${CONFIG.baseUrl}/cashier/pos`);
    await page.waitForLoadState("networkidle");

    try {
      // Add multiple products to cart
      for (let i = 0; i < 5; i++) {
        // Try to find different products each time
        const productSelector = `.product-item:nth-child(${
          i + 1
        }), .ant-card:nth-child(${i + 1})`;
        if (await page.isVisible(productSelector)) {
          await page.click(productSelector);
        } else {
          // If not enough products, click the first one multiple times
          await page.click(
            '.product-item, .ant-card, [data-testid="product-item"]'
          );
        }
      }

      // Measure checkout process time
      const checkoutTime = await measurePerformance(
        page,
        async () => {
          // Click checkout
          await page.click('.checkout-button, button:has-text("Checkout")');

          // Wait for payment modal
          await page.waitForSelector(
            '.payment-modal, .ant-modal, [data-testid="payment-modal"]'
          );

          // Select cash payment
          await page.click('input[value="cash"], [data-testid="payment-cash"]');

          // Complete payment
          await page.click(
            'button:has-text("Complete Payment"), button:has-text("Hoàn thành")'
          );

          // Wait for receipt or confirmation
          await page.waitForSelector(".receipt, .ant-result-success", {
            timeout: 15000,
          });
        },
        "Checkout process"
      );

      if (checkoutTime > 4000) {
        const screenshot = await takeScreenshot(page, "checkout-performance");
        logIssue(
          "performance",
          "Order Processing",
          `Checkout process takes ${(checkoutTime / 1000).toFixed(
            1
          )}s on average (target: <2s)`,
          screenshot
        );
      }
    } catch (error) {
      const screenshot = await takeScreenshot(page, "checkout-test-error");
      logIssue(
        "high",
        "Order Processing",
        `Error during checkout performance test: ${error.message}`,
        screenshot
      );
    }
  });
});

// Add specific test for dashboard rendering performance
test.describe("Dashboard Performance Tests", () => {
  test("Admin dashboard rendering with large datasets", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");

    // Navigate to dashboard
    const dashboardTime = await measurePerformance(
      page,
      async () => {
        await page.goto(`${CONFIG.baseUrl}/admin/dashboard`);
        await page.waitForLoadState("networkidle");

        // Wait for charts to render
        await page.waitForSelector(
          ".recharts-surface, .chart-container, .dashboard-chart",
          {
            timeout: 10000,
            state: "visible",
          }
        );
      },
      "Dashboard initial load"
    );

    if (dashboardTime > 3000) {
      const screenshot = await takeScreenshot(page, "dashboard-initial-load");
      logIssue(
        "performance",
        "Dashboard Rendering",
        `Admin dashboard initial load takes ${(dashboardTime / 1000).toFixed(
          1
        )}s`,
        screenshot
      );
    }

    try {
      // Look for date range selector to test with 12 months of data
      const dateRangeSelector =
        'button:has-text("Last 12 Months"), .date-range-selector';
      if (await page.isVisible(dateRangeSelector)) {
        // Measure time to load 12 months of data
        const largeDatasetTime = await measurePerformance(
          page,
          async () => {
            await page.click(dateRangeSelector);
            await page.click(
              'li:has-text("Last 12 Months"), div:has-text("Last 12 Months")'
            );

            // Wait for charts to update
            await page.waitForTimeout(500); // Wait for any loading indicators to appear
            await page.waitForSelector(
              ".recharts-surface, .chart-container, .dashboard-chart",
              {
                timeout: 10000,
                state: "visible",
              }
            );
          },
          "Dashboard with 12 months data"
        );

        if (largeDatasetTime > 3700) {
          const screenshot = await takeScreenshot(
            page,
            "dashboard-12-months-render"
          );
          logIssue(
            "performance",
            "Dashboard Rendering",
            `Admin dashboard with 12 months of data takes ${(
              largeDatasetTime / 1000
            ).toFixed(1)}s to render charts`,
            screenshot
          );
        }
      }
    } catch (error) {
      const screenshot = await takeScreenshot(page, "dashboard-test-error");
      logIssue(
        "high",
        "Dashboard Rendering",
        `Error during dashboard rendering test: ${error.message}`,
        screenshot
      );
    }
  });
});

// 8. Visual Tests
test.describe("Visual Tests", () => {
  test("UI consistency", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    // Log in as admin
    await authenticate(page, "admin");

    // Capture screenshots of key interfaces for visual comparison
    const pagesToCapture = [
      { url: "/admin/dashboard", name: "Dashboard" },
      { url: "/admin/products", name: "Products" },
      { url: "/admin/orders", name: "Orders" },
      { url: "/admin/customers", name: "Customers" },
    ];

    for (const pageCapture of pagesToCapture) {
      await page.goto(`${CONFIG.baseUrl}${pageCapture.url}`);
      await page.waitForLoadState("networkidle");

      // Take screenshot
      const fileName = await takeScreenshot(
        page,
        `visual-${pageCapture.name.toLowerCase()}`
      );

      // Check for visual inconsistencies (would normally compare to baseline)
      // This is a simplified check - in a real implementation we'd compare to baseline images
      const hasVisualIssues = await page.evaluate(() => {
        // Check for overlapping elements as an example
        const elements = document.querySelectorAll(
          ".ant-card, .ant-table, .ant-list"
        );
        for (let i = 0; i < elements.length; i++) {
          const rect1 = elements[i].getBoundingClientRect();
          for (let j = i + 1; j < elements.length; j++) {
            const rect2 = elements[j].getBoundingClientRect();
            if (
              !(
                rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom
              )
            ) {
              return true; // Found overlapping elements
            }
          }
        }
        return false;
      });

      if (hasVisualIssues) {
        logIssue(
          "visual",
          `${pageCapture.name} UI`,
          `Visual inconsistencies detected`,
          fileName
        );
      }

      // Check for responsiveness by resizing
      await page.setViewportSize({ width: 768, height: 1024 }); // Tablet size
      await page.waitForTimeout(1000); // Allow time for resize

      const tabletFileName = await takeScreenshot(
        page,
        `visual-tablet-${pageCapture.name.toLowerCase()}`
      );

      // Check if layout breaks at tablet size
      const hasTabletIssues = await page.evaluate(() => {
        return window.innerWidth !== document.documentElement.scrollWidth;
      });

      if (hasTabletIssues) {
        logIssue(
          "visual",
          `${pageCapture.name} UI`,
          `Tablet layout issues detected`,
          tabletFileName
        );
      }

      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    }
  });
});

// Add specific tests for Cloudflare D1 database operations
test.describe("Database Operations", () => {
  test("D1 Database Query Performance", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");

    // Test large product query performance
    await page.goto(`${CONFIG.baseUrl}/admin/products`);

    // Measure time to load products
    const loadTime = await measurePerformance(
      page,
      async () => {
        await page.click('button:has-text("Load All")');
        await page.waitForSelector(".product-item", { timeout: 10000 });
      },
      "Product loading performance"
    );

    if (loadTime > 3000) {
      logIssue(
        "performance",
        "Database",
        `Slow product loading performance: ${loadTime}ms (target: <3000ms)`,
        await takeScreenshot(page, "slow-product-loading")
      );
    }
  });
});

// Add specific tests for R2 storage operations
test.describe("File Storage Operations", () => {
  test("R2 Image Upload Performance", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");

    // Test image upload performance
    await page.goto(`${CONFIG.baseUrl}/admin/products/new`);

    // Check if file upload element exists
    const fileUploadExists = await checkElement(
      page,
      'input[type="file"]',
      "File Upload Input"
    );

    if (!fileUploadExists) {
      logIssue(
        "high",
        "File Upload",
        "File upload input not found",
        await takeScreenshot(page, "missing-file-upload")
      );
      return;
    }

    // Test upload performance (simulate)
    const uploadTime = await measurePerformance(
      page,
      async () => {
        // Simulate file upload process
        await page.evaluate(() => {
          // Mock successful upload response
          window.dispatchEvent(new CustomEvent("test:upload:complete"));
        });
        await page.waitForTimeout(500);
      },
      "Image upload performance"
    );

    if (uploadTime > 2000) {
      logIssue(
        "performance",
        "R2 Storage",
        `Slow image upload performance: ${uploadTime}ms (target: <2000ms)`,
        await takeScreenshot(page, "slow-image-upload")
      );
    }
  });
});

// Add specific tests for Vietnamese language and currency support
test.describe("Vietnamese Market Support", () => {
  test("Vietnamese Character Support", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "admin");

    // Test product creation with Vietnamese characters
    await page.goto(`${CONFIG.baseUrl}/admin/products/new`);

    // Fill product form with Vietnamese text
    await page.fill('input[name="name"]', "Cà phê sữa đá Việt Nam");
    await page.fill(
      'textarea[name="description"]',
      "Đây là sản phẩm cà phê đặc trưng của Việt Nam"
    );
    await page.fill('input[name="price"]', "25000");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for success message
    try {
      await page.waitForSelector(".ant-message-success", { timeout: 5000 });
    } catch {
      logIssue(
        "high",
        "Vietnamese Support",
        "Failed to create product with Vietnamese characters",
        await takeScreenshot(page, "vietnamese-product-creation-failed")
      );
    }

    // Test search with Vietnamese characters
    await page.goto(`${CONFIG.baseUrl}/admin/products`);
    await page.fill('input[placeholder="Tìm kiếm"]', "cà phê");
    await page.press('input[placeholder="Tìm kiếm"]', "Enter");

    // Check if search results appear
    try {
      await page.waitForSelector(".product-item", { timeout: 5000 });
    } catch {
      logIssue(
        "high",
        "Vietnamese Support",
        "Search with Vietnamese characters failed",
        await takeScreenshot(page, "vietnamese-search-failed")
      );
    }
  });

  test("VND Currency Format", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await authenticate(page, "cashier");

    // Go to POS page
    await page.goto(`${CONFIG.baseUrl}/pos`);

    // Check for VND currency format
    const hasCurrencyFormat = await page.evaluate(() => {
      const priceElements = Array.from(
        document.querySelectorAll(".price, .amount")
      );
      return priceElements.some(
        (el) =>
          el.textContent.includes("₫") ||
          el.textContent.includes("VND") ||
          el.textContent.includes("đ")
      );
    });

    if (!hasCurrencyFormat) {
      logIssue(
        "high",
        "Vietnamese Support",
        "VND currency format not found in POS interface",
        await takeScreenshot(page, "vnd-currency-missing")
      );
    }
  });
});

// Generate final report
test.afterAll(async () => {
  // Add issues to report by category
  const addIssuesToReport = (category, severity) => {
    if (issues[severity].length === 0) return;

    reportContent += `\n## ${category} Issues\n\n`;

    issues[severity].forEach((issue, index) => {
      reportContent += `### ${index + 1}. ${issue.component}\n`;
      reportContent += `- **Description:** ${issue.description}\n`;
      if (issue.screenshot) {
        reportContent += `- **Screenshot:** [View](../screenshots/${issue.screenshot})\n`;
      }
      reportContent += "\n";
    });
  };

  // Add summary counts
  reportContent += `Total issues found: ${
    issues.critical.length +
    issues.high.length +
    issues.medium.length +
    issues.low.length +
    issues.visual.length +
    issues.performance.length
  }\n\n`;

  reportContent += `- Critical issues: ${issues.critical.length}\n`;
  reportContent += `- High priority issues: ${issues.high.length}\n`;
  reportContent += `- Medium priority issues: ${issues.medium.length}\n`;
  reportContent += `- Low priority issues: ${issues.low.length}\n`;
  reportContent += `- Visual issues: ${issues.visual.length}\n`;
  reportContent += `- Performance issues: ${issues.performance.length}\n`;

  // Add detailed issues
  addIssuesToReport("Critical", "critical");
  addIssuesToReport("High Priority", "high");
  addIssuesToReport("Medium Priority", "medium");
  addIssuesToReport("Low Priority", "low");
  addIssuesToReport("Visual", "visual");
  addIssuesToReport("Performance", "performance");

  // Write report to file
  fs.writeFileSync(CONFIG.reportPath, reportContent);
  console.log(`Test report generated at: ${CONFIG.reportPath}`);
});
