const { test, expect } = require("@playwright/test");

/**
 * Basic test to verify the testing infrastructure is working
 */
test("Basic test of the KhoAugment POS system", async ({ page }) => {
  // Navigate to the homepage
  await page.goto("/");

  // Take a screenshot of the initial page
  await page.screenshot({ path: "test-results/test-page-initial.png" });

  // Check if the page has loaded
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Check if we can access the API
  try {
    const response = await page.request.get("/api");
    console.log(`API health check status: ${response.status()}`);
    await page.screenshot({ path: "test-results/test-health-api.png" });
  } catch (error) {
    console.error(`API health check failed: ${error.message}`);
  }

  // Try to access the login page
  try {
    await page.goto("/login");
    await page.waitForSelector("form", { timeout: 5000 });
    await page.screenshot({ path: "test-results/test-login.png" });
    console.log("Login page loaded successfully");
  } catch (error) {
    console.error(`Login page failed to load: ${error.message}`);
  }

  // Try to access the products API
  try {
    const response = await page.request.get("/api/products");
    console.log(`Products API status: ${response.status()}`);
    await page.screenshot({ path: "test-results/test-products-api.png" });
  } catch (error) {
    console.error(`Products API failed: ${error.message}`);
  }

  // Try to access the categories API
  try {
    const response = await page.request.get("/api/categories");
    console.log(`Categories API status: ${response.status()}`);
    await page.screenshot({ path: "test-results/test-categories-api.png" });
  } catch (error) {
    console.error(`Categories API failed: ${error.message}`);
  }

  // Take a final screenshot
  await page.screenshot({ path: "test-results/test-page-final.png" });
});
