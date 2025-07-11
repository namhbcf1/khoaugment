-- ============================================================================
-- UPDATE PASSWORD HASHES ONLY - PRODUCTION USER CREDENTIALS
-- ============================================================================
-- Update existing users with correct password hashes for production system
-- Password hashes generated with SALT: truongphat-computer-hoabinh-salt-2025

-- Update password hashes for existing users
UPDATE users SET password_hash = '69d0fff6b65f850292dcb8cafdd3b3edc211c070b3d85e48f05922d58cdc36d1' WHERE email = 'admin@truongphat.com';
UPDATE users SET password_hash = 'bcfa0dba5dcfc1137b7658d75dc7287f4ff174b196d4e5dd66746f30a595ab78' WHERE email = 'cashier@truongphat.com';
UPDATE users SET password_hash = 'dd0a22bb1f7e025f94aad97a07bd4aac62e6a9f13d9e023a054ae389ed421946' WHERE email = 'staff@truongphat.com';
UPDATE users SET password_hash = 'dc78a6b8b1adf0f183fe885285dbdbe9df0702bd75c17e3ee32b053a85679189' WHERE email = 'manager@truongphat.com';

-- Verify password hashes were updated
SELECT 'Password hashes updated successfully:' as message;
SELECT id, email, name, role, substr(password_hash, 1, 20) || '...' as password_hash_preview FROM users WHERE email LIKE '%truongphat.com' ORDER BY role;
