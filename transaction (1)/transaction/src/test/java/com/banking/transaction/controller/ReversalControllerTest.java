package com.banking.transaction.controller;

import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.service.ReversalService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReversalControllerTest {

    @Mock
    private ReversalService reversalService;

    @InjectMocks
    private ReversalController reversalController;

    @Test
    void reverse_delegatesTransactionIdToService() {
        when(reversalService.reverse("TXN-1")).thenReturn(
                new TransactionResponse("TXN-1-REV", "SUCCESS", "Reversed TXN-1",
                        new BigDecimal("1000"), "ACC-D", null));

        TransactionResponse res = reversalController.reverse("TXN-1");

        assertEquals("SUCCESS", res.getStatus());
        assertEquals("TXN-1-REV", res.getTransactionId());
        verify(reversalService).reverse("TXN-1");
    }
}