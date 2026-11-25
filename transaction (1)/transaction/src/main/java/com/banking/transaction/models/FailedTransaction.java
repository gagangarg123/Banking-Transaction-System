package com.banking.transaction.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "failed_transaction",
    indexes = {
        @Index(name = "idx_failed_txn_id", columnList = "transaction_id"),
        @Index(name = "idx_failed_reason", columnList = "error_category")
    }
)
public class FailedTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, length = 64)
    private String transactionId;

    @Column(name = "account_number", length = 20)
    private String accountNumber;

    @Column(name = "operation", length = 20)
    private String operation;

    @Column(name = "amount", precision = 19, scale = 4)
    private java.math.BigDecimal amount;

    @Column(name = "error_category", length = 50)
    private String errorCategory;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    @Column(name = "thread_name", length = 100)
    private String threadName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public FailedTransaction() {
    }

    public FailedTransaction(String transactionId, String accountNumber,
                             String operation, java.math.BigDecimal amount,
                             String errorCategory, String errorMessage,
                             String stackTrace, String threadName) {
        this.transactionId = transactionId;
        this.accountNumber = accountNumber;
        this.operation = operation;
        this.amount = amount;
        this.errorCategory = errorCategory;
        this.errorMessage = errorMessage;
        this.stackTrace = stackTrace;
        this.threadName = threadName;
    }

    public Long getId() { return id; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String v) { this.transactionId = v; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String v) { this.accountNumber = v; }
    public String getOperation() { return operation; }
    public void setOperation(String v) { this.operation = v; }
    public java.math.BigDecimal getAmount() { return amount; }
    public void setAmount(java.math.BigDecimal v) { this.amount = v; }
    public String getErrorCategory() { return errorCategory; }
    public void setErrorCategory(String v) { this.errorCategory = v; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String v) { this.errorMessage = v; }
    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String v) { this.stackTrace = v; }
    public String getThreadName() { return threadName; }
    public void setThreadName(String v) { this.threadName = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
