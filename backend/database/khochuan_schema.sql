-- ============================================================================
-- KHOCHUAN POS SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Complete database schema for KhoChuan POS system
-- Based on CHUAN.MD specifications
-- Compatible with Cloudflare D1 (SQLite)

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table - System users (admin, manager, cashier, staff, customer)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'staff', 'customer')),
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locations table - Store locations
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table - Product suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table - Product categories (hierarchical)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id TEXT,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Products table - Product catalog
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  tax_rate DECIMAL(5,2) DEFAULT 0,
  category_id TEXT,
  supplier_id TEXT,
  image_urls TEXT, -- JSON array of image URLs
  attributes TEXT, -- JSON for variants like color, size, etc.
  is_active BOOLEAN DEFAULT 1,
  track_inventory BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Inventory table - Stock management
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  max_stock INTEGER,
  last_counted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  UNIQUE(product_id, location_id)
);

-- Customers table - Customer management
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  segment TEXT, -- VIP, Regular, New, etc.
  preferences TEXT, -- JSON for shopping preferences
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table - Sales orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  cashier_id TEXT,
  location_id TEXT,
  channel TEXT DEFAULT 'pos', -- pos, online, mobile
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'completed',
  payment_status TEXT DEFAULT 'paid',
  notes TEXT,
  metadata TEXT, -- JSON for additional order data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (cashier_id) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Order items table - Order line items
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Payments table - Payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id TEXT NOT NULL,
  method TEXT NOT NULL, -- cash, card, qr, mobile
  amount DECIMAL(10,2) NOT NULL,
  reference_number TEXT,
  status TEXT DEFAULT 'completed',
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- Achievements table - Available achievements
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria TEXT NOT NULL, -- JSON for achievement criteria
  reward_points INTEGER DEFAULT 0,
  reward_type TEXT, -- points, badge, bonus
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Staff achievements table - User achievements
CREATE TABLE IF NOT EXISTS staff_achievements (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  staff_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  progress DECIMAL(5,2) DEFAULT 0, -- Progress percentage
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id),
  UNIQUE(staff_id, achievement_id)
);

-- Staff performance table - Performance tracking
CREATE TABLE IF NOT EXISTS staff_performance (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  staff_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  customers_served INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  commission_earned DECIMAL(10,2) DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  level_achieved INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id)
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Sales analytics table - Daily sales summary
CREATE TABLE IF NOT EXISTS sales_analytics (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date DATE NOT NULL,
  location_id TEXT,
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  top_products TEXT, -- JSON for top selling products
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  UNIQUE(date, location_id)
);

-- Customer analytics table - Customer behavior
CREATE TABLE IF NOT EXISTS customer_analytics (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_id TEXT NOT NULL,
  date DATE NOT NULL,
  visits INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  UNIQUE(customer_id, date)
);

-- ============================================================================
-- SYSTEM TABLES
-- ============================================================================

-- Sessions table - User sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Settings table - System settings
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL, -- JSON value
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table - System audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values TEXT, -- JSON
  new_values TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_cashier ON orders(cashier_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_staff_performance_staff ON staff_performance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_period ON staff_performance(period_start, period_end);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_sales_analytics_date ON sales_analytics(date);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_location ON sales_analytics(location_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_customer ON customer_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_date ON customer_analytics(date);

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert default admin user
INSERT OR IGNORE INTO users (id, email, password_hash, name, role) VALUES
('admin-001', 'admin@khochuan.com', '$2a$12$U40PJfIQZha2Dja4P9Xo3uX4JgQMtvAfIpP9xVlJJUrfTvDsV7Pha', 'Admin KhoChuan', 'admin');

-- Insert default location
INSERT OR IGNORE INTO locations (id, name, address, phone, email) VALUES
('loc-001', 'KhoChuan Store Main', '123 Main Street, Ho Chi Minh City', '+84901234567', 'store@khochuan.com');

-- Insert sample categories
INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
('cat-001', 'Đồ uống', 'do-uong', 'Các loại đồ uống'),
('cat-002', 'Thực phẩm', 'thuc-pham', 'Các loại thực phẩm'),
('cat-003', 'Gia vị', 'gia-vi', 'Các loại gia vị nấu ăn');

-- Insert sample products
INSERT OR IGNORE INTO products (id, name, sku, barcode, price, cost, category_id) VALUES
('prod-001', 'Coca Cola 330ml', 'COCA-330', '8934673123456', 15000, 12000, 'cat-001'),
('prod-002', 'Pepsi 330ml', 'PEPSI-330', '8934673123457', 15000, 12000, 'cat-001'),
('prod-003', 'Mì tôm Hảo Hảo', 'MI-HAOHAO', '8934673123458', 5000, 4000, 'cat-002');

-- Insert sample inventory
INSERT OR IGNORE INTO inventory (product_id, location_id, quantity, reorder_point) VALUES
('prod-001', 'loc-001', 100, 20),
('prod-002', 'loc-001', 80, 20),
('prod-003', 'loc-001', 200, 50);

-- Insert sample achievements
INSERT OR IGNORE INTO achievements (id, name, description, criteria, reward_points) VALUES
('ach-001', 'First Sale', 'Complete your first sale', '{"type": "sales_count", "value": 1}', 100),
('ach-002', 'Sales Master', 'Complete 100 sales', '{"type": "sales_count", "value": 100}', 1000),
('ach-003', 'Revenue King', 'Achieve 1M VND in sales', '{"type": "sales_amount", "value": 1000000}', 2000);
