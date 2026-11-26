CREATE DATABASE IF NOT EXISTS banking_transaction_system;
USE banking_transaction_system;

-- ==================== CUSTOMERS ====================
CREATE TABLE IF NOT EXISTS customers (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    CONSTRAINT uk_customer_email UNIQUE (email)
);

-- ==================== ACCOUNT ====================
CREATE TABLE IF NOT EXISTS account (
    account_id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number          VARCHAR(255) NOT NULL,
    customer_id             BIGINT       NOT NULL,
    balance                 DECIMAL(19,4) NOT NULL,
    status                  VARCHAR(255) NOT NULL,
    account_type            VARCHAR(255) NOT NULL,
    daily_withdrawal_limit  DECIMAL(19,4) NOT NULL,
    daily_transfer_limit    DECIMAL(19,4) NOT NULL,
    version                 BIGINT,
    created_at              DATETIME(6) NOT NULL,
    updated_at              DATETIME(6) NOT NULL,
    CONSTRAINT uk_account_number UNIQUE (account_number),
    CONSTRAINT fk_account_customer FOREIGN KEY (customer_id)
        REFERENCES customers (id),
    INDEX idx_account_customer (customer_id)
);

-- ==================== TRANSACTION ====================
CREATE TABLE IF NOT EXISTS transaction (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id      VARCHAR(64)  NOT NULL,
    type                VARCHAR(255) NOT NULL,
    status              VARCHAR(255) NOT NULL,
    amount              DECIMAL(19,4) NOT NULL,
    source_account      VARCHAR(20),
    destination_account VARCHAR(20),
    failure_reason      TEXT,
    processed_by        VARCHAR(100),
    created_at          DATETIME(6) NOT NULL,
    updated_at          DATETIME(6) NOT NULL,
    CONSTRAINT uk_transaction_id UNIQUE (transaction_id),
    INDEX idx_txn_source (source_account),
    INDEX idx_txn_destination (destination_account),
    INDEX idx_txn_status (status)
);

-- ==================== TRANSACTION AUDIT ====================
CREATE TABLE IF NOT EXISTS transaction_audit (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id  VARCHAR(64)  NOT NULL,
    account_number  VARCHAR(20),
    operation       VARCHAR(20),
    result          VARCHAR(20),
    thread_name     VARCHAR(100),
    duration_ms     BIGINT,
    error_message   TEXT,
    created_at      DATETIME(6) NOT NULL,
    INDEX idx_audit_txn_id (transaction_id),
    INDEX idx_audit_thread (thread_name)
);

-- ==================== FAILED TRANSACTION ====================
CREATE TABLE IF NOT EXISTS failed_transaction (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id  VARCHAR(64)  NOT NULL,
    account_number  VARCHAR(20),
    operation       VARCHAR(20),
    amount          DECIMAL(19,4),
    error_category  VARCHAR(50),
    error_message   TEXT,
    stack_trace     TEXT,
    thread_name     VARCHAR(100),
    created_at      DATETIME(6) NOT NULL,
    INDEX idx_failed_txn_id (transaction_id),
    INDEX idx_failed_reason (error_category)
);