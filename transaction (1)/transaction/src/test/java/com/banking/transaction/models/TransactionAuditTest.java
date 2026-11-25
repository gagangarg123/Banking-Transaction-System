package com.banking.transaction.models;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TransactionAuditTest {

    @Test
    void constructor_recordsAuditFields() {
        TransactionAudit audit = new TransactionAudit(
                "TXN001",
                "ACC1001",
                "DEPOSIT",
                "SUCCESS",
                "pool-1-thread-1",
                45L,
                null
        );

        assertEquals("TXN001", audit.getTransactionId());
        assertEquals("ACC1001", audit.getAccountNumber());
        assertEquals("DEPOSIT", audit.getOperation());
        assertEquals("SUCCESS", audit.getResult());
        assertEquals("pool-1-thread-1", audit.getThreadName());
        assertEquals(45L, audit.getDurationMs());
        assertNull(audit.getErrorMessage());
    }

    @Test
    void failureAudit_storesErrorMessage() {
        TransactionAudit audit = new TransactionAudit();

        audit.setResult("FAILED");
        audit.setErrorMessage("Account frozen");

        assertEquals("FAILED", audit.getResult());
        assertEquals("Account frozen", audit.getErrorMessage());
    }
}