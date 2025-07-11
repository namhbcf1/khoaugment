/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================================================
 * Handles JWT token validation, user authentication, and role-based access
 */

import { corsHeaders } from '../utils/cors.js';
import { verifyJWT } from '../utils/jwt.js';

/**
<<<<<<< HEAD
 * Authentication middleware for protected routes
 */
export async function authMiddleware(request, env, ctx) {
  try {
    // Skip auth for public routes
    const publicRoutes = [
      '/health',
      '/api/info',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password'
    ];

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Check if this is a public route
    if (publicRoutes.some(route => pathname.includes(route))) {
      return; // Continue to next handler
    }

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
        code: 'AUTH_MISSING_TOKEN'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const payload = await verifyJWT(token, env.JWT_SECRET || 'default-secret-key');

    if (!payload) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 'AUTH_INVALID_TOKEN'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get user from database to ensure they still exist and are active
    const user = await request.db.findById('users', payload.userId);

    if (!user || !user.is_active) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'User not found or inactive',
        code: 'AUTH_USER_INACTIVE'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Add user info to request for use in route handlers
    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: payload.permissions || [],
      tokenExp: payload.exp
    };

    // Continue to next handler
    return;

  } catch (error) {
    console.error('Auth middleware error:', error);

    return new Response(JSON.stringify({
      error: 'Authentication Error',
      message: 'Failed to authenticate request',
      code: 'AUTH_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(allowedRoles) {
  return async function(request, env, ctx) {
    if (!request.user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const userRole = request.user.role;

    if (!allowedRoles.includes(userRole)) {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        code: 'AUTH_INSUFFICIENT_PERMISSIONS'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Continue to next handler
    return;
  };
}

/**
 * Permission-based access control middleware
 */
export function requirePermission(permission) {
  return async function(request, env, ctx) {
    if (!request.user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const userPermissions = request.user.permissions || [];

    if (!userPermissions.includes(permission) && request.user.role !== 'admin') {
      return new Response(JSON.stringify({
        error: 'Forbidden',
        message: `Access denied. Required permission: ${permission}`,
        code: 'AUTH_INSUFFICIENT_PERMISSIONS'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Continue to next handler
    return;
  };
}

// Export auth as alias for authMiddleware
export const auth = authMiddleware;



