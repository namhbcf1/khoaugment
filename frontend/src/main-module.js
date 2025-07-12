// This wrapper ensures proper module loading in strict environments like Cloudflare Pages
// It normalizes how modules are loaded and provides fallbacks for unsupported features

// Make sure we have global objects defined
window.process = window.process || { env: {} };
window.global = window || {};

// Safety check for module loading
const loadModule = async (url) => {
  try {
    return await import(url);
  } catch (e) {
    console.error(`Failed to load module: ${url}`, e);
    // Show an error message to the user if module loading fails
    const rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;">
          <h2 style="color: #cc0000;">Unable to load application</h2>
          <p>There was a problem loading the required resources. This might be due to network issues or an unsupported browser.</p>
          <p>Please try:</p>
          <ul>
            <li>Refreshing the page</li>
            <li>Clearing your browser cache</li>
            <li>Using a modern browser like Chrome, Firefox, or Edge</li>
          </ul>
          <p><button onclick="window.location.reload()">Refresh Page</button></p>
          <details>
            <summary>Technical details</summary>
            <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${e.message}</pre>
          </details>
        </div>
      `;
    }
    return null;
  }
};

// Load the main application
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // This will import the main application entry point
    const mainModule = await loadModule("./src/main.tsx");
    console.log("Application loaded successfully");
  } catch (error) {
    console.error("Failed to load the application:", error);
  }
});

// Export something to make this a valid ES module
export default {
  name: "KhoAugment POS",
  version: "1.0.0",
};
