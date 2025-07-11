/**
 * ============================================================================
 * ENCRYPTION UTILITIES
 * ============================================================================
 * Password hashing and verification using Web Crypto API
 */

/**
 * Hash a password using PBKDF2
 * @param {string} password - Plain text password
 * @param {string} salt - Optional salt (will generate if not provided)
 * @returns {Promise<string>} - Hashed password with salt
 */
export async function hashPassword(password, salt = null) {
  const encoder = new TextEncoder();

  // Generate salt if not provided
  if (!salt) {
    const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
    salt = Array.from(saltBuffer, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `${salt}:${hashHex}`;
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Stored hash with salt
 * @returns {Promise<boolean>} - True if password matches
 */
export async function verifyPassword(password, hash) {
  try {
    const [salt, storedHash] = hash.split(':');
    if (!salt || !storedHash) {
      return false;
    }

    const newHash = await hashPassword(password, salt);
    const [, newHashValue] = newHash.split(':');

    return storedHash === newHashValue;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
export function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Generate a secure random token
 * @param {number} length - Length in bytes (default: 32)
 * @returns {string} - Hex encoded token
 */
export function generateSecureToken(length = 32) {
  const buffer = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
}