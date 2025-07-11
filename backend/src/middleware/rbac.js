/**
 * Role-Based Access Control (RBAC) Middleware
 * Manages access control for the system
 */

import { corsHeaders } from '../utils/cors';

/**
 * Permission definitions
 */
export const PERMISSIONS = {
  // Admin permissions
  'admin:full_access': 'Full system access',
  'admin:users': 'Manage users',
  'admin:settings': 'Manage system settings',
  
  // Cashier permissions
  'cashier:sales': 'Process sales',
  'cashier:orders': 'Manage orders',
  'cashier:inventory': 'View inventory',
  
  // Staff permissions
  'staff:profile': 'View and update profile',
  'staff:sales': 'View sales',
  'staff:reports': 'View reports',
  
  // Customer permissions
  'customer:orders': 'View orders',
  'customer:profile': 'View and update profile'
};

/**
 * Role definitions with associated permissions
 */
export const ROLES = {
  admin: [
    'admin:full_access',
    'admin:users',
    'admin:settings',
    'cashier:sales',
    'cashier:orders',
    'cashier:inventory',
    'staff:profile',
    'staff:sales',
    'staff:reports'
  ],
  cashier: [
    'cashier:sales',
    'cashier:orders',
    'cashier:inventory',
    'staff:profile',
    'staff:sales'
  ],
  staff: [
    'staff:profile',
    'staff:sales',
    'staff:reports'
  ],
  customer: [
    'customer:orders',
    'customer:profile'
  ]
};

/**
 * Resource-based permissions mapping
 */
export const RESOURCE_PERMISSIONS = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    products: ['create', 'read', 'update', 'delete'],
    orders: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
    settings: ['read', 'update'],
    inventory: ['create', 'read', 'update', 'delete']
  },
  manager: {
    users: ['read', 'update'],
    products: ['create', 'read', 'update', 'delete'],
    orders: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    analytics: ['read'],
    settings: ['read'],
    inventory: ['create', 'read', 'update', 'delete']
  },
  cashier: {
    products: ['read'],
    orders: ['create', 'read', 'update'],
    customers: ['read', 'update'],
    inventory: ['read']
  },
  staff: {
    products: ['read'],
    orders: ['read'],
    customers: ['read'],
    inventory: ['read']
  },
  customer: {
    orders: ['read'],
    profile: ['read', 'update']
  }
};

/**
 * Check if user has required permission
 * @param {Object} user - User object with role
 * @param {String} permission - Required permission
 * @returns {Boolean} - True if user has permission
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) {
    return false;
  }
  
  const rolePermissions = ROLES[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Permission check middleware
 * @param {String|Array} requiredPermissions - Required permission(s)
 * @returns {Function} - Middleware function
 */
export const requirePermissionMiddleware = (requiredPermissions) => (request) => {
  // Skip for OPTIONS requests
  if (request.method === 'OPTIONS') {
    return;
  }

  // Ensure user is authenticated
  if (!request.user) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Authentication required'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  // Normalize permissions to array
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  // Check if user has any of the required permissions
  const hasRequiredPermission = permissions.some(
    permission => hasPermission(request.user, permission)
  );

  if (!hasRequiredPermission) {
    return new Response(JSON.stringify({
      success: false,
      message: 'You do not have permission to perform this action'
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

/**
 * Main RBAC middleware
 */
export function rbacMiddleware(allowedRoles = [], requiredPermissions = [], options = {}) {
  return (request) => {
    // Skip for OPTIONS requests
    if (request.method === 'OPTIONS') {
      return;
    }

    // Ensure user is authenticated
    if (!request.user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check role if specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(request.user.role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Insufficient role permissions'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0) {
      const hasPermissions = options.requireAll
        ? requiredPermissions.every(p => hasPermission(request.user, p))
        : requiredPermissions.some(p => hasPermission(request.user, p));

      if (!hasPermissions) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Insufficient permissions'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  };
}

/**
 * Quick role check middleware
 */
export function requireRole(roles) {
  return rbacMiddleware(roles)
}

  /**
   * Quick permission check middleware
   */
  export function requirePermission(permissions, requireAll = false) {
    return rbacMiddleware([], permissions, { requireAll })
  }

  /**
   * Admin only middleware
   */
  export function adminOnly() {
    return rbacMiddleware(['admin'])
  }

  /**
   * Staff or Admin middleware
   */
  export function staffOrAdmin() {
    return rbacMiddleware(['staff', 'admin'])
  }
  
  /**
   * Self or Admin access (for user profile updates, etc.)
   */
  export function selfOrAdmin(userIdParam = 'id') {
    return async (c, next) => {
      const user = c.get('user')
      const targetUserId = c.req.param(userIdParam)
      
      // Admin can access anyone
      if (user.role === 'admin') {
        return await next()
      }
      
      // Users can only access their own resources
      if (user.id === targetUserId) {
        return await next()
      }
      
      return c.json({
        error: 'Can only access your own resources',
        code: 'SELF_ACCESS_ONLY'
      }, 403)
    }
  }
  
  /**
   * Cashier ownership check (cashiers can only see their own orders)
   */
  export function cashierOwnership() {
    return async (c, next) => {
      const user = c.get('user')
      
      // Admin and staff can see all
      if (['admin', 'staff'].includes(user.role)) {
        return await next()
      }
      
      // Cashiers can only see their own orders
      if (user.role === 'cashier') {
        // Add cashier filter to query
        c.set('cashierFilter', user.id)
      }
      
      await next()
    }
  }
  
  /**
   * Check resource ownership
   */
  async function checkResourceOwnership(c, user, ownershipConfig) {
    try {
      const { table, idParam = 'id', ownerField = 'user_id' } = ownershipConfig
      const resourceId = c.req.param(idParam)
      
      if (!resourceId) return true // Skip if no resource ID
      
      const query = `SELECT ${ownerField} FROM ${table} WHERE id = ?`
      const result = await c.env.DB.prepare(query).bind(resourceId).first()
      
      if (!result) return false // Resource not found
      
      return result[ownerField] === user.id
      
    } catch (error) {
      console.error('Resource ownership check error:', error)
      return false
    }
  }
  
  /**
   * Log access denied attempts
   */
  async function logAccessDenied(db, userId, method, path, reason) {
    try {
      await db.prepare(`
        INSERT INTO activity_logs (
          user_id, action, entity_type, entity_id, 
          new_values, created_at
        )
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        userId,
        'access_denied',
        'rbac',
        null,
        JSON.stringify({ method, path, reason })
      ).run()
    } catch (error) {
      console.error('Failed to log access denied:', error)
    }
  }
  
  /**
   * Get user permissions helper
   */
  export function getUserPermissions(userRole) {
    return ROLES[userRole]?.permissions || []
  }
  
  /**
   * Check if user can perform action
   */
  export function canPerformAction(userRole, action) {
    return hasPermission(userRole, action)
  }
  
  /**
   * Permission checker for UI
   */
  export function createPermissionChecker(userRole) {
    return {
      can: (permission) => hasPermission(userRole, permission),
      canAny: (permissions) => hasAnyPermission(userRole, permissions),
      canAll: (permissions) => hasAllPermissions(userRole, permissions),
      hasRole: (role) => hasRoleLevel(userRole, role),
      permissions: getUserPermissions(userRole),
      roleLevel: ROLES[userRole]?.level || 0
    }
  }
  
// Export rbac as alias for rbacMiddleware
export const rbac = rbacMiddleware;

