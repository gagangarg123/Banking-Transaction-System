package com.banking.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AccountResponse {

    private Long accountId;
    private String accountNumber;
    private Long customerId;
    private String customerName;
    private BigDecimal balance;
    private String status;
    private String accountType;
    private BigDecimal dailyWithdrawalLimit;
    private BigDecimal dailyTransferLimit;
    private LocalDateTime createdAt;

    // No-argument constructor
    public AccountResponse() {
    }

    // Parameterized constructor
    public AccountResponse(Long accountId, String accountNumber, Long customerId,
                          String customerName, BigDecimal balance, String status,
                          String accountType, BigDecimal dailyWithdrawalLimit,
                          BigDecimal dailyTransferLimit, LocalDateTime createdAt) {

        this.accountId = accountId;
        this.accountNumber = accountNumber;
        this.customerId = customerId;
        this.customerName = customerName;
        this.balance = balance;
        this.status = status;
        this.accountType = accountType;
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
        this.dailyTransferLimit = dailyTransferLimit;
        this.createdAt = createdAt;
    }

    // Getters

    public Long getAccountId() {
        return accountId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getStatus() {
        return status;
    }

    public String getAccountType() {
        return accountType;
    }

    public BigDecimal getDailyWithdrawalLimit() {
        return dailyWithdrawalLimit;
    }

    public BigDecimal getDailyTransferLimit() {
        return dailyTransferLimit;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}