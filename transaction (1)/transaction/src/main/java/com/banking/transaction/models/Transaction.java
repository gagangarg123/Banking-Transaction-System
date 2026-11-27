
package com.banking.transaction.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "bank_transactions",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_transaction_id",
            columnNames = "transaction_id"
        )
    },
    indexes = {
        @Index(name = "idx_txn_source", columnList = "source_account"),
        @Index(name = "idx_txn_destination", columnList = "destination_account"),
        @Index(name = "idx_txn_status", columnList = "status"),
        @Index(name = "idx_txn_created_at", columnList = "created_at")
    }
)
public class Transaction {

    public enum TransactionType {
        DEPOSIT, WITHDRAWAL, TRANSFER,REVERSAL
    }

    public enum TransactionStatus {
        SUCCESS, FAILED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false, unique = true, length = 64)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TransactionStatus status;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "source_account", length = 20)
    private String sourceAccount;

    @Column(name = "destination_account", length = 20)
    private String destinationAccount;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    @Column(name = "reversed", nullable = false)
    private boolean reversed = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Transaction() {
    }

    public Transaction(
            String transactionId,
            TransactionType type,
            TransactionStatus status,
            BigDecimal amount,
            String sourceAccount,
            String destinationAccount,
            String failureReason
    ) {
        this.transactionId = transactionId;
        this.type = type;
        this.status = status;
        this.amount = amount;
        this.sourceAccount = sourceAccount;
        this.destinationAccount = destinationAccount;
        this.failureReason = failureReason;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getSourceAccount() {
        return sourceAccount;
    }

    public void setSourceAccount(String sourceAccount) {
        this.sourceAccount = sourceAccount;
    }

    public String getDestinationAccount() {
        return destinationAccount;
    }

    public void setDestinationAccount(String destinationAccount) {
        this.destinationAccount = destinationAccount;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    public boolean isReversed(){
        return reversed;
    }
    public void setReversed(boolean reversed){
        this.reversed=reversed;
    }
    public Long getVersion() {
        return version;
    }
}
