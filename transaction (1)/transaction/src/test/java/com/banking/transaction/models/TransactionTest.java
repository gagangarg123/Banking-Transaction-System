
package com.banking.transaction.models;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class TransactionTest {

    @Test
    void constructor_setsTransactionFields() {
        Transaction transaction = new Transaction(
                "TXN001",
                Transaction.TransactionType.DEPOSIT,
                Transaction.TransactionStatus.SUCCESS,
                new BigDecimal("1000.00"),
                null,
                "ACC1001",
                null
        );

        assertEquals("TXN001", transaction.getTransactionId());
        assertEquals(Transaction.TransactionType.DEPOSIT, transaction.getType());
        assertEquals(Transaction.TransactionStatus.SUCCESS, transaction.getStatus());
        assertEquals(new BigDecimal("1000.00"), transaction.getAmount());
        assertEquals("ACC1001", transaction.getDestinationAccount());
        assertNull(transaction.getSourceAccount());
    }

    @Test
    void transfer_hasBothAccounts() {
        Transaction transaction = new Transaction(
                "TXN002",
                Transaction.TransactionType.TRANSFER,
                Transaction.TransactionStatus.SUCCESS,
                new BigDecimal("500"),
                "ACC1001",
                "ACC1002",
                null
        );

        assertEquals("ACC1001", transaction.getSourceAccount());
        assertEquals("ACC1002", transaction.getDestinationAccount());
    }

    @Test
    void failedTransaction_storesReason() {
        Transaction transaction = new Transaction();

        transaction.setStatus(Transaction.TransactionStatus.FAILED);
        transaction.setFailureReason("Insufficient balance");

        assertEquals(Transaction.TransactionStatus.FAILED, transaction.getStatus());
        assertEquals("Insufficient balance", transaction.getFailureReason());
    }
}
