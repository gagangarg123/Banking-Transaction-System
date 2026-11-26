package com.banking.transaction.repository;

import com.banking.transaction.models.FailedTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FailedTransactionRepository extends JpaRepository<FailedTransaction, Long> {

    Optional<FailedTransaction> findByTransactionId(String transactionId);
}
