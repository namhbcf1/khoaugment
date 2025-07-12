/**
 * API Endpoints Constants
 * Central definition of all API endpoints used in the application
 *
 * @author KhoAugment POS
 * @version 1.0.0
 */

/**
 * Base API endpoint configuration
 */
export const API_BASE = {
  URL:
    import.meta.env.VITE_API_URL ||
    "https://khoaugment-backend.your-subdomain.workers.dev",
  PREFIX: "/api",
};

/**
 * Authentication API endpoints
 */
export const AUTH = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",
  ME: "/auth/me",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  CHANGE_PASSWORD: "/auth/change-password",
  STATUS: "/auth/status",
};

/**
 * Product API endpoints
 */
export const PRODUCTS = {
  BASE: "/products",
  DETAIL: (id: number | string) => `/products/${id}`,
  SEARCH: "/products/search",
  BARCODE: (barcode: string) => `/products/barcode/${barcode}`,
  CATEGORIES: "/products/categories",
  LOW_STOCK: "/products/low-stock",
};

/**
 * Category API endpoints
 */
export const CATEGORIES = {
  BASE: "/categories",
  DETAIL: (id: number | string) => `/categories/${id}`,
};

/**
 * Order API endpoints
 */
export const ORDERS = {
  BASE: "/orders",
  DETAIL: (id: number | string) => `/orders/${id}`,
  HISTORY: "/orders/history",
  STATUS: (id: number | string, status: string) =>
    `/orders/${id}/status/${status}`,
  RECEIPT: (id: number | string) => `/orders/${id}/receipt`,
  SEARCH: "/orders/search",
};

/**
 * Customer API endpoints
 */
export const CUSTOMERS = {
  BASE: "/customers",
  DETAIL: (id: number | string) => `/customers/${id}`,
  SEARCH: "/customers/search",
  LOYALTY: (id: number | string) => `/customers/${id}/loyalty`,
  ORDERS: (id: number | string) => `/customers/${id}/orders`,
};

/**
 * Inventory API endpoints
 */
export const INVENTORY = {
  BASE: "/inventory",
  MOVEMENTS: "/inventory/movements",
  MOVEMENT_DETAIL: (id: number | string) => `/inventory/movements/${id}`,
  STOCK_ADJUSTMENT: "/inventory/stock-adjustment",
  VALUATION: "/inventory/valuation",
};

/**
 * Reports API endpoints
 */
export const REPORTS = {
  SALES: "/reports/sales",
  INVENTORY: "/reports/inventory",
  PRODUCTS: "/reports/products",
  CUSTOMERS: "/reports/customers",
  REVENUE: "/reports/revenue",
  EXPORT: (type: string) => `/reports/export/${type}`,
};

/**
 * Analytics API endpoints
 */
export const ANALYTICS = {
  DASHBOARD: "/analytics/dashboard",
  SALES_CHART: "/analytics/sales-chart",
  TOP_PRODUCTS: "/analytics/top-products",
  TOP_CUSTOMERS: "/analytics/top-customers",
  INVENTORY_STATUS: "/analytics/inventory-status",
};

/**
 * User API endpoints
 */
export const USERS = {
  BASE: "/users",
  DETAIL: (id: number | string) => `/users/${id}`,
  PERMISSIONS: "/users/permissions",
  ROLES: "/users/roles",
  PROFILE: "/users/profile",
  ACTIVITY: "/users/activity",
};

/**
 * Settings API endpoints
 */
export const SETTINGS = {
  BASE: "/settings",
  BUSINESS: "/settings/business",
  TAXES: "/settings/taxes",
  PAYMENT_METHODS: "/settings/payment-methods",
  BACKUP: "/settings/backup",
  RESTORE: "/settings/restore",
};

/**
 * Upload API endpoints
 */
export const UPLOADS = {
  BASE: "/uploads",
  IMAGE: "/uploads/image",
  FILE: "/uploads/file",
  PRODUCT_IMAGE: "/uploads/product-image",
  PROFILE_IMAGE: "/uploads/profile-image",
};

/**
 * Utility API endpoints
 */
export const UTILS = {
  BARCODE_GENERATOR: "/utils/barcode",
  QR_GENERATOR: "/utils/qr",
};

/**
 * Combine all API endpoints
 */
export const API_ENDPOINTS = {
  AUTH,
  PRODUCTS,
  CATEGORIES,
  ORDERS,
  CUSTOMERS,
  INVENTORY,
  REPORTS,
  ANALYTICS,
  USERS,
  SETTINGS,
  UPLOADS,
  UTILS,
};

export default API_ENDPOINTS;
