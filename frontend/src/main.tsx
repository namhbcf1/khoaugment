import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Global error handler for unhandled promises
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
});

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

// Define version globally if not already defined
// Define window app version
interface WindowWithAppVersion extends Window {
  __APP_VERSION__?: string;
}

if (typeof (window as WindowWithAppVersion).__APP_VERSION__ === "undefined") {
  (window as WindowWithAppVersion).__APP_VERSION__ = "1.0.0";
}

// Ensure environment variables are available
console.log(
  "🚀 App starting with version:",
  (window as WindowWithAppVersion).__APP_VERSION__ || "unknown"
);
console.log("🌍 Environment:", import.meta.env.MODE || "development");

// Mount React app with error boundary
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
