package com.banking.transaction.util;

import com.banking.transaction.dto.TransactionRequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TransactionWorkloadGenerator {

    public static List<TransactionRequest> deposits(String accountNumber, int count, BigDecimal amount) {
        List<TransactionRequest> requests = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            TransactionRequest r = new TransactionRequest();
            r.setTransactionId("LOAD-D-" + UUID.randomUUID());
            r.setType("DEPOSIT");
            r.setAmount(amount);
            r.setDestinationAccount(accountNumber);
            requests.add(r);
        }
        return requests;
    }

    public static List<TransactionRequest> withdrawals(String accountNumber, int count, BigDecimal amount) {
        List<TransactionRequest> requests = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            TransactionRequest r = new TransactionRequest();
            r.setTransactionId("LOAD-W-" + UUID.randomUUID());
            r.setType("WITHDRAWAL");
            r.setAmount(amount);
            r.setSourceAccount(accountNumber);
            requests.add(r);
        }
        return requests;
    }

    public static List<TransactionRequest> transfers(String source, String dest, int count, BigDecimal amount) {
        List<TransactionRequest> requests = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            TransactionRequest r = new TransactionRequest();
            r.setTransactionId("LOAD-T-" + UUID.randomUUID());
            r.setType("TRANSFER");
            r.setAmount(amount);
            r.setSourceAccount(source);
            r.setDestinationAccount(dest);
            requests.add(r);
        }
        return requests;
    }

    /**
     * Mixed workload: 1/3 DEPOSIT, 1/3 WITHDRAWAL, 1/3 TRANSFER.
     * Deterministic (i % 3) so every worker-count run gets the SAME workload shape.
     * Requires funded accounts for withdrawals/transfers.
     */
    public static List<TransactionRequest> mixedWorkload(
            String depositAccount, String txnAccount, String transferDest,
            int count, BigDecimal amount) {

        List<TransactionRequest> requests = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            TransactionRequest r = new TransactionRequest();
            r.setTransactionId("LOAD-M-" + UUID.randomUUID());
            r.setAmount(amount);
            switch (i % 3) {
                case 0 -> {
                    r.setType("DEPOSIT");
                    r.setDestinationAccount(depositAccount);
                }
                case 1 -> {
                    r.setType("WITHDRAWAL");
                    r.setSourceAccount(txnAccount);
                }
                default -> {
                    r.setType("TRANSFER");
                    r.setSourceAccount(txnAccount);
                    r.setDestinationAccount(transferDest);
                }
            }
            requests.add(r);
        }
        return requests;
    }
}
