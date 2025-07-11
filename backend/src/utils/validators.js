/**
 * ============================================================================
 * VALIDATION UTILITIES
 * ============================================================================
 * Request validation and data sanitization functions
 */

/**
 * Validation schemas for different endpoints
 */
export const schemas = {
  // Authentication schemas
  login: {
    email: { type: 'email', required: true },
    password: { type: 'string', required: true, minLength: 6 }
  },

  register: {
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    email: { type: 'email', required: true },
    password: { type: 'string', required: true, minLength: 6, maxLength: 128 },
    role: { type: 'enum', values: ['admin', 'cashier', 'staff'], default: 'staff' },
    phone: { type: 'string', required: false, pattern: /^[\+]?[0-9\-\(\)\s]+$/ }
  },

  changePassword: {
    currentPassword: { type: 'string', required: true },
    newPassword: { type: 'string', required: true, minLength: 6, maxLength: 128 }
  },

  // Product schemas
  product: {
    sku: { type: 'string', required: true, minLength: 1, maxLength: 50 },
    name: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    description: { type: 'string', required: false, maxLength: 1000 },
    category_id: { type: 'string', required: false },
    price: { type: 'number', required: true, min: 0 },
    cost_price: { type: 'number', required: false, min: 0 },
    stock_quantity: { type: 'integer', required: false, min: 0, default: 0 },
    reorder_level: { type: 'integer', required: false, min: 0, default: 10 },
    barcode: { type: 'string', required: false, maxLength: 100 },
    weight: { type: 'number', required: false, min: 0 },
    tax_rate: { type: 'number', required: false, min: 0, max: 100, default: 0 }
  },

  // Customer schemas
  customer: {
    name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    email: { type: 'email', required: false },
    phone: { type: 'string', required: false, pattern: /^[\+]?[0-9\-\(\)\s]+$/ },
    address: { type: 'string', required: false, maxLength: 500 },
    city: { type: 'string', required: false, maxLength: 100 },
    postal_code: { type: 'string', required: false, maxLength: 20 },
    date_of_birth: { type: 'date', required: false }
  },

  // Order schemas
  order: {
    customer_id: { type: 'string', required: false },
    items: { type: 'array', required: true, minLength: 1 },
    payment_method: { type: 'enum', values: ['cash', 'card', 'digital_wallet', 'loyalty_points'], required: true },
    discount_amount: { type: 'number', required: false, min: 0, default: 0 },
    notes: { type: 'string', required: false, maxLength: 500 }
  },

  orderItem: {
    product_id: { type: 'string', required: true },
    quantity: { type: 'integer', required: true, min: 1 },
    unit_price: { type: 'number', required: true, min: 0 }
  }
};

/**
 * Validate request data against a schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} - { isValid: boolean, errors: array, sanitized: object }
 */
export function validateRequest(data, schema) {
  const errors = [];
  const sanitized = {};

  // Check required fields
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD'
      });
      continue;
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      if (rules.default !== undefined) {
        sanitized[field] = rules.default;
      }
      continue;
    }

    // Validate field
    const fieldValidation = validateField(field, value, rules);
    if (!fieldValidation.isValid) {
      errors.push(...fieldValidation.errors);
    } else {
      sanitized[field] = fieldValidation.value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field
 * @param {any} value - Value to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid: boolean, errors: array, value: any }
 */
function validateField(fieldName, value, rules) {
  const errors = [];
  let sanitizedValue = value;

  // Type validation
  switch (rules.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a string`,
          code: 'INVALID_TYPE'
        });
        break;
      }

      // Trim whitespace
      sanitizedValue = value.trim();

      // Length validation
      if (rules.minLength && sanitizedValue.length < rules.minLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${rules.minLength} characters`,
          code: 'MIN_LENGTH'
        });
      }

      if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at most ${rules.maxLength} characters`,
          code: 'MAX_LENGTH'
        });
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} format is invalid`,
          code: 'INVALID_FORMAT'
        });
      }
      break;

    case 'email':
      if (typeof value !== 'string') {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a string`,
          code: 'INVALID_TYPE'
        });
        break;
      }

      sanitizedValue = value.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(sanitizedValue)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a valid email address`,
          code: 'INVALID_EMAIL'
        });
      }
      break;

    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a valid number`,
          code: 'INVALID_NUMBER'
        });
        break;
      }

      sanitizedValue = numValue;

      if (rules.min !== undefined && numValue < rules.min) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${rules.min}`,
          code: 'MIN_VALUE'
        });
      }

      if (rules.max !== undefined && numValue > rules.max) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at most ${rules.max}`,
          code: 'MAX_VALUE'
        });
      }
      break;

    case 'integer':
      const intValue = parseInt(value);
      if (isNaN(intValue) || intValue !== Number(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a valid integer`,
          code: 'INVALID_INTEGER'
        });
        break;
      }

      sanitizedValue = intValue;

      if (rules.min !== undefined && intValue < rules.min) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${rules.min}`,
          code: 'MIN_VALUE'
        });
      }

      if (rules.max !== undefined && intValue > rules.max) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at most ${rules.max}`,
          code: 'MAX_VALUE'
        });
      }
      break;

    default:
      break;
  }

  return errors;
}

/**
 * Sanitize input value based on type
 */
function sanitizeValue(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string' ? value.trim() : String(value).trim();
    case 'number':
      return Number(value);
    case 'boolean':
      return Boolean(value);
    case 'email':
      return typeof value === 'string' ? value.trim().toLowerCase() : String(value).trim().toLowerCase();
    case 'array':
      return Array.isArray(value) ? value : [];
    case 'object':
      return typeof value === 'object' && value !== null ? value : {};
    default:
      return value;
  }
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}