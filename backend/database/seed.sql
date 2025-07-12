-- KhoAugment POS Seed Data
-- Insert default data for development and testing

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, role, full_name, phone) VALUES 
('admin@khoaugment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Quản trị viên', '0123456789'),
('cashier@khoaugment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cashier', 'Thu ngân', '0123456788'),
('staff@khoaugment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff', 'Nhân viên', '0123456787');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('Đồ uống', 'Nước ngọt, trà, cà phê, nước suối'),
('Đồ ăn', 'Bánh kẹo, snack, đồ ăn vặt'),
('Văn phòng phẩm', 'Bút, giấy, dụng cụ học tập'),
('Điện tử', 'Phụ kiện điện thoại, tai nghe, cáp sạc'),
('Gia dụng', 'Đồ dùng gia đình, vệ sinh');

-- Insert sample products
INSERT INTO products (name, description, price, cost_price, stock, min_stock, barcode, category_id) VALUES 
-- Đồ uống
('Coca Cola 330ml', 'Nước ngọt có ga Coca Cola lon 330ml', 15000, 12000, 100, 10, '8934673123456', 1),
('Pepsi 330ml', 'Nước ngọt có ga Pepsi lon 330ml', 15000, 12000, 80, 10, '8934673123457', 1),
('Aquafina 500ml', 'Nước suối tinh khiết Aquafina 500ml', 8000, 6000, 200, 20, '8934673123458', 1),
('Trà Xanh 0 độ 450ml', 'Trà xanh không đường 450ml', 12000, 9000, 60, 10, '8934673123459', 1),
('Cà phê Highlands 235ml', 'Cà phê sữa đá Highlands lon 235ml', 25000, 20000, 40, 5, '8934673123460', 1),

-- Đồ ăn
('Bánh Oreo Original', 'Bánh quy kem Oreo vị nguyên bản', 25000, 20000, 50, 5, '8934673234567', 2),
('Snack Oishi Bắp rang', 'Snack bắp rang vị tự nhiên 42g', 8000, 6000, 120, 15, '8934673234568', 2),
('Kẹo Mentos Mint', 'Kẹo Mentos vị bạc hà', 15000, 12000, 80, 10, '8934673234569', 2),
('Bánh mì Sandwich', 'Bánh mì sandwich thịt nguội', 35000, 25000, 20, 5, '8934673234570', 2),
('Mì tôm Hảo Hảo', 'Mì tôm chua cay Hảo Hảo', 5000, 3500, 200, 30, '8934673234571', 2),

-- Văn phòng phẩm
('Bút bi xanh Thiên Long', 'Bút bi xanh TL-027', 5000, 3000, 200, 20, '8934673345678', 3),
('Tập 4 ô Campus', 'Tập viết 4 ô Campus 200 trang', 15000, 10000, 100, 10, '8934673345679', 3),
('Bút chì 2B', 'Bút chì 2B Thiên Long', 3000, 2000, 150, 20, '8934673345680', 3),
('Thước kẻ 30cm', 'Thước kẻ nhựa trong 30cm', 8000, 5000, 80, 10, '8934673345681', 3),
('Gôm tẩy trắng', 'Gôm tẩy trắng Thiên Long', 2000, 1500, 300, 50, '8934673345682', 3),

-- Điện tử
('Cáp sạc iPhone Lightning', 'Cáp sạc Lightning 1m chính hãng', 150000, 100000, 30, 5, '8934673456789', 4),
('Tai nghe có dây', 'Tai nghe có dây jack 3.5mm', 50000, 35000, 25, 5, '8934673456790', 4),
('Ốp lưng iPhone 14', 'Ốp lưng silicon iPhone 14', 80000, 50000, 40, 5, '8934673456791', 4),
('Pin dự phòng 10000mAh', 'Pin dự phòng Xiaomi 10000mAh', 350000, 250000, 15, 3, '8934673456792', 4),
('Kính cường lực iPhone', 'Kính cường lực iPhone 14 Pro', 100000, 70000, 20, 3, '8934673456793', 4),

-- Gia dụng
('Khăn giấy Tempo', 'Khăn giấy Tempo hộp 100 tờ', 25000, 18000, 60, 10, '8934673567890', 5),
('Nước rửa chén Sunlight', 'Nước rửa chén Sunlight 500ml', 35000, 25000, 40, 5, '8934673567891', 5),
('Túi rác đen 3 cuộn', 'Túi rác đen size M 3 cuộn', 30000, 20000, 50, 10, '8934673567892', 5),
('Giấy vệ sinh Paseo', 'Giấy vệ sinh Paseo 10 cuộn', 45000, 35000, 30, 5, '8934673567893', 5),
('Nước lau sàn Vim', 'Nước lau sàn Vim hương lavender 1L', 40000, 30000, 25, 5, '8934673567894', 5);

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, loyalty_points) VALUES 
('Nguyễn Văn An', 'an@gmail.com', '0901234567', '123 Lê Lợi, Q1, TP.HCM', 150),
('Trần Thị Bình', 'binh@gmail.com', '0901234568', '456 Nguyễn Huệ, Q1, TP.HCM', 300),
('Lê Văn Cường', 'cuong@gmail.com', '0901234569', '789 Đồng Khởi, Q1, TP.HCM', 75),
('Phạm Thị Dung', 'dung@gmail.com', '0901234570', '321 Hai Bà Trưng, Q3, TP.HCM', 220),
('Hoàng Văn Em', 'em@gmail.com', '0901234571', '654 Cách Mạng Tháng 8, Q10, TP.HCM', 180);

-- Insert system settings
INSERT INTO settings (key, value, description) VALUES 
('tax_rate', '0.1', 'Thuế VAT (10%)'),
('currency', 'VND', 'Đơn vị tiền tệ'),
('business_name', 'KhoAugment POS', 'Tên cửa hàng'),
('business_address', '123 Nguyễn Du, Q1, TP.HCM', 'Địa chỉ cửa hàng'),
('business_phone', '028-1234-5678', 'Số điện thoại cửa hàng'),
('receipt_footer', 'Cảm ơn quý khách đã mua hàng!', 'Lời cảm ơn trên hóa đơn'),
('low_stock_threshold', '10', 'Ngưỡng cảnh báo hết hàng'),
('backup_frequency', '24', 'Tần suất sao lưu (giờ)');

-- Sample order for testing
INSERT INTO orders (order_number, user_id, customer_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, status, notes) VALUES 
('ORD-1000001', 2, 1, 50000, 5000, 0, 55000, 'cash', 'completed', 'Khách hàng thân thiết');

-- Sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES 
(1, 1, 2, 15000, 30000),  -- 2 Coca Cola
(1, 6, 1, 25000, 25000);  -- 1 Bánh Oreo

-- Sample inventory movements
INSERT INTO inventory_movements (product_id, movement_type, quantity_change, quantity_before, quantity_after, reference_id, reference_type, user_id, notes) VALUES 
(1, 'sale', -2, 102, 100, 1, 'order', 2, 'Bán hàng'),
(6, 'sale', -1, 51, 50, 1, 'order', 2, 'Bán hàng'); 