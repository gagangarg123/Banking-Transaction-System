
package com.banking.transaction.repository;

import com.banking.transaction.models.TransactionAudit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TransactionAuditRepositoryTest {

    @Autowired
    private TransactionAuditRepository auditRepository;

    // Test: Save an audit record and verify it
    @Test
    void save_auditRecord() {

        TransactionAudit audit = new TransactionAudit(
                "TXN-T10",
                "ACC1001",
                "DEPOSIT",
                "SUCCESS",
                "test-thread",
                15L,
                null
        );

        TransactionAudit saved = auditRepository.save(audit);

        assertNotNull(saved.getId());

        assertEquals(
                "TXN-T10",
                saved.getTransactionId()
        );
    }
}
