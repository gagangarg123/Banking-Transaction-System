
package com.banking.transaction.controller;

import com.banking.transaction.dto.AccountRequest;
import com.banking.transaction.dto.AccountResponse;
import com.banking.transaction.service.AccountService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    // Constructor Injection
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    
    // POST /api/accounts

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse createAccount(
            @Valid @RequestBody AccountRequest request) {

        return accountService.createAccount(request);
    }
    @PostMapping("/{accountNumber}/freeze")
     public AccountResponse freezeAccount(@PathVariable String accountNumber) {
             return accountService.freezeAccount(accountNumber);
}

    @PostMapping("/{accountNumber}/unfreeze")
    public AccountResponse unfreezeAccount(@PathVariable String accountNumber) {
             return accountService.unfreezeAccount(accountNumber);
}

    
    // GET /api/accounts

    @GetMapping
    public List<AccountResponse> getAllAccounts() {

        return accountService.getAllAccounts();
    }


    // GET /api/accounts/{accountNumber}

    @GetMapping("/{accountNumber}")
    public AccountResponse getAccount(
            @PathVariable String accountNumber) {

        return accountService.getAccountByNumber(accountNumber);
    }

    
    // GET /api/accounts/customer/{customerId}

    @GetMapping("/customer/{customerId}")
    public List<AccountResponse> getByCustomer(
            @PathVariable Long customerId) {

        return accountService.getAccountsByCustomer(customerId);
    }


}
