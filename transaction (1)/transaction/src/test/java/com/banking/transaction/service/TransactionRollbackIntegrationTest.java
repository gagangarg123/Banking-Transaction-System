package com.banking.transaction.service;

import com.banking.transaction.dto.TransactionRequest;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.CustomerRepository;
import com.banking.transaction.repository.TransactionAuditRepository;
import com.banking.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
class TransactionRollbackIntegrationTest {

    @Autowired TransactionService transactionService;
    @Autowired AccountRepository accountRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired TransactionRepository transactionRepository;

    // Audit repository is mocked to throw — simulates a DB failure AFTER balances updated
    @MockitoBean
    TransactionAuditRepository auditRepository;

    private String sourceAcc, destAcc;
    private static final BigDecimal SOURCE_INIT = new BigDecimal("1000");
    private static final BigDecimal AMOUNT = new BigDecimal("400");

    @BeforeEach
    void setup() {
        String u = String.valueOf(System.currentTimeMillis());
        Customer c = customerRepository.save(
                new Customer("RollbackTest", "rb-" + u + "@t.com", "0"));

        sourceAcc = "RBS-" + u;
        destAcc   = "RBD-" + u;
        save(sourceAcc, c, SOURCE_INIT);
        save(destAcc,   c, BigDecimal.ZERO);
    }

    private void save(String num, Customer c, BigDecimal bal) {
        Account a = new Account();
        a.setAccountNumber(num);
        a.setCustomer(c);
        a.setBalance(bal);
        a.setStatus(Account.AccountStatus.ACTIVE);
        a.setAccountType(Account.AccountType.SAVINGS);
        a.setDailyWithdrawalLimit(new BigDecimal("999999"));
        a.setDailyTransferLimit(new BigDecimal("999999"));
        accountRepository.save(a);
    }

    @Test
    void transfer_auditFailure_rollsBackBothBalances() {
        // Force failure: audit save throws AFTER debit+credit already applied in memory
        when(auditRepository.save(any()))
                .thenThrow(new RuntimeException("Simulated audit DB failure"));

        TransactionRequest req = new TransactionRequest();
        req.setTransactionId("RB-TXN-" + System.nanoTime());
        req.setType("TRANSFER");
        req.setAmount(AMOUNT);
        req.setSourceAccount(sourceAcc);
        req.setDestinationAccount(destAcc);

        // The exception MUST propagate — proving the transaction aborted
        assertThrows(RuntimeException.class, () -> transactionService.transfer(req));

        // Reload fresh state from DB — proves rollback actually happened
        Account src = accountRepository.findByAccountNumber(sourceAcc).orElseThrow();
        Account dst = accountRepository.findByAccountNumber(destAcc).orElseThrow();

        assertEquals(0, SOURCE_INIT.compareTo(src.getBalance()),
                "Source balance must be UNCHANGED after rollback");
        assertEquals(0, BigDecimal.ZERO.compareTo(dst.getBalance()),
                "Destination balance must be UNCHANGED after rollback");
        assertTrue(transactionRepository.findByTransactionId(req.getTransactionId()).isEmpty(),
                "No transaction row must exist after rollback");
    }

    @Test
    void transfer_success_commitsBothBalances() {
        // Sanity check: without the failure, transfer works and persists
        reset(auditRepository);  
        when(auditRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TransactionRequest req = new TransactionRequest();
        req.setTransactionId("RB-OK-" + System.nanoTime());
        req.setType("TRANSFER");
        req.setAmount(AMOUNT);
        req.setSourceAccount(sourceAcc);
        req.setDestinationAccount(destAcc);

        var res = transactionService.transfer(req);
        assertEquals("SUCCESS", res.getStatus());

        Account src = accountRepository.findByAccountNumber(sourceAcc).orElseThrow();
        Account dst = accountRepository.findByAccountNumber(destAcc).orElseThrow();
        assertEquals(0, new BigDecimal("600").compareTo(src.getBalance()));
        assertEquals(0, new BigDecimal("400").compareTo(dst.getBalance()));
        assertTrue(transactionRepository.findByTransactionId(req.getTransactionId()).isPresent());
    }
}
