/**
 * Production Security Service
 * Implements comprehensive security measures for production environment
 */

import CryptoJS from 'crypto-js';

// Security configuration
const SECURITY_CONFIG = {
  // Encryption settings
  ENCRYPTION_KEY: (typeof process !== 'undefined' && process.env && process.env.REACT_APP_ENCRYPTION_KEY) || 'khoaugment-default-key-32-chars!!',
  IV_LENGTH: 16,
  
  // Session settings
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  }
};

class SecurityService {
  constructor() {
    this.loginAttempts = new Map();
    this.sessionData = new Map();
    this.securityEvents = [];
    this.initializeSecurity();
  }

  /**
   * Initialize security measures
   */
  initializeSecurity() {
    // Set up session monitoring
    this.setupSessionMonitoring();
    
    // Set up security headers (for development)
    this.setupSecurityHeaders();
    
    // Set up input sanitization
    this.setupInputSanitization();
    
    // Set up CSRF protection
    this.setupCSRFProtection();
    
    // Monitor for security events
    this.setupSecurityMonitoring();
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data) {
    try {
      const iv = CryptoJS.lib.WordArray.random(SECURITY_CONFIG.IV_LENGTH);
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data), 
        SECURITY_CONFIG.ENCRYPTION_KEY,
        { iv: iv }
      );
      
      return {
        encrypted: encrypted.toString(),
        iv: iv.toString()
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData, iv) {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData,
        SECURITY_CONFIG.ENCRYPTION_KEY,
        { iv: CryptoJS.enc.Hex.parse(iv) }
      );
      
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash passwords securely
   */
  hashPassword(password, salt = null) {
    if (!salt) {
      salt = CryptoJS.lib.WordArray.random(128/8).toString();
    }
    
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    return {
      hash: hash.toString(),
      salt: salt
    };
  }

  /**
   * Verify password against hash
   */
  verifyPassword(password, hash, salt) {
    const computed = this.hashPassword(password, salt);
    return computed.hash === hash;
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    const errors = [];
    
    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Mật khẩu phải có ít nhất ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} ký tự`);
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số');
    }
    
    if (SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      strength: this.calculatePasswordStrength(password)
    };
  }

  /**
   * Calculate password strength
   */
  calculatePasswordStrength(password) {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 2, 20);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 10; // Common patterns
    
    if (score < 30) return 'weak';
    if (score < 60) return 'medium';
    if (score < 80) return 'strong';
    return 'very-strong';
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check for login attempts and implement rate limiting
   */
  checkLoginAttempts(identifier) {
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    const now = Date.now();
    
    // Reset attempts if lockout period has passed
    if (now - attempts.lastAttempt > SECURITY_CONFIG.LOCKOUT_DURATION) {
      attempts.count = 0;
    }
    
    if (attempts.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const timeLeft = SECURITY_CONFIG.LOCKOUT_DURATION - (now - attempts.lastAttempt);
      if (timeLeft > 0) {
        throw new Error(`Tài khoản bị khóa. Thử lại sau ${Math.ceil(timeLeft / 60000)} phút`);
      }
    }
    
    return true;
  }

  /**
   * Record failed login attempt
   */
  recordFailedLogin(identifier) {
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(identifier, attempts);
    
    this.logSecurityEvent('failed_login', { identifier, attempts: attempts.count });
  }

  /**
   * Clear login attempts on successful login
   */
  clearLoginAttempts(identifier) {
    this.loginAttempts.delete(identifier);
  }

  /**
   * Generate secure session token
   */
  generateSessionToken() {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * Create secure session
   */
  createSession(userId, userData) {
    const sessionId = this.generateSessionToken();
    const sessionData = {
      userId,
      userData,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };
    
    this.sessionData.set(sessionId, sessionData);
    
    // Set session timeout
    setTimeout(() => {
      this.destroySession(sessionId);
    }, SECURITY_CONFIG.SESSION_TIMEOUT);
    
    return sessionId;
  }

  /**
   * Validate session
   */
  validateSession(sessionId) {
    const session = this.sessionData.get(sessionId);
    
    if (!session) {
      throw new Error('Invalid session');
    }
    
    const now = Date.now();
    if (now - session.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
      this.destroySession(sessionId);
      throw new Error('Session expired');
    }
    
    // Update last activity
    session.lastActivity = now;
    this.sessionData.set(sessionId, session);
    
    return session;
  }

  /**
   * Destroy session
   */
  destroySession(sessionId) {
    this.sessionData.delete(sessionId);
  }

  /**
   * Get client IP address (best effort in browser)
   */
  getClientIP() {
    // In a real application, this would be handled by the server
    return 'client-ip-unknown';
  }

  /**
   * Setup session monitoring
   */
  setupSessionMonitoring() {
    // Monitor for multiple tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key === 'security_event') {
        this.handleSecurityEvent(JSON.parse(e.newValue));
      }
    });
    
    // Monitor for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logSecurityEvent('page_hidden');
      } else {
        this.logSecurityEvent('page_visible');
      }
    });
  }

  /**
   * Setup security headers (for development reference)
   */
  setupSecurityHeaders() {
    // In production, these should be set by the server
    console.log('Security headers should be configured on the server:', SECURITY_CONFIG.SECURITY_HEADERS);
  }

  /**
   * Setup input sanitization
   */
  setupInputSanitization() {
    // Add global input sanitization
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
        const sanitized = this.sanitizeInput(e.target.value);
        if (sanitized !== e.target.value) {
          e.target.value = sanitized;
          this.logSecurityEvent('input_sanitized', { element: e.target.name });
        }
      }
    });
  }

  /**
   * Setup CSRF protection
   */
  setupCSRFProtection() {
    // Generate CSRF token
    this.csrfToken = this.generateSessionToken();
    
    // Add CSRF token to all forms
    document.addEventListener('submit', (e) => {
      if (e.target.tagName === 'FORM') {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf';
        csrfInput.value = this.csrfToken;
        e.target.appendChild(csrfInput);
      }
    });
  }

  /**
   * Setup security monitoring
   */
  setupSecurityMonitoring() {
    // Monitor for suspicious activities
    let clickCount = 0;
    let lastClickTime = 0;
    
    document.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime < 100) {
        clickCount++;
        if (clickCount > 10) {
          this.logSecurityEvent('suspicious_clicking', { count: clickCount });
        }
      } else {
        clickCount = 0;
      }
      lastClickTime = now;
    });
  }

  /**
   * Log security events
   */
  logSecurityEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data: data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.securityEvents.push(event);
    
    // Keep only last 100 events
    if (this.securityEvents.length > 100) {
      this.securityEvents.shift();
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('security_events', JSON.stringify(this.securityEvents.slice(-10)));
    
    console.log('Security event:', event);
  }

  /**
   * Handle security events
   */
  handleSecurityEvent(event) {
    switch (event.type) {
      case 'multiple_sessions':
        this.handleMultipleSessions();
        break;
      case 'suspicious_activity':
        this.handleSuspiciousActivity(event.data);
        break;
      default:
        console.log('Unhandled security event:', event);
    }
  }

  /**
   * Handle multiple sessions
   */
  handleMultipleSessions() {
    const confirmed = window.confirm(
      'Phát hiện đăng nhập từ thiết bị khác. Bạn có muốn tiếp tục phiên làm việc này không?'
    );
    
    if (!confirmed) {
      this.logout();
    }
  }

  /**
   * Handle suspicious activity
   */
  handleSuspiciousActivity(data) {
    this.logSecurityEvent('security_alert', data);
    
    // Could implement additional measures like:
    // - Require re-authentication
    // - Lock account temporarily
    // - Send security notification
  }

  /**
   * Secure logout
   */
  logout() {
    // Clear all session data
    this.sessionData.clear();
    
    // Clear sensitive data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Clear sensitive data from sessionStorage
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Get security report
   */
  getSecurityReport() {
    return {
      loginAttempts: this.loginAttempts.size,
      activeSessions: this.sessionData.size,
      securityEvents: this.securityEvents.length,
      lastEvents: this.securityEvents.slice(-5),
      securityConfig: {
        sessionTimeout: SECURITY_CONFIG.SESSION_TIMEOUT,
        maxLoginAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
        passwordRequirements: {
          minLength: SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
          requireUppercase: SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE,
          requireLowercase: SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE,
          requireNumbers: SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS,
          requireSpecial: SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL
        }
      }
    };
  }
}

// Export singleton instance
export default new SecurityService();
