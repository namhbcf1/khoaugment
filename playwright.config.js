// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * KhoAugment POS System - Playwright Configuration for GPU Testing
 * Optimized for NVIDIA GTX 1070
 */
module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false, // Run tests in sequence for more stable GPU testing
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to prevent GPU resource contention
  reporter: [
    ["html", { outputFolder: "./test-results/html-report" }],
    ["json", { outputFile: "./test-results/results.json" }],
    ["junit", { outputFile: "./test-results/results.xml" }],
    ["list"],
  ],
  outputDir: "./test-results/artifacts",

  use: {
    // Base URL for all tests
    baseURL: "http://localhost:5173",

    // Collect trace when retrying the failed test
    trace: "retain-on-failure",

    // Collect screenshots
    screenshot: "only-on-failure",

    // Record video for failed tests
    video: "retain-on-failure",

    // Viewport size
    viewport: { width: 1920, height: 1080 },

    // GPU acceleration settings
    launchOptions: {
      args: [
        "--enable-gpu",
        "--ignore-gpu-blocklist",
        "--enable-webgl",
        "--use-gl=desktop",
        "--enable-accelerated-video-decode",
        "--disable-gpu-sandbox",
        "--disable-features=IsolateOrigins",
        "--disable-web-security",
        "--no-sandbox",
      ],
      headless: false, // Run with browser visible for better GPU utilization
      slowMo: 50, // Slow down operations by 50ms for more stable tests
    },
  },

  // Configure projects for different browsers and device types
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Override with our GPU settings
        launchOptions: {
          args: [
            "--enable-gpu",
            "--ignore-gpu-blocklist",
            "--enable-webgl",
            "--use-gl=desktop",
            "--enable-accelerated-video-decode",
            "--disable-gpu-sandbox",
            "--disable-features=IsolateOrigins",
            "--disable-web-security",
            "--no-sandbox",
          ],
          headless: false,
        },
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        // Firefox has different GPU acceleration flags
        launchOptions: {
          args: [
            "--enable-webrender",
            "--enable-gpu-rasterization",
            "--enable-accelerated-layers",
          ],
          firefoxUserPrefs: {
            "gfx.webrender.all": true,
            "gfx.webrender.enabled": true,
            "layers.acceleration.force-enabled": true,
          },
          headless: false,
        },
      },
    },

    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        // Mobile Chrome settings
        launchOptions: {
          args: [
            "--enable-gpu",
            "--ignore-gpu-blocklist",
            "--enable-webgl",
            "--use-gl=desktop",
          ],
          headless: false,
        },
      },
    },
  ],

  // Web server to use for testing
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
