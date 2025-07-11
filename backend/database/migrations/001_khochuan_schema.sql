-- Migration: 001_khochuan_schema.sql
-- Description: Create KhoChuan POS system database schema
-- Date: 2025-01-09

-- Users table - System users (admin, manager, cashier, staff, customer)
CREATE TABLE IF NOT EXISTS users_new (
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
CREATE TABLE IF NOT EXISTS locations_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table - Product categories (hierarchical)
CREATE TABLE IF NOT EXISTS categories_new (
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
  FOREIGN KEY (parent_id) REFERENCES categories_new(id)
);

-- Products table - Product catalog
CREATE TABLE IF NOT EXISTS products_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  tax_rate DECIMAL(5,2) DEFAULT 0,
  category_id TEXT,
  image_urls TEXT, -- JSON array of image URLs
  attributes TEXT, -- JSON for variants like color, size, etc.
  is_active BOOLEAN DEFAULT 1,
  track_inventory BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories_new(id)
);

-- Customers table - Customer management
CREATE TABLE IF NOT EXISTS customers_new (
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
CREATE TABLE IF NOT EXISTS orders_new (
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
  FOREIGN KEY (customer_id) REFERENCES customers_new(id),
  FOREIGN KEY (cashier_id) REFERENCES users_new(id),
  FOREIGN KEY (location_id) REFERENCES locations_new(id)
);

-- Insert default admin user
INSERT OR IGNORE INTO users_new (id, email, password_hash, name, role) VALUES
('admin-001', 'admin@khochuan.com', '$2a$12$U40PJfIQZha2Dja4P9Xo3uX4JgQMtvAfIpP9xVlJJUrfTvDsV7Pha', 'Admin KhoChuan', 'admin');

-- Insert default location
INSERT OR IGNORE INTO locations_new (id, name, address, phone, email) VALUES
('loc-001', 'KhoChuan Store Main', '123 Main Street, Ho Chi Minh City', '+84901234567', 'store@khochuan.com');

-- Insert sample categories
INSERT OR IGNORE INTO categories_new (id, name, slug, description) VALUES
('cat-001', 'Đồ uống', 'do-uong', 'Các loại đồ uống'),
('cat-002', 'Thực phẩm', 'thuc-pham', 'Các loại thực phẩm'),
('cat-003', 'Gia vị', 'gia-vi', 'Các loại gia vị nấu ăn');

-- Insert sample products
INSERT OR IGNORE INTO products_new (id, name, sku, barcode, price, cost, category_id) VALUES
('prod-001', 'Coca Cola 330ml', 'COCA-330', '8934673123456', 15000, 12000, 'cat-001'),
('prod-002', 'Pepsi 330ml', 'PEPSI-330', '8934673123457', 15000, 12000, 'cat-001'),
('prod-003', 'Mì tôm Hảo Hảo', 'MI-HAOHAO', '8934673123458', 5000, 4000, 'cat-002');
