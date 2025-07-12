import { Spin } from "antd";
import React, { Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./auth/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { useAuthStore } from "./stores/authStore";

// Lazy load pages for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));

// Admin pages
const AdminDashboard = React.lazy(
  () => import("./pages/admin/Dashboard/Dashboard")
);
const ProductsPage = React.lazy(
  () => import("./pages/admin/Products/ProductsPage")
);
const OrdersPage = React.lazy(() => import("./pages/admin/Orders/OrdersList"));
const InventoryPage = React.lazy(
  () => import("./pages/admin/Inventory/InventoryPage")
);
const CustomersPage = React.lazy(
  () => import("./pages/admin/Customers/CustomersPage")
);
const ReportsPage = React.lazy(
  () => import("./pages/admin/Reports/ReportsPage")
);
const SettingsPage = React.lazy(
  () => import("./pages/admin/Settings/SettingsPage")
);

// Cashier pages
const POSTerminalPage = React.lazy(() => import("./pages/cashier/POS/POSPage"));
const CashierOrdersPage = React.lazy(
  () => import("./pages/cashier/Orders/OrdersList")
);
const CashierCustomersPage = React.lazy(
  () => import("./pages/cashier/Customers/CustomersList")
);

// Common pages
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Helmet>
          <title>KhoAugment POS - Hệ thống bán hàng chuyên nghiệp</title>
          <meta
            name="description"
            content="Hệ thống bán hàng Point of Sale chuyên nghiệp cho thị trường Việt Nam"
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta name="theme-color" content="#1890ff" />
        </Helmet>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Spin size="large" />
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedRoute requiredRole="admin">
                  <InventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requiredRole="admin">
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Cashier Routes */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute requiredRole={["admin", "cashier"]}>
                  <POSTerminalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos/orders"
              element={
                <ProtectedRoute requiredRole={["admin", "cashier"]}>
                  <CashierOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos/customers"
              element={
                <ProtectedRoute requiredRole={["admin", "cashier"]}>
                  <CashierCustomersPage />
                </ProtectedRoute>
              }
            />

            {/* Main Route */}
            <Route path="/" element={<HomePage />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
