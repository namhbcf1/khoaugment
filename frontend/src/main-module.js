// This wrapper ensures proper module loading in strict environments like Cloudflare Pages
// It normalizes how modules are loaded and provides fallbacks for unsupported features

// Make sure we have global objects defined
window.process = window.process || { env: {} };
window.global = window || {};

// Track loading status
let mainModuleLoaded = false;
let loadingAttempts = 0;
const MAX_ATTEMPTS = 3;

// Collection of error messages
const errors = [];

// Safety check for module loading with multiple fallbacks
const loadModule = async (url, attempt = 0) => {
  try {
    loadingAttempts++;
    console.log(`Attempting to load module (${attempt}): ${url}`);
    return await import(url);
  } catch (e) {
    errors.push({
      url,
      attempt,
      error: e.message,
      timestamp: new Date().toISOString(),
    });

    console.error(`Failed to load module (attempt ${attempt}): ${url}`, e);

    // Try alternate loading methods if initial attempt failed
    if (attempt === 0) {
      try {
        // Try with explicit MIME type (for browsers that are strict)
        const script = document.createElement("script");
        script.type = "module";
        script.src = url;
        script.setAttribute("data-retry", "true");

        // Create a promise that resolves when the script loads
        const loadPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            console.log(`Script loaded via DOM injection: ${url}`);
            resolve(window.mainModuleExports || {});
          };
          script.onerror = (error) => {
            console.error(
              `Failed to load script via DOM injection: ${url}`,
              error
            );
            reject(error);
          };
        });

        // Append the script to the document
        document.head.appendChild(script);
        return await loadPromise;
      } catch (domError) {
        console.error(`DOM script injection failed for ${url}`, domError);
        errors.push({
          url,
          method: "dom-injection",
          error: domError.message,
          timestamp: new Date().toISOString(),
        });

        // Fall back to default export if all else fails
        if (attempt < MAX_ATTEMPTS) {
          return loadModule(url, attempt + 1);
        } else {
          console.warn(
            `All loading attempts failed for ${url}, using fallback`
          );
          return { default: {} };
        }
      }
    } else if (attempt < MAX_ATTEMPTS) {
      // Try with a small delay before retry
      await new Promise((resolve) => setTimeout(resolve, 100));
      return loadModule(url, attempt + 1);
    } else {
      // Show an error message to the user if module loading fails after all attempts
      showErrorMessage(e);
      return { default: {} };
    }
  }
};

// Helper function to display error message
const showErrorMessage = (error) => {
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;">
        <h2 style="color: #cc0000;">Không thể tải ứng dụng</h2>
        <p>Đã xảy ra lỗi khi tải các tài nguyên cần thiết. Điều này có thể do sự cố mạng hoặc trình duyệt không được hỗ trợ.</p>
        <p>Vui lòng thử:</p>
        <ul>
          <li>Làm mới trang</li>
          <li>Xóa bộ nhớ cache của trình duyệt</li>
          <li>Sử dụng trình duyệt hiện đại như Chrome, Firefox hoặc Edge</li>
        </ul>
        <p><button onclick="window.location.reload()">Làm mới trang</button></p>
        <details>
          <summary>Chi tiết kỹ thuật</summary>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.message}</pre>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto; max-height: 200px; font-size: 12px;">${JSON.stringify(errors, null, 2)}</pre>
        </details>
      </div>
    `;
  }
};

// Load the main application with retry mechanism
const loadApplication = async () => {
  if (mainModuleLoaded) return;

  try {
    // First try to load via direct import
    console.log("Loading main application module...");
    const mainModule = await loadModule("./src/main.tsx");
    mainModuleLoaded = true;
    console.log("Application loaded successfully");
  } catch (error) {
    console.error(
      "Failed to load the application after multiple attempts:",
      error
    );
    showErrorMessage(error);
  }
};

// Load on DOMContentLoaded
document.addEventListener("DOMContentLoaded", loadApplication);

// Also try to load after window load as a fallback
window.addEventListener("load", () => {
  if (!mainModuleLoaded) {
    console.log("Attempting to load application after window load event");
    loadApplication();
  }
});

// Add error handler for any unhandled errors
window.addEventListener(
  "error",
  (event) => {
    if (event.target && event.target.tagName === "SCRIPT") {
      console.error("Script error:", event);
      errors.push({
        type: "script-error",
        src: event.target.src,
        error: event.error ? event.error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });

      // Prevent default error handling
      event.preventDefault();

      // Try to reload the application if it's a module error
      if (event.target.type === "module" && !mainModuleLoaded) {
        console.log("Module script error, attempting to reload");
        loadApplication();
      }
    }
  },
  true
);

// Export something to make this a valid ES module
export default {
  name: "KhoAugment POS",
  version: "1.0.0",
  errors,
};
