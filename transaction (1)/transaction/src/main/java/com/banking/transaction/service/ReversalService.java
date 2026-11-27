package com.banking.transaction.service;

import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.Transaction;
import com.banking.transaction.models.TransactionAudit;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.TransactionAuditRepository;
import com.banking.transaction.repository.TransactionRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

@Service
public class ReversalService {

    private static final Logger log =
            LoggerFactory.getLogger(ReversalService.class);

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final TransactionAuditRepository auditRepository;

    public ReversalService(TransactionRepository transactionRepository,
                           AccountRepository accountRepository,
                           TransactionAuditRepository auditRepository) {

        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.auditRepository = auditRepository;
    }

    // ==================== REVERSAL ====================

    @Transactional
    public TransactionResponse reverse(String transactionId) {

        String reversalId = transactionId + "-REV";

        log.info("REVERSAL started | originalTxnId={} reversalId={}",
                transactionId, reversalId);

        // 1. Find and lock the original transaction
        Transaction original = transactionRepository
                .findByTransactionIdWithLock(transactionId)
                .orElse(null);

        if (original == null) {
            return fail(reversalId,
                    "Original transaction not found: " + transactionId);
        }

        // 2. Only SUCCESS transactions can be reversed
        if (original.getStatus() !=
                Transaction.TransactionStatus.SUCCESS) {

            return fail(reversalId,
                    "Only SUCCESS transactions can be reversed");
        }

        // 3. Check whether original transaction is already reversed
        if (original.isReversed()) {
            return fail(reversalId,
                    "Transaction already reversed: " + transactionId);
        }

        // 4. Check whether reversal record already exists
        if (transactionRepository.existsByTransactionId(reversalId)) {
            return fail(reversalId,
                    "Reversal already exists: " + reversalId);
        }

        // 5. Identify involved accounts
        List<String> accountNumbers = involvedAccounts(original);

        // 6. Lock accounts in sorted order
        List<Account> lockedAccounts = new ArrayList<>();

        for (String accountNumber : accountNumbers) {

            Account account = accountRepository
                    .findByAccountNumberWithLock(accountNumber)
                    .orElse(null);

            if (account == null) {
                return fail(reversalId,
                        "Account not found during reversal: "
                                + accountNumber);
            }

            lockedAccounts.add(account);
        }

        // 7. Apply opposite balance movement
        String error = applyReversal(original, lockedAccounts);

        if (error != null) {
            return fail(reversalId, error);
        }

        // 8. Create reversal transaction record
        Transaction reversal = new Transaction(
                reversalId,
                Transaction.TransactionType.REVERSAL,
                Transaction.TransactionStatus.SUCCESS,
                original.getAmount(),
                original.getDestinationAccount(),
                original.getSourceAccount(),
                "Reversal of " + transactionId
        );

        reversal.setProcessedBy(Thread.currentThread().getName());

        transactionRepository.save(reversal);

        // 9. Mark original transaction as reversed
        original.setReversed(true);

        transactionRepository.save(original);

        // 10. Save audit records for involved accounts
        for (String accountNumber : accountNumbers) {

            auditRepository.save(new TransactionAudit(
                    reversalId,
                    accountNumber,
                    "REVERSAL",
                    "SUCCESS",
                    Thread.currentThread().getName(),
                    0L,
                    null
            ));
        }

        log.info("REVERSAL success | originalTxnId={} reversalId={}",
                transactionId, reversalId);

        // 11. Return response
        return new TransactionResponse(
                reversalId,
                "SUCCESS",
                "Reversed " + transactionId,
                original.getAmount(),
                original.getDestinationAccount(),
                original.getSourceAccount()
        );
    }

    // ==================== INVOLVED ACCOUNTS ====================

    private List<String> involvedAccounts(Transaction transaction) {

        List<String> accounts = new ArrayList<>();

        if (transaction.getSourceAccount() != null) {
            accounts.add(transaction.getSourceAccount());
        }

        if (transaction.getDestinationAccount() != null) {
            accounts.add(transaction.getDestinationAccount());
        }

        // Lock accounts in consistent order to reduce deadlocks
        accounts.sort(String::compareTo);

        return accounts;
    }

    // ==================== APPLY REVERSAL ====================

    private String applyReversal(Transaction original,
                                List<Account> lockedAccounts) {

        BigDecimal amount = original.getAmount();

        Transaction.TransactionType type = original.getType();

        // Find account from the already locked accounts
        Function<String, Account> byNumber = accountNumber ->
                lockedAccounts.stream()
                        .filter(account ->
                                account.getAccountNumber()
                                        .equals(accountNumber))
                        .findFirst()
                        .orElseThrow();

        // -------- DEPOSIT REVERSAL --------

        if (type == Transaction.TransactionType.DEPOSIT) {

            // Original deposit credited the destination account.
            // Reversal removes that credited amount.

            Account destination = byNumber.apply(
                    original.getDestinationAccount());

            if (destination.getBalance().compareTo(amount) < 0) {

                return "Cannot reverse deposit: "
                        + "account balance is too low";
            }

            destination.setBalance(
                    destination.getBalance().subtract(amount));
        }

        // -------- WITHDRAWAL REVERSAL --------

        else if (type == Transaction.TransactionType.WITHDRAWAL) {

            // Original withdrawal debited the source account.
            // Reversal restores that amount.

            Account source = byNumber.apply(
                    original.getSourceAccount());

            source.setBalance(
                    source.getBalance().add(amount));
        }

        // -------- TRANSFER REVERSAL --------

        else if (type == Transaction.TransactionType.TRANSFER) {

            // Original transfer moved money from source to destination.
            // Reversal moves the money back.

            Account source = byNumber.apply(
                    original.getSourceAccount());

            Account destination = byNumber.apply(
                    original.getDestinationAccount());

            if (destination.getBalance().compareTo(amount) < 0) {

                return "Cannot reverse transfer: "
                        + "destination account has insufficient balance";
            }

            destination.setBalance(
                    destination.getBalance().subtract(amount));

            source.setBalance(
                    source.getBalance().add(amount));
        }

        // -------- UNSUPPORTED TYPE --------

        else {

            return "Cannot reverse transaction type: " + type;
        }

        //  Save updated accounts
        for (Account account : lockedAccounts) {
            accountRepository.save(account);
        }

        return null;
    }

    // ==================== FAILURE RESPONSE ====================

    private TransactionResponse fail(String reversalId, String reason) {

        log.warn("REVERSAL failed | reversalId={} reason={}",
                reversalId, reason);

        return new TransactionResponse(
                reversalId,
                "FAILED",
                reason,
                null,
                null,
                null
        );
    }
}