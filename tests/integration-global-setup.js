const { request } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

async function globalSetup() {
  // Load environment variables
  dotenv.config();

  const apiUrl =
    process.env.TEST_API_URL || "https://khoaugment-api.workers.dev";
  const authFile = path.join(__dirname, "auth.json");

  // Create test-results directory if it doesn't exist
  const resultsDir = path.join(__dirname, "../test-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Create artifacts directory
  const artifactsDir = path.join(__dirname, "../test-results/artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Check if we have credentials to authenticate
  if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
    try {
      // Create a request context
      const context = await request.newContext({
        baseURL: apiUrl,
        extraHTTPHeaders: {
          Accept: "application/json",
        },
      });

      // Attempt login
      const loginResponse = await context.post("/api/auth/login", {
        data: {
          email: process.env.TEST_USER_EMAIL,
          password: process.env.TEST_USER_PASSWORD,
        },
      });

      // If login successful, save auth state
      if (loginResponse.ok()) {
        const authData = await loginResponse.json();
        if (authData.success && authData.data.token) {
          // Save auth token to file for tests to use
          fs.writeFileSync(
            authFile,
            JSON.stringify(
              {
                token: authData.data.token,
                userId: authData.data.user.id,
                role: authData.data.user.role,
                expires: new Date(Date.now() + 3600000).toISOString(), // Assume 1-hour expiry
              },
              null,
              2
            )
          );

          console.log(
            "✓ Authentication successful, token saved for test suite"
          );
        } else {
          console.warn(
            "⚠ Authentication response did not contain expected token structure"
          );
        }
      } else {
        console.warn(
          `⚠ Authentication failed with status ${loginResponse.status()}`
        );
      }

      await context.dispose();
    } catch (error) {
      console.error("❌ Error during authentication setup:", error.message);
    }
  } else {
    console.warn(
      "⚠ TEST_USER_EMAIL or TEST_USER_PASSWORD not provided, some tests may fail"
    );
  }

  // Pre-test environment validation
  await validateEnvironment(apiUrl);
}

async function validateEnvironment(apiUrl) {
  try {
    // Check API health
    const response = await fetch(`${apiUrl}/api/health`);
    if (!response.ok) {
      console.warn(
        `⚠ API health check failed: ${response.status} ${response.statusText}`
      );
    } else {
      const data = await response.json();
      console.log(`✓ API health check passed: ${data.status}`);

      // Check if we have all required API endpoints
      const endpoints = [
        "/api/auth/login",
        "/api/products",
        "/api/orders",
        "/api/customers",
        "/api/health/database",
        "/api/health/storage",
      ];

      console.log("Verifying critical API endpoints:");
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${apiUrl}${endpoint}`);
          // We don't care about the status code (could be 401), just that the endpoint exists
          console.log(`  ${response.status === 404 ? "✗" : "✓"} ${endpoint}`);
        } catch (error) {
          console.log(`  ✗ ${endpoint} (${error.message})`);
        }
      }
    }

    // Check client environment
    const requiredEnvVars = [
      "TEST_BASE_URL",
      "TEST_API_URL",
      "TEST_USER_EMAIL",
      "TEST_USER_PASSWORD",
    ];

    console.log("Checking environment variables:");
    for (const envVar of requiredEnvVars) {
      console.log(`  ${process.env[envVar] ? "✓" : "✗"} ${envVar}`);
    }

    // Log Cloudflare-specific information
    console.log("\nTest environment:");
    console.log(
      `  Frontend URL: ${
        process.env.TEST_BASE_URL || "https://khoaugment.pages.dev"
      }`
    );
    console.log(`  API URL: ${apiUrl}`);
    console.log(`  CI Environment: ${process.env.CI ? "Yes" : "No"}`);
    console.log(
      `  Test Browser: ${process.env.BROWSER || "All configured browsers"}`
    );
  } catch (error) {
    console.error("❌ Environment validation failed:", error.message);
  }
}

module.exports = globalSetup;
