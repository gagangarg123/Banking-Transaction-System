package com.banking.transaction.repository;

import com.banking.transaction.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    boolean existsByTransactionId(String transactionId);

    Optional<Transaction> findByTransactionId(String transactionId);

    List<Transaction> findBySourceAccountOrDestinationAccountOrderByCreatedAtDesc(
            String sourceAccount, String destinationAccount);
}