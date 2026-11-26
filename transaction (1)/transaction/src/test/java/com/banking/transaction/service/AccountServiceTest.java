package com.banking.transaction.service;

import com.banking.transaction.dto.AccountRequest;
import com.banking.transaction.dto.AccountResponse;
import com.banking.transaction.exception.ApiException;
import com.banking.transaction.exception.CustomerNotFoundException;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private AccountService accountService;

    private Customer customer() {
        return new Customer("Gagan", "g@t.com", "999");
    }

    private AccountRequest request(String number, Long customerId, String type) {
        AccountRequest r = new AccountRequest();
        r.setAccountNumber(number);
        r.setCustomerId(customerId);
        r.setAccountType(type);
        return r;
    }

    @Test
    void createAccount_success() {
        when(accountRepository.findByAccountNumber("ACC-T1")).thenReturn(Optional.empty());
        Customer c = customer();
        // simulate saved customer having an id — use reflection-free approach:
        when(customerRepository.findById(1L)).thenReturn(Optional.of(c));
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));

        AccountResponse res = accountService.createAccount(request("ACC-T1", 1L, "SAVINGS"));

        assertEquals("ACC-T1", res.getAccountNumber());
        assertEquals("ACTIVE", res.getStatus());          // status forced ACTIVE
        assertEquals("SAVINGS", res.getAccountType());
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void createAccount_duplicateNumber_throws409() {
        when(accountRepository.findByAccountNumber("ACC-DUP"))
                .thenReturn(Optional.of(new Account()));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> accountService.createAccount(request("ACC-DUP", 1L, "SAVINGS")));

        assertEquals(409, ex.getStatusCode().value());
        verify(accountRepository, never()).save(any());
    }

    @Test
    void createAccount_customerNotFound_throws404() {
        when(accountRepository.findByAccountNumber("ACC-T2")).thenReturn(Optional.empty());
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> accountService.createAccount(request("ACC-T2", 99L, "SAVINGS")));

        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void createAccount_invalidType_throws400() {
        when(accountRepository.findByAccountNumber("ACC-T3")).thenReturn(Optional.empty());
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer()));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> accountService.createAccount(request("ACC-T3", 1L, "BADTYPE")));

        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void getAccountByNumber_notFound_throws404() {
        when(accountRepository.findByAccountNumber("NOPE")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> accountService.getAccountByNumber("NOPE"));
    }
}