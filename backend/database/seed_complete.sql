-- Complete Seed Data for KhoChuan POS System
-- Real data for testing and development
-- Trường Phát Computer Hòa Bình

-- Insert Users
INSERT OR IGNORE INTO users (id, email, password_hash, name, role, phone, is_active, created_at, updated_at) VALUES
('user-001', 'admin@khochuan.com', 'admin123', 'Quản trị viên', 'admin', '0123456789', 1, datetime('now'), datetime('now')),
('user-002', 'cashier@khochuan.com', 'cashier123', 'Thu ngân', 'cashier', '0123456790', 1, datetime('now'), datetime('now')),
('user-003', 'staff@khochuan.com', 'staff123', 'Nhân viên', 'staff', '0123456791', 1, datetime('now'), datetime('now')),
('user-004', 'manager@khochuan.com', 'manager123', 'Quản lý', 'admin', '0123456792', 1, datetime('now'), datetime('now'));

-- Insert Categories
INSERT OR IGNORE INTO categories (id, name, description, color, sort_order, is_active, created_at, updated_at) VALUES
('cat-001', 'Máy tính', 'Máy tính để bàn và laptop', '#1890ff', 1, 1, datetime('now'), datetime('now')),
('cat-002', 'Linh kiện', 'Linh kiện máy tính', '#52c41a', 2, 1, datetime('now'), datetime('now')),
('cat-003', 'Phụ kiện', 'Phụ kiện máy tính', '#faad14', 3, 1, datetime('now'), datetime('now')),
('cat-004', 'Điện thoại', 'Điện thoại di động', '#f5222d', 4, 1, datetime('now'), datetime('now')),
('cat-005', 'Gaming', 'Thiết bị gaming', '#722ed1', 5, 1, datetime('now'), datetime('now'));

-- Insert Products
INSERT OR IGNORE INTO products (id, name, description, sku, barcode, price, cost_price, stock_quantity, reorder_level, category_id, is_active, created_at, updated_at) VALUES
('prod-001', 'Laptop Dell XPS 13', 'Laptop Dell XPS 13 inch, Intel Core i7, 16GB RAM, 512GB SSD', 'LAPTOP-DELL-001', '1234567890123', 25000000, 20000000, 10, 2, 'cat-001', 1, datetime('now'), datetime('now')),
('prod-002', 'iPhone 15 Pro', 'iPhone 15 Pro 128GB, Titanium Natural', 'PHONE-IP15-001', '2345678901234', 30000000, 25000000, 15, 3, 'cat-004', 1, datetime('now'), datetime('now')),
('prod-003', 'Gaming Mouse Logitech', 'Chuột gaming Logitech G502 Hero', 'MOUSE-LOG-001', '3456789012345', 1500000, 1200000, 50, 10, 'cat-005', 1, datetime('now'), datetime('now')),
('prod-004', 'Bàn phím cơ', 'Bàn phím cơ RGB, switch blue', 'KEYBOARD-001', '4567890123456', 2000000, 1600000, 30, 5, 'cat-005', 1, datetime('now'), datetime('now')),
('prod-005', 'RAM DDR4 16GB', 'RAM DDR4 16GB 3200MHz', 'RAM-DDR4-001', '5678901234567', 3000000, 2500000, 25, 5, 'cat-002', 1, datetime('now'), datetime('now')),
('prod-006', 'SSD Samsung 1TB', 'SSD Samsung 980 Pro 1TB NVMe', 'SSD-SAM-001', '6789012345678', 4000000, 3200000, 20, 3, 'cat-002', 1, datetime('now'), datetime('now')),
('prod-007', 'Màn hình 24 inch', 'Màn hình Dell 24 inch Full HD IPS', 'MONITOR-001', '7890123456789', 5000000, 4000000, 12, 2, 'cat-003', 1, datetime('now'), datetime('now')),
('prod-008', 'Webcam HD', 'Webcam Logitech C920 Full HD', 'WEBCAM-001', '8901234567890', 2500000, 2000000, 40, 8, 'cat-003', 1, datetime('now'), datetime('now')),
('prod-009', 'Tai nghe Gaming', 'Tai nghe gaming SteelSeries Arctis 7', 'HEADSET-001', '9012345678901', 3500000, 2800000, 18, 3, 'cat-005', 1, datetime('now'), datetime('now')),
('prod-010', 'Ổ cứng HDD 2TB', 'Ổ cứng WD Blue 2TB 7200RPM', 'HDD-WD-001', '0123456789012', 2200000, 1800000, 35, 7, 'cat-002', 1, datetime('now'), datetime('now'));

-- Insert Customers
INSERT OR IGNORE INTO customers (id, name, email, phone, address, date_of_birth, loyalty_points, total_spent, visit_count, last_visit, is_active, created_at, updated_at) VALUES
('cust-001', 'Nguyễn Văn An', 'nguyenvanan@gmail.com', '0901234567', '123 Đường Lê Lợi, Quận 1, TP.HCM', '1990-05-15', 1250, 25000000, 5, datetime('now', '-2 days'), 1, datetime('now', '-30 days'), datetime('now')),
('cust-002', 'Trần Thị Bình', 'tranthibinh@gmail.com', '0902345678', '456 Đường Nguyễn Huệ, Quận 1, TP.HCM', '1985-08-22', 800, 16000000, 3, datetime('now', '-5 days'), 1, datetime('now', '-45 days'), datetime('now')),
('cust-003', 'Lê Văn Cường', 'levancu@gmail.com', '0903456789', '789 Đường Hai Bà Trưng, Quận 3, TP.HCM', '1992-12-10', 2100, 42000000, 8, datetime('now', '-1 day'), 1, datetime('now', '-60 days'), datetime('now')),
('cust-004', 'Phạm Thị Dung', 'phamthidung@gmail.com', '0904567890', '321 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM', '1988-03-18', 450, 9000000, 2, datetime('now', '-10 days'), 1, datetime('now', '-20 days'), datetime('now')),
('cust-005', 'Hoàng Văn Em', 'hoangvanem@gmail.com', '0905678901', '654 Đường Võ Văn Tần, Quận 3, TP.HCM', '1995-07-25', 1800, 36000000, 6, datetime('now', '-3 days'), 1, datetime('now', '-90 days'), datetime('now'));

-- Insert Orders
INSERT OR IGNORE INTO orders (id, customer_id, cashier_id, total_amount, discount_amount, tax_amount, final_amount, payment_method, status, notes, created_at, updated_at) VALUES
('order-001', 'cust-001', 'user-002', 25000000, 0, 2500000, 27500000, 'cash', 'completed', 'Mua laptop Dell XPS 13', datetime('now', '-2 days'), datetime('now', '-2 days')),
('order-002', 'cust-002', 'user-002', 16000000, 1000000, 1500000, 16500000, 'card', 'completed', 'Mua linh kiện máy tính', datetime('now', '-5 days'), datetime('now', '-5 days')),
('order-003', 'cust-003', 'user-002', 42000000, 2000000, 4000000, 44000000, 'transfer', 'completed', 'Mua setup gaming hoàn chỉnh', datetime('now', '-1 day'), datetime('now', '-1 day')),
('order-004', 'cust-004', 'user-002', 9000000, 500000, 850000, 9350000, 'cash', 'completed', 'Mua phụ kiện', datetime('now', '-10 days'), datetime('now', '-10 days')),
('order-005', 'cust-005', 'user-002', 36000000, 1500000, 3450000, 37950000, 'card', 'completed', 'Mua máy tính văn phòng', datetime('now', '-3 days'), datetime('now', '-3 days'));

-- Insert Order Items
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at) VALUES
('item-001', 'order-001', 'prod-001', 1, 25000000, 25000000, datetime('now', '-2 days')),
('item-002', 'order-002', 'prod-005', 2, 3000000, 6000000, datetime('now', '-5 days')),
('item-003', 'order-002', 'prod-006', 1, 4000000, 4000000, datetime('now', '-5 days')),
('item-004', 'order-002', 'prod-010', 3, 2200000, 6600000, datetime('now', '-5 days')),
('item-005', 'order-003', 'prod-001', 1, 25000000, 25000000, datetime('now', '-1 day')),
('item-006', 'order-003', 'prod-007', 2, 5000000, 10000000, datetime('now', '-1 day')),
('item-007', 'order-003', 'prod-003', 1, 1500000, 1500000, datetime('now', '-1 day')),
('item-008', 'order-003', 'prod-004', 1, 2000000, 2000000, datetime('now', '-1 day')),
('item-009', 'order-003', 'prod-009', 1, 3500000, 3500000, datetime('now', '-1 day')),
('item-010', 'order-004', 'prod-008', 2, 2500000, 5000000, datetime('now', '-10 days')),
('item-011', 'order-004', 'prod-003', 2, 1500000, 3000000, datetime('now', '-10 days')),
('item-012', 'order-004', 'prod-004', 1, 2000000, 2000000, datetime('now', '-10 days')),
('item-013', 'order-005', 'prod-001', 1, 25000000, 25000000, datetime('now', '-3 days')),
('item-014', 'order-005', 'prod-007', 1, 5000000, 5000000, datetime('now', '-3 days')),
('item-015', 'order-005', 'prod-005', 2, 3000000, 6000000, datetime('now', '-3 days'));

-- Insert Inventory Movements
INSERT OR IGNORE INTO inventory_movements (id, product_id, movement_type, quantity, reference_type, reference_id, notes, created_at) VALUES
('mov-001', 'prod-001', 'in', 15, 'purchase', 'po-001', 'Nhập hàng đầu kỳ', datetime('now', '-30 days')),
('mov-002', 'prod-001', 'out', 1, 'sale', 'order-001', 'Bán cho khách hàng', datetime('now', '-2 days')),
('mov-003', 'prod-002', 'in', 20, 'purchase', 'po-002', 'Nhập hàng iPhone', datetime('now', '-25 days')),
('mov-004', 'prod-003', 'in', 60, 'purchase', 'po-003', 'Nhập chuột gaming', datetime('now', '-20 days')),
('mov-005', 'prod-003', 'out', 3, 'sale', 'order-003', 'Bán chuột gaming', datetime('now', '-1 day')),
('mov-006', 'prod-005', 'in', 30, 'purchase', 'po-004', 'Nhập RAM DDR4', datetime('now', '-15 days')),
('mov-007', 'prod-005', 'out', 4, 'sale', 'order-002', 'Bán RAM cho khách', datetime('now', '-5 days'));

-- Insert Loyalty Transactions
INSERT OR IGNORE INTO loyalty_transactions (id, customer_id, transaction_type, points, order_id, description, created_at) VALUES
('loy-001', 'cust-001', 'earned', 1250, 'order-001', 'Tích điểm từ đơn hàng 25,000,000 VND', datetime('now', '-2 days')),
('loy-002', 'cust-002', 'earned', 800, 'order-002', 'Tích điểm từ đơn hàng 16,000,000 VND', datetime('now', '-5 days')),
('loy-003', 'cust-003', 'earned', 2100, 'order-003', 'Tích điểm từ đơn hàng 42,000,000 VND', datetime('now', '-1 day')),
('loy-004', 'cust-004', 'earned', 450, 'order-004', 'Tích điểm từ đơn hàng 9,000,000 VND', datetime('now', '-10 days')),
('loy-005', 'cust-005', 'earned', 1800, 'order-005', 'Tích điểm từ đơn hàng 36,000,000 VND', datetime('now', '-3 days'));

-- Update product stock quantities based on movements
UPDATE products SET stock_quantity = 14 WHERE id = 'prod-001'; -- 15 in - 1 out
UPDATE products SET stock_quantity = 20 WHERE id = 'prod-002'; -- 20 in
UPDATE products SET stock_quantity = 57 WHERE id = 'prod-003'; -- 60 in - 3 out
UPDATE products SET stock_quantity = 30 WHERE id = 'prod-004'; -- initial stock
UPDATE products SET stock_quantity = 26 WHERE id = 'prod-005'; -- 30 in - 4 out
UPDATE products SET stock_quantity = 20 WHERE id = 'prod-006'; -- initial stock
UPDATE products SET stock_quantity = 12 WHERE id = 'prod-007'; -- initial stock
UPDATE products SET stock_quantity = 40 WHERE id = 'prod-008'; -- initial stock
UPDATE products SET stock_quantity = 18 WHERE id = 'prod-009'; -- initial stock
UPDATE products SET stock_quantity = 35 WHERE id = 'prod-010'; -- initial stock
