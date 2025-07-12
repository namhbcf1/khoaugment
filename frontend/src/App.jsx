import { ConfigProvider } from "antd";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";

// Main application component
const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading and version checking
    try {
      console.log(
        "App initializing with version:",
        window.__APP_VERSION__ || "unknown"
      );

      // Mark as loaded
      setLoaded(true);
    } catch (err) {
      console.error("Error during app initialization:", err);
      setError(err.message || "Unknown error during initialization");
    }
  }, []);

  // Show error state if something went wrong
  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2 style={{ color: "#ff4d4f" }}>Application Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            background: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          Reload Application
        </button>
      </div>
    );
  }

  // Show a loading state
  if (!loaded) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #1890ff",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              margin: "0 auto",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: "20px" }}>Loading application...</p>
        </div>
      </div>
    );
  }

  // Render the application
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Router>
        <div className="app-container">
          <header className="app-header">
            <h1>Kho Augment - POS System</h1>
            <p>Welcome to the POS system</p>
          </header>
          <main className="app-content">
            <p>Application content goes here</p>
          </main>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;
