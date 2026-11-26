
package com.banking.transaction.repository;

import com.banking.transaction.models.Account;
import com.banking.transaction.models.Customer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AccountRepositoryTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // Helper method to create an account
    private Account createAccount(String number, Customer customer) {
        return new Account(
                number,
                customer,
                new BigDecimal("10000"),
                Account.AccountStatus.ACTIVE,
                Account.AccountType.SAVINGS,
                new BigDecimal("25000"),
                new BigDecimal("50000")
        );
    }

    // Test 1: Save account and find it using account number
    @Test
    void save_andFindByAccountNumber_works() {

        Customer customer = customerRepository.save(
                new Customer("C1", "c1@test.com", "111")
        );

        Account savedAccount = accountRepository.save(
                createAccount("ACC-T01", customer)
        );

        Optional<Account> foundAccount =
                accountRepository.findByAccountNumber("ACC-T01");

        assertTrue(foundAccount.isPresent());

        assertEquals(
                savedAccount.getAccountId(),
                foundAccount.get().getAccountId()
        );
    }

    // Test 2: Find account using account number with lock
    @Test
    void findByAccountNumberWithLock_returnsAccount() {

        Customer customer = customerRepository.save(
                new Customer("C2", "c2@test.com", "222")
        );

        accountRepository.save(
                createAccount("ACC-T02", customer)
        );

        Optional<Account> lockedAccount =
                accountRepository.findByAccountNumberWithLock("ACC-T02");

        assertTrue(lockedAccount.isPresent());

        assertEquals(
                "ACC-T02",
                lockedAccount.get().getAccountNumber()
        );
    }

    // Test 3: Find all accounts belonging to a customer
    @Test
    void findByCustomerId_returnsAccounts() {

        Customer customer = customerRepository.save(
                new Customer("C3", "c3@test.com", "333")
        );

        accountRepository.save(
                createAccount("ACC-T03", customer)
        );

        accountRepository.save(
                createAccount("ACC-T04", customer)
        );

        assertEquals(
                2,
                accountRepository.findByCustomerId(customer.getId()).size()
        );
    }
}
