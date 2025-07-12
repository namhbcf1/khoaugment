import { message } from 'antd';
import axios, { AxiosError, AxiosResponse } from 'axios';

// API configuration
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8787/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      message.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
    } else if (error.response?.status >= 500) {
      message.error('Lỗi máy chủ. Vui lòng thử lại sau.');
    } else if (error.code === 'ECONNABORTED') {
      message.error('Yêu cầu bị timeout. Vui lòng thử lại.');
    } else {
      const errorMessage = error.response?.data?.error || 'Đã xảy ra lỗi không xác định';
      message.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

// API response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// Products API
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products');
    return response.data.data || [];
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error('Không tìm thấy sản phẩm');
    }
    return response.data.data;
  },

  create: async (product: CreateProductRequest): Promise<{ id: number }> => {
    const response = await api.post<ApiResponse<{ id: number }>>('/products', product);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể tạo sản phẩm');
    }
    return response.data.data!;
  },

  update: async (id: number, product: UpdateProductRequest): Promise<void> => {
    const response = await api.put<ApiResponse>(`/products/${id}`, product);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể cập nhật sản phẩm');
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/products/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể xóa sản phẩm');
    }
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data || [];
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error('Không tìm thấy danh mục');
    }
    return response.data.data;
  },

  create: async (category: CreateCategoryRequest): Promise<{ id: number }> => {
    const response = await api.post<ApiResponse<{ id: number }>>('/categories', category);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể tạo danh mục');
    }
    return response.data.data!;
  },

  update: async (id: number, category: UpdateCategoryRequest): Promise<void> => {
    const response = await api.put<ApiResponse>(`/categories/${id}`, category);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể cập nhật danh mục');
    }
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/categories/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể xóa danh mục');
    }
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/orders', { params });
    return response.data.data || [];
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error('Không tìm thấy đơn hàng');
    }
    return response.data.data;
  },

  create: async (order: CreateOrderRequest): Promise<{ order_number: string; total_amount: number }> => {
    const response = await api.post<ApiResponse<{ order_number: string; total_amount: number }>>('/orders', order);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể tạo đơn hàng');
    }
    return response.data.data!;
  },

  updateStatus: async (id: number, status: string): Promise<void> => {
    const response = await api.patch<ApiResponse>(`/orders/${id}/status`, { status });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể cập nhật trạng thái đơn hàng');
    }
  },
};

// Customers API
export const customersAPI = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<ApiResponse<Customer[]>>('/customers');
    return response.data.data || [];
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error('Không tìm thấy khách hàng');
    }
    return response.data.data;
  },

  create: async (customer: CreateCustomerRequest): Promise<{ id: number }> => {
    const response = await api.post<ApiResponse<{ id: number }>>('/customers', customer);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể tạo khách hàng');
    }
    return response.data.data!;
  },

  update: async (id: number, customer: UpdateCustomerRequest): Promise<void> => {
    const response = await api.put<ApiResponse>(`/customers/${id}`, customer);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể cập nhật khách hàng');
    }
  },

  search: async (query: string): Promise<Customer[]> => {
    const response = await api.get<ApiResponse<Customer[]>>(`/customers/search?q=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/analytics/dashboard');
    return response.data.data || {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
      revenueGrowth: 0,
    };
  },

  getSalesChart: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SalesChartData[]> => {
    const response = await api.get<ApiResponse<SalesChartData[]>>(`/analytics/sales-chart?period=${period}`);
    return response.data.data || [];
  },

  getTopProducts: async (limit: number = 10): Promise<TopProduct[]> => {
    const response = await api.get<ApiResponse<TopProduct[]>>(`/analytics/top-products?limit=${limit}`);
    return response.data.data || [];
  },
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file: File): Promise<{ url: string; key: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string; key: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể tải file lên');
    }

    return response.data.data!;
  },
};

// Inventory API
export const inventoryAPI = {
  getInventory: async (params?: { category_id?: number; low_stock?: boolean; search?: string; page?: number; limit?: number }): Promise<{ products: Product[]; summary: InventorySummary; pagination: Pagination }> => {
    const response = await api.get<ApiResponse<{ products: Product[]; summary: InventorySummary; pagination: Pagination }>>('/inventory', { params });
    return response.data.data || { products: [], summary: { total_products: 0, low_stock: 0, out_of_stock: 0, total_value: 0 }, pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } };
  },

  getLowStock: async (limit?: number): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/inventory/low-stock`, { params: { limit } });
    return response.data.data || [];
  },

  getMovements: async (productId: number, options?: { limit?: number; offset?: number }): Promise<InventoryMovement[]> => {
    const response = await api.get<ApiResponse<InventoryMovement[]>>(`/inventory/movements/${productId}`, { params: options });
    return response.data.data || [];
  },

  updateStock: async (productId: number, newStock: number, notes?: string): Promise<boolean> => {
    const response = await api.put<ApiResponse<{ success: boolean }>>('/inventory/stock', {
      product_id: productId,
      new_stock: newStock,
      notes
    });
    return response.data.success;
  },

  recordMovement: async (movement: {
    product_id: number;
    movement_type: 'purchase' | 'sale' | 'adjustment' | 'return';
    quantity_change: number;
    notes?: string;
    reference_id?: number;
    reference_type?: string;
  }): Promise<{ success: boolean; movement_id?: number; new_stock?: number }> => {
    const response = await api.post<ApiResponse<{ success: boolean; movement_id: number; new_stock: number }>>('/inventory/movement', movement);
    return response.data.data || { success: false };
  },

  getValuation: async (categoryId?: number): Promise<{ categories: InventoryValuationCategory[]; summary: ValuationSummary }> => {
    const response = await api.get<ApiResponse<{ categories: InventoryValuationCategory[]; summary: ValuationSummary }>>('/inventory/valuation', {
      params: { category_id: categoryId }
    });
    return response.data.data || { categories: [], summary: { total_products: 0, total_items: 0, total_value: 0 } };
  },

  getAlerts: async (): Promise<{ low_stock: Product[]; stock_history: StockHistory[]; recent_alerts: ActivityLog[] }> => {
    const response = await api.get<ApiResponse<{ low_stock: Product[]; stock_history: StockHistory[]; recent_alerts: ActivityLog[] }>>('/inventory/alerts');
    return response.data.data || { low_stock: [], stock_history: [], recent_alerts: [] };
  }
};

// Types
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

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  customer_id?: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  completed_at?: string;
  items: OrderItem[];
  cashier_name?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
}

export interface CreateOrderRequest {
  customer_id?: number;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
  }[];
  payment_method: 'cash' | 'card' | 'vnpay' | 'momo' | 'zalopay';
  discount_amount?: number;
  notes?: string;
}

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

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
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

export default api; 

// Additional types for inventory management
export interface InventorySummary {
  total_products: number;
  low_stock: number;
  out_of_stock: number;
  total_value: number;
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference_id?: number;
  reference_type?: string;
  notes?: string;
  user_id: number;
  user_name?: string;
  created_at: string;
}

export interface InventoryValuationCategory {
  category_name: string;
  total_items: number;
  total_value: number;
  product_count: number;
  average_cost: number;
}

export interface ValuationSummary {
  total_products: number;
  total_items: number;
  total_value: number;
}

export interface StockHistory {
  product_id: number;
  product_name: string;
  movements: InventoryMovement[];
}

export interface ActivityLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
} 