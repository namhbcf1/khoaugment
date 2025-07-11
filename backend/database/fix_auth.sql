-- ============================================================================
-- FIX AUTHENTICATION SYSTEM - PRODUCTION USER CREDENTIALS
-- ============================================================================
-- Create/Update users with correct password hashes for production system

-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Delete existing users to avoid conflicts (only our specific users)
DELETE FROM users WHERE email IN (
    'admin@truongphat.com',
    'cashier@truongphat.com',
    'staff@truongphat.com',
    'manager@truongphat.com'
);

-- Insert users with correct password hashes
-- Password hashes generated with SALT: truongphat-computer-hoabinh-salt-2025
INSERT INTO users (id, email, password_hash, name, role, phone, is_active, created_at, updated_at) VALUES
-- admin@truongphat.com / admin123
('admin-001', 'admin@truongphat.com', '69d0fff6b65f850292dcb8cafdd3b3edc211c070b3d85e48f05922d58cdc36d1', 'Nguyễn Văn Admin', 'admin', '0123456789', 1, datetime('now'), datetime('now')),

-- cashier@truongphat.com / cashier123  
('cashier-001', 'cashier@truongphat.com', 'bcfa0dba5dcfc1137b7658d75dc7287f4ff174b196d4e5dd66746f30a595ab78', 'Trần Thị Thu Ngân', 'cashier', '0987654321', 1, datetime('now'), datetime('now')),

-- staff@truongphat.com / staff123
('staff-001', 'staff@truongphat.com', 'dd0a22bb1f7e025f94aad97a07bd4aac62e6a9f13d9e023a054ae389ed421946', 'Lê Văn Nhân Viên', 'staff', '0369852147', 1, datetime('now'), datetime('now')),

-- manager@truongphat.com / manager123
('manager-001', 'manager@truongphat.com', 'dc78a6b8b1adf0f183fe885285dbdbe9df0702bd75c17e3ee32b053a85679189', 'Phạm Thị Quản Lý', 'manager', '0147258369', 1, datetime('now'), datetime('now'));

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Verify users were created
SELECT 'Users created successfully:' as message;
SELECT id, email, name, role, is_active FROM users WHERE email LIKE '%truongphat.com' ORDER BY role;
