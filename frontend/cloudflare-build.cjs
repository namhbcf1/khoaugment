#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Starting Cloudflare optimized build process");

// Ensure dist directory exists
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy configuration files to dist directory
console.log("📂 Copying configuration files to dist directory");

// Copy _headers file
const headersFile = path.join(__dirname, "public", "_headers");
const headersDistFile = path.join(distDir, "_headers");
if (fs.existsSync(headersFile)) {
  fs.copyFileSync(headersFile, headersDistFile);
  console.log("✅ Copied _headers file");
}

// Copy _routes.json file
const routesFile = path.join(__dirname, "public", "_routes.json");
const routesDistFile = path.join(distDir, "_routes.json");
if (fs.existsSync(routesFile)) {
  fs.copyFileSync(routesFile, routesDistFile);
  console.log("✅ Copied _routes.json file");
}

// Create .cloudflare directory in dist
const cloudflareDir = path.join(distDir, ".cloudflare");
if (!fs.existsSync(cloudflareDir)) {
  fs.mkdirSync(cloudflareDir, { recursive: true });
}

// Copy Cloudflare Pages configuration if exists
const cloudflareConfigFile = path.join(__dirname, ".cloudflare", "pages.json");
const cloudflareDistFile = path.join(cloudflareDir, "pages.json");
if (fs.existsSync(cloudflareConfigFile)) {
  fs.copyFileSync(cloudflareConfigFile, cloudflareDistFile);
  console.log("✅ Copied Cloudflare Pages configuration");
} else {
  // Create a basic pages.json if it doesn't exist
  const basicConfig = {
    name: "khoaugment",
    headers: {
      "/*.js": {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      "/*.css": {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      "/assets/*.js": {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      "/assets/*.css": {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  };
  fs.writeFileSync(cloudflareDistFile, JSON.stringify(basicConfig, null, 2));
  console.log("✅ Created basic Cloudflare Pages configuration");
}

// Create a specialized module loading script
console.log("📝 Creating module loading script");
const moduleLoaderScript = `
// Module loader with MIME type handling
(function() {
  function loadModule(url, retry = false) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = url;
      script.onload = () => resolve();
      script.onerror = (error) => {
        console.error(\`Failed to load module: \${url}\`, error);
        
        if (!retry) {
          console.log(\`Retrying with alternative MIME type for: \${url}\`);
          // Add timestamp to bust cache
          const retryUrl = \`\${url}?t=\${Date.now()}\`;
          loadModule(retryUrl, true).then(resolve).catch(reject);
        } else {
          // Create a helpful error message
          const errorMsg = document.createElement('div');
          errorMsg.style.padding = '20px';
          errorMsg.style.margin = '20px';
          errorMsg.style.backgroundColor = '#fff0f0';
          errorMsg.style.border = '1px solid #ff0000';
          errorMsg.style.borderRadius = '4px';
          errorMsg.innerHTML = \`
            <h3>Module Loading Error</h3>
            <p>Failed to load module: \${url}</p>
            <p>This might be due to incorrect MIME type configuration on the server.</p>
            <p>Please check the network tab in your browser's developer tools.</p>
            <button onclick="location.reload()">Retry</button>
          \`;
          document.body.prepend(errorMsg);
          reject(error);
        }
      };
      document.head.appendChild(script);
    });
  }

  window.loadAppModule = function() {
    // Show loading indicator
    const loading = document.createElement('div');
    loading.id = 'app-loading';
    loading.style.position = 'fixed';
    loading.style.top = '0';
    loading.style.left = '0';
    loading.style.width = '100%';
    loading.style.height = '100%';
    loading.style.backgroundColor = '#f5f5f5';
    loading.style.display = 'flex';
    loading.style.alignItems = 'center';
    loading.style.justifyContent = 'center';
    loading.style.flexDirection = 'column';
    loading.style.zIndex = '9999';
    loading.innerHTML = \`
      <div style="text-align: center;">
        <div style="border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 20px; font-family: sans-serif;">Đang tải ứng dụng...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    \`;
    document.body.appendChild(loading);

    // Try to load the main entry point
    return loadModule('/assets/index.js')
      .catch(() => loadModule('/src/main.js'))
      .catch(() => loadModule('/index.js'))
      .finally(() => {
        // Remove loading indicator
        const loadingEl = document.getElementById('app-loading');
        if (loadingEl) {
          setTimeout(() => {
            loadingEl.style.opacity = '0';
            loadingEl.style.transition = 'opacity 0.5s';
            setTimeout(() => loadingEl.remove(), 500);
          }, 500);
        }
      });
  };
})();
`;

fs.writeFileSync(path.join(distDir, "module-loader.js"), moduleLoaderScript);
console.log("✅ Created module-loader.js");

// Create fallback HTML files
const fallbackHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KhoAugment POS</title>
  <meta name="description" content="KhoAugment POS - Hệ thống quản lý bán hàng">
  <link rel="icon" href="/favicon.ico">
  <!-- Preload critical assets -->
  <link rel="preload" href="/module-loader.js" as="script">
  <script type="text/javascript">
    // Handle loading errors
    window.addEventListener('error', function(e) {
      console.error('Global error handler:', e);
      if (e.target && (e.target.src || e.target.href)) {
        console.log('Asset failed to load:', e.target);
      }
    });
  </script>
  <script src="/module-loader.js"></script>
</head>
<body>
  <div id="root"></div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      window.loadAppModule().catch(err => {
        console.error('Failed to load application:', err);
        document.body.innerHTML = '<div style="padding: 20px; text-align: center;">' +
          '<h2>Không thể tải ứng dụng</h2>' +
          '<p>Vui lòng thử lại hoặc liên hệ quản trị viên.</p>' +
          '<button onclick="location.reload()">Tải lại trang</button>' +
          '</div>';
      });
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, "200.html"), fallbackHtml);
fs.writeFileSync(path.join(distDir, "404.html"), fallbackHtml);
console.log("✅ Created fallback HTML files");

// Create .well-known directory with MIME types
const wellKnownDir = path.join(distDir, ".well-known");
if (!fs.existsSync(wellKnownDir)) {
  fs.mkdirSync(wellKnownDir, { recursive: true });
}

// Create mime.types file
const mimeTypesContent = `# MIME types for Cloudflare Pages
application/javascript  js mjs
text/css                css
application/json        json
text/html               html htm
image/svg+xml           svg
image/png               png
image/jpeg              jpg jpeg
image/webp              webp
font/woff               woff
font/woff2              woff2
application/manifest+json  webmanifest
`;

fs.writeFileSync(path.join(wellKnownDir, "mime.types"), mimeTypesContent);
console.log("✅ Created .well-known/mime.types");

// Run the standard build
console.log("🔨 Running standard build process");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build completed successfully");
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
}

console.log("🎉 Cloudflare optimized build completed successfully!");
