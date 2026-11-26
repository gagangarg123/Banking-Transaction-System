package com.banking.transaction.repository;

import com.banking.transaction.models.FailedTransaction;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class FailedTransactionRepositoryTest {

    @Autowired
    private FailedTransactionRepository failedRepository;

    @Test
    void save_andFindByTransactionId_works() {
        FailedTransaction failed = new FailedTransaction(
                "TXN-T20", "ACC1001", "WITHDRAWAL",
                new BigDecimal("9999"), "INSUFFICIENT_BALANCE",
                "Not enough balance", "stack...", "thread-1");

        failedRepository.save(failed);

        Optional<FailedTransaction> found = failedRepository.findByTransactionId("TXN-T20");
        assertTrue(found.isPresent());
        assertEquals("INSUFFICIENT_BALANCE", found.get().getErrorCategory());
    }
}
