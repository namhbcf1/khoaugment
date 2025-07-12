// Custom build script for Cloudflare Pages
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔥 Starting Cloudflare Pages optimized build...");

// Step 1: Build the application
console.log("📦 Building the application...");
execSync("vite build", { stdio: "inherit" });

// Step 2: Ensure _headers and _redirects are in the dist folder
console.log("📄 Copying configuration files...");
try {
  if (fs.existsSync(path.join(__dirname, "public", "_headers"))) {
    fs.copyFileSync(
      path.join(__dirname, "public", "_headers"),
      path.join(__dirname, "dist", "_headers")
    );
    console.log("✅ Copied _headers file");
  } else {
    console.log("⚠️ No _headers file found");
  }

  if (fs.existsSync(path.join(__dirname, "public", "_redirects"))) {
    fs.copyFileSync(
      path.join(__dirname, "public", "_redirects"),
      path.join(__dirname, "dist", "_redirects")
    );
    console.log("✅ Copied _redirects file");
  } else {
    console.log("⚠️ No _redirects file found");
  }

  // Also copy pages.toml if it exists
  if (fs.existsSync(path.join(__dirname, "pages.toml"))) {
    fs.copyFileSync(
      path.join(__dirname, "pages.toml"),
      path.join(__dirname, "dist", "pages.toml")
    );
    console.log("✅ Copied pages.toml file");
  }
} catch (error) {
  console.error("❌ Error copying configuration files:", error);
}

// Step 3: Create a simple deployment verification file
console.log("📝 Creating deployment verification...");
const packageJson = require("./package.json");
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  version: packageJson.version,
  environment: process.env.NODE_ENV || "production",
};

try {
  fs.writeFileSync(
    path.join(__dirname, "dist", "deployment-info.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✅ Created deployment-info.json");
} catch (error) {
  console.error("❌ Error creating deployment info:", error);
}

console.log("✅ Build completed successfully!");
console.log("🚀 Ready for Cloudflare Pages deployment");
