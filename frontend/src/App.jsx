import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import CashierLayout from "./components/layout/CashierLayout";
import MainLayout from "./components/layout/MainLayout";

// Pages
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import POSTerminal from "./pages/POS";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Main application component
const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(true); // For demo, set to true

  useEffect(() => {
    // Initialize app and check version
    try {
      console.log(
        "App initializing with version:",
        window.__APP_VERSION__ || "unknown"
      );

      // Simulate API check or authentication
      setTimeout(() => {
        setLoaded(true);
      }, 1000);
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

  // Render the application with routing
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!authenticated ? <Login /> : <Navigate to="/" />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={authenticated ? <AdminLayout /> : <Navigate to="/login" />}
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Cashier Routes */}
          <Route
            path="/pos"
            element={
              authenticated ? <CashierLayout /> : <Navigate to="/login" />
            }
          >
            <Route index element={<POSTerminal />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
          </Route>

          {/* Main Routes */}
          <Route
            path="/"
            element={authenticated ? <MainLayout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
