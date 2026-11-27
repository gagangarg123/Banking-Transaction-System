package com.banking.transaction.dto;

import java.math.BigDecimal;

public class ReversalResponse {

    private String reversalId;
    private String originalTransactionId;
    private String status;
    private String message;
    private BigDecimal amount;
    private String sourceAccount;
    private String destinationAccount;

    public ReversalResponse() {
    }

    public ReversalResponse(String reversalId,
                           String originalTransactionId,
                           String status,
                           String message,
                           BigDecimal amount,
                           String sourceAccount,
                           String destinationAccount) {

        this.reversalId = reversalId;
        this.originalTransactionId = originalTransactionId;
        this.status = status;
        this.message = message;
        this.amount = amount;
        this.sourceAccount = sourceAccount;
        this.destinationAccount = destinationAccount;
    }

    public String getReversalId() {
        return reversalId;
    }

    public void setReversalId(String reversalId) {
        this.reversalId = reversalId;
    }

    public String getOriginalTransactionId() {
        return originalTransactionId;
    }

    public void setOriginalTransactionId(String originalTransactionId) {
        this.originalTransactionId = originalTransactionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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
}