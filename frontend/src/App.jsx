import { App as AntApp, ConfigProvider, Spin } from "antd";
import viVN from "antd/locale/vi_VN";
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "./styles/globals.css";

// Lazy load page components for better performance
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products/ProductList"));
const AdminInventory = lazy(() =>
  import("./pages/admin/Inventory/InventoryManagement")
);
const AdminOrders = lazy(() => import("./pages/admin/Orders/OrderList"));
const AdminCustomers = lazy(() =>
  import("./pages/admin/Customers/CustomerList")
);
const AdminReports = lazy(() =>
  import("./pages/admin/Reports/ReportsDashboard")
);
const AdminSettings = lazy(() => import("./pages/admin/Settings/SettingsPage"));
const AdminStaff = lazy(() => import("./pages/admin/Staff/StaffList"));

// Cashier Pages
const CashierPOS = lazy(() => import("./pages/cashier/POS/POSTerminal"));
const CashierOrders = lazy(() => import("./pages/cashier/Orders/OrderHistory"));
const CashierCustomers = lazy(() =>
  import("./pages/cashier/Customers/CustomerSearch")
);

// Staff Pages
const StaffDashboard = lazy(() =>
  import("./pages/staff/Dashboard/StaffDashboard")
);
const StaffSales = lazy(() => import("./pages/staff/Sales/SalesSummary"));
const StaffProfile = lazy(() => import("./pages/staff/Profile/StaffProfile"));

// Error Pages
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const ServerError = lazy(() => import("./pages/ServerError"));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <Spin size="large" />
    <p>Đang tải...</p>
  </div>
);

// Optimized theme - minimal effects for better performance
const theme = {
  token: {
    colorPrimary: "#1890ff",
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      headerBg: "#001529",
      siderBg: "#001529",
    },
    Menu: {
      darkItemBg: "#001529",
      darkSubMenuItemBg: "#000c17",
    },
  },
};

const App = () => {
  console.log("🚀 KhoChuan POS App initializing...");

  return (
    <ErrorBoundary>
      <ConfigProvider locale={viVN} theme={theme}>
        <AntApp>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin/login" element={<Login />} />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRoles={["admin", "manager"]}>
                        <Navigate to="/admin/dashboard" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredRoles={["admin", "manager"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products/*"
                    element={
                      <ProtectedRoute requiredRoles={["admin", "manager"]}>
                        <AdminProducts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/inventory/*"
                    element={
                      <ProtectedRoute requiredRoles={["admin", "manager"]}>
                        <AdminInventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders/*"
                    element={
                      <ProtectedRoute requiredRoles={["admin", "manager"]}>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/customers/*"
                    element={
                      <ProtectedRoute requiredRoles={["admin", "manager"]}>
                        <AdminCustomers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports/*"
                    element={
                      <ProtectedRoute requiredRoles={["admin", "manager"]}>
                        <AdminReports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/staff/*"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminStaff />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings/*"
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Cashier Routes */}
                  <Route
                    path="/cashier"
                    element={
                      <ProtectedRoute
                        requiredRoles={["cashier", "admin", "manager"]}
                      >
                        <Navigate to="/cashier/pos" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cashier/pos/*"
                    element={
                      <ProtectedRoute
                        requiredRoles={["cashier", "admin", "manager"]}
                      >
                        <CashierPOS />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cashier/orders/*"
                    element={
                      <ProtectedRoute
                        requiredRoles={["cashier", "admin", "manager"]}
                      >
                        <CashierOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cashier/customers/*"
                    element={
                      <ProtectedRoute
                        requiredRoles={["cashier", "admin", "manager"]}
                      >
                        <CashierCustomers />
                      </ProtectedRoute>
                    }
                  />

                  {/* Staff Routes */}
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute
                        requiredRoles={["staff", "cashier", "admin", "manager"]}
                      >
                        <Navigate to="/staff/dashboard" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff/dashboard"
                    element={
                      <ProtectedRoute
                        requiredRoles={["staff", "cashier", "admin", "manager"]}
                      >
                        <StaffDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff/sales/*"
                    element={
                      <ProtectedRoute
                        requiredRoles={["staff", "cashier", "admin", "manager"]}
                      >
                        <StaffSales />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff/profile/*"
                    element={
                      <ProtectedRoute
                        requiredRoles={["staff", "cashier", "admin", "manager"]}
                      >
                        <StaffProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Error Routes */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/server-error" element={<ServerError />} />
                  <Route path="/404" element={<NotFound />} />

                  {/* Default Routes */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
