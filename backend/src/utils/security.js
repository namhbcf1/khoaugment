/**
 * Security Utilities
 * Input Validation, SQL Injection Prevention, and Security Headers
 * Trường Phát Computer Hòa Bình
 */

/**
 * Input validation utilities
 */
export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Vietnamese format)
   */
  static isValidPhone(phone) {
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate SKU format
   */
  static isValidSKU(sku) {
    const skuRegex = /^[A-Z0-9\-]{3,20}$/;
    return skuRegex.test(sku);
  }

  /**
   * Validate barcode format
   */
  static isValidBarcode(barcode) {
    const barcodeRegex = /^[0-9]{8,13}$/;
    return barcodeRegex.test(barcode);
  }

  /**
   * Validate price (positive number with max 2 decimal places)
   */
  static isValidPrice(price) {
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    return priceRegex.test(price.toString()) && parseFloat(price) > 0;
  }

  /**
   * Validate quantity (positive integer)
   */
  static isValidQuantity(quantity) {
    return Number.isInteger(quantity) && quantity >= 0;
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes to prevent injection
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate and sanitize object
   */
  static validateObject(obj, schema) {
    const errors = [];
    const sanitized = {};

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} is required`);
        continue;
      }

      // Skip validation if field is optional and empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} must be of type ${rules.type}`);
        continue;
      }

      // Custom validation
      if (rules.validator && !rules.validator(value)) {
        errors.push(`${key} is invalid`);
        continue;
      }

      // Sanitize and add to result
      if (rules.sanitize) {
        sanitized[key] = rules.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return { isValid: errors.length === 0, errors, data: sanitized };
  }
}

/**
 * SQL injection prevention utilities
 */
export class SQLSecurity {
  /**
   * Escape SQL string
   */
  static escapeString(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/'/g, "''");
  }

  /**
   * Validate SQL identifier (table/column names)
   */
  static isValidIdentifier(identifier) {
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return identifierRegex.test(identifier);
  }

  /**
   * Build safe WHERE clause
   */
  static buildWhereClause(conditions) {
    const validConditions = [];
    const params = [];

    for (const [field, value] of Object.entries(conditions)) {
      if (!this.isValidIdentifier(field)) {
        throw new Error(`Invalid field name: ${field}`);
      }

      if (Array.isArray(value)) {
        const placeholders = value.map(() => '?').join(',');
        validConditions.push(`${field} IN (${placeholders})`);
        params.push(...value);
      } else {
        validConditions.push(`${field} = ?`);
        params.push(value);
      }
    }

    return {
      clause: validConditions.length > 0 ? validConditions.join(' AND ') : '1=1',
      params
    };
  }

  /**
   * Validate ORDER BY clause
   */
  static validateOrderBy(orderBy, allowedFields) {
    const parts = orderBy.split(' ');
    const field = parts[0];
    const direction = parts[1] || 'ASC';

    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid sort field: ${field}`);
    }

    if (!['ASC', 'DESC'].includes(direction.toUpperCase())) {
      throw new Error(`Invalid sort direction: ${direction}`);
    }

    return `${field} ${direction.toUpperCase()}`;
  }
}

/**
 * Security headers utility
 */
export class SecurityHeaders {
  /**
   * Add security headers to response
   */
  static addSecurityHeaders(response) {
    // Content Security Policy
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' wss: https:;"
    );

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    // XSS Protection
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // HSTS (HTTP Strict Transport Security)
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    response.headers.set('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=()'
    );

    return response;
  }

  /**
   * Security headers middleware
   */
  static middleware() {
    return async (request, env, ctx) => {
      const response = await ctx.next();
      return this.addSecurityHeaders(response);
    };
  }
}

/**
 * Authentication security utilities
 */
export class AuthSecurity {
  /**
   * Generate secure random token
   */
  static generateSecureToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Hash password with salt
   */
  static async hashPassword(password, saltRounds = 12) {
    // Note: In production, use bcrypt or similar
    // This is a simplified version for demonstration
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password, hash) {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hash;
  }

  /**
   * Check for common passwords
   */
  static isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken() {
    return this.generateSecureToken(32);
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token, expectedToken) {
    return token === expectedToken;
  }
}

/**
 * Request validation middleware
 */
export class RequestValidator {
  /**
   * Validate request size
   */
  static validateRequestSize(maxSize = 10 * 1024 * 1024) { // 10MB default
    return async (request, env, ctx) => {
      const contentLength = request.headers.get('Content-Length');
      
      if (contentLength && parseInt(contentLength) > maxSize) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Request too large'
        }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return ctx.next();
    };
  }

  /**
   * Validate content type
   */
  static validateContentType(allowedTypes = ['application/json']) {
    return async (request, env, ctx) => {
      if (request.method === 'POST' || request.method === 'PUT') {
        const contentType = request.headers.get('Content-Type');
        
        if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Invalid content type'
          }), {
            status: 415,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      return ctx.next();
    };
  }

  /**
   * Validate request origin
   */
  static validateOrigin(allowedOrigins = []) {
    return async (request, env, ctx) => {
      const origin = request.headers.get('Origin');
      
      if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Origin not allowed'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return ctx.next();
    };
  }
}

/**
 * Audit logging utility
 */
export class AuditLogger {
  /**
   * Log security event
   */
  static async logSecurityEvent(event, details, env) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event_type: event,
      details,
      ip_address: details.ip || 'unknown',
      user_agent: details.userAgent || 'unknown'
    };

    try {
      // In production, send to logging service
      console.log('Security Event:', JSON.stringify(logEntry));
      
      // Store in KV for analysis
      if (env.KV) {
        const key = `security_log:${Date.now()}:${Math.random()}`;
        await env.KV.put(key, JSON.stringify(logEntry), { expirationTtl: 86400 * 30 }); // 30 days
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log failed login attempt
   */
  static async logFailedLogin(email, ip, userAgent, env) {
    await this.logSecurityEvent('failed_login', {
      email,
      ip,
      userAgent,
      severity: 'medium'
    }, env);
  }

  /**
   * Log successful login
   */
  static async logSuccessfulLogin(userId, email, ip, userAgent, env) {
    await this.logSecurityEvent('successful_login', {
      userId,
      email,
      ip,
      userAgent,
      severity: 'low'
    }, env);
  }

  /**
   * Log suspicious activity
   */
  static async logSuspiciousActivity(activity, details, env) {
    await this.logSecurityEvent('suspicious_activity', {
      activity,
      ...details,
      severity: 'high'
    }, env);
  }
}
