package com.banking.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {

    private String transactionId;
    private String status;                  // SUCCESS / FAILED / REJECTED
    private String message;
    private BigDecimal amount;
    private String sourceAccount;
    private String destinationAccount;
    private LocalDateTime timestamp;

    // Default constructor
    public TransactionResponse() {
    }

    // Parameterized constructor
    public TransactionResponse(
            String transactionId,
            String status,
            String message,
            BigDecimal amount,
            String sourceAccount,
            String destinationAccount
    ) {
        this.transactionId = transactionId;
        this.status = status;
        this.message = message;
        this.amount = amount;
        this.sourceAccount = sourceAccount;
        this.destinationAccount = destinationAccount;
        this.timestamp = LocalDateTime.now();
    }

    // Getters

    public String getTransactionId() {
        return transactionId;
    }

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getSourceAccount() {
        return sourceAccount;
    }

    public String getDestinationAccount() {
        return destinationAccount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // Setters

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setSourceAccount(String sourceAccount) {
        this.sourceAccount = sourceAccount;
    }

    public void setDestinationAccount(String destinationAccount) {
        this.destinationAccount = destinationAccount;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}