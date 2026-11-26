USE banking_transaction_system;

-- ==================== CUSTOMERS ====================
INSERT INTO customers (id, name, email, phone, created_at, updated_at) VALUES
(1, 'Rahul Sharma',   'rahul.sharma@test.com',   '9876543210', NOW(), NOW()),
(2, 'Priya Patel',    'priya.patel@test.com',    '9876543211', NOW(), NOW()),
(3, 'Amit Verma',     'amit.verma@test.com',     '9876543212', NOW(), NOW()),
(4, 'Sneha Reddy',    'sneha.reddy@test.com',    '9876543213', NOW(), NOW());

-- ==================== ACCOUNTS ====================
-- 5 accounts: different types + one FROZEN for testing rejections
INSERT INTO account
(account_id, account_number, customer_id, balance, status, account_type,
 daily_withdrawal_limit, daily_transfer_limit, version, created_at, updated_at) VALUES
(1, 'ACC1001', 1,  52500.0000, 'ACTIVE', 'SAVINGS',  25000.0000, 50000.0000, 0, NOW(), NOW()),
(2, 'ACC1002', 1,  18250.0000, 'ACTIVE', 'SAVINGS',  25000.0000, 50000.0000, 0, NOW(), NOW()),
(3, 'ACC2001', 2, 125000.0000, 'ACTIVE', 'CURRENT',  50000.0000, 100000.0000, 0, NOW(), NOW()),
(4, 'ACC2002', 2,   9400.0000, 'FROZEN', 'SAVINGS',  25000.0000, 50000.0000, 0, NOW(), NOW()),
(5, 'ACC3001', 3,  31500.0000, 'ACTIVE', 'SAVINGS',  25000.0000, 50000.0000, 0, NOW(), NOW());

-- ==================== TRANSACTIONS (all SUCCESS) ====================
INSERT INTO transaction
(transaction_id, type, status, amount, source_account, destination_account,
 failure_reason, processed_by, created_at, updated_at) VALUES
('SEED-TXN-001', 'DEPOSIT',   'SUCCESS', 25000.0000, NULL,      'ACC1001', NULL, 'seed-thread', NOW(), NOW()),
('SEED-TXN-002', 'WITHDRAWAL','SUCCESS',  5000.0000, 'ACC1001', NULL,      NULL, 'seed-thread', NOW(), NOW()),
('SEED-TXN-003', 'TRANSFER',  'SUCCESS', 10000.0000, 'ACC1001', 'ACC2001', NULL, 'seed-thread', NOW(), NOW()),
('SEED-TXN-004', 'DEPOSIT',   'SUCCESS', 50000.0000, NULL,      'ACC2001', NULL, 'seed-thread', NOW(), NOW()),
('SEED-TXN-005', 'TRANSFER',  'SUCCESS', 15000.0000, 'ACC2001', 'ACC3001', NULL, 'seed-thread', NOW(), NOW()),
('SEED-TXN-006', 'WITHDRAWAL','SUCCESS',  2000.0000, 'ACC3001', NULL,      NULL, 'seed-thread', NOW(), NOW()),
('SEED-TXN-007', 'TRANSFER',  'SUCCESS',  5000.0000, 'ACC3001', 'ACC1002', NULL, 'seed-thread', NOW(), NOW());

-- ==================== TRANSACTION AUDIT ====================
INSERT INTO transaction_audit
(transaction_id, account_number, operation, result, thread_name, duration_ms, error_message, created_at) VALUES
('SEED-TXN-001', 'ACC1001', 'DEPOSIT',    'SUCCESS', 'seed-thread', 32,  NULL, NOW()),
('SEED-TXN-002', 'ACC1001', 'WITHDRAWAL', 'SUCCESS', 'seed-thread', 28,  NULL, NOW()),
('SEED-TXN-003', 'ACC1001', 'TRANSFER',   'SUCCESS', 'seed-thread', 45,  NULL, NOW()),
('SEED-TXN-003', 'ACC2001', 'TRANSFER',   'SUCCESS', 'seed-thread', 45,  NULL, NOW()),
('SEED-TXN-004', 'ACC2001', 'DEPOSIT',    'SUCCESS', 'seed-thread', 30,  NULL, NOW()),
('SEED-TXN-005', 'ACC2001', 'TRANSFER',   'SUCCESS', 'seed-thread', 51,  NULL, NOW()),
('SEED-TXN-005', 'ACC3001', 'TRANSFER',   'SUCCESS', 'seed-thread', 51,  NULL, NOW()),
('SEED-TXN-006', 'ACC3001', 'WITHDRAWAL', 'SUCCESS', 'seed-thread', 26,  NULL, NOW()),
('SEED-TXN-007', 'ACC3001', 'TRANSFER',   'SUCCESS', 'seed-thread', 40,  NULL, NOW()),
('SEED-TXN-007', 'ACC1002', 'TRANSFER',   'SUCCESS', 'seed-thread', 40,  NULL, NOW());

-- ==================== FAILED TRANSACTIONS ====================
INSERT INTO failed_transaction
(transaction_id, account_number, operation, amount, error_category,
 error_message, stack_trace, thread_name, created_at) VALUES
('SEED-TXN-F01', 'ACC2002', 'WITHDRAWAL', 5000.0000, 'ACCOUNT_INACTIVE',
 'Account is FROZEN', 
 'com.banking.transaction.exception.InactiveAccountException: Account ACC2002 is FROZEN',
 'seed-thread', NOW()),

('SEED-TXN-F02', 'ACC3001', 'WITHDRAWAL', 99999.0000, 'INSUFFICIENT_BALANCE',
 'Insufficient balance: available 31500.0000, requested 99999.0000',
 'com.banking.transaction.exception.InsufficientBalanceException: Insufficient balance',
 'seed-thread', NOW()),

('SEED-TXN-F03', 'ACC1001', 'TRANSFER', 500.0000, 'DUPLICATE_TRANSACTION',
 'Duplicate transactionId: SEED-TXN-003 already exists',
 'com.banking.transaction.exception.DuplicateTransactionException: Duplicate transaction',
 'pool-1-thread-3', NOW()),

('SEED-TXN-F04', 'ACC1001', 'WITHDRAWAL', -100.0000, 'VALIDATION',
 'Amount must be positive',
 'jakarta.validation.ConstraintViolationException: amount must be greater than 0',
 'pool-1-thread-1', NOW());