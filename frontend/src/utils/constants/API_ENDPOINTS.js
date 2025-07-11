/**
 * API Endpoints Configuration
 * Centralized API endpoint definitions for KhoChuan POS
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.khoaugment.com';
const API_VERSION = '/v1';
const BASE_URL = `${API_BASE_URL}${API_VERSION}`;

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE_URL}/auth/login`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  REFRESH: `${BASE_URL}/auth/refresh`,
  REGISTER: `${BASE_URL}/auth/register`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  VERIFY_EMAIL: `${BASE_URL}/auth/verify-email`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
  PROFILE: `${BASE_URL}/auth/profile`,
  PERMISSIONS: `${BASE_URL}/auth/permissions`,
};

/**
 * Product Management Endpoints
 */
export const PRODUCT_ENDPOINTS = {
  LIST: `${BASE_URL}/products`,
  CREATE: `${BASE_URL}/products`,
  UPDATE: (id) => `${BASE_URL}/products/${id}`,
  DELETE: (id) => `${BASE_URL}/products/${id}`,
  GET_BY_ID: (id) => `${BASE_URL}/products/${id}`,
  SEARCH: `${BASE_URL}/products/search`,
  CATEGORIES: `${BASE_URL}/products/categories`,
  BULK_IMPORT: `${BASE_URL}/products/bulk-import`,
  BULK_UPDATE: `${BASE_URL}/products/bulk-update`,
  PRICE_HISTORY: (id) => `${BASE_URL}/products/${id}/price-history`,
  VARIANTS: (id) => `${BASE_URL}/products/${id}/variants`,
};

/**
 * Inventory Management Endpoints
 */
export const INVENTORY_ENDPOINTS = {
  LIST: `${BASE_URL}/inventory`,
  UPDATE_STOCK: (id) => `${BASE_URL}/inventory/${id}/stock`,
  MOVEMENTS: `${BASE_URL}/inventory/movements`,
  LOW_STOCK: `${BASE_URL}/inventory/low-stock`,
  STOCK_ALERTS: `${BASE_URL}/inventory/alerts`,
  WAREHOUSE_TRANSFER: `${BASE_URL}/inventory/transfer`,
  STOCK_COUNT: `${BASE_URL}/inventory/stock-count`,
  FORECASTING: `${BASE_URL}/inventory/forecasting`,
};

/**
 * Order Management Endpoints
 */
export const ORDER_ENDPOINTS = {
  LIST: `${BASE_URL}/orders`,
  CREATE: `${BASE_URL}/orders`,
  UPDATE: (id) => `${BASE_URL}/orders/${id}`,
  DELETE: (id) => `${BASE_URL}/orders/${id}`,
  GET_BY_ID: (id) => `${BASE_URL}/orders/${id}`,
  CANCEL: (id) => `${BASE_URL}/orders/${id}/cancel`,
  REFUND: (id) => `${BASE_URL}/orders/${id}/refund`,
  PRINT_RECEIPT: (id) => `${BASE_URL}/orders/${id}/receipt`,
  PAYMENT_STATUS: (id) => `${BASE_URL}/orders/${id}/payment-status`,
  DELIVERY_STATUS: (id) => `${BASE_URL}/orders/${id}/delivery-status`,
};

/**
 * Customer Management Endpoints
 */
export const CUSTOMER_ENDPOINTS = {
  LIST: `${BASE_URL}/customers`,
  CREATE: `${BASE_URL}/customers`,
  UPDATE: (id) => `${BASE_URL}/customers/${id}`,
  DELETE: (id) => `${BASE_URL}/customers/${id}`,
  GET_BY_ID: (id) => `${BASE_URL}/customers/${id}`,
  SEARCH: `${BASE_URL}/customers/search`,
  LOYALTY_POINTS: (id) => `${BASE_URL}/customers/${id}/loyalty-points`,
  PURCHASE_HISTORY: (id) => `${BASE_URL}/customers/${id}/purchase-history`,
  SEGMENTATION: `${BASE_URL}/customers/segmentation`,
};

/**
 * Staff Management Endpoints
 */
export const STAFF_ENDPOINTS = {
  LIST: `${BASE_URL}/staff`,
  CREATE: `${BASE_URL}/staff`,
  UPDATE: (id) => `${BASE_URL}/staff/${id}`,
  DELETE: (id) => `${BASE_URL}/staff/${id}`,
  GET_BY_ID: (id) => `${BASE_URL}/staff/${id}`,
  PERFORMANCE: (id) => `${BASE_URL}/staff/${id}/performance`,
  SCHEDULE: `${BASE_URL}/staff/schedule`,
  ATTENDANCE: `${BASE_URL}/staff/attendance`,
  PAYROLL: `${BASE_URL}/staff/payroll`,
  COMMISSIONS: `${BASE_URL}/staff/commissions`,
};

/**
 * Analytics & Reporting Endpoints
 */
export const ANALYTICS_ENDPOINTS = {
  DASHBOARD: `${BASE_URL}/analytics/dashboard`,
  SALES_REPORT: `${BASE_URL}/analytics/sales`,
  INVENTORY_REPORT: `${BASE_URL}/analytics/inventory`,
  CUSTOMER_ANALYTICS: `${BASE_URL}/analytics/customers`,
  STAFF_PERFORMANCE: `${BASE_URL}/analytics/staff-performance`,
  FINANCIAL_REPORT: `${BASE_URL}/analytics/financial`,
  REAL_TIME_METRICS: `${BASE_URL}/analytics/real-time`,
  CUSTOM_REPORTS: `${BASE_URL}/analytics/custom-reports`,
};

/**
 * AI & Machine Learning Endpoints
 */
export const AI_ENDPOINTS = {
  DEMAND_FORECASTING: `${BASE_URL}/ai/demand-forecasting`,
  PRICE_OPTIMIZATION: `${BASE_URL}/ai/price-optimization`,
  CUSTOMER_SEGMENTATION: `${BASE_URL}/ai/customer-segmentation`,
  RECOMMENDATION_ENGINE: `${BASE_URL}/ai/recommendations`,
  SALES_PREDICTION: `${BASE_URL}/ai/sales-prediction`,
  INVENTORY_OPTIMIZATION: `${BASE_URL}/ai/inventory-optimization`,
};

/**
 * Hardware Integration Endpoints
 */
export const HARDWARE_ENDPOINTS = {
  PRINTER_STATUS: `${BASE_URL}/hardware/printer/status`,
  PRINT_RECEIPT: `${BASE_URL}/hardware/printer/print`,
  BARCODE_SCAN: `${BASE_URL}/hardware/barcode/scan`,
  CASH_DRAWER_OPEN: `${BASE_URL}/hardware/cash-drawer/open`,
  PAYMENT_TERMINAL: `${BASE_URL}/hardware/payment-terminal`,
  DEVICE_STATUS: `${BASE_URL}/hardware/device-status`,
};

/**
 * E-commerce Integration Endpoints
 */
export const ECOMMERCE_ENDPOINTS = {
  SHOPEE: {
    PRODUCTS: `${BASE_URL}/ecommerce/shopee/products`,
    ORDERS: `${BASE_URL}/ecommerce/shopee/orders`,
    SYNC: `${BASE_URL}/ecommerce/shopee/sync`,
  },
  LAZADA: {
    PRODUCTS: `${BASE_URL}/ecommerce/lazada/products`,
    ORDERS: `${BASE_URL}/ecommerce/lazada/orders`,
    SYNC: `${BASE_URL}/ecommerce/lazada/sync`,
  },
  TIKI: {
    PRODUCTS: `${BASE_URL}/ecommerce/tiki/products`,
    ORDERS: `${BASE_URL}/ecommerce/tiki/orders`,
    SYNC: `${BASE_URL}/ecommerce/tiki/sync`,
  },
  UNIFIED: {
    SYNC_ALL: `${BASE_URL}/ecommerce/unified/sync-all`,
    INVENTORY_SYNC: `${BASE_URL}/ecommerce/unified/inventory-sync`,
    ORDER_SYNC: `${BASE_URL}/ecommerce/unified/order-sync`,
  },
};

/**
 * Gamification Endpoints
 */
export const GAMIFICATION_ENDPOINTS = {
  ACHIEVEMENTS: `${BASE_URL}/gamification/achievements`,
  LEADERBOARD: `${BASE_URL}/gamification/leaderboard`,
  REWARDS: `${BASE_URL}/gamification/rewards`,
  CHALLENGES: `${BASE_URL}/gamification/challenges`,
  POINTS: `${BASE_URL}/gamification/points`,
  BADGES: `${BASE_URL}/gamification/badges`,
};

/**
 * System Settings Endpoints
 */
export const SETTINGS_ENDPOINTS = {
  COMPANY_PROFILE: `${BASE_URL}/settings/company`,
  SYSTEM_CONFIG: `${BASE_URL}/settings/system`,
  SECURITY_SETTINGS: `${BASE_URL}/settings/security`,
  PAYMENT_GATEWAYS: `${BASE_URL}/settings/payment-gateways`,
  INTEGRATIONS: `${BASE_URL}/settings/integrations`,
  BACKUP_RESTORE: `${BASE_URL}/settings/backup`,
};

/**
 * File Upload Endpoints
 */
export const UPLOAD_ENDPOINTS = {
  PRODUCT_IMAGES: `${BASE_URL}/upload/product-images`,
  CUSTOMER_AVATARS: `${BASE_URL}/upload/customer-avatars`,
  STAFF_PHOTOS: `${BASE_URL}/upload/staff-photos`,
  COMPANY_LOGO: `${BASE_URL}/upload/company-logo`,
  DOCUMENTS: `${BASE_URL}/upload/documents`,
  BULK_IMPORT: `${BASE_URL}/upload/bulk-import`,
};

/**
 * WebSocket Endpoints
 */
export const WEBSOCKET_ENDPOINTS = {
  REAL_TIME_UPDATES: `${API_BASE_URL.replace('http', 'ws')}/ws/updates`,
  INVENTORY_ALERTS: `${API_BASE_URL.replace('http', 'ws')}/ws/inventory-alerts`,
  ORDER_NOTIFICATIONS: `${API_BASE_URL.replace('http', 'ws')}/ws/order-notifications`,
  STAFF_COMMUNICATION: `${API_BASE_URL.replace('http', 'ws')}/ws/staff-chat`,
};

/**
 * Export all endpoints as a single object
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  PRODUCTS: PRODUCT_ENDPOINTS,
  INVENTORY: INVENTORY_ENDPOINTS,
  ORDERS: ORDER_ENDPOINTS,
  CUSTOMERS: CUSTOMER_ENDPOINTS,
  STAFF: STAFF_ENDPOINTS,
  ANALYTICS: ANALYTICS_ENDPOINTS,
  AI: AI_ENDPOINTS,
  HARDWARE: HARDWARE_ENDPOINTS,
  ECOMMERCE: ECOMMERCE_ENDPOINTS,
  GAMIFICATION: GAMIFICATION_ENDPOINTS,
  SETTINGS: SETTINGS_ENDPOINTS,
  UPLOAD: UPLOAD_ENDPOINTS,
  WEBSOCKET: WEBSOCKET_ENDPOINTS,
};

export default API_ENDPOINTS;
