-- Migration: Add loyalty_transactions table for customer loyalty program
-- Date: 2025-07-10
-- Purpose: Support loyalty points tracking and management

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    points INTEGER NOT NULL,
    transaction_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'earned', 'redeemed', 'expired', 'bonus'
    reason TEXT NOT NULL,
    balance_before INTEGER NOT NULL DEFAULT 0,
    balance_after INTEGER NOT NULL DEFAULT 0,
    order_id TEXT NULL, -- Reference to order if points earned/redeemed from order
    created_by TEXT NULL, -- User who created this transaction
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);

-- Add some sample loyalty transactions for testing
INSERT OR IGNORE INTO loyalty_transactions (id, customer_id, points, transaction_type, reason, balance_before, balance_after, created_at) VALUES
('loyalty-001', 'cust-001', 100, 'bonus', 'Welcome bonus for new customer', 0, 100, datetime('now', '-30 days')),
('loyalty-002', 'cust-001', 50, 'earned', 'Points earned from purchase', 100, 150, datetime('now', '-25 days')),
('loyalty-003', 'cust-001', -25, 'redeemed', 'Points redeemed for discount', 150, 125, datetime('now', '-20 days')),
('loyalty-004', 'cust-002', 200, 'bonus', 'Birthday bonus points', 0, 200, datetime('now', '-15 days')),
('loyalty-005', 'cust-002', 75, 'earned', 'Points earned from large purchase', 200, 275, datetime('now', '-10 days'));
