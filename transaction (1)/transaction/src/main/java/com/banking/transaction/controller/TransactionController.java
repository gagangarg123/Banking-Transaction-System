
package com.banking.transaction.controller;

import com.banking.transaction.dto.TransactionRequest;
import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.service.TransactionService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    // Constructor injection
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // POST /api/transactions/deposit
    @PostMapping("/deposit")
    public TransactionResponse deposit(
            @Valid @RequestBody TransactionRequest request) {

        return transactionService.deposit(request);
    }

    // POST /api/transactions/withdraw
    @PostMapping("/withdraw")
    public TransactionResponse withdraw(
            @Valid @RequestBody TransactionRequest request) {

        return transactionService.withdraw(request);
    }

    // POST /api/transactions/transfer
    @PostMapping("/transfer")
    public TransactionResponse transfer(
            @Valid @RequestBody TransactionRequest request) {

        return transactionService.transfer(request);
    }

    // GET /api/transactions
    // Get all transactions
    @GetMapping
    public List<TransactionResponse> getAllTransactions() {

        return transactionService.getAllTransactions();
    }

    // GET /api/transactions/account/{accountNumber}
    // Get transaction history of a specific account
    @GetMapping("/account/{accountNumber}")
    public List<TransactionResponse> getByAccount(
            @PathVariable String accountNumber) {

        return transactionService.getByAccount(accountNumber);
    }
}
