import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h1>❌ Something went wrong!</h1>
          <p>
            The application encountered an error and could not load properly.
          </p>
          <details style={{ marginTop: "20px", textAlign: "left" }}>
            <summary>Error Details (for developers)</summary>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
              }}
            >
              {this.state.error?.stack ||
                this.state.error?.message ||
                "Unknown error"}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
if (typeof window.__APP_VERSION__ === "undefined") {
  window.__APP_VERSION__ = "1.0.0";
}

// Ensure environment variables are available
console.log(
  "🚀 App starting with version:",
  window.__APP_VERSION__ || "unknown"
);
console.log("🌍 Environment:", process.env.NODE_ENV || "development");

// Mount React app with error boundary
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
