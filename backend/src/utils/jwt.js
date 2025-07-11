/**
 * ============================================================================
 * JWT UTILITIES
 * ============================================================================
 * JWT token creation and verification for Cloudflare Workers
 */

/**
 * Create a JWT token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret key
 * @param {number} expiresIn - Expiration time in seconds (default: 7 days)
 * @returns {Promise<string>} - JWT token
 */
export async function createJWT(payload, secret, expiresIn = 7 * 24 * 60 * 60) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));

  // Create signature
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await sign(data, secret);
  const encodedSignature = base64UrlEncode(signature);

  return `${data}.${encodedSignature}`;
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret key
 * @returns {Promise<Object|null>} - Decoded payload or null if invalid
 */
export async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Verify signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await sign(data, secret);
    const expectedEncodedSignature = base64UrlEncode(expectedSignature);

    if (encodedSignature !== expectedEncodedSignature) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Create HMAC-SHA256 signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {Promise<ArrayBuffer>} - Signature
 */
async function sign(data, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return await crypto.subtle.sign('HMAC', cryptoKey, messageData);
}

/**
 * Base64 URL encode
 * @param {string|ArrayBuffer} data - Data to encode
 * @returns {string} - Base64 URL encoded string
 */
function base64UrlEncode(data) {
  let base64;
  
  if (typeof data === 'string') {
    base64 = btoa(data);
  } else {
    // ArrayBuffer
    const bytes = new Uint8Array(data);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    base64 = btoa(binary);
  }

  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL decode
 * @param {string} data - Base64 URL encoded string
 * @returns {string} - Decoded string
 */
function base64UrlDecode(data) {
  // Add padding if needed
  const padded = data + '==='.slice((data.length + 3) % 4);
  
  // Replace URL-safe characters
  const base64 = padded
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return atob(base64);
}

/**
 * Generate a random JWT secret
 * @param {number} length - Secret length (default: 32)
 * @returns {string} - Random secret
 */
export function generateJWTSecret(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Extract token from Authorization header
 * @param {Request} request - HTTP request
 * @returns {string|null} - JWT token or null
 */
export function extractToken(request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Create refresh token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret key
 * @returns {Promise<string>} - Refresh token (30 days expiration)
 */
export async function createRefreshToken(payload, secret) {
  return await createJWT(payload, secret, 30 * 24 * 60 * 60); // 30 days
}

/**
 * Decode JWT without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token parts or null
 */
export function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload] = parts;
    
    return {
      header: JSON.parse(base64UrlDecode(encodedHeader)),
      payload: JSON.parse(base64UrlDecode(encodedPayload))
    };
  } catch (error) {
    return null;
  }
}

// Aliases for compatibility
export const generateJWT = createJWT;
export const generateRefreshToken = createRefreshToken;
