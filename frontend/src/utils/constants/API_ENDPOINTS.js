/**
 * API Endpoints Constants
 * Defines all API endpoints used by the application
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

// Base API URL - will be different for development and production
const BASE_URL = import.meta.env.VITE_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.khochuanpos.com/api/v1'
    : 'http://localhost:8787/api/v1');

// Authentication endpoints
const AUTH = {
  LOGIN: `${BASE_URL}/auth/login`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
  REGISTER: `${BASE_URL}/auth/register`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
  VERIFY_EMAIL: `${BASE_URL}/auth/verify-email`,
  ME: `${BASE_URL}/auth/me`,
  PROFILE: `${BASE_URL}/auth/profile`,
  PERMISSIONS: `${BASE_URL}/auth/permissions`,
};

// User endpoints
const USERS = {
  LIST: `${BASE_URL}/users`,
  GET_BY_ID: (id) => `${BASE_URL}/users/${id}`,
  CREATE: `${BASE_URL}/users`,
  UPDATE: (id) => `${BASE_URL}/users/${id}`,
  DELETE: (id) => `${BASE_URL}/users/${id}`,
  CHANGE_STATUS: (id) => `${BASE_URL}/users/${id}/status`,
  PERMISSIONS: `${BASE_URL}/users/permissions`,
  ROLES: `${BASE_URL}/users/roles`,
  ACTIVITY: (id) => `${BASE_URL}/users/${id}/activity`,
  PERFORMANCE: (id) => `${BASE_URL}/users/${id}/performance`,
};

// Product endpoints
const PRODUCTS = {
  LIST: `${BASE_URL}/products`,
  GET_BY_ID: (id) => `${BASE_URL}/products/${id}`,
  GET_BY_BARCODE: (barcode) => `${BASE_URL}/products/barcode/${barcode}`,
  CREATE: `${BASE_URL}/products`,
  UPDATE: (id) => `${BASE_URL}/products/${id}`,
  DELETE: (id) => `${BASE_URL}/products/${id}`,
  CATEGORIES: `${BASE_URL}/categories`,
  SEARCH: `${BASE_URL}/products/search`,
  BULK_IMPORT: `${BASE_URL}/products/import`,
  BULK_UPDATE: `${BASE_URL}/products/bulk-update`,
  PRICE_HISTORY: (id) => `${BASE_URL}/products/${id}/price-history`,
  VARIANTS: (id) => `${BASE_URL}/products/${id}/variants`,
  LOW_STOCK: `${BASE_URL}/products/low-stock`,
  POPULAR: `${BASE_URL}/products/popular`,
  TRENDING: `${BASE_URL}/products/trending`,
};

// Category endpoints
const CATEGORIES = {
  LIST: `${BASE_URL}/categories`,
  GET_BY_ID: (id) => `${BASE_URL}/categories/${id}`,
  CREATE: `${BASE_URL}/categories`,
  UPDATE: (id) => `${BASE_URL}/categories/${id}`,
  DELETE: (id) => `${BASE_URL}/categories/${id}`,
  PRODUCTS: (id) => `${BASE_URL}/categories/${id}/products`,
};

// Customer endpoints
const CUSTOMERS = {
  LIST: `${BASE_URL}/customers`,
  GET_BY_ID: (id) => `${BASE_URL}/customers/${id}`,
  CREATE: `${BASE_URL}/customers`,
  UPDATE: (id) => `${BASE_URL}/customers/${id}`,
  DELETE: (id) => `${BASE_URL}/customers/${id}`,
  SEARCH: `${BASE_URL}/customers/search`,
  LOYALTY: (id) => `${BASE_URL}/customers/${id}/loyalty`,
  LOYALTY_HISTORY: (id) => `${BASE_URL}/customers/${id}/loyalty/history`,
  ANALYTICS: (id) => `${BASE_URL}/customers/${id}/analytics`,
  ORDERS: (id) => `${BASE_URL}/customers/${id}/orders`,
  ADD_POINTS: (id) => `${BASE_URL}/customers/${id}/loyalty/add`,
  REDEEM_POINTS: (id) => `${BASE_URL}/customers/${id}/loyalty/redeem`,
  SEGMENTS: `${BASE_URL}/customers/segments`,
};

// Order endpoints
const ORDERS = {
  LIST: `${BASE_URL}/orders`,
  GET_BY_ID: (id) => `${BASE_URL}/orders/${id}`,
  CREATE: `${BASE_URL}/orders`,
  UPDATE: (id) => `${BASE_URL}/orders/${id}`,
  DELETE: (id) => `${BASE_URL}/orders/${id}`,
  UPDATE_STATUS: (id) => `${BASE_URL}/orders/${id}/status`,
  CANCEL: (id) => `${BASE_URL}/orders/${id}/cancel`,
  REFUND: (id) => `${BASE_URL}/orders/${id}/refund`,
  GENERATE_INVOICE: (id) => `${BASE_URL}/orders/${id}/invoice`,
  STATISTICS: `${BASE_URL}/orders/statistics`,
  CUSTOMER_HISTORY: (id) => `${BASE_URL}/customers/${id}/orders`,
  ITEMS: (id) => `${BASE_URL}/orders/${id}/items`,
  RECEIPT: (id) => `${BASE_URL}/orders/${id}/receipt`,
  DAILY: `${BASE_URL}/orders/daily`,
  WEEKLY: `${BASE_URL}/orders/weekly`,
  MONTHLY: `${BASE_URL}/orders/monthly`,
};

// Inventory endpoints
const INVENTORY = {
  LIST: `${BASE_URL}/inventory`,
  GET_BY_ID: (id) => `${BASE_URL}/inventory/${id}`,
  UPDATE: (id) => `${BASE_URL}/inventory/${id}`,
  LOGS: `${BASE_URL}/inventory/logs`,
  STOCK_ADJUSTMENT: `${BASE_URL}/inventory/stock-adjustment`,
  LOW_STOCK: `${BASE_URL}/inventory/low-stock`,
  WAREHOUSES: `${BASE_URL}/inventory/warehouses`,
  TRANSFERS: `${BASE_URL}/inventory/transfers`,
  CREATE_TRANSFER: `${BASE_URL}/inventory/transfers`,
  TRANSFER_DETAILS: (id) => `${BASE_URL}/inventory/transfers/${id}`,
  PRODUCT_HISTORY: (id) => `${BASE_URL}/inventory/product/${id}/history`,
  STOCK_COUNT: `${BASE_URL}/inventory/stock-count`,
  EXPIRING: `${BASE_URL}/inventory/expiring`,
};

// Payment endpoints
const PAYMENTS = {
  PROCESS: `${BASE_URL}/payments/process`,
  VERIFY: (id) => `${BASE_URL}/payments/${id}/verify`,
  REFUND: (id) => `${BASE_URL}/payments/${id}/refund`,
  METHODS: `${BASE_URL}/payments/methods`,
  HISTORY: `${BASE_URL}/payments/history`,
  TRANSACTION: (id) => `${BASE_URL}/payments/transaction/${id}`,
  VNPAY: `${BASE_URL}/payments/vnpay`,
  MOMO: `${BASE_URL}/payments/momo`,
  ZALOPAY: `${BASE_URL}/payments/zalopay`,
  CASH: `${BASE_URL}/payments/cash`,
};

// Analytics endpoints
const ANALYTICS = {
  DASHBOARD: `${BASE_URL}/analytics/dashboard`,
  SALES: `${BASE_URL}/analytics/sales`,
  PRODUCTS: `${BASE_URL}/analytics/products`,
  CUSTOMERS: `${BASE_URL}/analytics/customers`,
  INVENTORY: `${BASE_URL}/analytics/inventory`,
  STAFF: `${BASE_URL}/analytics/staff`,
  CUSTOM: `${BASE_URL}/analytics/custom`,
  EXPORT: `${BASE_URL}/analytics/export`,
  DAILY_SALES: `${BASE_URL}/analytics/sales/daily`,
  WEEKLY_SALES: `${BASE_URL}/analytics/sales/weekly`,
  MONTHLY_SALES: `${BASE_URL}/analytics/sales/monthly`,
  YEARLY_SALES: `${BASE_URL}/analytics/sales/yearly`,
  PRODUCT_PERFORMANCE: `${BASE_URL}/analytics/products/performance`,
  CUSTOMER_RETENTION: `${BASE_URL}/analytics/customers/retention`,
};

// AI endpoints
const AI = {
  CUSTOMER_SEGMENTATION: `${BASE_URL}/ai/customer-segmentation`,
  DEMAND_FORECASTING: `${BASE_URL}/ai/demand-forecasting`,
  PRICE_OPTIMIZATION: `${BASE_URL}/ai/price-optimization`,
  PRODUCT_RECOMMENDATION: `${BASE_URL}/ai/product-recommendation`,
  ANOMALY_DETECTION: `${BASE_URL}/ai/anomaly-detection`,
  CROSS_SELL: `${BASE_URL}/ai/cross-sell`,
  UPSELL: `${BASE_URL}/ai/upsell`,
  CUSTOMER_LIFETIME_VALUE: `${BASE_URL}/ai/customer-lifetime-value`,
  CHURN_PREDICTION: `${BASE_URL}/ai/churn-prediction`,
  INVENTORY_OPTIMIZATION: `${BASE_URL}/ai/inventory-optimization`,
};

// Gamification endpoints
const GAMIFICATION = {
  LEADERBOARD: `${BASE_URL}/gamification/leaderboard`,
  USER_STATS: (id) => `${BASE_URL}/gamification/users/${id}/stats`,
  BADGES: `${BASE_URL}/gamification/badges`,
  USER_BADGES: (id) => `${BASE_URL}/gamification/users/${id}/badges`,
  CHALLENGES: `${BASE_URL}/gamification/challenges`,
  USER_CHALLENGES: (id) => `${BASE_URL}/gamification/users/${id}/challenges`,
  REWARDS: `${BASE_URL}/gamification/rewards`,
  CLAIM_REWARD: (id) => `${BASE_URL}/gamification/rewards/${id}/claim`,
  ACHIEVEMENTS: `${BASE_URL}/gamification/achievements`,
  PROGRESS: (id) => `${BASE_URL}/gamification/users/${id}/progress`,
  TEAMS: `${BASE_URL}/gamification/teams`,
};

// Settings endpoints
const SETTINGS = {
  LIST: `${BASE_URL}/settings`,
  UPDATE: `${BASE_URL}/settings`,
  STORE: `${BASE_URL}/settings/store`,
  TAX: `${BASE_URL}/settings/tax`,
  CURRENCY: `${BASE_URL}/settings/currency`,
  NOTIFICATION: `${BASE_URL}/settings/notification`,
  SECURITY: `${BASE_URL}/settings/security`,
  BACKUP: `${BASE_URL}/settings/backup`,
  RECEIPT_TEMPLATE: `${BASE_URL}/settings/receipt-template`,
  INVOICE_TEMPLATE: `${BASE_URL}/settings/invoice-template`,
  HARDWARE: `${BASE_URL}/settings/hardware`,
  INTEGRATIONS: `${BASE_URL}/settings/integrations`,
};

// Notification endpoints
const NOTIFICATIONS = {
  LIST: `${BASE_URL}/notifications`,
  GET_BY_ID: (id) => `${BASE_URL}/notifications/${id}`,
  MARK_READ: (id) => `${BASE_URL}/notifications/${id}/read`,
  MARK_ALL_READ: `${BASE_URL}/notifications/read-all`,
  COUNT_UNREAD: `${BASE_URL}/notifications/unread-count`,
  PREFERENCES: `${BASE_URL}/notifications/preferences`,
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/unsubscribe`,
};

// Hardware endpoints
const HARDWARE = {
  PRINTERS: `${BASE_URL}/hardware/printers`,
  CASH_DRAWERS: `${BASE_URL}/hardware/cash-drawers`,
  BARCODE_SCANNERS: `${BASE_URL}/hardware/barcode-scanners`,
  PAYMENT_TERMINALS: `${BASE_URL}/hardware/payment-terminals`,
  PRINTER_TEST: `${BASE_URL}/hardware/printers/test`,
  CASH_DRAWER_TEST: `${BASE_URL}/hardware/cash-drawers/test`,
  REGISTER: `${BASE_URL}/hardware/register`,
};

// Export all endpoints
export const API_ENDPOINTS = {
  BASE_URL,
  AUTH,
  USERS,
  PRODUCTS,
  CATEGORIES,
  CUSTOMERS,
  ORDERS,
  INVENTORY,
  PAYMENTS,
  ANALYTICS,
  AI,
  GAMIFICATION,
  SETTINGS,
  NOTIFICATIONS,
  HARDWARE,
};
