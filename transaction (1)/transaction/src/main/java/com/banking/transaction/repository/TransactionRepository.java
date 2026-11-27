package com.banking.transaction.repository;

import com.banking.transaction.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    boolean existsByTransactionId(String transactionId);

    Optional<Transaction> findByTransactionId(String transactionId);

    List<Transaction> findBySourceAccountOrDestinationAccountOrderByCreatedAtDesc(
            String sourceAccount, String destinationAccount);

// to check that withdrawlimit not excceds or not
@Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
       "WHERE t.sourceAccount = :accountNumber AND t.status = :status " +
       "AND t.type IN :types AND t.createdAt >= :startOfDay")
BigDecimal sumDailyOutflow(
        @Param("accountNumber") String accountNumber,
        @Param("status") Transaction.TransactionStatus status,
        @Param("types") List<Transaction.TransactionType> types,
        @Param("startOfDay") java.time.LocalDateTime startOfDay);

}