#!/usr/bin/env node
/**
 * KhoAugment POS - API Health Verification
 * This script checks API health including D1 and R2 connections
 * to ensure the testing environment is ready.
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Configuration
const apiUrl = process.env.TEST_API_URL || "https://khoaugment-api.workers.dev";
const outputFile = path.join(__dirname, "../test-results/api-health.json");

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

async function checkApiHealth() {
  console.log(
    `${colors.blue}┌───────────────────────────────────────┐${colors.reset}`
  );
  console.log(
    `${colors.blue}│     KhoAugment API Health Check       │${colors.reset}`
  );
  console.log(
    `${colors.blue}└───────────────────────────────────────┘${colors.reset}`
  );
  console.log(`${colors.gray}Checking API at: ${apiUrl}${colors.reset}\n`);

  const healthResults = {
    timestamp: new Date().toISOString(),
    api: { status: "unknown", responseTime: 0 },
    database: { status: "unknown", responseTime: 0 },
    storage: { status: "unknown", responseTime: 0 },
    cloudflareServices: {},
    endpoints: {},
  };

  // Create results directory if it doesn't exist
  const resultsDir = path.join(__dirname, "../test-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  try {
    // Check main API health
    console.log(`${colors.cyan}Checking API health...${colors.reset}`);
    const startTime = Date.now();
    const apiResponse = await axios.get(`${apiUrl}/api/health`);
    const apiResponseTime = Date.now() - startTime;

    if (apiResponse.status === 200) {
      console.log(
        `${colors.green}✓ API is healthy (${apiResponseTime}ms)${colors.reset}`
      );
      healthResults.api = {
        status: "healthy",
        responseTime: apiResponseTime,
        version: apiResponse.data.version || "unknown",
      };
    } else {
      console.log(
        `${colors.red}✗ API returned status ${apiResponse.status}${colors.reset}`
      );
      healthResults.api = {
        status: "unhealthy",
        responseTime: apiResponseTime,
      };
    }

    // Check database connection
    console.log(
      `\n${colors.cyan}Checking D1 database connection...${colors.reset}`
    );
    try {
      const dbStartTime = Date.now();
      const dbResponse = await axios.get(`${apiUrl}/api/health/database`);
      const dbResponseTime = Date.now() - dbStartTime;

      if (dbResponse.status === 200 && dbResponse.data.status === "connected") {
        console.log(
          `${colors.green}✓ D1 database connected (${dbResponseTime}ms)${colors.reset}`
        );
        healthResults.database = {
          status: "connected",
          responseTime: dbResponseTime,
          details: dbResponse.data,
        };
      } else {
        console.log(
          `${colors.red}✗ D1 database connection issue: ${
            dbResponse.data?.message || "Unknown error"
          }${colors.reset}`
        );
        healthResults.database = {
          status: "error",
          responseTime: dbResponseTime,
          error: dbResponse.data?.message || "Unknown error",
        };
      }
    } catch (error) {
      console.log(
        `${colors.red}✗ D1 database connection failed: ${error.message}${colors.reset}`
      );
      healthResults.database = { status: "error", error: error.message };
    }

    // Check R2 storage connection
    console.log(
      `\n${colors.cyan}Checking R2 storage connection...${colors.reset}`
    );
    try {
      const storageStartTime = Date.now();
      const storageResponse = await axios.get(`${apiUrl}/api/health/storage`);
      const storageResponseTime = Date.now() - storageStartTime;

      if (
        storageResponse.status === 200 &&
        storageResponse.data.status === "connected"
      ) {
        console.log(
          `${colors.green}✓ R2 storage connected (${storageResponseTime}ms)${colors.reset}`
        );
        healthResults.storage = {
          status: "connected",
          responseTime: storageResponseTime,
          details: storageResponse.data,
        };
      } else {
        console.log(
          `${colors.red}✗ R2 storage connection issue: ${
            storageResponse.data?.message || "Unknown error"
          }${colors.reset}`
        );
        healthResults.storage = {
          status: "error",
          responseTime: storageResponseTime,
          error: storageResponse.data?.message || "Unknown error",
        };
      }
    } catch (error) {
      console.log(
        `${colors.red}✗ R2 storage connection failed: ${error.message}${colors.reset}`
      );
      healthResults.storage = { status: "error", error: error.message };
    }

    // Get Cloudflare service information
    console.log(
      `\n${colors.cyan}Retrieving Cloudflare service information...${colors.reset}`
    );
    try {
      const cfResponse = await axios.get(`${apiUrl}/api/health/cloudflare`);
      if (cfResponse.status === 200) {
        healthResults.cloudflareServices = cfResponse.data;

        console.log(
          `${colors.green}✓ Cloudflare information retrieved${colors.reset}`
        );
        if (cfResponse.data.datacenter) {
          console.log(`  - Datacenter: ${cfResponse.data.datacenter}`);
        }
        if (cfResponse.data.rayId) {
          console.log(`  - Ray ID: ${cfResponse.data.rayId}`);
        }
      }
    } catch (error) {
      console.log(
        `${colors.yellow}⚠ Cloudflare service info not available${colors.reset}`
      );
    }

    // Verify critical API endpoints
    console.log(
      `\n${colors.cyan}Verifying critical API endpoints...${colors.reset}`
    );
    const endpoints = [
      "/api/auth/login",
      "/api/products",
      "/api/orders",
      "/api/customers",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${apiUrl}${endpoint}`);

        // Success responses are 200s or 401 (for auth required endpoints)
        const isSuccess = response.status === 200 || response.status === 401;

        if (isSuccess) {
          console.log(
            `${colors.green}✓ ${endpoint} - Available${colors.reset}`
          );
          healthResults.endpoints[endpoint] = {
            status: "available",
            statusCode: response.status,
          };
        } else {
          console.log(
            `${colors.red}✗ ${endpoint} - Unexpected status: ${response.status}${colors.reset}`
          );
          healthResults.endpoints[endpoint] = {
            status: "error",
            statusCode: response.status,
          };
        }
      } catch (error) {
        const statusCode = error.response?.status;

        // 401 is acceptable for auth-required endpoints
        if (statusCode === 401) {
          console.log(
            `${colors.green}✓ ${endpoint} - Authentication required${colors.reset}`
          );
          healthResults.endpoints[endpoint] = {
            status: "authentication_required",
            statusCode: 401,
          };
        } else {
          console.log(
            `${colors.red}✗ ${endpoint} - ${error.message}${colors.reset}`
          );
          healthResults.endpoints[endpoint] = {
            status: "error",
            statusCode: statusCode || "unknown",
            error: error.message,
          };
        }
      }
    }

    // Check for Vietnamese language support in API responses
    console.log(
      `\n${colors.cyan}Checking Vietnamese language support...${colors.reset}`
    );
    try {
      const viResponse = await axios.get(`${apiUrl}/api/health`, {
        headers: {
          "Accept-Language": "vi-VN",
        },
      });

      if (
        viResponse.data.languageSupport &&
        viResponse.data.languageSupport === "vi-VN"
      ) {
        console.log(
          `${colors.green}✓ Vietnamese language supported${colors.reset}`
        );
        healthResults.vietnameseSupport = { status: "supported" };
      } else {
        console.log(
          `${colors.yellow}⚠ Vietnamese language might not be fully supported${colors.reset}`
        );
        healthResults.vietnameseSupport = { status: "unknown" };
      }
    } catch (error) {
      console.log(
        `${colors.yellow}⚠ Could not verify Vietnamese language support${colors.reset}`
      );
      healthResults.vietnameseSupport = {
        status: "error",
        error: error.message,
      };
    }

    // Overall health assessment
    const isApiHealthy = healthResults.api.status === "healthy";
    const isDbConnected = healthResults.database.status === "connected";
    const isStorageConnected = healthResults.storage.status === "connected";

    console.log(
      `\n${colors.blue}┌───────────────────────────────────────┐${colors.reset}`
    );
    console.log(
      `${colors.blue}│           Overall Assessment           │${colors.reset}`
    );
    console.log(
      `${colors.blue}└───────────────────────────────────────┘${colors.reset}`
    );

    if (isApiHealthy && isDbConnected && isStorageConnected) {
      console.log(`${colors.green}✓ All systems operational${colors.reset}`);
      console.log(
        `${colors.green}✓ Ready to run integration tests${colors.reset}`
      );
      healthResults.overallStatus = "healthy";
    } else {
      console.log(`${colors.red}✗ System health check failed${colors.reset}`);
      console.log(
        `  API: ${isApiHealthy ? colors.green + "✓" : colors.red + "✗"}${
          colors.reset
        }`
      );
      console.log(
        `  Database: ${isDbConnected ? colors.green + "✓" : colors.red + "✗"}${
          colors.reset
        }`
      );
      console.log(
        `  Storage: ${
          isStorageConnected ? colors.green + "✓" : colors.red + "✗"
        }${colors.reset}`
      );
      healthResults.overallStatus = "unhealthy";
    }

    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(healthResults, null, 2));
    console.log(`\nResults saved to: ${outputFile}`);

    // Return appropriate exit code
    process.exit(healthResults.overallStatus === "healthy" ? 0 : 1);
  } catch (error) {
    console.log(
      `${colors.red}✗ API health check failed: ${error.message}${colors.reset}`
    );

    healthResults.overallStatus = "error";
    healthResults.error = error.message;

    // Save error results
    fs.writeFileSync(outputFile, JSON.stringify(healthResults, null, 2));

    process.exit(1);
  }
}

// Run the health check
checkApiHealth();
