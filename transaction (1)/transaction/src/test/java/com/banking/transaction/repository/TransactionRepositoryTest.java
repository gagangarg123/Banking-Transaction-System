
package com.banking.transaction.repository;

import com.banking.transaction.models.Transaction;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;

    // Test 1: Save transaction and check whether transaction ID exists
    @Test
    void save_andExistsByTransactionId_works() {

        Transaction transaction = new Transaction(
                "TXN-T01",
                Transaction.TransactionType.DEPOSIT,
                Transaction.TransactionStatus.SUCCESS,
                new BigDecimal("1000"),
                null,
                "ACC1001",
                null
        );

        transactionRepository.save(transaction);

        assertTrue(
                transactionRepository.existsByTransactionId("TXN-T01")
        );

        assertFalse(
                transactionRepository.existsByTransactionId("TXN-UNKNOWN")
        );
    }

    // Test 2: Find transactions related to an account
    @Test
    void findBySourceOrDestination_returnsHistory() {

        transactionRepository.save(
                new Transaction(
                        "TXN-T02",
                        Transaction.TransactionType.WITHDRAWAL,
                        Transaction.TransactionStatus.SUCCESS,
                        new BigDecimal("500"),
                        "ACC-TEST-HIST",
                        null,
                        null
                )
        );

        transactionRepository.save(
                new Transaction(
                        "TXN-T03",
                        Transaction.TransactionType.DEPOSIT,
                        Transaction.TransactionStatus.SUCCESS,
                        new BigDecimal("200"),
                        null,
                        "ACC-TEST-HIST",
                        null
                )
        );

        List<Transaction> history = transactionRepository
                .findBySourceAccountOrDestinationAccountOrderByCreatedAtDesc(
                        "ACC-TEST-HIST",
                        "ACC-TEST-HIST"
                );

        assertEquals(2, history.size());
    }
}
