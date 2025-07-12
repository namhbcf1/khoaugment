const { test, expect } = require("@playwright/test");
const axios = require("axios");

// Configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || "https://khoaugment.pages.dev",
  apiUrl: process.env.TEST_API_URL || "https://khoaugment-api.workers.dev",
  testUser: {
    email: process.env.TEST_USER_EMAIL || "test@example.com",
    password: process.env.TEST_USER_PASSWORD || "testpassword",
  },
  testProduct: {
    name: "Cà phê Trung Nguyên",
    price: 35000,
    barcode: "8935024122211",
  },
  timeouts: {
    apiRequest: 10000,
    pageLoad: 30000,
    animation: 1000,
  },
};

let authToken;
let testContext = {};

// Helper functions
async function login() {
  const response = await axios.post(`${config.apiUrl}/api/auth/login`, {
    email: config.testUser.email,
    password: config.testUser.password,
  });

  expect(response.status).toBe(200);
  expect(response.data.success).toBeTruthy();
  expect(response.data.data.token).toBeDefined();

  authToken = response.data.data.token;
  return authToken;
}

async function createTestProduct() {
  const response = await axios.post(
    `${config.apiUrl}/api/products`,
    config.testProduct,
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  expect(response.status).toBe(201);
  expect(response.data.success).toBeTruthy();
  expect(response.data.data.id).toBeDefined();

  testContext.productId = response.data.data.id;
  return response.data.data;
}

// Setup and teardown
test.beforeAll(async () => {
  try {
    await login();
    await createTestProduct();
  } catch (error) {
    console.error("Setup failed:", error.message);
    throw error;
  }
});

test.afterAll(async () => {
  if (testContext.productId) {
    try {
      await axios.delete(
        `${config.apiUrl}/api/products/${testContext.productId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (error) {
      console.error("Teardown failed:", error.message);
    }
  }
});

// Test cases
test("API health check", async () => {
  const response = await axios.get(`${config.apiUrl}/api/health`);
  expect(response.status).toBe(200);
  expect(response.data.status).toBe("ok");

  // Check D1 database connection
  const dbResponse = await axios.get(`${config.apiUrl}/api/health/database`);
  expect(dbResponse.status).toBe(200);
  expect(dbResponse.data.status).toBe("connected");

  // Check R2 bucket connection
  const r2Response = await axios.get(`${config.apiUrl}/api/health/storage`);
  expect(r2Response.status).toBe(200);
  expect(r2Response.data.status).toBe("connected");
});

test("Frontend loads correctly", async ({ page }) => {
  await page.goto(config.baseUrl);
  await expect(page).toHaveTitle(/KhoAugment/);

  // Check that critical UI elements are visible
  await expect(page.locator(".login-form")).toBeVisible();

  // Check that Vietnamese characters render correctly
  await expect(page.locator("text=Đăng nhập")).toBeVisible();
});

test("Login flow works correctly", async ({ page }) => {
  await page.goto(`${config.baseUrl}/login`);

  // Fill login form
  await page.fill('input[name="email"]', config.testUser.email);
  await page.fill('input[name="password"]', config.testUser.password);
  await page.click('button[type="submit"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL(/dashboard/);

  // Verify user info is displayed
  await expect(page.locator(".user-info")).toBeVisible();
});

test("Product search with Vietnamese characters", async ({ page }) => {
  await page.goto(`${config.baseUrl}/login`);

  // Login
  await page.fill('input[name="email"]', config.testUser.email);
  await page.fill('input[name="password"]', config.testUser.password);
  await page.click('button[type="submit"]');

  // Navigate to products
  await page.goto(`${config.baseUrl}/products`);

  // Search for Vietnamese product name
  await page.fill('input[placeholder="Tìm kiếm sản phẩm..."]', "Cà phê");
  await page.click(".search-button");

  // Wait for results
  await page.waitForSelector(".product-item");

  // Verify product is found
  await expect(page.locator(`text=${config.testProduct.name}`)).toBeVisible();
});

test("Create order with Vietnamese product", async ({ page }) => {
  await page.goto(`${config.baseUrl}/login`);

  // Login
  await page.fill('input[name="email"]', config.testUser.email);
  await page.fill('input[name="password"]', config.testUser.password);
  await page.click('button[type="submit"]');

  // Navigate to POS
  await page.goto(`${config.baseUrl}/pos`);

  // Scan product barcode
  await page.fill(".barcode-input", config.testProduct.barcode);
  await page.press(".barcode-input", "Enter");

  // Wait for product to be added to cart
  await page.waitForSelector(".cart-item");

  // Verify product in cart
  await expect(page.locator(`text=${config.testProduct.name}`)).toBeVisible();

  // Set quantity
  await page.fill(".quantity-input", "2");

  // Calculate expected price
  const expectedTotal = config.testProduct.price * 2;

  // Verify total
  await expect(page.locator(".cart-total")).toContainText(
    expectedTotal.toString()
  );

  // Complete order with cash payment
  await page.click(".payment-method-cash");
  await page.click(".complete-order-button");

  // Verify order success
  await expect(page.locator(".order-success-message")).toBeVisible();

  // Verify receipt contains Vietnamese characters
  await expect(page.locator(".receipt-container")).toContainText(
    config.testProduct.name
  );
});

test("D1 database performance under concurrent requests", async () => {
  // Create multiple concurrent requests to test D1 performance
  const concurrentRequests = 10;
  const requests = [];

  for (let i = 0; i < concurrentRequests; i++) {
    requests.push(
      axios.get(`${config.apiUrl}/api/products?page=${i}&limit=10`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
    );
  }

  const results = await Promise.all(requests);

  // Verify all requests succeeded
  for (const response of results) {
    expect(response.status).toBe(200);
    expect(response.data.success).toBeTruthy();
  }
});

test("R2 storage upload and retrieval performance", async () => {
  // Create a test image
  const testImage = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  const blob = new Blob([testImage], { type: "image/gif" });
  const imageFile = new File([blob], "test-image.gif", { type: "image/gif" });

  // Create form data
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("name", "Test Image");

  // Upload to R2
  const uploadResponse = await axios.post(
    `${config.apiUrl}/api/storage/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  expect(uploadResponse.status).toBe(200);
  expect(uploadResponse.data.success).toBeTruthy();
  expect(uploadResponse.data.data.url).toBeDefined();

  const imageUrl = uploadResponse.data.data.url;

  // Verify image is accessible
  const imageResponse = await axios.get(imageUrl);
  expect(imageResponse.status).toBe(200);

  // Clean up
  await axios.delete(`${config.apiUrl}/api/storage/delete`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { url: imageUrl },
  });
});

test("Vietnamese payment processing", async ({ page }) => {
  await page.goto(`${config.baseUrl}/login`);

  // Login
  await page.fill('input[name="email"]', config.testUser.email);
  await page.fill('input[name="password"]', config.testUser.password);
  await page.click('button[type="submit"]');

  // Navigate to POS
  await page.goto(`${config.baseUrl}/pos`);

  // Add product to cart
  await page.fill(".barcode-input", config.testProduct.barcode);
  await page.press(".barcode-input", "Enter");

  // Select VNPAY payment method
  await page.click(".payment-method-vnpay");

  // Process payment
  await page.click(".complete-order-button");

  // Wait for VNPAY redirect
  await page.waitForURL(/vnpay/, { timeout: config.timeouts.pageLoad });

  // Verify we're on VNPAY page
  await expect(page).toHaveURL(/vnpay/);

  // Simulate successful payment and return to POS
  await page.goto(
    `${config.baseUrl}/pos/payment-success?orderId=test-order-id`
  );

  // Verify success page
  await expect(page.locator(".payment-success-message")).toBeVisible();
  await expect(page.locator("text=Thanh toán thành công")).toBeVisible();
});

test("Worker CPU time limit test", async () => {
  // Test complex query that might approach CPU time limits
  const response = await axios.post(
    `${config.apiUrl}/api/analytics/sales-report`,
    {
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      groupBy: "day",
      includeProductDetails: true,
      includeCategoryBreakdown: true,
      includeInventoryImpact: true,
    },
    {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: 25000, // Nearly the Cloudflare 30s limit
    }
  );

  expect(response.status).toBe(200);
  expect(response.data.success).toBeTruthy();
  expect(response.data.data).toBeDefined();
});

test("Edge caching effectiveness", async () => {
  // First request to ensure content is cached
  const firstResponse = await axios.get(
    `${config.apiUrl}/api/products/categories`
  );
  expect(firstResponse.status).toBe(200);

  // Second request should be faster and have cache headers
  const startTime = Date.now();
  const secondResponse = await axios.get(
    `${config.apiUrl}/api/products/categories`
  );
  const endTime = Date.now();

  expect(secondResponse.status).toBe(200);
  expect(secondResponse.headers["cf-cache-status"]).toBe("HIT");

  // Response time should be significantly faster (< 100ms is very good)
  const responseTime = endTime - startTime;
  expect(responseTime).toBeLessThan(100);
});

test("Mobile responsive design", async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

  await page.goto(`${config.baseUrl}/login`);

  // Login
  await page.fill('input[name="email"]', config.testUser.email);
  await page.fill('input[name="password"]', config.testUser.password);
  await page.click('button[type="submit"]');

  // Navigate to POS
  await page.goto(`${config.baseUrl}/pos`);

  // Verify mobile-specific UI elements
  await expect(page.locator(".mobile-nav-toggle")).toBeVisible();

  // Open mobile menu
  await page.click(".mobile-nav-toggle");

  // Verify menu is open
  await expect(page.locator(".mobile-menu")).toBeVisible();

  // Verify Vietnamese text in mobile menu
  await expect(page.locator("text=Trang chính")).toBeVisible();
});
