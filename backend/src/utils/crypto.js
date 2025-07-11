/**
 * Cryptographic Utilities
 * Password hashing and verification using Web Crypto API
 */

/**
 * Hash a password using PBKDF2
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password with salt
 */
export async function hashPassword(password) {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Convert password to ArrayBuffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import the password as a key
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive the hash
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  // Convert to hex strings
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return salt:hash format
  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Stored hash in salt:hash format
 * @returns {Promise<boolean>} - True if password matches
 */
export async function verifyPassword(password, hash) {
  try {
    // Split salt and hash
    const [saltHex, hashHex] = hash.split(':');
    if (!saltHex || !hashHex) {
      return false;
    }
    
    // Convert hex strings back to Uint8Array
    const salt = new Uint8Array(saltHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    const storedHash = new Uint8Array(hashHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    
    // Convert password to ArrayBuffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import the password as a key
    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive the hash with the same parameters
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
    const computedHash = new Uint8Array(hashBuffer);
    
    // Compare hashes
    if (computedHash.length !== storedHash.length) {
      return false;
    }
    
    for (let i = 0; i < computedHash.length; i++) {
      if (computedHash[i] !== storedHash[i]) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate a random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} - Random hex token
 */
export function generateRandomToken(length = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash data using SHA-256
 * @param {string} data - Data to hash
 * @returns {Promise<string>} - SHA-256 hash in hex format
 */
export async function sha256Hash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypt data using AES-GCM
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key (32 characters)
 * @returns {Promise<string>} - Encrypted data with IV in format iv:encrypted
 */
export async function encryptData(data, key) {
  try {
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Convert key to ArrayBuffer
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(key.padEnd(32, '0').substring(0, 32));
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Encrypt the data
    const dataBuffer = encoder.encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      dataBuffer
    );
    
    // Convert to hex strings
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const encryptedHex = Array.from(new Uint8Array(encryptedBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${ivHex}:${encryptedHex}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data using AES-GCM
 * @param {string} encryptedData - Encrypted data in format iv:encrypted
 * @param {string} key - Decryption key (32 characters)
 * @returns {Promise<string>} - Decrypted data
 */
export async function decryptData(encryptedData, key) {
  try {
    // Split IV and encrypted data
    const [ivHex, encryptedHex] = encryptedData.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid encrypted data format');
    }
    
    // Convert hex strings back to Uint8Array
    const iv = new Uint8Array(ivHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    const encrypted = new Uint8Array(encryptedHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    
    // Convert key to ArrayBuffer
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(key.padEnd(32, '0').substring(0, 32));
    
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encrypted
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Generate a secure session ID
 * @returns {string} - Secure session ID
 */
export function generateSessionId() {
  return generateRandomToken(32);
}

/**
 * Create a HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {Promise<string>} - HMAC signature in hex format
 */
export async function createHMAC(data, secret) {
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(secret);
  const dataBuffer = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
  const signatureArray = new Uint8Array(signature);
  
  return Array.from(signatureArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - HMAC signature to verify
 * @param {string} secret - Secret key
 * @returns {Promise<boolean>} - True if signature is valid
 */
export async function verifyHMAC(data, signature, secret) {
  try {
    const computedSignature = await createHMAC(data, secret);
    return computedSignature === signature;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}
