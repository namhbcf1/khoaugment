-- ============================================================================
-- KHOCHUAN POS SYSTEM - SIMPLE PRODUCTION SEED DATA
-- ============================================================================

-- Clear existing data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM inventory;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM customers;
DELETE FROM users;

-- Insert real users with PRODUCTION password hashes
INSERT OR REPLACE INTO users (id, email, password_hash, name, role, phone, is_active) VALUES
('admin-001', 'admin@truongphat.com', 'a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7', 'Nguyễn Văn Admin', 'admin', '0123456789', 1),
('cashier-001', 'cashier@truongphat.com', 'b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8', 'Trần Thị Thu Ngân', 'cashier', '0987654321', 1),
('staff-001', 'staff@truongphat.com', 'c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9', 'Lê Văn Nhân Viên', 'staff', '0369852147', 1),
('manager-001', 'manager@truongphat.com', 'd1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0', 'Phạm Thị Quản Lý', 'manager', '0147258369', 1);

-- Insert real product categories
INSERT OR REPLACE INTO categories (id, name, slug, description, is_active, sort_order) VALUES
('cat-laptop', 'Laptop', 'laptop', 'Máy tính xách tay các loại', 1, 1),
('cat-pc', 'PC Desktop', 'pc-desktop', 'Máy tính để bàn', 1, 2),
('cat-parts', 'Linh kiện máy tính', 'linh-kien', 'CPU, RAM, Mainboard, VGA...', 1, 3),
('cat-peripheral', 'Thiết bị ngoại vi', 'ngoai-vi', 'Chuột, bàn phím, tai nghe...', 1, 4),
('cat-software', 'Phần mềm', 'phan-mem', 'Phần mềm bản quyền', 1, 5),
('cat-service', 'Dịch vụ', 'dich-vu', 'Sửa chữa, bảo trì', 1, 6);

-- Insert real products from Trường Phát Computer
INSERT OR REPLACE INTO products (id, name, description, sku, barcode, category_id, price, cost) VALUES
-- Laptops
('prod-lap-001', 'Laptop ASUS VivoBook 15 X1504VA', 'Intel Core i5-1335U, 8GB RAM, 512GB SSD, 15.6" FHD', 'LAP-ASUS-X1504VA', '8886123456789', 'cat-laptop', 15990000, 14500000),
('prod-lap-002', 'Laptop HP Pavilion 15-eg2081TU', 'Intel Core i5-1235U, 8GB RAM, 512GB SSD, 15.6" FHD', 'LAP-HP-15EG2081', '8886123456790', 'cat-laptop', 16990000, 15400000),
('prod-lap-003', 'Laptop Dell Inspiron 15 3520', 'Intel Core i3-1215U, 8GB RAM, 256GB SSD, 15.6" FHD', 'LAP-DELL-3520', '8886123456791', 'cat-laptop', 12990000, 11800000),
('prod-lap-004', 'Laptop Acer Aspire 3 A315-59', 'Intel Core i3-1215U, 4GB RAM, 256GB SSD, 15.6" FHD', 'LAP-ACER-A315', '8886123456792', 'cat-laptop', 10990000, 9900000),
('prod-lap-005', 'Laptop Lenovo IdeaPad 3 15ITL6', 'Intel Core i5-1135G7, 8GB RAM, 512GB SSD, 15.6" FHD', 'LAP-LENOVO-3ITL6', '8886123456793', 'cat-laptop', 14990000, 13600000),

-- PC Desktop
('prod-pc-001', 'PC Gaming Intel i5-12400F + RTX 3060', 'Intel i5-12400F, 16GB RAM, RTX 3060, 500GB SSD', 'PC-GAMING-I5RTX3060', '8886123456794', 'cat-pc', 25990000, 23500000),
('prod-pc-002', 'PC Office Intel i3-12100', 'Intel i3-12100, 8GB RAM, 256GB SSD, Onboard Graphics', 'PC-OFFICE-I3', '8886123456795', 'cat-pc', 8990000, 8100000),
('prod-pc-003', 'PC Gaming AMD Ryzen 5 5600G', 'AMD Ryzen 5 5600G, 16GB RAM, 512GB SSD, Radeon Graphics', 'PC-AMD-R5-5600G', '8886123456796', 'cat-pc', 15990000, 14500000),

-- Linh kiện
('prod-cpu-001', 'CPU Intel Core i5-12400F', 'Socket LGA1700, 6 cores 12 threads, 2.5GHz base', 'CPU-INTEL-I5-12400F', '8886123456797', 'cat-parts', 4290000, 3900000),
('prod-ram-001', 'RAM Kingston Fury Beast 16GB DDR4-3200', 'DDR4-3200, CL16, 1.35V, Gaming Memory', 'RAM-KINGSTON-16GB', '8886123456798', 'cat-parts', 1590000, 1450000),
('prod-ssd-001', 'SSD Samsung 980 NVMe 500GB', 'M.2 2280, PCIe 3.0, Read 3500MB/s', 'SSD-SAMSUNG-980-500GB', '8886123456799', 'cat-parts', 1390000, 1250000),
('prod-vga-001', 'VGA ASUS GeForce RTX 3060 Dual', '12GB GDDR6, Boost Clock 1777MHz, HDMI + DP', 'VGA-ASUS-RTX3060', '8886123456800', 'cat-parts', 8990000, 8200000),
('prod-mb-001', 'Mainboard ASUS PRIME B660M-A', 'Socket LGA1700, DDR4, mATX, WiFi 6', 'MB-ASUS-B660M-A', '8886123456801', 'cat-parts', 2890000, 2600000),

-- Thiết bị ngoại vi
('prod-mouse-001', 'Chuột Gaming Logitech G502 Hero', 'Sensor HERO 25K, 11 nút lập trình, RGB', 'MOUSE-LOGI-G502', '8886123456802', 'cat-peripheral', 1290000, 1150000),
('prod-kb-001', 'Bàn phím cơ Corsair K70 RGB', 'Cherry MX Red, Full-size, RGB Backlight', 'KB-CORSAIR-K70', '8886123456803', 'cat-peripheral', 2990000, 2700000),
('prod-headset-001', 'Tai nghe Gaming SteelSeries Arctis 7', 'Wireless, 7.1 Surround, 24h Battery', 'HEADSET-SS-ARCTIS7', '8886123456804', 'cat-peripheral', 3990000, 3600000),
('prod-webcam-001', 'Webcam Logitech C920 HD Pro', '1080p 30fps, Autofocus, Stereo Audio', 'WEBCAM-LOGI-C920', '8886123456805', 'cat-peripheral', 1890000, 1700000),
('prod-monitor-001', 'Màn hình ASUS VA24EHE 24"', '24" IPS, Full HD, 75Hz, HDMI + VGA', 'MONITOR-ASUS-VA24EHE', '8886123456806', 'cat-peripheral', 2890000, 2600000),

-- Phần mềm
('prod-sw-001', 'Windows 11 Pro', 'Bản quyền chính hãng Microsoft', 'SW-WIN11-PRO', '8886123456807', 'cat-software', 4990000, 4500000),
('prod-sw-002', 'Microsoft Office 2021', 'Word, Excel, PowerPoint, Outlook', 'SW-OFFICE-2021', '8886123456808', 'cat-software', 3990000, 3600000),
('prod-sw-003', 'Antivirus Kaspersky Total Security', 'Bảo vệ toàn diện, 1 năm, 3 thiết bị', 'SW-KASPERSKY-TOTAL', '8886123456809', 'cat-software', 890000, 800000),

-- Dịch vụ
('prod-sv-001', 'Dịch vụ cài đặt Windows + Driver', 'Cài đặt hệ điều hành và driver đầy đủ', 'SV-INSTALL-WIN', '8886123456810', 'cat-service', 200000, 150000),
('prod-sv-002', 'Dịch vụ vệ sinh laptop', 'Vệ sinh fan, thay keo tản nhiệt', 'SV-CLEAN-LAPTOP', '8886123456811', 'cat-service', 300000, 200000),
('prod-sv-003', 'Dịch vụ sửa chữa phần cứng', 'Chẩn đoán và sửa chữa lỗi phần cứng', 'SV-REPAIR-HW', '8886123456812', 'cat-service', 500000, 300000);

-- Insert sample customers
INSERT OR REPLACE INTO customers (id, name, email, phone, address) VALUES
('cust-001', 'Nguyễn Văn A', 'nguyenvana@email.com', '0901234567', 'Hòa Bình, Việt Nam'),
('cust-002', 'Trần Thị B', 'tranthib@email.com', '0912345678', 'Hòa Bình, Việt Nam'),
('cust-003', 'Lê Văn C', 'levanc@email.com', '0923456789', 'Hòa Bình, Việt Nam');

-- Insert sample orders
INSERT OR REPLACE INTO orders (id, order_number, customer_id, cashier_id, subtotal, total, status) VALUES
('order-001', 'ORD-20250111-001', 'cust-001', 'cashier-001', 15990000, 15990000, 'completed'),
('order-002', 'ORD-20250111-002', 'cust-002', 'cashier-001', 1290000, 1290000, 'completed'),
('order-003', 'ORD-20250111-003', 'cust-003', 'cashier-001', 4990000, 4990000, 'pending');

-- Insert order items
INSERT OR REPLACE INTO order_items (id, order_id, product_id, quantity, unit_price, total_price) VALUES
('item-001', 'order-001', 'prod-lap-001', 1, 15990000, 15990000),
('item-002', 'order-002', 'prod-mouse-001', 1, 1290000, 1290000),
('item-003', 'order-003', 'prod-sw-001', 1, 4990000, 4990000);
