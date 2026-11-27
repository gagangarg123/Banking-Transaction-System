package com.banking.transaction.service;

import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.Customer;
import com.banking.transaction.models.Transaction;
import com.banking.transaction.repository.AccountRepository;
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
class ReversalServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionAuditRepository auditRepository;

    @InjectMocks
    private ReversalService reversalService;

    private Transaction originalTxn(String id, Transaction.TransactionType type,
                                    String source, String dest) {
        return new Transaction(id, type, Transaction.TransactionStatus.SUCCESS,
                new BigDecimal("1000"), source, dest, null);
    }

    private Account account(String number, String balance) {
        Account a = new Account();
        a.setAccountNumber(number);
        a.setBalance(new BigDecimal(balance));
        a.setStatus(Account.AccountStatus.ACTIVE);
        a.setCustomer(new Customer("C", "c@t.com", "1"));
        return a;
    }

    private void stubHappyPath(Transaction original, Account... accounts) {
        when(transactionRepository.findByTransactionIdWithLock(original.getTransactionId()))
                .thenReturn(Optional.of(original));
        when(transactionRepository.existsByTransactionId(original.getTransactionId() + "-REV"))
                .thenReturn(false);
        for (Account a : accounts) {
            when(accountRepository.findByAccountNumberWithLock(a.getAccountNumber()))
                    .thenReturn(Optional.of(a));
        }
        lenient().when(accountRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        lenient().when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        lenient().when(auditRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void reverse_deposit_debitsAccount() {
        Transaction orig = originalTxn("TXN-1", Transaction.TransactionType.DEPOSIT,
                null, "ACC-D");
        Account dest = account("ACC-D", "5000");
        stubHappyPath(orig, dest);

        TransactionResponse res = reversalService.reverse("TXN-1");

        assertEquals("SUCCESS", res.getStatus());
        assertEquals(0, new BigDecimal("4000").compareTo(dest.getBalance())); // 5000-1000
        assertTrue(orig.isReversed());
        verify(transactionRepository, times(2)).save(any()); // reversal + original flag
    }

    @Test
    void reverse_withdrawal_creditsAccount() {
        Transaction orig = originalTxn("TXN-2", Transaction.TransactionType.WITHDRAWAL,
                "ACC-S", null);
        Account src = account("ACC-S", "2000");
        stubHappyPath(orig, src);

        TransactionResponse res = reversalService.reverse("TXN-2");

        assertEquals("SUCCESS", res.getStatus());
        assertEquals(0, new BigDecimal("3000").compareTo(src.getBalance())); // 2000+1000
    }

    @Test
    void reverse_transfer_movesMoneyBack() {
        Transaction orig = originalTxn("TXN-3", Transaction.TransactionType.TRANSFER,
                "ACC-S", "ACC-D");
        Account src = account("ACC-S", "1000");
        Account dst = account("ACC-D", "3000");
        stubHappyPath(orig, src, dst);

        TransactionResponse res = reversalService.reverse("TXN-3");

        assertEquals("SUCCESS", res.getStatus());
        assertEquals(0, new BigDecimal("2000").compareTo(src.getBalance())); // gets 1000 back
        assertEquals(0, new BigDecimal("2000").compareTo(dst.getBalance())); // loses 1000
    }

    @Test
    void reverse_alreadyReversed_fails() {
        Transaction orig = originalTxn("TXN-4", Transaction.TransactionType.DEPOSIT,
                null, "ACC-D");
        orig.setReversed(true);
        when(transactionRepository.findByTransactionIdWithLock("TXN-4"))
                .thenReturn(Optional.of(orig));

        TransactionResponse res = reversalService.reverse("TXN-4");

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("already reversed"));
        verify(accountRepository, never()).findByAccountNumberWithLock(any());
    }

    @Test
    void reverse_failedTransaction_fails() {
        Transaction orig = originalTxn("TXN-5", Transaction.TransactionType.DEPOSIT,
                null, "ACC-D");
        orig.setStatus(Transaction.TransactionStatus.FAILED);
        when(transactionRepository.findByTransactionIdWithLock("TXN-5"))
                .thenReturn(Optional.of(orig));

        TransactionResponse res = reversalService.reverse("TXN-5");

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("SUCCESS"));
    }

    @Test
    void reverse_notFound_fails() {
        when(transactionRepository.findByTransactionIdWithLock("GHOST"))
                .thenReturn(Optional.empty());

        TransactionResponse res = reversalService.reverse("GHOST");

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("not found"));
    }

    @Test
    void reverse_deposit_spentFunds_fails() {
        Transaction orig = originalTxn("TXN-6", Transaction.TransactionType.DEPOSIT,
                null, "ACC-D");
        Account dest = account("ACC-D", "500"); // less than 1000 reversal needs
        stubHappyPath(orig, dest);

        TransactionResponse res = reversalService.reverse("TXN-6");

        assertEquals("FAILED", res.getStatus());
        assertTrue(res.getMessage().contains("balance"));
    }
}