-- Update payment_methods table to allow loyalty_points
-- SQLite doesn't support ALTER TABLE to modify CHECK constraints
-- So we need to recreate the table

-- Create new table with updated constraint
CREATE TABLE IF NOT EXISTS payment_methods_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'card', 'digital_wallet', 'bank_transfer', 'loyalty_points')),
    is_active BOOLEAN DEFAULT 1,
    processing_fee DECIMAL(5,2) DEFAULT 0,
    icon TEXT,
    settings TEXT, -- JSON configuration
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO payment_methods_new (id, name, type, is_active, processing_fee, icon, settings, created_at)
SELECT id, name, type, is_active, processing_fee, icon, settings, created_at
FROM payment_methods;

-- Drop old table
DROP TABLE payment_methods;

-- Rename new table to original name
ALTER TABLE payment_methods_new RENAME TO payment_methods;
