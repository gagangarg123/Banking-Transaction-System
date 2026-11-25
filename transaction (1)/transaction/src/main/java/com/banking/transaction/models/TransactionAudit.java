package com.banking.transaction.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "transaction_audit",
    indexes = {
        @Index(name = "idx_audit_txn_id", columnList = "transaction_id"),
        @Index(name = "idx_audit_thread", columnList = "thread_name")
    }
)
public class TransactionAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, length = 64)
    private String transactionId;

    @Column(name = "account_number", length = 20)
    private String accountNumber;

    @Column(name = "operation", length = 20)
    private String operation;

    @Column(name = "result", length = 20)
    private String result;

    @Column(name = "thread_name", length = 100)
    private String threadName;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public TransactionAudit() {
    }

    public TransactionAudit(String transactionId, String accountNumber,
                            String operation, String result,
                            String threadName, Long durationMs,
                            String errorMessage) {
        this.transactionId = transactionId;
        this.accountNumber = accountNumber;
        this.operation = operation;
        this.result = result;
        this.threadName = threadName;
        this.durationMs = durationMs;
        this.errorMessage = errorMessage;
    }

    public Long getId() { return id; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String v) { this.transactionId = v; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String v) { this.accountNumber = v; }
    public String getOperation() { return operation; }
    public void setOperation(String v) { this.operation = v; }
    public String getResult() { return result; }
    public void setResult(String v) { this.result = v; }
    public String getThreadName() { return threadName; }
    public void setThreadName(String v) { this.threadName = v; }
    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long v) { this.durationMs = v; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String v) { this.errorMessage = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
