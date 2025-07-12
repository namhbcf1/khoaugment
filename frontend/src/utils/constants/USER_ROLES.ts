/**
 * User Roles Constants
 * Definition of user role types and permissions
 *
 * @author KhoAugment POS
 * @version 1.0.0
 */

/**
 * User role constants
 */
export const USER_ROLES = {
  ADMIN: "admin",
  CASHIER: "cashier",
  STAFF: "staff",
};

/**
 * Role hierarchy (higher roles include lower roles' permissions)
 */
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: [USER_ROLES.ADMIN, USER_ROLES.CASHIER, USER_ROLES.STAFF],
  [USER_ROLES.CASHIER]: [USER_ROLES.CASHIER],
  [USER_ROLES.STAFF]: [USER_ROLES.STAFF],
};

/**
 * Permission definitions for each role
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "inventory.view",
    "inventory.adjust",
    "orders.view",
    "orders.create",
    "orders.edit",
    "orders.delete",
    "orders.refund",
    "customers.view",
    "customers.create",
    "customers.edit",
    "customers.delete",
    "reports.view",
    "reports.export",
    "settings.view",
    "settings.edit",
  ],

  [USER_ROLES.CASHIER]: [
    "products.view",
    "orders.view",
    "orders.create",
    "customers.view",
    "customers.create",
    "pos.operate",
  ],

  [USER_ROLES.STAFF]: [
    "products.view",
    "inventory.view",
    "orders.view",
    "customers.view",
  ],
};

/**
 * Menu access by role
 */
export const ROLE_MENU_ACCESS = {
  [USER_ROLES.ADMIN]: [
    "dashboard",
    "products",
    "inventory",
    "orders",
    "customers",
    "reports",
    "users",
    "settings",
    "pos",
  ],

  [USER_ROLES.CASHIER]: ["pos", "orders", "customers"],

  [USER_ROLES.STAFF]: ["dashboard", "products", "inventory", "orders"],
};

/**
 * Role display names (for UI)
 */
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: "Quản trị viên",
  [USER_ROLES.CASHIER]: "Thu ngân",
  [USER_ROLES.STAFF]: "Nhân viên",
};

/**
 * Function to check if a user has a specific permission
 */
export const hasPermission = (
  userRole: string | undefined,
  requiredPermission: string
): boolean => {
  if (!userRole) return false;

  const permissions =
    ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  if (!permissions) return false;

  return permissions.includes(requiredPermission);
};

/**
 * Function to check if a user has a specific role
 */
export const hasRole = (
  userRole: string | undefined,
  requiredRole: string
): boolean => {
  if (!userRole) return false;

  const hierarchy = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY];
  if (!hierarchy) return false;

  return hierarchy.includes(requiredRole);
};

export default USER_ROLES;
