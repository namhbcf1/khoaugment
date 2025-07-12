/**
 * KhoAugment Integration Tests - Cloudflare Deployment Configuration
 */

module.exports = {
  /**
   * Base URLs for testing environments
   */
  environments: {
    development: {
      frontendUrl: "https://dev-khoaugment.pages.dev",
      apiUrl: "https://dev-khoaugment-api.workers.dev",
    },
    staging: {
      frontendUrl: "https://staging-khoaugment.pages.dev",
      apiUrl: "https://staging-khoaugment-api.workers.dev",
    },
    production: {
      frontendUrl: "https://khoaugment.pages.dev",
      apiUrl: "https://khoaugment-api.workers.dev",
    },
  },

  /**
   * Cloudflare Workers settings
   */
  workers: {
    testMonitorName: "khoaugment-integration-tests",
    compatibilityDate: "2023-10-30",
    compatibilityFlags: ["nodejs_compat"],
  },

  /**
   * Test suite configuration
   */
  testConfig: {
    defaultConcurrency: 4,
    defaultBrowser: "chromium",
    defaultTimeout: 30000,
    defaultViewport: { width: 1280, height: 720 },
  },

  /**
   * Vietnamese language test settings
   */
  vietnameseConfig: {
    locale: "vi-VN",
    encoding: "UTF-8",
    testStrings: [
      "Xin chào Việt Nam",
      "Cà phê Trung Nguyên",
      "Thanh toán thành công",
    ],
    specialCharacters: ["ă", "â", "đ", "ê", "ô", "ơ", "ư"],
  },

  /**
   * Authentication settings
   */
  auth: {
    testUser: {
      email: process.env.TEST_USER_EMAIL || "test@example.com",
      // Password should be provided via environment variable
      password: process.env.TEST_USER_PASSWORD,
    },
    jwtExpiry: "1h",
  },

  /**
   * Test data
   */
  testData: {
    products: [
      {
        name: "Cà phê Trung Nguyên",
        price: 35000,
        barcode: "8935024122211",
      },
      {
        name: "Bánh mì Việt Nam",
        price: 20000,
        barcode: "8936054123456",
      },
    ],
    orders: [
      {
        id: "test-order-1",
        total: 70000,
        items: [{ productId: 1, quantity: 2, price: 35000 }],
      },
    ],
    paymentMethods: [
      { id: "cash", name: "Tiền mặt" },
      { id: "vnpay", name: "VNPay" },
      { id: "momo", name: "MoMo" },
    ],
  },

  /**
   * Cloudflare service limits (free tier)
   */
  serviceLimits: {
    workers: {
      requestsPerDay: 100000,
      cpuTimeMs: 30,
      memoryMB: 128,
    },
    d1: {
      rowsReadPerDay: 5000,
      rowsWrittenPerDay: 1000,
    },
    r2: {
      storageLimitGB: 10,
      operationsLimit: 1000000,
    },
  },
};
