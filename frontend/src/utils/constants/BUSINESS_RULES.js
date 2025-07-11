/**
 * Business Rules Configuration
 * Centralized business logic and validation rules for KhoChuan POS
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

/**
 * Product Management Rules
 */
export const PRODUCT_RULES = {
  // Price constraints
  MIN_PRICE: 1000, // Minimum price in VND
  MAX_PRICE: 100000000, // Maximum price in VND (100 million)
  PRICE_DECIMAL_PLACES: 0, // No decimal places for VND
  
  // Stock constraints
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
  LOW_STOCK_THRESHOLD: 10,
  CRITICAL_STOCK_THRESHOLD: 5,
  
  // Product code rules
  PRODUCT_CODE_MIN_LENGTH: 3,
  PRODUCT_CODE_MAX_LENGTH: 20,
  PRODUCT_CODE_PATTERN: /^[A-Z0-9-_]+$/,
  
  // Name constraints
  PRODUCT_NAME_MIN_LENGTH: 2,
  PRODUCT_NAME_MAX_LENGTH: 100,
  
  // Description constraints
  DESCRIPTION_MAX_LENGTH: 1000,
  
  // Image constraints
  MAX_IMAGES_PER_PRODUCT: 10,
  MAX_IMAGE_SIZE_MB: 5,
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  
  // Category constraints
  MAX_CATEGORIES_PER_PRODUCT: 5,
  CATEGORY_NAME_MAX_LENGTH: 50,
};

/**
 * Order Management Rules
 */
export const ORDER_RULES = {
  // Order value constraints
  MIN_ORDER_VALUE: 1000, // Minimum order value in VND
  MAX_ORDER_VALUE: 50000000, // Maximum order value in VND
  
  // Quantity constraints
  MIN_QUANTITY: 1,
  MAX_QUANTITY_PER_ITEM: 999,
  MAX_ITEMS_PER_ORDER: 100,
  
  // Discount rules
  MAX_DISCOUNT_PERCENTAGE: 50, // Maximum 50% discount
  MAX_DISCOUNT_AMOUNT: 5000000, // Maximum 5 million VND discount
  
  // Payment rules
  CASH_PAYMENT_MAX: 20000000, // Maximum cash payment 20 million VND
  CARD_PAYMENT_MIN: 10000, // Minimum card payment 10k VND
  
  // Order status flow
  ALLOWED_STATUS_TRANSITIONS: {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'returned'],
    'delivered': ['completed', 'returned'],
    'completed': [],
    'cancelled': [],
    'returned': ['refunded'],
    'refunded': [],
  },
  
  // Cancellation rules
  CANCELLATION_TIME_LIMIT_HOURS: 24, // Can cancel within 24 hours
  REFUND_TIME_LIMIT_DAYS: 7, // Can refund within 7 days
  
  // Receipt rules
  RECEIPT_NUMBER_LENGTH: 10,
  RECEIPT_NUMBER_PREFIX: 'TP',
};

/**
 * Customer Management Rules
 */
export const CUSTOMER_RULES = {
  // Personal information
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_PATTERN: /^(0|\+84)[0-9]{9,10}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Address constraints
  ADDRESS_MAX_LENGTH: 200,
  CITY_MAX_LENGTH: 50,
  DISTRICT_MAX_LENGTH: 50,
  WARD_MAX_LENGTH: 50,
  
  // Loyalty program
  POINTS_PER_VND: 0.01, // 1 point per 100 VND spent
  MIN_POINTS_FOR_REDEMPTION: 100,
  POINTS_EXPIRY_MONTHS: 12,
  
  // Customer tiers
  TIER_THRESHOLDS: {
    BRONZE: 0,
    SILVER: 1000000, // 1 million VND total spent
    GOLD: 5000000, // 5 million VND total spent
    PLATINUM: 20000000, // 20 million VND total spent
    DIAMOND: 50000000, // 50 million VND total spent
  },
  
  // Tier benefits (discount percentage)
  TIER_DISCOUNTS: {
    BRONZE: 0,
    SILVER: 2,
    GOLD: 5,
    PLATINUM: 8,
    DIAMOND: 10,
  },
};

/**
 * Staff Management Rules
 */
export const STAFF_RULES = {
  // Personal information
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMPLOYEE_ID_LENGTH: 8,
  EMPLOYEE_ID_PREFIX: 'TP',
  
  // Contact information
  PHONE_PATTERN: /^(0|\+84)[0-9]{9,10}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Work schedule
  MAX_HOURS_PER_DAY: 12,
  MAX_HOURS_PER_WEEK: 48,
  MIN_BREAK_HOURS: 1,
  
  // Salary constraints
  MIN_HOURLY_RATE: 25000, // Minimum wage in VND
  MAX_HOURLY_RATE: 200000,
  MIN_MONTHLY_SALARY: 4000000, // Minimum monthly salary
  MAX_MONTHLY_SALARY: 50000000,
  
  // Commission rules
  DEFAULT_COMMISSION_RATE: 2, // 2% commission on sales
  MAX_COMMISSION_RATE: 10, // Maximum 10% commission
  MIN_SALES_FOR_COMMISSION: 1000000, // Minimum 1M VND sales for commission
  
  // Performance metrics
  MIN_SALES_TARGET_MONTHLY: 10000000, // 10M VND monthly target
  ATTENDANCE_THRESHOLD: 95, // 95% attendance required
  CUSTOMER_SATISFACTION_THRESHOLD: 4.0, // 4.0/5.0 rating required
};

/**
 * Inventory Management Rules
 */
export const INVENTORY_RULES = {
  // Stock levels
  REORDER_POINT_MULTIPLIER: 1.5, // Reorder when stock = 1.5 * average daily sales
  SAFETY_STOCK_DAYS: 7, // Keep 7 days of safety stock
  MAX_STOCK_DAYS: 90, // Maximum 90 days of stock
  
  // Stock movements
  MAX_ADJUSTMENT_PERCENTAGE: 20, // Maximum 20% stock adjustment without approval
  STOCK_COUNT_FREQUENCY_DAYS: 30, // Monthly stock count
  
  // Warehouse rules
  MAX_WAREHOUSES: 10,
  WAREHOUSE_NAME_MAX_LENGTH: 50,
  
  // Transfer rules
  MIN_TRANSFER_QUANTITY: 1,
  MAX_TRANSFER_QUANTITY: 1000,
  TRANSFER_APPROVAL_THRESHOLD: 1000000, // Transfers over 1M VND need approval
};

/**
 * Payment Rules
 */
export const PAYMENT_RULES = {
  // Payment methods
  ALLOWED_PAYMENT_METHODS: ['cash', 'card', 'bank_transfer', 'e_wallet', 'qr_code'],
  
  // Cash handling
  MAX_CASH_DENOMINATION: 500000, // 500k VND notes
  CASH_DRAWER_LIMIT: 10000000, // 10M VND max in cash drawer
  
  // Card payments
  CARD_PROCESSING_FEE_PERCENTAGE: 2.5,
  MIN_CARD_AMOUNT: 10000,
  
  // Digital payments
  QR_CODE_EXPIRY_MINUTES: 15,
  E_WALLET_PROCESSING_FEE: 1.5, // 1.5% fee
  
  // Refund rules
  CASH_REFUND_LIMIT: 5000000, // 5M VND max cash refund
  REFUND_PROCESSING_DAYS: 3, // 3 business days for non-cash refunds
};

/**
 * Security Rules
 */
export const SECURITY_RULES = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL_CHARS: true,
  PASSWORD_EXPIRY_DAYS: 90,
  
  // Session management
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_CONCURRENT_SESSIONS: 3,
  
  // Login security
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  
  // Data access
  AUDIT_LOG_RETENTION_DAYS: 365,
  SENSITIVE_DATA_MASK_PATTERN: '****',
  
  // API security
  RATE_LIMIT_REQUESTS_PER_MINUTE: 100,
  API_KEY_EXPIRY_DAYS: 365,
};

/**
 * System Configuration Rules
 */
export const SYSTEM_RULES = {
  // Database
  MAX_RECORDS_PER_PAGE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_EXPORT_RECORDS: 10000,
  
  // File uploads
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'],
  
  // Backup
  BACKUP_FREQUENCY_HOURS: 6,
  BACKUP_RETENTION_DAYS: 30,
  
  // Performance
  CACHE_TTL_MINUTES: 15,
  MAX_CONCURRENT_USERS: 100,
  
  // Notifications
  MAX_NOTIFICATIONS_PER_USER: 50,
  NOTIFICATION_RETENTION_DAYS: 30,
};

/**
 * Business Hours Configuration
 */
export const BUSINESS_HOURS = {
  MONDAY: { open: '08:00', close: '22:00' },
  TUESDAY: { open: '08:00', close: '22:00' },
  WEDNESDAY: { open: '08:00', close: '22:00' },
  THURSDAY: { open: '08:00', close: '22:00' },
  FRIDAY: { open: '08:00', close: '22:00' },
  SATURDAY: { open: '08:00', close: '23:00' },
  SUNDAY: { open: '09:00', close: '21:00' },
};

/**
 * Tax Configuration
 */
export const TAX_RULES = {
  DEFAULT_VAT_RATE: 10, // 10% VAT in Vietnam
  TAX_EXEMPT_THRESHOLD: 0, // No tax exemption threshold
  TAX_CALCULATION_METHOD: 'inclusive', // Tax included in price
};

/**
 * Currency Configuration
 */
export const CURRENCY_RULES = {
  PRIMARY_CURRENCY: 'VND',
  CURRENCY_SYMBOL: '₫',
  DECIMAL_PLACES: 0,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
  CURRENCY_POSITION: 'after', // Symbol after amount
};

/**
 * Validation helper functions
 */
export const VALIDATION_HELPERS = {
  isValidPrice: (price) => price >= PRODUCT_RULES.MIN_PRICE && price <= PRODUCT_RULES.MAX_PRICE,
  isValidStock: (stock) => stock >= PRODUCT_RULES.MIN_STOCK && stock <= PRODUCT_RULES.MAX_STOCK,
  isValidPhone: (phone) => CUSTOMER_RULES.PHONE_PATTERN.test(phone),
  isValidEmail: (email) => CUSTOMER_RULES.EMAIL_PATTERN.test(email),
  isValidProductCode: (code) => PRODUCT_RULES.PRODUCT_CODE_PATTERN.test(code),
  isBusinessHours: (day, time) => {
    const hours = BUSINESS_HOURS[day.toUpperCase()];
    return hours && time >= hours.open && time <= hours.close;
  },
};

export default {
  PRODUCT_RULES,
  ORDER_RULES,
  CUSTOMER_RULES,
  STAFF_RULES,
  INVENTORY_RULES,
  PAYMENT_RULES,
  SECURITY_RULES,
  SYSTEM_RULES,
  BUSINESS_HOURS,
  TAX_RULES,
  CURRENCY_RULES,
  VALIDATION_HELPERS,
};
