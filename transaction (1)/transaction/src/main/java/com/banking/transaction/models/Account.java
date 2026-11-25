package com.banking.transaction.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "account",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_account_number", columnNames = "account_number")
    },
    indexes = {
        @Index(name = "idx_account_customer", columnList = "customer_id")
    }
)
public class Account {

    public enum AccountStatus {
        ACTIVE, FROZEN, CLOSED
    }

    public enum AccountType {
        SAVINGS, CURRENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    @Column(name = "account_number", nullable = false, unique = true)
    private String accountNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(name = "daily_withdrawal_limit", nullable = false,
            precision = 19, scale = 4)
    private BigDecimal dailyWithdrawalLimit;

    @Column(name = "daily_transfer_limit", nullable = false,
            precision = 19, scale = 4)
    private BigDecimal dailyTransferLimit;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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

    public Account() {
    }

    public Account(String accountNumber, Customer customer, BigDecimal balance,
                   AccountStatus status, AccountType accountType,
                   BigDecimal dailyWithdrawalLimit, BigDecimal dailyTransferLimit) {
        this.accountNumber = accountNumber;
        this.customer = customer;
        this.balance = balance;
        this.status = status;
        this.accountType = accountType;
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
        this.dailyTransferLimit = dailyTransferLimit;
    }

    public Long getAccountId() { return accountId; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }
    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }
    public BigDecimal getDailyWithdrawalLimit() { return dailyWithdrawalLimit; }
    public void setDailyWithdrawalLimit(BigDecimal v) { this.dailyWithdrawalLimit = v; }
    public BigDecimal getDailyTransferLimit() { return dailyTransferLimit; }
    public void setDailyTransferLimit(BigDecimal v) { this.dailyTransferLimit = v; }
    public Long getVersion() { return version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
