package com.banking.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class AccountRequest {

    @NotBlank(message = "accountNumber is required")
    @Size(max = 30, message = "accountNumber cannot exceed 30 characters")
    private String accountNumber;

    @NotNull(message = "customerId is required")
    private Long customerId;

    @NotBlank(message = "accountType is required")
    private String accountType; // SAVINGS / CURRENT

    @PositiveOrZero(message = "balance cannot be negative")
    private BigDecimal balance; // optional, defaults to 0

    @PositiveOrZero(message = "dailyWithdrawalLimit cannot be negative")
    private BigDecimal dailyWithdrawalLimit;

    @PositiveOrZero(message = "dailyTransferLimit cannot be negative")
    private BigDecimal dailyTransferLimit;


    // No-argument constructor
    public AccountRequest() {
    }


    // Getters and Setters

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getDailyWithdrawalLimit() {
        return dailyWithdrawalLimit;
    }

    public void setDailyWithdrawalLimit(BigDecimal dailyWithdrawalLimit) {
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
    }

    public BigDecimal getDailyTransferLimit() {
        return dailyTransferLimit;
    }

    public void setDailyTransferLimit(BigDecimal dailyTransferLimit) {
        this.dailyTransferLimit = dailyTransferLimit;
    }
}