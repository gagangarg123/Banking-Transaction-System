
package com.banking.transaction.models;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class FailedTransactionTest {

    @Test
    void constructor_recordsFailureDetails() {
        FailedTransaction failed = new FailedTransaction(
                "TXN003",
                "ACC1001",
                "WITHDRAWAL",
                new BigDecimal("2000"),
                "INSUFFICIENT_BALANCE",
                "Balance too low",
                "java.lang.RuntimeException: ...",
                "pool-1-thread-2"
        );

        assertEquals("TXN003", failed.getTransactionId());
        assertEquals("ACC1001", failed.getAccountNumber());
        assertEquals("WITHDRAWAL", failed.getOperation());
        assertEquals(new BigDecimal("2000"), failed.getAmount());
        assertEquals("INSUFFICIENT_BALANCE", failed.getErrorCategory());
        assertEquals("Balance too low", failed.getErrorMessage());
        assertEquals("java.lang.RuntimeException: ...", failed.getStackTrace());
        assertEquals("pool-1-thread-2", failed.getThreadName());
        assertNull(failed.getCreatedAt());
    }

    @Test
    void setters_updateErrorDetails() {
        FailedTransaction failed = new FailedTransaction();

        failed.setErrorCategory("VALIDATION");
        failed.setErrorMessage("Amount must be positive");

        assertEquals("VALIDATION", failed.getErrorCategory());
        assertEquals("Amount must be positive", failed.getErrorMessage());
    }
}
