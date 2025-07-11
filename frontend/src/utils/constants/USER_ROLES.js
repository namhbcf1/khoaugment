/**
 * User Roles and Permissions Configuration
 * Centralized role definitions for KhoChuan POS System
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

/**
 * System User Roles
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  STAFF: 'staff',
  CUSTOMER: 'customer',
  GUEST: 'guest',
};

/**
 * Role Hierarchy (higher number = more permissions)
 */
export const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 100,
  [USER_ROLES.ADMIN]: 90,
  [USER_ROLES.MANAGER]: 80,
  [USER_ROLES.CASHIER]: 60,
  [USER_ROLES.STAFF]: 40,
  [USER_ROLES.CUSTOMER]: 20,
  [USER_ROLES.GUEST]: 10,
};

/**
 * Role Display Names (Vietnamese)
 */
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.SUPER_ADMIN]: 'Quản trị viên cấp cao',
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.MANAGER]: 'Quản lý',
  [USER_ROLES.CASHIER]: 'Thu ngân',
  [USER_ROLES.STAFF]: 'Nhân viên',
  [USER_ROLES.CUSTOMER]: 'Khách hàng',
  [USER_ROLES.GUEST]: 'Khách',
};

/**
 * Role Descriptions
 */
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.SUPER_ADMIN]: 'Quyền truy cập toàn bộ hệ thống, quản lý cấu hình hệ thống',
  [USER_ROLES.ADMIN]: 'Quản lý toàn bộ cửa hàng, nhân viên, báo cáo',
  [USER_ROLES.MANAGER]: 'Quản lý vận hành hàng ngày, giám sát nhân viên',
  [USER_ROLES.CASHIER]: 'Xử lý giao dịch bán hàng, quản lý ca làm việc',
  [USER_ROLES.STAFF]: 'Hỗ trợ bán hàng, quản lý sản phẩm cơ bản',
  [USER_ROLES.CUSTOMER]: 'Khách hàng đã đăng ký, tra cứu đơn hàng',
  [USER_ROLES.GUEST]: 'Khách vãng lai, quyền truy cập hạn chế',
};

/**
 * Permission Categories
 */
export const PERMISSION_CATEGORIES = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  STAFF: 'staff',
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  GAMIFICATION: 'gamification',
  AI_FEATURES: 'ai_features',
  HARDWARE: 'hardware',
  ECOMMERCE: 'ecommerce',
  SECURITY: 'security',
  SYSTEM: 'system',
};

/**
 * Detailed Permissions by Category
 */
export const PERMISSIONS = {
  // Dashboard Permissions
  [PERMISSION_CATEGORIES.DASHBOARD]: {
    VIEW: 'dashboard.view',
    VIEW_ANALYTICS: 'dashboard.view_analytics',
    VIEW_REAL_TIME: 'dashboard.view_real_time',
    EXPORT_DATA: 'dashboard.export_data',
  },

  // Product Management Permissions
  [PERMISSION_CATEGORIES.PRODUCTS]: {
    VIEW: 'products.view',
    CREATE: 'products.create',
    UPDATE: 'products.update',
    DELETE: 'products.delete',
    BULK_IMPORT: 'products.bulk_import',
    BULK_UPDATE: 'products.bulk_update',
    MANAGE_CATEGORIES: 'products.manage_categories',
    VIEW_PRICE_HISTORY: 'products.view_price_history',
  },

  // Inventory Management Permissions
  [PERMISSION_CATEGORIES.INVENTORY]: {
    VIEW: 'inventory.view',
    UPDATE_STOCK: 'inventory.update_stock',
    VIEW_MOVEMENTS: 'inventory.view_movements',
    MANAGE_WAREHOUSES: 'inventory.manage_warehouses',
    STOCK_TRANSFER: 'inventory.stock_transfer',
    STOCK_COUNT: 'inventory.stock_count',
    VIEW_FORECASTING: 'inventory.view_forecasting',
  },

  // Order Management Permissions
  [PERMISSION_CATEGORIES.ORDERS]: {
    VIEW: 'orders.view',
    CREATE: 'orders.create',
    UPDATE: 'orders.update',
    CANCEL: 'orders.cancel',
    REFUND: 'orders.refund',
    PRINT_RECEIPT: 'orders.print_receipt',
    VIEW_PAYMENT_STATUS: 'orders.view_payment_status',
    MANAGE_DELIVERY: 'orders.manage_delivery',
  },

  // Customer Management Permissions
  [PERMISSION_CATEGORIES.CUSTOMERS]: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete',
    VIEW_PURCHASE_HISTORY: 'customers.view_purchase_history',
    MANAGE_LOYALTY: 'customers.manage_loyalty',
    VIEW_ANALYTICS: 'customers.view_analytics',
    EXPORT_DATA: 'customers.export_data',
  },

  // Staff Management Permissions
  [PERMISSION_CATEGORIES.STAFF]: {
    VIEW: 'staff.view',
    CREATE: 'staff.create',
    UPDATE: 'staff.update',
    DELETE: 'staff.delete',
    MANAGE_SCHEDULE: 'staff.manage_schedule',
    VIEW_PERFORMANCE: 'staff.view_performance',
    MANAGE_PAYROLL: 'staff.manage_payroll',
    MANAGE_COMMISSIONS: 'staff.manage_commissions',
  },

  // Analytics Permissions
  [PERMISSION_CATEGORIES.ANALYTICS]: {
    VIEW_BASIC: 'analytics.view_basic',
    VIEW_ADVANCED: 'analytics.view_advanced',
    VIEW_REAL_TIME: 'analytics.view_real_time',
    EXPORT_REPORTS: 'analytics.export_reports',
    CREATE_CUSTOM_REPORTS: 'analytics.create_custom_reports',
  },

  // System Settings Permissions
  [PERMISSION_CATEGORIES.SETTINGS]: {
    VIEW: 'settings.view',
    UPDATE_COMPANY: 'settings.update_company',
    UPDATE_SYSTEM: 'settings.update_system',
    MANAGE_INTEGRATIONS: 'settings.manage_integrations',
    MANAGE_PAYMENT_GATEWAYS: 'settings.manage_payment_gateways',
    BACKUP_RESTORE: 'settings.backup_restore',
  },

  // Gamification Permissions
  [PERMISSION_CATEGORIES.GAMIFICATION]: {
    VIEW: 'gamification.view',
    MANAGE_ACHIEVEMENTS: 'gamification.manage_achievements',
    MANAGE_REWARDS: 'gamification.manage_rewards',
    VIEW_LEADERBOARD: 'gamification.view_leaderboard',
    MANAGE_CHALLENGES: 'gamification.manage_challenges',
  },

  // AI Features Permissions
  [PERMISSION_CATEGORIES.AI_FEATURES]: {
    VIEW: 'ai_features.view',
    USE_FORECASTING: 'ai_features.use_forecasting',
    USE_RECOMMENDATIONS: 'ai_features.use_recommendations',
    USE_PRICE_OPTIMIZATION: 'ai_features.use_price_optimization',
    CONFIGURE_AI: 'ai_features.configure_ai',
  },

  // Hardware Permissions
  [PERMISSION_CATEGORIES.HARDWARE]: {
    VIEW_STATUS: 'hardware.view_status',
    MANAGE_DEVICES: 'hardware.manage_devices',
    CONFIGURE_PRINTER: 'hardware.configure_printer',
    CONFIGURE_SCANNER: 'hardware.configure_scanner',
    CONFIGURE_PAYMENT_TERMINAL: 'hardware.configure_payment_terminal',
  },

  // E-commerce Permissions
  [PERMISSION_CATEGORIES.ECOMMERCE]: {
    VIEW: 'ecommerce.view',
    MANAGE_INTEGRATIONS: 'ecommerce.manage_integrations',
    SYNC_PRODUCTS: 'ecommerce.sync_products',
    SYNC_ORDERS: 'ecommerce.sync_orders',
    CONFIGURE_MARKETPLACES: 'ecommerce.configure_marketplaces',
  },

  // Security Permissions
  [PERMISSION_CATEGORIES.SECURITY]: {
    VIEW_LOGS: 'security.view_logs',
    MANAGE_USERS: 'security.manage_users',
    MANAGE_ROLES: 'security.manage_roles',
    CONFIGURE_SECURITY: 'security.configure_security',
    VIEW_AUDIT_TRAIL: 'security.view_audit_trail',
  },

  // System Administration Permissions
  [PERMISSION_CATEGORIES.SYSTEM]: {
    VIEW_SYSTEM_INFO: 'system.view_system_info',
    MANAGE_DATABASE: 'system.manage_database',
    MANAGE_CACHE: 'system.manage_cache',
    VIEW_PERFORMANCE: 'system.view_performance',
    MANAGE_UPDATES: 'system.manage_updates',
  },
};

/**
 * Role-based Permission Matrix
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    // All permissions for super admin
    ...Object.values(PERMISSIONS).flatMap(category => Object.values(category))
  ],

  [USER_ROLES.ADMIN]: [
    // Dashboard
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.DASHBOARD.VIEW_ANALYTICS,
    PERMISSIONS.DASHBOARD.VIEW_REAL_TIME,
    PERMISSIONS.DASHBOARD.EXPORT_DATA,
    
    // Products
    ...Object.values(PERMISSIONS.PRODUCTS),
    
    // Inventory
    ...Object.values(PERMISSIONS.INVENTORY),
    
    // Orders
    ...Object.values(PERMISSIONS.ORDERS),
    
    // Customers
    ...Object.values(PERMISSIONS.CUSTOMERS),
    
    // Staff
    ...Object.values(PERMISSIONS.STAFF),
    
    // Analytics
    ...Object.values(PERMISSIONS.ANALYTICS),
    
    // Settings (limited)
    PERMISSIONS.SETTINGS.VIEW,
    PERMISSIONS.SETTINGS.UPDATE_COMPANY,
    PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS,
    PERMISSIONS.SETTINGS.MANAGE_PAYMENT_GATEWAYS,
    
    // Gamification
    ...Object.values(PERMISSIONS.GAMIFICATION),
    
    // AI Features
    ...Object.values(PERMISSIONS.AI_FEATURES),
    
    // Hardware
    ...Object.values(PERMISSIONS.HARDWARE),
    
    // E-commerce
    ...Object.values(PERMISSIONS.ECOMMERCE),
  ],

  [USER_ROLES.MANAGER]: [
    // Dashboard
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.DASHBOARD.VIEW_ANALYTICS,
    PERMISSIONS.DASHBOARD.EXPORT_DATA,
    
    // Products
    PERMISSIONS.PRODUCTS.VIEW,
    PERMISSIONS.PRODUCTS.CREATE,
    PERMISSIONS.PRODUCTS.UPDATE,
    PERMISSIONS.PRODUCTS.BULK_UPDATE,
    PERMISSIONS.PRODUCTS.MANAGE_CATEGORIES,
    
    // Inventory
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.INVENTORY.UPDATE_STOCK,
    PERMISSIONS.INVENTORY.VIEW_MOVEMENTS,
    PERMISSIONS.INVENTORY.STOCK_TRANSFER,
    PERMISSIONS.INVENTORY.STOCK_COUNT,
    
    // Orders
    PERMISSIONS.ORDERS.VIEW,
    PERMISSIONS.ORDERS.CREATE,
    PERMISSIONS.ORDERS.UPDATE,
    PERMISSIONS.ORDERS.CANCEL,
    PERMISSIONS.ORDERS.REFUND,
    PERMISSIONS.ORDERS.PRINT_RECEIPT,
    
    // Customers
    PERMISSIONS.CUSTOMERS.VIEW,
    PERMISSIONS.CUSTOMERS.CREATE,
    PERMISSIONS.CUSTOMERS.UPDATE,
    PERMISSIONS.CUSTOMERS.VIEW_PURCHASE_HISTORY,
    PERMISSIONS.CUSTOMERS.MANAGE_LOYALTY,
    
    // Staff
    PERMISSIONS.STAFF.VIEW,
    PERMISSIONS.STAFF.MANAGE_SCHEDULE,
    PERMISSIONS.STAFF.VIEW_PERFORMANCE,
    
    // Analytics
    PERMISSIONS.ANALYTICS.VIEW_BASIC,
    PERMISSIONS.ANALYTICS.VIEW_ADVANCED,
    PERMISSIONS.ANALYTICS.EXPORT_REPORTS,
    
    // Gamification
    PERMISSIONS.GAMIFICATION.VIEW,
    PERMISSIONS.GAMIFICATION.VIEW_LEADERBOARD,
  ],

  [USER_ROLES.CASHIER]: [
    // Dashboard
    PERMISSIONS.DASHBOARD.VIEW,
    
    // Products
    PERMISSIONS.PRODUCTS.VIEW,
    
    // Inventory
    PERMISSIONS.INVENTORY.VIEW,
    
    // Orders
    PERMISSIONS.ORDERS.VIEW,
    PERMISSIONS.ORDERS.CREATE,
    PERMISSIONS.ORDERS.PRINT_RECEIPT,
    PERMISSIONS.ORDERS.VIEW_PAYMENT_STATUS,
    
    // Customers
    PERMISSIONS.CUSTOMERS.VIEW,
    PERMISSIONS.CUSTOMERS.CREATE,
    PERMISSIONS.CUSTOMERS.UPDATE,
    PERMISSIONS.CUSTOMERS.VIEW_PURCHASE_HISTORY,
    
    // Hardware
    PERMISSIONS.HARDWARE.VIEW_STATUS,
    PERMISSIONS.HARDWARE.CONFIGURE_PRINTER,
    PERMISSIONS.HARDWARE.CONFIGURE_SCANNER,
    PERMISSIONS.HARDWARE.CONFIGURE_PAYMENT_TERMINAL,
    
    // Gamification
    PERMISSIONS.GAMIFICATION.VIEW,
  ],

  [USER_ROLES.STAFF]: [
    // Dashboard
    PERMISSIONS.DASHBOARD.VIEW,
    
    // Products
    PERMISSIONS.PRODUCTS.VIEW,
    
    // Inventory
    PERMISSIONS.INVENTORY.VIEW,
    
    // Orders
    PERMISSIONS.ORDERS.VIEW,
    PERMISSIONS.ORDERS.CREATE,
    
    // Customers
    PERMISSIONS.CUSTOMERS.VIEW,
    PERMISSIONS.CUSTOMERS.CREATE,
    
    // Gamification
    PERMISSIONS.GAMIFICATION.VIEW,
  ],

  [USER_ROLES.CUSTOMER]: [
    // Limited permissions for customers
    PERMISSIONS.ORDERS.VIEW, // Only their own orders
    PERMISSIONS.CUSTOMERS.UPDATE, // Only their own profile
    PERMISSIONS.GAMIFICATION.VIEW, // View their own achievements
  ],

  [USER_ROLES.GUEST]: [
    // Very limited permissions for guests
    PERMISSIONS.PRODUCTS.VIEW, // Browse products only
  ],
};

/**
 * Helper function to check if a role has a specific permission
 */
export const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

/**
 * Helper function to get all permissions for a role
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Helper function to check if role A has higher hierarchy than role B
 */
export const isHigherRole = (roleA, roleB) => {
  return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
};

/**
 * Helper function to get role display name
 */
export const getRoleDisplayName = (role) => {
  return ROLE_DISPLAY_NAMES[role] || role;
};

/**
 * Helper function to get role description
 */
export const getRoleDescription = (role) => {
  return ROLE_DESCRIPTIONS[role] || '';
};

export default {
  USER_ROLES,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  PERMISSION_CATEGORIES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  isHigherRole,
  getRoleDisplayName,
  getRoleDescription,
};
