import { App as AntApp, ConfigProvider } from "antd";
import React, { Suspense, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const AdminLayout = React.lazy(() => import("./components/layout/AdminLayout"));
const CashierLayout = React.lazy(
  () => import("./components/layout/CashierLayout")
);
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

// Admin pages
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const ProductsPage = React.lazy(() => import("./pages/admin/ProductsPage"));
const CategoriesPage = React.lazy(() => import("./pages/admin/CategoriesPage"));
const OrdersPage = React.lazy(() => import("./pages/admin/OrdersPage"));
const CustomersPage = React.lazy(() => import("./pages/admin/CustomersPage"));
const SettingsPage = React.lazy(() => import("./pages/admin/SettingsPage"));
const UsersPage = React.lazy(() => import("./pages/admin/UsersPage"));
const ReportsPage = React.lazy(() => import("./pages/admin/ReportsPage"));

// Cashier pages
const POSPage = React.lazy(() => import("./pages/cashier/POSPage"));
const OrderHistoryPage = React.lazy(
  () => import("./pages/cashier/OrderHistoryPage")
);
const CustomerLookupPage = React.lazy(
  () => import("./pages/cashier/CustomerLookupPage")
);

const App: React.FC = () => {
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider>
      <AntApp>
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
        </Helmet>

        <Suspense fallback={null}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate
                    to={user.role === "cashier" ? "/cashier" : "/admin"}
                  />
                ) : (
                  <LoginPage />
                )
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                user && user.role === "admin" ? (
                  <AdminLayout />
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* Cashier routes */}
            <Route
              path="/cashier"
              element={
                user && (user.role === "admin" || user.role === "cashier") ? (
                  <CashierLayout />
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              <Route index element={<POSPage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="customers" element={<CustomerLookupPage />} />
            </Route>

            {/* Redirect from root based on user role */}
            <Route
              path="/"
              element={
                user ? (
                  user.role === "cashier" ? (
                    <Navigate to="/cashier" />
                  ) : (
                    <Navigate to="/admin" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
