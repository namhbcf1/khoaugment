-- Sample data for testing KhoChuan POS System
-- Insert sample categories

INSERT OR IGNORE INTO categories (id, name, description, color, sort_order, is_active, created_at, updated_at) VALUES
('cat-001', 'Đồ uống', 'Các loại đồ uống', '#1890ff', 1, 1, datetime('now'), datetime('now')),
('cat-002', 'Thực phẩm', 'Các loại thực phẩm', '#52c41a', 2, 1, datetime('now'), datetime('now')),
('cat-003', 'Điện tử', 'Thiết bị điện tử', '#722ed1', 3, 1, datetime('now'), datetime('now')),
('cat-004', 'Văn phòng phẩm', 'Đồ dùng văn phòng', '#fa8c16', 4, 1, datetime('now'), datetime('now')),
('cat-005', 'Gia dụng', 'Đồ gia dụng', '#eb2f96', 5, 1, datetime('now'), datetime('now'));

-- Insert sample products
INSERT OR IGNORE INTO products (
  id, name, description, sku, barcode, category_id, price, cost_price,
  stock_quantity, min_stock_level, unit, is_active, is_featured,
  created_at, updated_at
) VALUES
-- Đồ uống
('prod-001', 'Coca Cola 330ml', 'Nước ngọt Coca Cola lon 330ml', 'CC-330-001', '8934673123456', 'cat-001', 12000, 8000, 150, 50, 'lon', 1, 1, datetime('now'), datetime('now')),
('prod-002', 'Pepsi 330ml', 'Nước ngọt Pepsi lon 330ml', 'PP-330-001', '8934673123457', 'cat-001', 12000, 8000, 120, 50, 'lon', 1, 0, datetime('now'), datetime('now')),
('prod-003', 'Nước suối Lavie 500ml', 'Nước suối tinh khiết Lavie', 'LV-500-001', '8934673123458', 'cat-001', 5000, 3000, 200, 100, 'chai', 1, 1, datetime('now'), datetime('now')),
('prod-004', 'Trà xanh C2 455ml', 'Trà xanh C2 hương chanh', 'C2-455-001', '8934673123459', 'cat-001', 10000, 7000, 80, 30, 'chai', 1, 0, datetime('now'), datetime('now')),

-- Thực phẩm
('prod-005', 'Bánh mì sandwich', 'Bánh mì sandwich thịt nguội', 'BM-SW-001', '8934673123460', 'cat-002', 25000, 15000, 25, 30, 'cái', 1, 1, datetime('now'), datetime('now')),
('prod-006', 'Mì tôm Hảo Hảo', 'Mì ăn liền Hảo Hảo tôm chua cay', 'HH-TC-001', '8934673123461', 'cat-002', 4000, 2500, 100, 50, 'gói', 1, 1, datetime('now'), datetime('now')),
('prod-007', 'Bánh quy Oreo', 'Bánh quy Oreo kem vani', 'OR-VN-001', '8934673123462', 'cat-002', 15000, 10000, 60, 20, 'gói', 1, 0, datetime('now'), datetime('now')),
('prod-008', 'Kẹo Mentos', 'Kẹo Mentos hương bạc hà', 'MT-BH-001', '8934673123463', 'cat-002', 8000, 5000, 40, 20, 'gói', 1, 0, datetime('now'), datetime('now')),

-- Điện tử
('prod-009', 'Tai nghe Sony WH-1000XM4', 'Tai nghe chống ồn Sony', 'SN-WH-001', '8934673123464', 'cat-003', 8500000, 7000000, 5, 2, 'cái', 1, 1, datetime('now'), datetime('now')),
('prod-010', 'Chuột Logitech MX Master 3', 'Chuột không dây Logitech', 'LG-MX-001', '8934673123465', 'cat-003', 2200000, 1800000, 8, 3, 'cái', 1, 1, datetime('now'), datetime('now')),
('prod-011', 'Bàn phím Keychron K2', 'Bàn phím cơ Keychron K2', 'KC-K2-001', '8934673123466', 'cat-003', 2800000, 2300000, 3, 2, 'cái', 1, 0, datetime('now'), datetime('now')),

-- Văn phòng phẩm
('prod-012', 'Bút bi Thiên Long TL-027', 'Bút bi xanh Thiên Long', 'TL-027-001', '8934673123467', 'cat-004', 3000, 2000, 200, 100, 'cây', 1, 1, datetime('now'), datetime('now')),
('prod-013', 'Giấy A4 Double A', 'Giấy photocopy A4 70gsm', 'DA-A4-001', '8934673123468', 'cat-004', 85000, 70000, 50, 20, 'ream', 1, 1, datetime('now'), datetime('now')),
('prod-014', 'Keo dán UHU', 'Keo dán đa năng UHU 40ml', 'UH-40-001', '8934673123469', 'cat-004', 12000, 8000, 30, 15, 'tuýp', 1, 0, datetime('now'), datetime('now')),

-- Gia dụng
('prod-015', 'Nồi cơm điện Sharp 1.8L', 'Nồi cơm điện Sharp KS-COM18V', 'SH-18-001', '8934673123470', 'cat-005', 1200000, 950000, 10, 5, 'cái', 1, 1, datetime('now'), datetime('now')),
('prod-016', 'Quạt điện Panasonic', 'Quạt bàn Panasonic F-409U', 'PN-409-001', '8934673123471', 'cat-005', 850000, 700000, 12, 5, 'cái', 1, 0, datetime('now'), datetime('now')),
('prod-017', 'Bình nước Lock&Lock', 'Bình nước thể thao 750ml', 'LL-750-001', '8934673123472', 'cat-005', 120000, 80000, 25, 10, 'cái', 1, 1, datetime('now'), datetime('now'));

-- Insert sample users for testing
INSERT OR IGNORE INTO users (id, email, name, role, password_hash, is_active, created_at, updated_at) VALUES
('user-001', 'admin@khochuan.com', 'Admin User', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VRt7S/FGy', 1, datetime('now'), datetime('now')),
('user-002', 'manager@khochuan.com', 'Manager User', 'manager', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VRt7S/FGy', 1, datetime('now'), datetime('now')),
('user-003', 'cashier@khochuan.com', 'Cashier User', 'cashier', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VRt7S/FGy', 1, datetime('now'), datetime('now'));

-- Insert sample inventory movements
INSERT OR IGNORE INTO inventory_movements (
  id, product_id, movement_type, quantity, reference_type, notes, user_id, created_at
) VALUES
('inv-001', 'prod-001', 'in', 150, 'initial_stock', 'Nhập kho ban đầu', 'user-001', datetime('now')),
('inv-002', 'prod-002', 'in', 120, 'initial_stock', 'Nhập kho ban đầu', 'user-001', datetime('now')),
('inv-003', 'prod-003', 'in', 200, 'initial_stock', 'Nhập kho ban đầu', 'user-001', datetime('now')),
('inv-004', 'prod-004', 'in', 80, 'initial_stock', 'Nhập kho ban đầu', 'user-001', datetime('now')),
('inv-005', 'prod-005', 'in', 25, 'initial_stock', 'Nhập kho ban đầu', 'user-001', datetime('now'));
