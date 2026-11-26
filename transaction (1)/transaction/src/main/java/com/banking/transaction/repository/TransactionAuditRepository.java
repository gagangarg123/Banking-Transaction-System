package com.banking.transaction.repository;

import com.banking.transaction.models.TransactionAudit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionAuditRepository extends JpaRepository<TransactionAudit, Long> {
}