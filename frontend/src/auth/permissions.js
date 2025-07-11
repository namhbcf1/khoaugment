export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  STAFF: 'staff',
  CUSTOMER: 'customer'
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_UPDATE: 'inventory.update',
  ORDERS_VIEW: 'orders.view',
  ORDERS_CREATE: 'orders.create',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_DELETE: 'orders.delete',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_DELETE: 'customers.delete',
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  POS_USE: 'pos.use',
  POS_DISCOUNT: 'pos.discount',
  POS_REFUND: 'pos.refund',
  POS_VOID: 'pos.void',
  POS_CASH_DRAWER: 'pos.cash_drawer',

  // Analytics & Reports
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  FINANCIAL_REPORTS: 'financial.reports',
  PROFIT_MARGINS: 'profit.margins',

  // AI Features
  AI_USE: 'ai.use',
  AI_CONFIGURE: 'ai.configure',
  AI_INSIGHTS: 'ai.insights',

  // Gamification
  GAMIFICATION_VIEW: 'gamification.view',
  GAMIFICATION_MANAGE: 'gamification.manage',
  ACHIEVEMENTS_VIEW: 'achievements.view',
  ACHIEVEMENTS_MANAGE: 'achievements.manage',

  // System Administration
  SYSTEM_LOGS: 'system.logs',
  BACKUP_RESTORE: 'backup.restore',
  INTEGRATIONS_MANAGE: 'integrations.manage',

  // Staff Performance
  STAFF_PERFORMANCE: 'staff.performance',
  STAFF_SCHEDULE: 'staff.schedule',
  STAFF_PAYROLL: 'staff.payroll'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_DELETE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.CUSTOMERS_DELETE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DELETE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.POS_USE,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_VOID,
    PERMISSIONS.POS_CASH_DRAWER,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.PROFIT_MARGINS,
    PERMISSIONS.AI_USE,
    PERMISSIONS.AI_CONFIGURE,
    PERMISSIONS.AI_INSIGHTS,
    PERMISSIONS.GAMIFICATION_VIEW,
    PERMISSIONS.GAMIFICATION_MANAGE,
    PERMISSIONS.ACHIEVEMENTS_VIEW,
    PERMISSIONS.ACHIEVEMENTS_MANAGE,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.BACKUP_RESTORE,
    PERMISSIONS.INTEGRATIONS_MANAGE,
    PERMISSIONS.STAFF_PERFORMANCE,
    PERMISSIONS.STAFF_SCHEDULE,
    PERMISSIONS.STAFF_PAYROLL
  ],
  [ROLES.CASHIER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.POS_USE,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.POS_CASH_DRAWER,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.GAMIFICATION_VIEW,
    PERMISSIONS.ACHIEVEMENTS_VIEW
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AI_USE,
    PERMISSIONS.AI_INSIGHTS,
    PERMISSIONS.GAMIFICATION_VIEW,
    PERMISSIONS.ACHIEVEMENTS_VIEW
  ],

  [ROLES.CUSTOMER]: [
    PERMISSIONS.GAMIFICATION_VIEW,
    PERMISSIONS.ACHIEVEMENTS_VIEW
  ]
};

// Helper functions
export const hasRole = (userRole, requiredRole) => {
  return userRole === requiredRole;
};

export const hasAnyRole = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

export const hasAllRoles = (userRole, requiredRoles) => {
  return requiredRoles.every(role => userRole === role);
};

export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (userRole, requiredPermissions) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return requiredPermissions.some(permission => permissions.includes(permission));
};

export const hasAllPermissions = (userRole, requiredPermissions) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return requiredPermissions.every(permission => permissions.includes(permission));
};

export const getUserPermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

export const isFeatureEnabled = (feature) => {
  // Simple feature flag implementation
  return true;
};

export const checkBusinessRule = (rule, context) => {
  // Simple business rule implementation
  return true;
};
