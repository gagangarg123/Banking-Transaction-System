package com.banking.transaction.controller;

import com.banking.transaction.dto.AccountRequest;
import com.banking.transaction.dto.AccountResponse;
import com.banking.transaction.service.AccountService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountControllerTest {

    @Mock
    private AccountService accountService;

    @InjectMocks
    private AccountController accountController;

    @Test
    void getAllAccounts_delegatesToService() {
        when(accountService.getAllAccounts()).thenReturn(List.of(
                new AccountResponse(1L, "ACC1", 1L, "Gagan",
                        BigDecimal.TEN, "ACTIVE", "SAVINGS",
                        BigDecimal.ONE, BigDecimal.TEN, null)));

        List<AccountResponse> result = accountController.getAllAccounts();

        assertEquals(1, result.size());
        verify(accountService).getAllAccounts();
    }

    @Test
    void createAccount_delegatesRequest() {
        AccountRequest req = new AccountRequest();
        req.setAccountNumber("ACC1");
        req.setCustomerId(1L);
        req.setAccountType("SAVINGS");

        when(accountService.createAccount(req)).thenReturn(
                new AccountResponse(2L, "ACC1", 1L, "Gagan",
                        BigDecimal.ZERO, "ACTIVE", "SAVINGS",
                        BigDecimal.ONE, BigDecimal.TEN, null));

        AccountResponse res = accountController.createAccount(req);

        assertEquals("ACC1", res.getAccountNumber());
        assertEquals("ACTIVE", res.getStatus());
        verify(accountService).createAccount(req);
    }

    @Test
    void getByCustomer_delegatesCustomerId() {
        when(accountService.getAccountsByCustomer(5L)).thenReturn(List.of());

        accountController.getByCustomer(5L);

        verify(accountService).getAccountsByCustomer(5L);
    }
}