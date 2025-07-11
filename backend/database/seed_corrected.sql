-- Corrected Seed Data for KhoChuan POS System
-- Matches existing database schema
-- Trường Phát Computer Hòa Bình

-- Insert Users (using existing schema)
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, phone, is_active, created_at, updated_at) VALUES
('user-001', 'admin@khochuan.com', 'admin123', 'Quản trị viên', 'admin', '0123456789', 1, datetime('now'), datetime('now')),
('user-002', 'cashier@khochuan.com', 'cashier123', 'Thu ngân', 'cashier', '0123456790', 1, datetime('now'), datetime('now')),
('user-003', 'staff@khochuan.com', 'staff123', 'Nhân viên', 'staff', '0123456791', 1, datetime('now'), datetime('now')),
('user-004', 'manager@khochuan.com', 'manager123', 'Quản lý', 'admin', '0123456792', 1, datetime('now'), datetime('now'));

-- Insert Categories (using existing schema)
INSERT OR IGNORE INTO categories (id, name, description, color, sort_order, is_active, created_at, updated_at) VALUES
('cat-001', 'Máy tính', 'Máy tính để bàn và laptop', '#1890ff', 1, 1, datetime('now'), datetime('now')),
('cat-002', 'Linh kiện', 'Linh kiện máy tính', '#52c41a', 2, 1, datetime('now'), datetime('now')),
('cat-003', 'Phụ kiện', 'Phụ kiện máy tính', '#faad14', 3, 1, datetime('now'), datetime('now')),
('cat-004', 'Điện thoại', 'Điện thoại di động', '#f5222d', 4, 1, datetime('now'), datetime('now')),
('cat-005', 'Gaming', 'Thiết bị gaming', '#722ed1', 5, 1, datetime('now'), datetime('now'));

-- Insert Products (using existing schema)
INSERT OR IGNORE INTO products (id, sku, name, description, category_id, price, cost_price, stock_quantity, reorder_level, barcode, is_active, created_at, updated_at) VALUES
('prod-001', 'LAPTOP-DELL-001', 'Laptop Dell XPS 13', 'Laptop Dell XPS 13 inch, Intel Core i7, 16GB RAM, 512GB SSD', 'cat-001', 25000000, 20000000, 10, 2, '1234567890123', 1, datetime('now'), datetime('now')),
('prod-002', 'PHONE-IP15-001', 'iPhone 15 Pro', 'iPhone 15 Pro 128GB, Titanium Natural', 'cat-004', 30000000, 25000000, 15, 3, '2345678901234', 1, datetime('now'), datetime('now')),
('prod-003', 'MOUSE-LOG-001', 'Gaming Mouse Logitech', 'Chuột gaming Logitech G502 Hero', 'cat-005', 1500000, 1200000, 50, 10, '3456789012345', 1, datetime('now'), datetime('now')),
('prod-004', 'KEYBOARD-001', 'Bàn phím cơ', 'Bàn phím cơ RGB, switch blue', 'cat-005', 2000000, 1600000, 30, 5, '4567890123456', 1, datetime('now'), datetime('now')),
('prod-005', 'RAM-DDR4-001', 'RAM DDR4 16GB', 'RAM DDR4 16GB 3200MHz', 'cat-002', 3000000, 2500000, 25, 5, '5678901234567', 1, datetime('now'), datetime('now')),
('prod-006', 'SSD-SAM-001', 'SSD Samsung 1TB', 'SSD Samsung 980 Pro 1TB NVMe', 'cat-002', 4000000, 3200000, 20, 3, '6789012345678', 1, datetime('now'), datetime('now')),
('prod-007', 'MONITOR-001', 'Màn hình 24 inch', 'Màn hình Dell 24 inch Full HD IPS', 'cat-003', 5000000, 4000000, 12, 2, '7890123456789', 1, datetime('now'), datetime('now')),
('prod-008', 'WEBCAM-001', 'Webcam HD', 'Webcam Logitech C920 Full HD', 'cat-003', 2500000, 2000000, 40, 8, '8901234567890', 1, datetime('now'), datetime('now')),
('prod-009', 'HEADSET-001', 'Tai nghe Gaming', 'Tai nghe gaming SteelSeries Arctis 7', 'cat-005', 3500000, 2800000, 18, 3, '9012345678901', 1, datetime('now'), datetime('now')),
('prod-010', 'HDD-WD-001', 'Ổ cứng HDD 2TB', 'Ổ cứng WD Blue 2TB 7200RPM', 'cat-002', 2200000, 1800000, 35, 7, '0123456789012', 1, datetime('now'), datetime('now'));

-- Insert Customers (using existing schema)
INSERT OR IGNORE INTO customers (id, name, email, phone, address, date_of_birth, loyalty_points, total_spent, visit_count, last_visit, is_active, created_at, updated_at) VALUES
('cust-001', 'Nguyễn Văn An', 'nguyenvanan@gmail.com', '0901234567', '123 Đường Lê Lợi, Quận 1, TP.HCM', '1990-05-15', 1250, 25000000, 5, datetime('now', '-2 days'), 1, datetime('now', '-30 days'), datetime('now')),
('cust-002', 'Trần Thị Bình', 'tranthibinh@gmail.com', '0902345678', '456 Đường Nguyễn Huệ, Quận 1, TP.HCM', '1985-08-22', 800, 16000000, 3, datetime('now', '-5 days'), 1, datetime('now', '-45 days'), datetime('now')),
('cust-003', 'Lê Văn Cường', 'levancu@gmail.com', '0903456789', '789 Đường Hai Bà Trưng, Quận 3, TP.HCM', '1992-12-10', 2100, 42000000, 8, datetime('now', '-1 day'), 1, datetime('now', '-60 days'), datetime('now')),
('cust-004', 'Phạm Thị Dung', 'phamthidung@gmail.com', '0904567890', '321 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM', '1988-03-18', 450, 9000000, 2, datetime('now', '-10 days'), 1, datetime('now', '-20 days'), datetime('now')),
('cust-005', 'Hoàng Văn Em', 'hoangvanem@gmail.com', '0905678901', '654 Đường Võ Văn Tần, Quận 3, TP.HCM', '1995-07-25', 1800, 36000000, 6, datetime('now', '-3 days'), 1, datetime('now', '-90 days'), datetime('now'));

-- Generate order numbers
INSERT OR IGNORE INTO orders (id, order_number, customer_id, cashier_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, order_status, notes, created_at, updated_at) VALUES
('order-001', 'ORD-001', 'cust-001', 'user-002', 25000000, 2500000, 0, 27500000, 'cash', 'completed', 'completed', 'Mua laptop Dell XPS 13', datetime('now', '-2 days'), datetime('now', '-2 days')),
('order-002', 'ORD-002', 'cust-002', 'user-002', 15000000, 1500000, 1000000, 15500000, 'card', 'completed', 'completed', 'Mua linh kiện máy tính', datetime('now', '-5 days'), datetime('now', '-5 days')),
('order-003', 'ORD-003', 'cust-003', 'user-002', 40000000, 4000000, 2000000, 42000000, 'digital_wallet', 'completed', 'completed', 'Mua setup gaming hoàn chỉnh', datetime('now', '-1 day'), datetime('now', '-1 day')),
('order-004', 'ORD-004', 'cust-004', 'user-002', 8500000, 850000, 500000, 8850000, 'cash', 'completed', 'completed', 'Mua phụ kiện', datetime('now', '-10 days'), datetime('now', '-10 days')),
('order-005', 'ORD-005', 'cust-005', 'user-002', 34500000, 3450000, 1500000, 36450000, 'card', 'completed', 'completed', 'Mua máy tính văn phòng', datetime('now', '-3 days'), datetime('now', '-3 days'));

-- Insert Order Items (using existing schema)
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal, discount_amount, created_at) VALUES
('item-001', 'order-001', 'prod-001', 1, 25000000, 25000000, 0, datetime('now', '-2 days')),
('item-002', 'order-002', 'prod-005', 2, 3000000, 6000000, 0, datetime('now', '-5 days')),
('item-003', 'order-002', 'prod-006', 1, 4000000, 4000000, 0, datetime('now', '-5 days')),
('item-004', 'order-002', 'prod-010', 2, 2500000, 5000000, 0, datetime('now', '-5 days')),
('item-005', 'order-003', 'prod-001', 1, 25000000, 25000000, 0, datetime('now', '-1 day')),
('item-006', 'order-003', 'prod-007', 2, 5000000, 10000000, 0, datetime('now', '-1 day')),
('item-007', 'order-003', 'prod-003', 1, 1500000, 1500000, 0, datetime('now', '-1 day')),
('item-008', 'order-003', 'prod-004', 1, 2000000, 2000000, 0, datetime('now', '-1 day')),
('item-009', 'order-003', 'prod-009', 1, 3500000, 3500000, 0, datetime('now', '-1 day')),
('item-010', 'order-004', 'prod-008', 2, 2500000, 5000000, 0, datetime('now', '-10 days')),
('item-011', 'order-004', 'prod-003', 1, 1500000, 1500000, 0, datetime('now', '-10 days')),
('item-012', 'order-004', 'prod-004', 1, 2000000, 2000000, 0, datetime('now', '-10 days')),
('item-013', 'order-005', 'prod-001', 1, 25000000, 25000000, 0, datetime('now', '-3 days')),
('item-014', 'order-005', 'prod-007', 1, 5000000, 5000000, 0, datetime('now', '-3 days')),
('item-015', 'order-005', 'prod-005', 2, 3000000, 6000000, 0, datetime('now', '-3 days'));

-- Insert Inventory Logs (using existing schema)
INSERT OR IGNORE INTO inventory_logs (id, product_id, user_id, type, quantity_change, previous_quantity, new_quantity, reason, reference_id, created_at) VALUES
('log-001', 'prod-001', 'user-001', 'restock', 15, 0, 15, 'Nhập hàng đầu kỳ', 'po-001', datetime('now', '-30 days')),
('log-002', 'prod-001', 'user-002', 'sale', -1, 15, 14, 'Bán cho khách hàng', 'order-001', datetime('now', '-2 days')),
('log-003', 'prod-002', 'user-001', 'restock', 20, 0, 20, 'Nhập hàng iPhone', 'po-002', datetime('now', '-25 days')),
('log-004', 'prod-003', 'user-001', 'restock', 60, 0, 60, 'Nhập chuột gaming', 'po-003', datetime('now', '-20 days')),
('log-005', 'prod-003', 'user-002', 'sale', -2, 60, 58, 'Bán chuột gaming', 'order-003', datetime('now', '-1 day')),
('log-006', 'prod-005', 'user-001', 'restock', 30, 0, 30, 'Nhập RAM DDR4', 'po-004', datetime('now', '-15 days')),
('log-007', 'prod-005', 'user-002', 'sale', -4, 30, 26, 'Bán RAM cho khách', 'order-002', datetime('now', '-5 days'));

-- Update product stock quantities based on movements
UPDATE products SET stock_quantity = 14 WHERE id = 'prod-001'; -- 15 in - 1 out
UPDATE products SET stock_quantity = 20 WHERE id = 'prod-002'; -- 20 in
UPDATE products SET stock_quantity = 58 WHERE id = 'prod-003'; -- 60 in - 2 out
UPDATE products SET stock_quantity = 30 WHERE id = 'prod-004'; -- initial stock
UPDATE products SET stock_quantity = 26 WHERE id = 'prod-005'; -- 30 in - 4 out
UPDATE products SET stock_quantity = 20 WHERE id = 'prod-006'; -- initial stock
UPDATE products SET stock_quantity = 12 WHERE id = 'prod-007'; -- initial stock
UPDATE products SET stock_quantity = 40 WHERE id = 'prod-008'; -- initial stock
UPDATE products SET stock_quantity = 18 WHERE id = 'prod-009'; -- initial stock
UPDATE products SET stock_quantity = 35 WHERE id = 'prod-010'; -- initial stock
