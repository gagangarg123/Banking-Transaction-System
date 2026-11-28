
package com.banking.transaction.service;

import com.banking.transaction.dto.AccountRequest;
import com.banking.transaction.dto.AccountResponse;
import com.banking.transaction.exception.AccountNotFoundException;
import com.banking.transaction.exception.ApiException;
import com.banking.transaction.exception.CustomerNotFoundException;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.CustomerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    
    public AccountService(AccountRepository accountRepository,
                          CustomerRepository customerRepository) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
    }

    // ==================== CREATE ACCOUNT ====================

    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        // 1. Validate account number
        if (request.getAccountNumber() == null ||
                request.getAccountNumber().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Account number is required");
        }

        String accountNumber = request.getAccountNumber().trim();

        // 2. Check duplicate account number
        if (accountRepository.findByAccountNumber(accountNumber).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Account number already exists: " + accountNumber);
        }

        // 3. Validate customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new CustomerNotFoundException(request.getCustomerId()));

        // 4. Validate account type
        Account.AccountType accountType =
                parseAccountType(request.getAccountType());

        // 5. Validate initial balance
        BigDecimal balance = request.getBalance() != null
                ? request.getBalance()
                : BigDecimal.ZERO;

        if (balance.compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Initial balance cannot be negative");
        }

        // 6. Set default withdrawal limit
        BigDecimal withdrawalLimit = defaultIfNull(
                request.getDailyWithdrawalLimit(),
                new BigDecimal("25000")
        );

        // 7. Set default transfer limit
        BigDecimal transferLimit = defaultIfNull(
                request.getDailyTransferLimit(),
                new BigDecimal("50000")
        );

        // 8. Validate limits
        validateLimit(withdrawalLimit, "Daily withdrawal limit");
        validateLimit(transferLimit, "Daily transfer limit");

        // 9. Create Account entity
        Account account = new Account();

        account.setAccountNumber(accountNumber);
        account.setCustomer(customer);
        account.setBalance(balance);
        account.setStatus(Account.AccountStatus.ACTIVE);
        account.setAccountType(accountType);
        account.setDailyWithdrawalLimit(withdrawalLimit);
        account.setDailyTransferLimit(transferLimit);

        // 10. Save account
        Account savedAccount = accountRepository.save(account);

        // 11. Convert entity to DTO
        return toResponse(savedAccount);
    }

    // ==================== GET ALL ACCOUNTS ====================

    @Transactional(readOnly = true)
    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ==================== GET ACCOUNT BY NUMBER ====================

    @Transactional(readOnly = true)
    public AccountResponse getAccountByNumber(String accountNumber) {

        Account account = accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new ApiException(HttpStatus.NOT_FOUND,
                                "Account not found: " + accountNumber));

        return toResponse(account);
    }

    // ==================== GET ACCOUNTS BY CUSTOMER ====================

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByCustomer(Long customerId) {

        // Check whether customer exists
        customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new CustomerNotFoundException(customerId));

        // Fetch accounts belonging to customer
        return accountRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ==================== PARSE ACCOUNT TYPE ====================

    private Account.AccountType parseAccountType(String value) {

        try {
            return Account.AccountType.valueOf(
                    value.trim().toUpperCase(Locale.ROOT)
            );

        } catch (IllegalArgumentException | NullPointerException e) {

            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Invalid accountType: " + value
                            + " (use SAVINGS or CURRENT)");
        }
    }

    // ==================== DEFAULT VALUE ====================

    private BigDecimal defaultIfNull(BigDecimal value,
                                    BigDecimal fallback) {

        return value != null ? value : fallback;
    }

    // ==================== VALIDATE LIMIT ====================

    private void validateLimit(BigDecimal limit, String fieldName) {

        if (limit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    fieldName + " must be greater than zero");
        }
    }

    // ==================== ENTITY TO RESPONSE DTO ====================

    private AccountResponse toResponse(Account account) {

        return new AccountResponse(
                account.getAccountId(),
                account.getAccountNumber(),
                account.getCustomer().getId(),
                account.getCustomer().getName(),
                account.getBalance(),
                account.getStatus().name(),
                account.getAccountType().name(),
                account.getDailyWithdrawalLimit(),
                account.getDailyTransferLimit(),
                account.getCreatedAt()
        );
    }
    @Transactional
public AccountResponse freezeAccount(String accountNumber) {
    Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new AccountNotFoundException(accountNumber));
    account.setStatus(Account.AccountStatus.FROZEN);
    return toResponse(accountRepository.save(account));
}

@Transactional
public AccountResponse unfreezeAccount(String accountNumber) {
    Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new AccountNotFoundException(accountNumber));
    account.setStatus(Account.AccountStatus.ACTIVE);
    return toResponse(accountRepository.save(account));
}
}
