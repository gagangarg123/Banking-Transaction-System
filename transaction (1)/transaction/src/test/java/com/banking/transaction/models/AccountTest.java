
package com.banking.transaction.models;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class AccountTest {

    @Test
    void constructor_setsAllFields() {
        Customer customer = new Customer(
                "Gagan",
                "g@test.com",
                "999"
        );

        Account account = new Account(
                "ACC1001",
                customer,
                new BigDecimal("10000.00"),
                Account.AccountStatus.ACTIVE,
                Account.AccountType.SAVINGS,
                new BigDecimal("25000"),
                new BigDecimal("50000")
        );

        assertEquals("ACC1001", account.getAccountNumber());
        assertEquals(customer, account.getCustomer());
        assertEquals(new BigDecimal("10000.00"), account.getBalance());
        assertEquals(Account.AccountStatus.ACTIVE, account.getStatus());
        assertEquals(Account.AccountType.SAVINGS, account.getAccountType());
        assertNull(account.getAccountId());
    }

    @Test
    void setters_updateBalanceAndStatus() {
        Account account = new Account();

        account.setBalance(new BigDecimal("5000"));
        account.setStatus(Account.AccountStatus.FROZEN);

        assertEquals(new BigDecimal("5000"), account.getBalance());
        assertEquals(Account.AccountStatus.FROZEN, account.getStatus());
    }

    @Test
    void balance_supportsDecimalPrecision() {
        Account account = new Account();

        account.setBalance(new BigDecimal("1234.5678"));

        assertEquals(
                0,
                new BigDecimal("1234.5678").compareTo(account.getBalance())
        );
    }
}
