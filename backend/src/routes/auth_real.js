/**
 * Real Authentication Routes - NO MOCK DATA
 * 100% Real Database Operations with D1
 * Trường Phát Computer Hòa Bình
 */

import { Router } from 'itty-router';
import { hashPassword, verifyPassword } from '../utils/encryption';
import { generateJWT, verifyJWT } from '../utils/jwt';
import { addCorsHeaders } from '../utils/cors';
import { validateEmail, validatePassword } from '../utils/validators';

const router = Router();

/**
 * POST /auth/login - Real login with database verification
 */
router.post('/auth/login', async (request) => {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email và mật khẩu là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email không hợp lệ'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Query real database for user
    const db = request.env.DB;
    const user = await db.prepare(`
      SELECT 
        id, email, password_hash, name, role, is_active, 
        avatar_url, permissions, total_points, current_level, 
        department, last_login, created_at
      FROM users 
      WHERE email = ? AND is_active = 1
    `).bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Verify password against real hash
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // Log failed login attempt
      await db.prepare(`
        INSERT INTO activity_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, 'failed_login', ?, ?, datetime('now'))
      `).bind(
        user.id,
        JSON.stringify({ email, reason: 'invalid_password' }),
        request.headers.get('CF-Connecting-IP') || 'unknown'
      ).run();

      return new Response(JSON.stringify({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Generate real JWT token
    const token = await generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    }, request.env.JWT_SECRET);

    // Update last login in database
    await db.prepare(`
      UPDATE users 
      SET last_login = datetime('now'), 
          login_count = login_count + 1
      WHERE id = ?
    `).bind(user.id).run();

    // Log successful login
    await db.prepare(`
      INSERT INTO activity_logs (user_id, action, details, ip_address, created_at)
      VALUES (?, 'login', ?, ?, datetime('now'))
    `).bind(
      user.id,
      JSON.stringify({ email, success: true }),
      request.headers.get('CF-Connecting-IP') || 'unknown'
    ).run();

    // Return user data (without password)
    const { password_hash, ...userWithoutPassword } = user;
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          permissions: JSON.parse(user.permissions || '[]')
        },
        token,
        expires_in: 86400 // 24 hours
      },
      message: 'Đăng nhập thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi hệ thống, vui lòng thử lại'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /auth/logout - Real logout with session cleanup
 */
router.post('/auth/logout', async (request) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token không hợp lệ'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    if (payload) {
      // Log logout in database
      const db = request.env.DB;
      await db.prepare(`
        INSERT INTO activity_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, 'logout', ?, ?, datetime('now'))
      `).bind(
        payload.userId,
        JSON.stringify({ success: true }),
        request.headers.get('CF-Connecting-IP') || 'unknown'
      ).run();

      // Invalidate token in KV store (blacklist)
      await request.env.CACHE.put(`blacklist:${token}`, 'true', { expirationTtl: 86400 });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Đăng xuất thành công'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi hệ thống'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * GET /auth/me - Get current user profile from database
 */
router.get('/auth/me', async (request) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token không hợp lệ'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const token = authHeader.substring(7);
    
    // Check if token is blacklisted
    const isBlacklisted = await request.env.CACHE.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token đã hết hạn'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    if (!payload) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token không hợp lệ'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Get fresh user data from database
    const db = request.env.DB;
    const user = await db.prepare(`
      SELECT 
        id, email, name, role, is_active, avatar_url, 
        permissions, total_points, current_level, department,
        last_login, created_at
      FROM users 
      WHERE id = ? AND is_active = 1
    `).bind(payload.userId).first();

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Người dùng không tồn tại'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        user: {
          ...user,
          permissions: JSON.parse(user.permissions || '[]')
        }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi hệ thống'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

/**
 * POST /auth/verify - Verify token validity
 */
router.post('/auth/verify', async (request) => {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await request.env.CACHE.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token đã hết hạn'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
      });
    }

    const payload = await verifyJWT(token, request.env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      success: !!payload,
      data: payload ? { userId: payload.userId, role: payload.role } : null
    }), {
      status: payload ? 200 : 401,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Token không hợp lệ'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...addCorsHeaders() }
    });
  }
});

export default router;
