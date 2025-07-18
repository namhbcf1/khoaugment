import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// Custom manifest plugin cho Cloudflare với MIME type handling
const cloudflareManifestPlugin = () => {
  return {
    name: "vite:cf-manifest",
    generateBundle(_, bundle) {
      // Generate a custom asset-manifest.json with content types
      const manifest = {};
      const contentTypes = {};

      for (const fileName in bundle) {
        const file = bundle[fileName];
        const ext = path.extname(fileName);
        let contentType = "text/plain";

        // Map file extensions to MIME types
        switch (ext) {
          case ".js":
          case ".mjs":
            contentType = "application/javascript; charset=utf-8";
            break;
          case ".css":
            contentType = "text/css; charset=utf-8";
            break;
          case ".json":
            contentType = "application/json; charset=utf-8";
            break;
          case ".html":
            contentType = "text/html; charset=utf-8";
            break;
          case ".svg":
            contentType = "image/svg+xml";
            break;
          case ".png":
            contentType = "image/png";
            break;
          case ".jpg":
          case ".jpeg":
            contentType = "image/jpeg";
            break;
          case ".webp":
            contentType = "image/webp";
            break;
          case ".woff":
            contentType = "font/woff";
            break;
          case ".woff2":
            contentType = "font/woff2";
            break;
        }

        manifest[fileName] = {
          contentType,
          path: fileName,
        };

        // Build pattern-based content type mapping
        const pattern = ext ? `*${ext}` : fileName;
        contentTypes[pattern] = contentType;
      }

      // Add the manifest to the bundle
      this.emitFile({
        type: "asset",
        fileName: "cf-asset-manifest.json",
        source: JSON.stringify(manifest, null, 2),
      });

      // Generate a content-types.json file for reference
      this.emitFile({
        type: "asset",
        fileName: ".well-known/content-types.json",
        source: JSON.stringify(contentTypes, null, 2),
      });
    },
    closeBundle() {
      // Ensure the dist directory exists
      if (!fs.existsSync("dist")) {
        return;
      }

      // Ensure .well-known directory exists
      if (!fs.existsSync("dist/.well-known")) {
        fs.mkdirSync("dist/.well-known", { recursive: true });
      }

      // Create a mime.types file for Cloudflare
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

      fs.writeFileSync("dist/.well-known/mime.types", mimeTypesContent);
    },
  };
};

// Fix HTML plugin
const fixHtmlPlugin = () => {
  return {
    name: "vite:fix-html",
    generateBundle(_, bundle) {
      // Check if index.html exists in the bundle
      const indexHtml = bundle["index.html"];
      if (indexHtml) {
        // Add a special comment to enforce HTML MIME type
        let content = indexHtml.source;
        if (typeof content === "string") {
          content = content.replace(
            "<!DOCTYPE html>",
            "<!DOCTYPE html>\n<!-- MIME Type: text/html -->\n"
          );
          indexHtml.source = content;
        }
      }
    },
  };
};

// PWA plugin configuration
const pwaPlugin = () => {
  return {
    name: "vite-pwa-plugin",
    generateBundle() {
      // Generate a basic service worker
      const swContent = `
// Service Worker for KhoAugment POS
const CACHE_NAME = 'khoaugment-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/assets/index.css',
  '/assets/index.js'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses or API calls
            if (!response || response.status !== 200 || event.request.url.includes('/api/')) {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
      `;

      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: swContent,
      });
    },
  };
};

export default defineConfig(({ command, mode }) => {
  // Load env files
  const env = loadEnv(mode, process.cwd(), "");

  // Package version from package.json
  const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
  const version = packageJson.version || "1.0.0";

  return {
    // Base URL is important for asset paths - must be "/" for Cloudflare Pages
    base: "/",
    plugins: [
      react({
        // Ensure React works in production mode
        jsxRuntime: "automatic",
      }),
      cloudflareManifestPlugin(),
      fixHtmlPlugin(),
      pwaPlugin(),
    ],
    define: {
      // Fix undefined version issue
      __APP_VERSION__: JSON.stringify(version),
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env": JSON.stringify(process.env),
      global: "globalThis",
      __DEV__: JSON.stringify(mode === "development"),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@styles": path.resolve(__dirname, "./src/styles"),
      },
      extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
    },
    build: {
      target: "es2020",
      minify: "terser",
      sourcemap: false,
      outDir: "dist",
      assetsDir: "assets",
      // Important settings for Cloudflare Pages
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      modulePreload: false, // Disable modulePreload as it can cause MIME type issues
      // Make sure all modules are valid JavaScript modules
      rollupOptions: {
        output: {
          format: "es",
          // Make paths absolute to avoid problems with Cloudflare
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split(".").at(1);
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff|woff2|ttf|otf|eot/i.test(extType)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          // Ensure every module has the right MIME type
          hoistTransitiveImports: false,
          // Chunking strategy
          manualChunks: (id) => {
            // React ecosystem
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom")
            ) {
              return "react-vendor";
            }

            // React Router
            if (id.includes("node_modules/react-router")) {
              return "router";
            }

            // Ant Design core
            if (id.includes("node_modules/antd")) {
              return "antd-core";
            }

            // Ant Design icons (separate chunk due to size)
            if (id.includes("node_modules/@ant-design/icons")) {
              return "antd-icons";
            }

            // Charts library (Recharts is large)
            if (
              id.includes("node_modules/recharts") ||
              id.includes("node_modules/d3-")
            ) {
              return "charts";
            }

            // Date/time utilities
            if (
              id.includes("node_modules/dayjs") ||
              id.includes("node_modules/moment")
            ) {
              return "datetime";
            }

            // HTTP client
            if (id.includes("node_modules/axios")) {
              return "http";
            }

            // Utility libraries
            if (
              id.includes("node_modules/lodash") ||
              id.includes("node_modules/ramda")
            ) {
              return "utils";
            }

            // React Query
            if (id.includes("node_modules/@tanstack/react-query")) {
              return "react-query";
            }

            // Split large vendor libraries individually
            if (
              id.includes("node_modules/@babel/") ||
              id.includes("node_modules/core-js/")
            ) {
              return "polyfills";
            }

            if (
              id.includes("node_modules/react-router-dom/") ||
              id.includes("node_modules/history/")
            ) {
              return "router";
            }

            if (
              id.includes("node_modules/react-query/") ||
              id.includes("node_modules/@tanstack/")
            ) {
              return "react-query";
            }

            if (
              id.includes("node_modules/i18next/") ||
              id.includes("node_modules/react-i18next/")
            ) {
              return "i18n";
            }

            // Other vendor libraries - split into smaller chunks
            if (id.includes("node_modules/")) {
              // Split by first level package name to avoid huge vendor chunk
              const chunks = id.split("node_modules/")[1].split("/")[0];
              if (chunks.startsWith("@")) {
                // Scoped packages
                const scopedName = id
                  .split("node_modules/")[1]
                  .split("/")
                  .slice(0, 2)
                  .join("-");
                return `vendor-${scopedName.replace("@", "")}`;
              }
              return `vendor-${chunks}`;
            }

            // App pages - split by feature
            if (id.includes("/src/pages/admin/")) {
              return "admin-pages";
            }

            if (
              id.includes("/src/pages/cashier/") ||
              id.includes("/src/pages/POS")
            ) {
              return "pos-pages";
            }

            if (id.includes("/src/pages/customer/")) {
              return "customer-pages";
            }

            if (id.includes("/src/pages/staff/")) {
              return "staff-pages";
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      cors: true,
    },
    preview: {
      port: 4173,
      strictPort: false,
      cors: true,
    },
  };
});
