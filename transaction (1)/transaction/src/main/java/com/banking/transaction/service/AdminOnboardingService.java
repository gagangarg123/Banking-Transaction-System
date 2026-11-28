package com.banking.transaction.service;

import com.banking.transaction.dto.OnboardCustomerRequest;
import com.banking.transaction.exception.EmailExistsException;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

@Service
public class AdminOnboardingService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AdminOnboardingService(CustomerRepository customerRepository,
                                  AccountRepository accountRepository,
                                  PasswordEncoder passwordEncoder,
                                  EmailService emailService) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * One-shot admin onboarding: creates customer + account + emails credentials.
     * Plaintext password exists only here — stored BCrypt-hashed, emailed once.
     */
    @Transactional
    public Map<String, Object> onboard(OnboardCustomerRequest req) {
        String email = req.getEmail().trim().toLowerCase(Locale.ROOT);

        if (customerRepository.findByEmail(email).isPresent()) {
            throw new EmailExistsException(email);
        }

        Customer c = new Customer();
        c.setName(req.getName().trim());
        c.setEmail(email);
        c.setPhone(req.getPhone().trim());
        c.setPassword(passwordEncoder.encode(req.getPassword()));
        customerRepository.save(c);

        String accNo = "5" + System.currentTimeMillis() % 100_000_000_000L;
        Account a = new Account();
        a.setAccountNumber(accNo);
        a.setCustomer(c);
        a.setBalance(req.getDeposit() != null ? req.getDeposit() : java.math.BigDecimal.ZERO);
        a.setStatus(Account.AccountStatus.ACTIVE);
        a.setAccountType(Account.AccountType.valueOf(
                (req.getAccountType() != null ? req.getAccountType() : "SAVINGS").toUpperCase()));
        a.setDailyWithdrawalLimit(new java.math.BigDecimal("25000"));
        a.setDailyTransferLimit(new java.math.BigDecimal("50000"));
        accountRepository.save(a);

        // Email AFTER commit-safe point inside tx; failure is swallowed by EmailService
        emailService.sendWelcomeCredentials(email, c.getName(), req.getPassword(), accNo);

        return Map.of(
                "customerId", c.getId(),
                "accountNumber", accNo,
                "email", email,
                "name", c.getName());
    }
}
