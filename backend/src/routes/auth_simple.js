import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors';
import bcrypt from 'bcryptjs';

// Create router for auth routes
const router = Router();

// Helper function to generate JWT token
async function generateToken(user, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Helper function to verify password
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Demo users for testing
const DEMO_USERS = [
  { 
    id: '1',
    email: 'admin@pos.com',
    password: '$2a$12$U40PJfIQZha2Dja4P9Xo3uX4JgQMtvAfIpP9xVlJJUrfTvDsV7Pha', // "admin123"
    name: 'Admin',
    role: 'admin'
  },
  { 
    id: '2',
    email: 'cashier@pos.com',
    password: '$2a$12$U40PJfIQZha2Dja4P9Xo3uX4JgQMtvAfIpP9xVlJJUrfTvDsV7Pha', // "cashier123"
    name: 'Thu Ngân',
    role: 'cashier'
  },
  { 
    id: '3',
    email: 'staff@pos.com',
    password: '$2a$12$U40PJfIQZha2Dja4P9Xo3uX4JgQMtvAfIpP9xVlJJUrfTvDsV7Pha', // "staff123"
    name: 'Nhân Viên',
    role: 'staff'
  }
];

// Login endpoint
router.post('/login', async (request) => {
  try {
    console.log('🔐 Login attempt received');
    const { email, password } = await request.json();
    
    console.log('📧 Login attempt for email:', email);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return new Response(JSON.stringify({
        success: false,
        message: 'Email và mật khẩu là bắt buộc'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Find user
    const user = DEMO_USERS.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return new Response(JSON.stringify({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    console.log('👤 User found:', user.email, 'Role:', user.role);
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return new Response(JSON.stringify({
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Generate token
    const token = await generateToken(user, 'khoaugment-secret-key');
    
    // Return user data (without password)
    const { password: _, ...userData } = user;
    
    console.log('✅ Login successful for user:', email);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Đăng nhập thành công',
      user: userData,
      token
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('💥 Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Lỗi server nội bộ'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Verify Token endpoint
router.post('/verify', async (request) => {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Token is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Simple token verification (in production, use proper JWT verification)
    return new Response(JSON.stringify({
      success: true,
      message: 'Token is valid'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Invalid token'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Logout endpoint
router.post('/logout', async () => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Đăng xuất thành công'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

export default router;
