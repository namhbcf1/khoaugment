/**
 * Lazy Loading Configuration
 * Implements code splitting for better performance
 */

import { lazy } from "react";

// Export lazy loading utility function without loading indicator
export const lazyLoad = (importFunc) => {
  return lazy(importFunc);
};

// Export component preloader function
export const preloadComponent = (importFunc) => {
  importFunc();
};

// Lazy loaded components
export const LazyDashboard = lazy(() => import("../pages/Dashboard"));
export const LazyAdminDashboard = lazy(
  () => import("../pages/admin/Dashboard")
);
export const LazyCheckoutTerminal = lazy(
  () => import("../components/POS/CheckoutTerminal")
);
export const LazyInventoryDashboard = lazy(
  () => import("../pages/admin/Inventory/InventoryDashboard")
);
export const LazyProductManagement = lazy(
  () => import("../pages/admin/Products/ProductManagement")
);
export const LazyCustomerManagement = lazy(
  () => import("../pages/admin/Customers/CustomerManagement")
);
export const LazyOrderManagement = lazy(
  () => import("../pages/admin/Orders/OrderManagement")
);
export const LazyUserManagement = lazy(
  () => import("../pages/admin/Users/UserManagement")
);
export const LazyAnalyticsDashboard = lazy(
  () => import("../pages/admin/Analytics/AnalyticsDashboard")
);
export const LazyReportsOverview = lazy(
  () => import("../pages/admin/Reports/ReportsOverview")
);
export const LazyGamificationConfig = lazy(
  () => import("../pages/admin/Gamification/GamificationConfig")
);
export const LazyPerformanceOverview = lazy(
  () => import("../pages/admin/Performance/PerformanceOverview")
);
export const LazySecuritySettings = lazy(
  () => import("../pages/admin/Settings/SecuritySettings")
);
export const LazySystemSettings = lazy(
  () => import("../pages/admin/Settings/SystemSettings")
);
export const LazyPaymentGateway = lazy(
  () => import("../components/Payment/PaymentGateway")
);
export const LazySecurityDashboard = lazy(
  () => import("../components/Security/SecurityDashboard")
);
export const LazyPerformanceDashboard = lazy(
  () => import("../components/Performance/PerformanceDashboard")
);

// Wrapped components with loading states
export const Dashboard = lazyLoad(() => LazyDashboard);
export const AdminDashboard = lazyLoad(() => LazyAdminDashboard);
export const CheckoutTerminal = lazyLoad(() => LazyCheckoutTerminal);
export const InventoryDashboard = lazyLoad(() => LazyInventoryDashboard);
export const ProductManagement = lazyLoad(() => LazyProductManagement);
export const CustomerManagement = lazyLoad(() => LazyCustomerManagement);
export const OrderManagement = lazyLoad(() => LazyOrderManagement);
export const UserManagement = lazyLoad(() => LazyUserManagement);
export const AnalyticsDashboard = lazyLoad(() => LazyAnalyticsDashboard);
export const ReportsOverview = lazyLoad(() => LazyReportsOverview);
export const GamificationConfig = lazyLoad(() => LazyGamificationConfig);
export const PerformanceOverview = lazyLoad(() => LazyPerformanceOverview);
export const SecuritySettings = lazyLoad(() => LazySecuritySettings);
export const SystemSettings = lazyLoad(() => LazySystemSettings);
export const PaymentGateway = lazyLoad(() => LazyPaymentGateway);
export const SecurityDashboard = lazyLoad(() => LazySecurityDashboard);
export const PerformanceDashboard = lazyLoad(() => LazyPerformanceDashboard);

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  LazyDashboard;
  LazyCheckoutTerminal;
  LazyAdminDashboard;
};

// Preload components based on user role
export const preloadByRole = (userRole) => {
  switch (userRole) {
    case "admin":
      LazyAdminDashboard;
      LazyInventoryDashboard;
      LazyProductManagement;
      LazyUserManagement;
      LazyAnalyticsDashboard;
      LazySecuritySettings;
      LazyPerformanceDashboard;
      break;
    case "cashier":
      LazyCheckoutTerminal;
      LazyProductManagement;
      LazyCustomerManagement;
      break;
    case "staff":
      LazyProductManagement;
      LazyInventoryDashboard;
      LazyCustomerManagement;
      break;
    case "manager":
      LazyAdminDashboard;
      LazyAnalyticsDashboard;
      LazyReportsOverview;
      LazyPerformanceOverview;
      break;
    default:
      LazyDashboard;
  }
};

// Bundle analysis helper
export const getBundleInfo = () => {
  if (typeof window !== "undefined" && window.performance) {
    const resources = performance.getEntriesByType("resource");
    const jsResources = resources.filter(
      (resource) =>
        resource.name.includes(".js") && !resource.name.includes("node_modules")
    );

    const totalSize = jsResources.reduce(
      (sum, resource) => sum + (resource.transferSize || 0),
      0
    );

    return {
      totalBundles: jsResources.length,
      totalSize: totalSize,
      averageSize: totalSize / jsResources.length,
      bundles: jsResources.map((resource) => ({
        name: resource.name.split("/").pop(),
        size: resource.transferSize || 0,
        loadTime: resource.duration || 0,
      })),
    };
  }

  return null;
};

// Performance optimization recommendations
export const getOptimizationRecommendations = () => {
  const bundleInfo = getBundleInfo();
  const recommendations = [];

  if (bundleInfo) {
    if (bundleInfo.totalSize > 1000000) {
      // 1MB
      recommendations.push({
        type: "Bundle Size",
        message: "Consider further code splitting to reduce bundle size",
        priority: "high",
      });
    }

    if (bundleInfo.totalBundles > 20) {
      recommendations.push({
        type: "Bundle Count",
        message:
          "Too many bundles may impact performance, consider bundling strategy",
        priority: "medium",
      });
    }

    const slowBundles = bundleInfo.bundles.filter(
      (bundle) => bundle.loadTime > 1000
    );
    if (slowBundles.length > 0) {
      recommendations.push({
        type: "Load Time",
        message: `${slowBundles.length} bundles are loading slowly (>1s)`,
        priority: "high",
      });
    }
  }

  return recommendations;
};

// Dynamic import helper with error handling
export const dynamicImport = async (importFunction, componentName) => {
  try {
    const startTime = performance.now();
    const module = await importFunction();
    const loadTime = performance.now() - startTime;

    console.log(
      `Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`
    );

    return module;
  } catch (error) {
    console.error(`Failed to load component ${componentName}:`, error);
    throw error;
  }
};

// Route-based preloading
export const preloadRouteComponents = (routes) => {
  routes.forEach((route) => {
    if (route.preload && typeof route.component === "function") {
      route.component();
    }
  });
};

export default {
  Dashboard,
  AdminDashboard,
  CheckoutTerminal,
  InventoryDashboard,
  ProductManagement,
  CustomerManagement,
  OrderManagement,
  UserManagement,
  AnalyticsDashboard,
  ReportsOverview,
  GamificationConfig,
  PerformanceOverview,
  SecuritySettings,
  SystemSettings,
  PaymentGateway,
  SecurityDashboard,
  PerformanceDashboard,
  preloadCriticalComponents,
  preloadByRole,
  getBundleInfo,
  getOptimizationRecommendations,
  dynamicImport,
  preloadRouteComponents,
};
