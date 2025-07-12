/**
 * API Types
 * Type definitions for API requests and responses
 *
 * @author KhoAugment POS
 * @version 1.0.0
 */

/**
 * Standard API Response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T>
  extends ApiResponse<{
    items: T[];
    pagination: PaginationInfo;
  }> {}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Product Types
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock: number;
  min_stock: number;
  barcode?: string;
  category_id?: number;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock: number;
  min_stock?: number;
  barcode?: string;
  category_id?: number;
  image_url?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

/**
 * Category Types
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  active: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

/**
 * Order Types
 */
export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  customer_id?: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  completed_at?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface CreateOrderRequest {
  customer_id?: number;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
  }[];
  payment_method: PaymentMethod;
  discount_amount?: number;
  notes?: string;
}

export type PaymentMethod = "cash" | "card" | "vnpay" | "momo" | "zalopay";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type OrderStatus = "pending" | "completed" | "cancelled" | "refunded";

/**
 * Customer Types
 */
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  loyalty_points: number;
  active: boolean;
  created_at: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

/**
 * Analytics & Dashboard Types
 */
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface SalesChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  total_revenue: number;
}

/**
 * Inventory Types
 */
export interface InventorySummary {
  total_products: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  movement_type: "sale" | "purchase" | "adjustment" | "return";
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference_id?: number;
  reference_type?: string;
  notes?: string;
  user_id: number;
  created_at: string;
  product?: {
    id: number;
    name: string;
  };
}

export interface InventoryValuationCategory {
  category_id: number;
  category_name: string;
  product_count: number;
  total_value: number;
}

export interface ValuationSummary {
  total_value: number;
  by_category: InventoryValuationCategory[];
}

export interface StockHistory {
  date: string;
  quantity: number;
  value: number;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    id: number;
    full_name: string;
  };
}

/**
 * File Upload Types
 */
export interface UploadResponse {
  url: string;
  key: string;
}

/**
 * Error Types
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Auth Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    role: string;
    full_name: string;
  };
  permissions: string[];
  roles: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}
