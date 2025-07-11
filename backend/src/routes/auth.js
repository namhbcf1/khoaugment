/**
 * Authentication Routes
 * Handle login, logout, register, and token management
 */

import { Router } from 'itty-router';
import { createJWT, verifyJWT } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { handleError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * POST /auth/login
 * User login with email and password
 */
router.post('/login', async (request, env) => {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!validateEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Password is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find user in database
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND is_active = 1'
    ).bind(email.toLowerCase()).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email or password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate JWT tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const accessToken = await createJWT(payload, env.JWT_SECRET, 24 * 60 * 60); // 24 hours
    const refreshToken = await createJWT(
      { userId: user.id, type: 'refresh' }, 
      env.JWT_SECRET, 
      7 * 24 * 60 * 60 // 7 days
    );

    // Update last login
    await env.DB.prepare(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(user.id).run();

    // Store refresh token in KV
    await env.SESSIONS.put(`refresh_${user.id}`, refreshToken, {
      expirationTtl: 7 * 24 * 60 * 60 // 7 days
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar_url: user.avatar_url
        },
        accessToken,
        refreshToken
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleError(error, request, env);
  }
});

/**
 * POST /auth/logout
 * User logout - invalidate tokens
 */
router.post('/logout', async (request, env) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No token provided'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);

    if (payload && payload.userId) {
      // Remove refresh token from KV
      await env.SESSIONS.delete(`refresh_${payload.userId}`);
      
      // Add token to blacklist (optional - for extra security)
      await env.SESSIONS.put(`blacklist_${token}`, 'true', {
        expirationTtl: 24 * 60 * 60 // 24 hours
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Logout successful'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleError(error, request, env);
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (request, env) => {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Refresh token is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify refresh token
    const payload = await verifyJWT(refreshToken, env.JWT_SECRET);
    if (!payload || payload.type !== 'refresh') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid refresh token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if refresh token exists in KV
    const storedToken = await env.SESSIONS.get(`refresh_${payload.userId}`);
    if (storedToken !== refreshToken) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Refresh token not found or expired'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user data
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ? AND is_active = 1'
    ).bind(payload.userId).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate new access token
    const newPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const newAccessToken = await createJWT(newPayload, env.JWT_SECRET, 24 * 60 * 60);

    return new Response(JSON.stringify({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar_url: user.avatar_url
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleError(error, request, env);
  }
});

/**
 * POST /auth/register
 * User registration (admin only)
 */
router.post('/register', async (request, env) => {
  try {
    const { email, password, name, role = 'staff' } = await request.json();

    // Validate input
    if (!validateEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Password validation failed',
        errors: passwordValidation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!name || name.trim().length < 2) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Name must be at least 2 characters long'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['admin', 'cashier', 'staff'].includes(role)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid role'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user already exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User with this email already exists'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await env.DB.prepare(`
      INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(email.toLowerCase(), passwordHash, name.trim(), role).run();

    if (!result.success) {
      throw new Error('Failed to create user');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.meta.last_row_id,
        email: email.toLowerCase(),
        name: name.trim(),
        role
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleError(error, request, env);
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', async (request, env) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No token provided'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);

    if (!payload) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user data
    const user = await env.DB.prepare(
      'SELECT id, email, name, role, avatar_url, last_login, created_at FROM users WHERE id = ? AND is_active = 1'
    ).bind(payload.userId).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: user
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleError(error, request, env);
  }
});

export default router;
