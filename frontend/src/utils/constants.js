/**
 * Các hằng số và cấu hình cho ứng dụng
 */

// API config
export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://khoaugment-api.bangachieu2.workers.dev';
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const AUTH_TOKEN_KEY = 'pos_auth_token';
export const AUTH_USER_KEY = 'pos_auth_user';
export const TOKEN_EXPIRY_KEY = 'pos_token_expiry';
export const REFRESH_TOKEN_KEY = 'pos_refresh_token';
export const TOKEN_TYPE = 'Bearer';
export const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  STAFF: 'staff',
  CUSTOMER: 'customer'
};

// Permission definitions
export const PERMISSIONS = {
  // Users
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  
  // Products
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_PRODUCTS: 'view_products',
  
  // Orders
  MANAGE_ORDERS: 'manage_orders',
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDER: 'create_order',
  
  // Inventory
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_INVENTORY: 'view_inventory',
  
  // Customers
  MANAGE_CUSTOMERS: 'manage_customers',
  VIEW_CUSTOMERS: 'view_customers',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',
  
  // Cashier specific
  OPEN_SHIFT: 'open_shift',
  CLOSE_SHIFT: 'close_shift',
  PROCESS_PAYMENT: 'process_payment',
  APPLY_DISCOUNT: 'apply_discount',
  ISSUE_REFUND: 'issue_refund',
};

// Menu configs dựa trên role
export const ADMIN_MENU = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'DashboardOutlined',
  },
  {
    key: 'products',
    label: 'Sản phẩm',
    icon: 'ShoppingOutlined',
    children: [
      {
        key: 'product-list',
        label: 'Danh sách sản phẩm',
        path: '/admin/products',
        icon: 'UnorderedListOutlined',
      },
      {
        key: 'add-product',
        label: 'Thêm sản phẩm',
        path: '/admin/products/new',
        icon: 'PlusOutlined',
      },
      {
        key: 'price-optimization',
        label: 'Tối ưu giá',
        path: '/admin/products/price-optimization',
        icon: 'RiseOutlined',
      },
    ],
  },
  {
    key: 'inventory',
    label: 'Kho hàng',
    icon: 'InboxOutlined',
    children: [
      {
        key: 'inventory-dashboard',
        label: 'Tổng quan kho',
        path: '/admin/inventory',
        icon: 'DashboardOutlined',
      },
      {
        key: 'inventory-forecast',
        label: 'Dự báo nhu cầu',
        path: '/admin/inventory/forecasting',
        icon: 'AreaChartOutlined',
      },
    ],
  },
  {
    key: 'orders',
    label: 'Đơn hàng',
    icon: 'ShoppingCartOutlined',
    children: [
      {
        key: 'manage-orders',
        label: 'Quản lý đơn hàng',
        path: '/admin/orders',
        icon: 'UnorderedListOutlined',
      },
      {
        key: 'order-analytics',
        label: 'Phân tích đơn hàng',
        path: '/admin/orders/analytics',
        icon: 'BarChartOutlined',
      },
    ],
  },
  {
    key: 'customers',
    label: 'Khách hàng',
    icon: 'UserOutlined',
    children: [
      {
        key: 'customer-list',
        label: 'Danh sách khách hàng',
        path: '/admin/customers',
        icon: 'TeamOutlined',
      },
      {
        key: 'customer-segmentation',
        label: 'Phân khúc khách hàng',
        path: '/admin/customers/segmentation',
        icon: 'ClusterOutlined',
      },
    ],
  },
  {
    key: 'settings',
    label: 'Cài đặt',
    icon: 'SettingOutlined',
    children: [
      {
        key: 'system-settings',
        label: 'Cài đặt hệ thống',
        path: '/admin/settings',
        icon: 'ToolOutlined',
      },
      {
        key: 'user-management',
        label: 'Quản lý người dùng',
        path: '/admin/settings/users',
        icon: 'TeamOutlined',
      },
    ],
  },
];

export const CASHIER_MENU = [
  {
    key: 'pos',
    label: 'Bán hàng',
    path: '/cashier/pos',
    icon: 'ShoppingCartOutlined',
  },
  {
    key: 'orders',
    label: 'Đơn hàng',
    path: '/cashier/orders',
    icon: 'FileSearchOutlined',
  },
  {
    key: 'customers',
    label: 'Khách hàng',
    path: '/cashier/customers',
    icon: 'UserOutlined',
  },
  {
    key: 'session',
    label: 'Ca làm việc',
    icon: 'CalendarOutlined',
    children: [
      {
        key: 'start-shift',
        label: 'Mở ca',
        path: '/cashier/session/start',
        icon: 'PlayCircleOutlined',
      },
      {
        key: 'end-shift',
        label: 'Đóng ca',
        path: '/cashier/session/end',
        icon: 'PauseCircleOutlined',
      },
    ],
  },
];

export const STAFF_MENU = [
  {
    key: 'dashboard',
    label: 'Tổng quan',
    path: '/staff/dashboard',
    icon: 'DashboardOutlined',
  },
  {
    key: 'sales',
    label: 'Doanh số',
    path: '/staff/sales',
    icon: 'RiseOutlined',
  },
  {
    key: 'training',
    label: 'Đào tạo',
    icon: 'BookOutlined',
    children: [
      {
        key: 'product-knowledge',
        label: 'Kiến thức sản phẩm',
        path: '/staff/training/products',
        icon: 'LaptopOutlined',
      },
      {
        key: 'sales-skills',
        label: 'Kỹ năng bán hàng',
        path: '/staff/training/sales',
        icon: 'TrophyOutlined',
      },
    ],
  },
];

// Payment methods
export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Tiền mặt', icon: 'DollarOutlined' },
  { id: 'bank_transfer', name: 'Chuyển khoản', icon: 'BankOutlined' },
  { id: 'credit_card', name: 'Thẻ tín dụng', icon: 'CreditCardOutlined' },
  { id: 'momo', name: 'MoMo', icon: 'MobileOutlined' },
  { id: 'vnpay', name: 'VNPay', icon: 'WalletOutlined' },
  { id: 'zalopay', name: 'ZaloPay', icon: 'WalletOutlined' },
];

// Currency format
export const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 0,
});

// Format price function
export function formatPrice(price) {
  return currencyFormatter.format(price);
}

// Pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

// Date format
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Local storage keys
export const THEME_KEY = 'pos_theme';
export const LANGUAGE_KEY = 'pos_language';
export const ACTIVE_SHIFT_KEY = 'activeShift';