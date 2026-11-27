package com.banking.transaction.controller;

import com.banking.transaction.dto.TransactionRequest;
import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private TransactionController transactionController;

    @Test
    void deposit_delegatesToService() {
        TransactionRequest req = new TransactionRequest();
        req.setTransactionId("T1");
        req.setType("DEPOSIT");
        req.setAmount(new BigDecimal("100"));
        req.setDestinationAccount("ACC1");

        when(transactionService.deposit(req)).thenReturn(
                new TransactionResponse("T1", "SUCCESS", "ok",
                        new BigDecimal("100"), null, "ACC1"));

        TransactionResponse res = transactionController.deposit(req);

        assertEquals("SUCCESS", res.getStatus());
        verify(transactionService).deposit(req);
    }

    @Test
    void withdraw_delegatesToService() {
        TransactionRequest req = new TransactionRequest();
        req.setTransactionId("W1");
        req.setType("WITHDRAWAL");
        req.setAmount(new BigDecimal("200"));
        req.setSourceAccount("ACC1");

        when(transactionService.withdraw(req)).thenReturn(
                new TransactionResponse("W1", "SUCCESS", "ok",
                        new BigDecimal("200"), "ACC1", null));

        TransactionResponse res = transactionController.withdraw(req);

        assertEquals("SUCCESS", res.getStatus());
        verify(transactionService).withdraw(req);
    }

    @Test
    void transfer_delegatesToService() {
        TransactionRequest req = new TransactionRequest();
        req.setTransactionId("TR1");
        req.setType("TRANSFER");
        req.setAmount(new BigDecimal("500"));
        req.setSourceAccount("SRC");
        req.setDestinationAccount("DST");

        when(transactionService.transfer(req)).thenReturn(
                new TransactionResponse("TR1", "SUCCESS", "ok",
                        new BigDecimal("500"), "SRC", "DST"));

        TransactionResponse res = transactionController.transfer(req);

        assertEquals("SUCCESS", res.getStatus());
        assertEquals("DST", res.getDestinationAccount());
        verify(transactionService).transfer(req);
    }
}