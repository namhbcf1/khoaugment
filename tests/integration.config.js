const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./",
  testMatch: ["**/integration-suite.js"],
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/integration-results.json" }],
  ],
  use: {
    actionTimeout: 15000,
    baseURL: process.env.TEST_BASE_URL || "https://khoaugment.pages.dev",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Chrome Desktop",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 720 },
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
      },
    },
    {
      name: "Firefox Desktop",
      use: {
        browserName: "firefox",
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        browserName: "chromium",
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/98.0.4758.85 Mobile/15E148 Safari/604.1",
      },
    },
    {
      name: "Mobile Safari",
      use: {
        browserName: "webkit",
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
      },
    },
  ],
  outputDir: "test-results/artifacts/",
  globalSetup: require.resolve("./integration-global-setup.js"),
  webServer: {
    command: "npm run preview -- --port 8787",
    port: 8787,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
