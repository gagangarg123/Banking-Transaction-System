package com.banking.transaction.service;

import com.banking.transaction.dto.TransactionRequest;
import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.FailedTransactionRepository;
import com.banking.transaction.repository.TransactionAuditRepository;
import com.banking.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private FailedTransactionRepository failedTransactionRepository;

    @Mock
    private TransactionAuditRepository transactionAuditRepository;

    @InjectMocks
    private TransactionService transactionService;

    private AccountRequestHelper helper = new AccountRequestHelper();

    private TransactionRequest depositReq(String txnId, String account, BigDecimal amount) {
        TransactionRequest r = new TransactionRequest();
        r.setTransactionId(txnId);
        r.setType("DEPOSIT");
        r.setAmount(amount);
        r.setDestinationAccount(account);
        return r;
    }

    private Account activeAccount(String number, String balance) {
        Account a = new Account();
        a.setAccountNumber(number);
        a.setBalance(new BigDecimal(balance));
        a.setStatus(Account.AccountStatus.ACTIVE);
        a.setCustomer(new Customer("C", "c@t.com", "1"));
        return a;
    }

    @Test
    void deposit_success_creditsBalance() {
        Account acc = activeAccount("ACC1", "1000");
        when(transactionRepository.existsByTransactionId("T1")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("ACC1")).thenReturn(Optional.of(acc));
        when(accountRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TransactionResponse res = transactionService.deposit(depositReq("T1", "ACC1", new BigDecimal("500")));

        assertEquals("SUCCESS", res.getStatus());
        assertEquals(0, new BigDecimal("1500").compareTo(acc.getBalance()));
        verify(accountRepository).save(acc);
        verify(transactionRepository).save(any());
    }

    @Test
    void deposit_duplicateId_fails() {
        when(transactionRepository.existsByTransactionId("T1")).thenReturn(true);

        TransactionResponse res = transactionService.deposit(depositReq("T1", "ACC1", new BigDecimal("500")));

        assertEquals("FAILED", res.getStatus());
        verify(accountRepository, never()).findByAccountNumberWithLock(any());
    }

    @Test
    void deposit_accountNotFound_fails() {
        when(transactionRepository.existsByTransactionId("T2")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("NOPE")).thenReturn(Optional.empty());

        TransactionResponse res = transactionService.deposit(depositReq("T2", "NOPE", new BigDecimal("500")));

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("not found"));
        // Phase A: failure must also be persisted to failed_transaction
        verify(failedTransactionRepository).save(any());
    }

    @Test
    void deposit_frozenAccount_fails() {
        Account acc = activeAccount("ACC2", "1000");
        acc.setStatus(Account.AccountStatus.FROZEN);
        when(transactionRepository.existsByTransactionId("T3")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("ACC2")).thenReturn(Optional.of(acc));

        TransactionResponse res = transactionService.deposit(depositReq("T3", "ACC2", new BigDecimal("500")));

        assertEquals("FAILED", res.getStatus());
        assertEquals(0, new BigDecimal("1000").compareTo(acc.getBalance())); // unchanged
    }

    @Test
    void deposit_zeroAmount_fails() {
        TransactionResponse res = transactionService.deposit(depositReq("T4", "ACC1", BigDecimal.ZERO));

        assertEquals("REJECTED", res.getStatus());   // validation failure → REJECTED
        verify(transactionRepository, never()).existsByTransactionId(any());
    }

    // ==================== WITHDRAW ====================

    private TransactionRequest withdrawReq(String txnId, String account, BigDecimal amount) {
        TransactionRequest r = new TransactionRequest();
        r.setTransactionId(txnId);
        r.setType("WITHDRAWAL");
        r.setAmount(amount);
        r.setSourceAccount(account);
        return r;
    }

    private Account withdrawableAccount(String number, String balance) {
        Account a = activeAccount(number, balance);
        a.setDailyWithdrawalLimit(new BigDecimal("25000"));
        return a;
    }

    @Test
    void withdraw_success_debitsBalance() {
        Account acc = withdrawableAccount("ACCW1", "5000");
        when(transactionRepository.existsByTransactionId("W1")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("ACCW1")).thenReturn(Optional.of(acc));
        when(transactionRepository.sumDailyOutflow(any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(accountRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TransactionResponse res = transactionService.withdraw(withdrawReq("W1", "ACCW1", new BigDecimal("1000")));

        assertEquals("SUCCESS", res.getStatus());
        assertEquals(0, new BigDecimal("4000").compareTo(acc.getBalance()));
        verify(accountRepository).save(acc);
    }

    @Test
    void withdraw_insufficientBalance_fails() {
        Account acc = withdrawableAccount("ACCW2", "100");
        when(transactionRepository.existsByTransactionId("W2")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("ACCW2")).thenReturn(Optional.of(acc));

        TransactionResponse res = transactionService.withdraw(withdrawReq("W2", "ACCW2", new BigDecimal("5000")));

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("Insufficient"));
        assertEquals(0, new BigDecimal("100").compareTo(acc.getBalance())); // unchanged
        verify(accountRepository, never()).save(any());
    }

    @Test
    void withdraw_dailyLimitExceeded_fails() {
        Account acc = withdrawableAccount("ACCW3", "50000");
        when(transactionRepository.existsByTransactionId("W3")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("ACCW3")).thenReturn(Optional.of(acc));
        // already withdrew 24000 today; limit 25000; trying 2000 more → exceeds
        when(transactionRepository.sumDailyOutflow(any(), any(), any(), any()))
                .thenReturn(new BigDecimal("24000"));

        TransactionResponse res = transactionService.withdraw(withdrawReq("W3", "ACCW3", new BigDecimal("2000")));

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("limit"));
        verify(accountRepository, never()).save(any());
    }

    @Test
    void withdraw_frozenAccount_fails() {
        Account acc = withdrawableAccount("ACCW4", "5000");
        acc.setStatus(Account.AccountStatus.FROZEN);
        when(transactionRepository.existsByTransactionId("W4")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("ACCW4")).thenReturn(Optional.of(acc));

        TransactionResponse res = transactionService.withdraw(withdrawReq("W4", "ACCW4", new BigDecimal("100")));

        assertEquals("FAILED", res.getStatus());
        verify(accountRepository, never()).save(any());
    }

    // ==================== TRANSFER ====================

    private TransactionRequest transferReq(String txnId, String src, String dst, BigDecimal amount) {
        TransactionRequest r = new TransactionRequest();
        r.setTransactionId(txnId);
        r.setType("TRANSFER");
        r.setAmount(amount);
        r.setSourceAccount(src);
        r.setDestinationAccount(dst);
        return r;
    }

    private Account transferAccount(String number, String balance) {
        Account a = activeAccount(number, balance);
        a.setDailyTransferLimit(new BigDecimal("50000"));
        a.setDailyWithdrawalLimit(new BigDecimal("25000"));
        return a;
    }

    @Test
    void transfer_success_movesMoneyBothWays() {
        Account src = transferAccount("SRC-ACC", "5000");
        Account dst = transferAccount("DST-ACC", "1000");

        when(transactionRepository.existsByTransactionId("TR1")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("SRC-ACC")).thenReturn(Optional.of(src));
        when(accountRepository.findByAccountNumberWithLock("DST-ACC")).thenReturn(Optional.of(dst));
        when(transactionRepository.sumDailyOutflow(any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(accountRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        TransactionResponse res = transactionService.transfer(
                transferReq("TR1", "SRC-ACC", "DST-ACC", new BigDecimal("1000")));

        assertEquals("SUCCESS", res.getStatus());
        assertEquals(0, new BigDecimal("4000").compareTo(src.getBalance())); // debited
        assertEquals(0, new BigDecimal("2000").compareTo(dst.getBalance())); // credited
    }

    @Test
    void transfer_insufficientBalance_fails() {
        Account src = transferAccount("SRC-ACC", "100");
        Account dst = transferAccount("DST-ACC", "1000");

        when(transactionRepository.existsByTransactionId("TR2")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("SRC-ACC")).thenReturn(Optional.of(src));
        when(accountRepository.findByAccountNumberWithLock("DST-ACC")).thenReturn(Optional.of(dst));

        TransactionResponse res = transactionService.transfer(
                transferReq("TR2", "SRC-ACC", "DST-ACC", new BigDecimal("5000")));

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("Insufficient"));
        assertEquals(0, new BigDecimal("100").compareTo(src.getBalance()));  // unchanged
        assertEquals(0, new BigDecimal("1000").compareTo(dst.getBalance())); // unchanged
        verify(accountRepository, never()).save(any());
    }

    @Test
    void transfer_sameAccount_fails() {
        TransactionResponse res = transactionService.transfer(
                transferReq("TR3", "SAME-ACC", "SAME-ACC", new BigDecimal("100")));

        assertEquals("REJECTED", res.getStatus());   // validation failure → REJECTED
        assertTrue(res.getMessage().contains("same account"));
        verify(accountRepository, never()).findByAccountNumberWithLock(any());
    }

    @Test
    void transfer_destinationNotFound_fails() {
        Account src = transferAccount("SRC-ACC", "5000");

        when(transactionRepository.existsByTransactionId("TR4")).thenReturn(false);
        when(accountRepository.findByAccountNumberWithLock("SRC-ACC")).thenReturn(Optional.of(src));
        when(accountRepository.findByAccountNumberWithLock("GHOST")).thenReturn(Optional.empty());

        TransactionResponse res = transactionService.transfer(
                transferReq("TR4", "SRC-ACC", "GHOST", new BigDecimal("100")));

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("not found"));
        verify(accountRepository, never()).save(any());
    }

    // tiny helper to avoid unused warning
    private static class AccountRequestHelper {}
}