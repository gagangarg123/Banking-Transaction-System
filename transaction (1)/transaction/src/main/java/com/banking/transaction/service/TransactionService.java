
package com.banking.transaction.service;

import com.banking.transaction.dto.TransactionRequest;
import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.FailedTransaction;
import com.banking.transaction.models.Transaction;
import com.banking.transaction.models.TransactionAudit;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.FailedTransactionRepository;
import com.banking.transaction.repository.TransactionAuditRepository;
import com.banking.transaction.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final FailedTransactionRepository failedTransactionRepository;
    private final TransactionAuditRepository transactionAuditRepository;

    // Constructor injection
    public TransactionService(AccountRepository accountRepository,
                             TransactionRepository transactionRepository,
                             FailedTransactionRepository failedTransactionRepository,
                             TransactionAuditRepository transactionAuditRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.failedTransactionRepository = failedTransactionRepository;
        this.transactionAuditRepository = transactionAuditRepository;
    }

    // deposit

    @Transactional
    public TransactionResponse deposit(TransactionRequest request) {

        long start = System.nanoTime();

        log.info("DEPOSIT started | txnId={} account={} amount={}",
                request.getTransactionId(), request.getDestinationAccount(), request.getAmount());

        // 1. Validate transaction ID
        if (request.getTransactionId() == null ||
                request.getTransactionId().isBlank()) {
            return recordRejection(
                    request,
                    Transaction.TransactionType.DEPOSIT,
                    "Transaction ID is required"
            );
        }

        // 2. Validate amount
        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return recordRejection(request, Transaction.TransactionType.DEPOSIT, "Amount must be positive");
        }

        // 3. Validate destination account number
        if (request.getDestinationAccount() == null ||
                request.getDestinationAccount().isBlank()) {
            return recordRejection(request, Transaction.TransactionType.DEPOSIT, "Destination account is required");
        }

        // 4. Check duplicate transaction ID
        // Do not save another transaction with an existing ID
        if (transactionRepository.existsByTransactionId(
                request.getTransactionId())) {

            return response(
                    request,
                    "FAILED",
                    "Duplicate transactionId: "
                            + request.getTransactionId()
            );
        }

        // 5. Fetch account with row lock
        String accountNumber = request.getDestinationAccount();

        Account account = accountRepository
                .findByAccountNumberWithLock(accountNumber)
                .orElse(null);

        // 6. Check account existence
        if (account == null) {
            return recordFailure(
                    request,
                    Transaction.TransactionType.DEPOSIT,
                    "Account not found: " + accountNumber
            );
        }

        // 7. Check account status
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            return recordFailure(
                    request,
                    Transaction.TransactionType.DEPOSIT,
                    "Account is " + account.getStatus()
            );
        }

        // 8. Check for null balance
        if (account.getBalance() == null) {
            return recordFailure(
                    request,
                    Transaction.TransactionType.DEPOSIT,
                    "Account balance is not initialized"
            );
        }

        // 9. Update account balance
        BigDecimal updatedBalance = account.getBalance()
                .add(request.getAmount());

        account.setBalance(updatedBalance);

        accountRepository.save(account);

        // 10. Create successful transaction record
        Transaction txn = new Transaction(
                request.getTransactionId(),
                Transaction.TransactionType.DEPOSIT,
                Transaction.TransactionStatus.SUCCESS,
                request.getAmount(),
                null,
                accountNumber,
                null
        );

        // Record the processing thread
        txn.setProcessedBy(Thread.currentThread().getName());

        // 11. Save transaction record
        transactionRepository.save(txn);

        // 12. Audit trail
        writeAudit(request.getTransactionId(), accountNumber,
                "DEPOSIT", "SUCCESS", null, start);

        log.info("DEPOSIT success | txnId={} account={} newBalance={}",
                request.getTransactionId(), accountNumber, updatedBalance);

        // 13. Return success response
        return response(
                request,
                "SUCCESS",
                "Deposit of " + request.getAmount()
                        + " to " + accountNumber
        );
    }

    //failure record

    private TransactionResponse recordFailure(
            TransactionRequest request,
            Transaction.TransactionType type,
            String reason) {

        // Record failed transaction
        Transaction txn = new Transaction(
                request.getTransactionId(),
                type,
                Transaction.TransactionStatus.FAILED,
                request.getAmount(),
                request.getSourceAccount(),
                request.getDestinationAccount(),
                reason
        );

        txn.setProcessedBy(Thread.currentThread().getName());

        transactionRepository.save(txn);

        // Persist to failed_transaction for reporting
        String accountNumber = request.getSourceAccount() != null
                ? request.getSourceAccount() : request.getDestinationAccount();

        FailedTransaction failed = new FailedTransaction(
                request.getTransactionId(),
                accountNumber,
                type.name(),
                request.getAmount(),
                categorize(reason),
                reason,
                null,
                Thread.currentThread().getName());
        failedTransactionRepository.save(failed);

        log.warn("TRANSACTION failed | txnId={} type={} account={} reason={}",
                request.getTransactionId(), type, accountNumber, reason);

        // Audit trail for the failure
        writeAudit(request.getTransactionId(), accountNumber,
                type.name(), "FAILED", reason, System.nanoTime());

        return response(request, "FAILED", reason);
    }

    // Rejected = invalid request, never processed (no failed_transaction row)
    private TransactionResponse recordRejection(
            TransactionRequest request,
            Transaction.TransactionType type,
            String reason) {

        Transaction txn = new Transaction(
                request.getTransactionId(),
                type,
                Transaction.TransactionStatus.REJECTED,
                request.getAmount(),
                request.getSourceAccount(),
                request.getDestinationAccount(),
                reason);
        txn.setProcessedBy(Thread.currentThread().getName());
        transactionRepository.save(txn);

        String accountNumber = request.getSourceAccount() != null
                ? request.getSourceAccount() : request.getDestinationAccount();
        writeAudit(request.getTransactionId(), accountNumber,
                type.name(), "REJECTED", reason, System.nanoTime());

        log.warn("TRANSACTION rejected | txnId={} type={} reason={}",
                request.getTransactionId(), type, reason);

        return response(request, "REJECTED", reason);
    }

    // Map failure reason to a stable error category for reporting
    private String categorize(String reason) {
        String r = reason.toLowerCase();
        if (r.contains("insufficient")) return "INSUFFICIENT_BALANCE";
        if (r.contains("not found")) return "ACCOUNT_NOT_FOUND";
        if (r.contains("limit")) return "DAILY_LIMIT_EXCEEDED";
        if (r.contains("duplicate")) return "DUPLICATE_TRANSACTION";
        if (r.contains("frozen") || r.contains("closed") || r.contains(" is ")) return "ACCOUNT_INACTIVE";
        return "VALIDATION";
    }

    // Write one audit row per account touched by the operation
    private void writeAudit(String txnId, String accountNumber, String operation,
                            String result, String errorMessage, long startNanos) {
        long durationMs = (System.nanoTime() - startNanos) / 1_000_000;
        TransactionAudit audit = new TransactionAudit(
                txnId, accountNumber, operation, result,
                Thread.currentThread().getName(), durationMs, errorMessage);
        transactionAuditRepository.save(audit);
    }

    // ==================== RESPONSE BUILDER ====================

    private TransactionResponse response(
            TransactionRequest request,
            String status,
            String message) {

        return new TransactionResponse(
                request.getTransactionId(),
                status,
                message,
                request.getAmount(),
                request.getSourceAccount(),
                request.getDestinationAccount()
        );
    }

    //withdraw

@Transactional
public TransactionResponse withdraw(TransactionRequest request) {

    long start = System.nanoTime();

    log.info("WITHDRAW started | txnId={} account={} amount={}",
            request.getTransactionId(), request.getSourceAccount(), request.getAmount());

    if (request.getAmount() == null ||
            request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
        return recordRejection(
                request,
                Transaction.TransactionType.WITHDRAWAL,
                "Amount must be positive"
        );
    }

    if (transactionRepository.existsByTransactionId(request.getTransactionId())) {
        return recordFailure(
                request,
                Transaction.TransactionType.WITHDRAWAL,
                "Duplicate transactionId: " + request.getTransactionId()
        );
    }

    String accountNumber = request.getSourceAccount();

    Account account = accountRepository
            .findByAccountNumberWithLock(accountNumber)
            .orElse(null);

    if (account == null) {
        return recordFailure(
                request,
                Transaction.TransactionType.WITHDRAWAL,
                "Account not found: " + accountNumber
        );
    }

    if (account.getStatus() != Account.AccountStatus.ACTIVE) {
        return recordFailure(
                request,
                Transaction.TransactionType.WITHDRAWAL,
                "Account is " + account.getStatus()
        );
    }

    if (account.getBalance().compareTo(request.getAmount()) < 0) {
        return recordFailure(
                request,
                Transaction.TransactionType.WITHDRAWAL,
                "Insufficient balance: " + account.getBalance()
        );
    }

    BigDecimal todayOutflow = transactionRepository.sumDailyOutflow(
            accountNumber,
            Transaction.TransactionStatus.SUCCESS,
            List.of(
                    Transaction.TransactionType.WITHDRAWAL,
                    Transaction.TransactionType.TRANSFER
            ),
            java.time.LocalDateTime.now()
                    .toLocalDate()
                    .atStartOfDay()
    );

    if (account.getDailyWithdrawalLimit() == null) {
        return recordFailure(
                request,
                Transaction.TransactionType.WITHDRAWAL,
                "Daily withdrawal limit is not configured"
        );
    }

    if (todayOutflow.add(request.getAmount())
            .compareTo(account.getDailyWithdrawalLimit()) > 0) {
        return recordFailure(
                request,
                Transaction.TransactionType.WITHDRAWAL,
                "Daily withdrawal limit exceeded"
        );
    }

    // Debit account
    account.setBalance(
            account.getBalance().subtract(request.getAmount())
    );

    accountRepository.save(account);

    // Save successful transaction
    Transaction txn = new Transaction(
            request.getTransactionId(),
            Transaction.TransactionType.WITHDRAWAL,
            Transaction.TransactionStatus.SUCCESS,
            request.getAmount(),
            accountNumber,
            null,
            null
    );

    txn.setProcessedBy(Thread.currentThread().getName());

    transactionRepository.save(txn);

    // Audit trail
    writeAudit(request.getTransactionId(), accountNumber,
            "WITHDRAWAL", "SUCCESS", null, start);

    log.info("WITHDRAW success | txnId={} account={} newBalance={}",
            request.getTransactionId(), accountNumber, account.getBalance());

    return new TransactionResponse(
            request.getTransactionId(),
            "SUCCESS",
            "Withdrawal of " + request.getAmount()
                    + " from " + accountNumber,
            request.getAmount(),
            accountNumber,
            null
    );
}

//transfer
    // ==================== TRANSFER ====================

    @Transactional
    public TransactionResponse transfer(TransactionRequest request) {

        long start = System.nanoTime();

        log.info("TRANSFER started | txnId={} from={} to={} amount={}",
                request.getTransactionId(), request.getSourceAccount(),
                request.getDestinationAccount(), request.getAmount());

        // 1. Validate amount
        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return recordRejection(request, Transaction.TransactionType.TRANSFER,
                    "Amount must be positive");
        }

        // 2. Both accounts required
        String sourceNumber = request.getSourceAccount();
        String destNumber = request.getDestinationAccount();

        if (sourceNumber == null || sourceNumber.isBlank() ||
                destNumber == null || destNumber.isBlank()) {
            return recordRejection(request, Transaction.TransactionType.TRANSFER,
                    "Source and destination accounts are required");
        }

        // 3. Can't transfer to self
        if (sourceNumber.equals(destNumber)) {
            return recordRejection(request, Transaction.TransactionType.TRANSFER,
                    "Cannot transfer to the same account");
        }

        // 4. Idempotency
        if (transactionRepository.existsByTransactionId(request.getTransactionId())) {
            return recordFailure(request, Transaction.TransactionType.TRANSFER,
                    "Duplicate transactionId: " + request.getTransactionId());
        }

        // 5. Lock BOTH accounts in SORTED order — prevents deadlock
        //    Thread A locks ACC1 then ACC2; Thread B must also do ACC1→ACC2 order
        String first = sourceNumber.compareTo(destNumber) <= 0 ? sourceNumber : destNumber;
        String second = first.equals(sourceNumber) ? destNumber : sourceNumber;

        Account firstAcc = accountRepository.findByAccountNumberWithLock(first).orElse(null);
        Account secondAcc = accountRepository.findByAccountNumberWithLock(second).orElse(null);

        Account source = first.equals(sourceNumber) ? firstAcc : secondAcc;
        Account dest = first.equals(destNumber) ? firstAcc : secondAcc;

        if (source == null) {
            return recordFailure(request, Transaction.TransactionType.TRANSFER,
                    "Source account not found: " + sourceNumber);
        }
        if (dest == null) {
            return recordFailure(request, Transaction.TransactionType.TRANSFER,
                    "Destination account not found: " + destNumber);
        }

        // 6. Both must be ACTIVE
        if (source.getStatus() != Account.AccountStatus.ACTIVE) {
            return recordFailure(request, Transaction.TransactionType.TRANSFER,
                    "Source account is " + source.getStatus());
        }
        if (dest.getStatus() != Account.AccountStatus.ACTIVE) {
            return recordFailure(request, Transaction.TransactionType.TRANSFER,
                    "Destination account is " + dest.getStatus());
        }

        // 7. Sufficient balance
        if (source.getBalance().compareTo(request.getAmount()) < 0) {
            return recordFailure(request, Transaction.TransactionType.TRANSFER,
                    "Insufficient balance: " + source.getBalance());
        }

        // 8. Daily transfer limit
        BigDecimal todayOutflow = transactionRepository.sumDailyOutflow(
                sourceNumber, Transaction.TransactionStatus.SUCCESS,
                List.of(Transaction.TransactionType.WITHDRAWAL, Transaction.TransactionType.TRANSFER),
                java.time.LocalDateTime.now().toLocalDate().atStartOfDay());

        if (source.getDailyTransferLimit() != null &&
                todayOutflow.add(request.getAmount())
                        .compareTo(source.getDailyTransferLimit()) > 0) {
            return recordFailure(request, Transaction.TransactionType.TRANSFER,
                    "Daily transfer limit exceeded");
        }

        // 9. Atomic move — debit source, credit dest
        source.setBalance(source.getBalance().subtract(request.getAmount()));
        dest.setBalance(dest.getBalance().add(request.getAmount()));
        accountRepository.save(source);
        accountRepository.save(dest);

        // 10. Single transaction record
        Transaction txn = new Transaction(
                request.getTransactionId(),
                Transaction.TransactionType.TRANSFER,
                Transaction.TransactionStatus.SUCCESS,
                request.getAmount(),
                sourceNumber, destNumber, null);
        txn.setProcessedBy(Thread.currentThread().getName());
        transactionRepository.save(txn);

        // Audit trail — one row per account touched
        writeAudit(request.getTransactionId(), sourceNumber,
                "TRANSFER", "SUCCESS", null, start);
        writeAudit(request.getTransactionId(), destNumber,
                "TRANSFER", "SUCCESS", null, start);

        log.info("TRANSFER success | txnId={} from={} to={} amount={}",
                request.getTransactionId(), sourceNumber, destNumber, request.getAmount());

        return new TransactionResponse(
                request.getTransactionId(), "SUCCESS",
                "Transferred " + request.getAmount() + " from " + sourceNumber + " to " + destNumber,
                request.getAmount(), sourceNumber, destNumber);
    }

    // ==================== HISTORY ====================

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getByAccount(String accountNumber) {
        return transactionRepository
                .findBySourceAccountOrDestinationAccountOrderByCreatedAtDesc(
                        accountNumber, accountNumber)
                .stream().map(this::toResponse).toList();
    }

    private TransactionResponse toResponse(Transaction txn) {
        return new TransactionResponse(
                txn.getTransactionId(),
                txn.getStatus().name(),
                txn.getType().name() + (txn.getFailureReason() != null
                        ? " - " + txn.getFailureReason() : ""),
                txn.getAmount(),
                txn.getSourceAccount(),
                txn.getDestinationAccount());
    }
}
