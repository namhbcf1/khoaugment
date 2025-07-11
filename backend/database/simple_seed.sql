-- Simple seed data for testing
-- Insert admin user
INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES
('admin', 'admin@pos.com', 'hashed_password_here', 'System Admin', 'admin', 1);

-- Insert categories
INSERT INTO categories (id, name, description, color) VALUES
('cat_001', 'Electronics', 'Electronic devices and accessories', '#1890ff'),
('cat_002', 'Computers', 'Computers and laptops', '#52c41a'),
('cat_003', 'Accessories', 'Computer accessories', '#faad14');

-- Insert basic products
INSERT INTO products (id, sku, name, description, category_id, price, stock_quantity) VALUES
('prod_001', 'LAP-001', 'Test Laptop', 'Test laptop for demo', 'cat_001', 1000.00, 10),
('prod_002', 'MOU-001', 'Test Mouse', 'Test mouse for demo', 'cat_003', 50.00, 20),
('prod_003', 'KEY-001', 'Test Keyboard', 'Test keyboard for demo', 'cat_003', 100.00, 15);

-- Insert payment methods
INSERT INTO payment_methods (id, name, type, is_active) VALUES
('pay_001', 'Cash', 'cash', 1),
('pay_002', 'Credit Card', 'card', 1),
('pay_003', 'Digital Wallet', 'digital_wallet', 1);

-- Insert staff stats for admin
INSERT INTO staff_stats (id, user_id, total_sales, total_orders, total_points, level) VALUES
('stat_001', 'admin', 0, 0, 0, 1);

-- Insert basic settings
INSERT INTO settings (id, key, value, type, description) VALUES
('set_001', 'store_name', 'Demo POS Store', 'string', 'Store name'),
('set_002', 'currency', 'USD', 'string', 'Default currency'),
('set_003', 'tax_rate', '10', 'number', 'Default tax rate percentage');
