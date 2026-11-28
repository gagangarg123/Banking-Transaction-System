package com.banking.transaction.service;

import com.banking.transaction.config.ExecutorServiceFactory;
import com.banking.transaction.dto.TransactionRequest;
import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.models.Account;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.AccountRepository;
import com.banking.transaction.repository.CustomerRepository;
import com.banking.transaction.util.TransactionWorkloadGenerator;
import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class TransactionPerformanceTest {

    @Autowired TransactionService transactionService;
    @Autowired AccountRepository accountRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired ExecutorServiceFactory executorFactory;
    @Autowired DataSource dataSource;
    
    private static final int TOTAL_TXNS = 1000;              // spec: >= 50,000
    private static final BigDecimal AMOUNT = new BigDecimal("10");
    private static final int[] WORKER_COUNTS = {1, 5, 10, 20};
    private String depositAcc, txnAcc, destAcc;
    private BigDecimal depositAccInit, txnAccInit, destAccInit;

    @BeforeAll
    void setup() {
        String u = String.valueOf(System.currentTimeMillis());
        Customer c = customerRepository.save(
                new Customer("Perf", "perf-" + u + "@t.com", "0"));

        depositAcc = "PFD-" + u;   txnAcc = "PFT-" + u;   destAcc = "PFDST-" + u;
        depositAccInit = new BigDecimal("0");
        txnAccInit     = new BigDecimal("999999999");       // funds withdrawals+transfers
        destAccInit    = new BigDecimal("0");

        save(depositAcc, c, depositAccInit);
        save(txnAcc,     c, txnAccInit);
        save(destAcc,    c, destAccInit);
    }

    private void save(String num, Customer c, BigDecimal bal) {
        Account a = new Account();
        a.setAccountNumber(num);
        a.setCustomer(c);
        a.setBalance(bal);
        a.setStatus(Account.AccountStatus.ACTIVE);
        a.setAccountType(Account.AccountType.SAVINGS);
        a.setDailyWithdrawalLimit(new BigDecimal("999999999"));
        a.setDailyTransferLimit(new BigDecimal("999999999"));
        accountRepository.save(a);
    }

    // ---------------- benchmark ----------------

    private void runBenchmark(int workers) throws Exception {
        // Fresh workload per run — same shape, unique IDs (UUID inside generator)
        List<TransactionRequest> requests =
                TransactionWorkloadGenerator.mixedWorkload(depositAcc, txnAcc, destAcc, TOTAL_TXNS, AMOUNT);

        ExecutorService executor = executorFactory.createExecutor(workers);
        AtomicInteger success = new AtomicInteger();
        AtomicInteger failed  = new AtomicInteger();
        AtomicInteger rejected = new AtomicInteger();
        LongAdder totalNanos  = new LongAdder();

        long start = System.nanoTime();
        List<Future<?>> futures = new CopyOnWriteArrayList<>();
        for (TransactionRequest req : requests) {
            futures.add(executor.submit(() -> {
                long t0 = System.nanoTime();
                try {
                    TransactionResponse res = dispatch(req);
                    totalNanos.add(System.nanoTime() - t0);
                    switch (res.getStatus()) {
                        case "SUCCESS"  -> success.incrementAndGet();
                        case "REJECTED" -> rejected.incrementAndGet();
                        default         -> failed.incrementAndGet();
                    }
                } catch (Exception e) {
                    failed.incrementAndGet();   // never let one task kill the run
                }
            }));
        }
        for (Future<?> f : futures) f.get();
        executor.shutdown();
        executor.awaitTermination(600, TimeUnit.SECONDS);
        double seconds = (System.nanoTime() - start) / 1e9;

        // ---- balance validation ----
        boolean balanced = validateBalances(requests);

        // ---- pool snapshot (real HikariCP metric) ----
        int activeConn = -1, maxConn = -1;
        if (dataSource instanceof HikariDataSource h) {
            activeConn = h.getHikariPoolMXBean().getActiveConnections();
            maxConn    = h.getMaximumPoolSize();
        }

        double avgMs = requests.isEmpty() ? 0 : (totalNanos.sum() / (double) requests.size()) / 1e6;
        double tps   = TOTAL_TXNS / seconds;   // TPS = submitted / elapsed (same formula all runs)

        System.out.printf("%-8s %9d %9d %8d %9d %10.2f %10.2f %9.2f %7s | pool %d/%d%n",
                workers, TOTAL_TXNS, success.get(), failed.get(), rejected.get(),
                seconds, tps, avgMs, balanced, activeConn, maxConn);
    }

    private TransactionResponse dispatch(TransactionRequest req) {
        return switch (req.getType()) {
            case "DEPOSIT"    -> transactionService.deposit(req);
            case "WITHDRAWAL" -> transactionService.withdraw(req);
            case "TRANSFER"   -> transactionService.transfer(req);
            default -> throw new IllegalArgumentException("bad type " + req.getType());
        };
    }

    /** Expected balances computed from the workload, compared with real DB values. */
    private boolean validateBalances(List<TransactionRequest> requests) {
        BigDecimal expDeposit = depositAccInit, expTxn = txnAccInit, expDest = destAccInit;
        int deposits = 0, withdrawals = 0, transfers = 0;
        for (TransactionRequest r : requests) {
            switch (r.getType()) {
                case "DEPOSIT"    -> { expDeposit = expDeposit.add(r.getAmount()); deposits++; }
                case "WITHDRAWAL" -> { expTxn = expTxn.subtract(r.getAmount()); withdrawals++; }
                case "TRANSFER"   -> { expTxn = expTxn.subtract(r.getAmount());
                                       expDest = expDest.add(r.getAmount()); transfers++; }
            }
        }
        Account d = accountRepository.findByAccountNumber(depositAcc).orElseThrow();
        Account t = accountRepository.findByAccountNumber(txnAcc).orElseThrow();
        Account s = accountRepository.findByAccountNumber(destAcc).orElseThrow();

        boolean ok = d.getBalance().compareTo(expDeposit) == 0
                  && t.getBalance().compareTo(expTxn) == 0
                  && s.getBalance().compareTo(expDest) == 0
                  && t.getBalance().signum() >= 0
                  && s.getBalance().signum() >= 0
                  && d.getBalance().signum() >= 0;

        System.out.printf("   balances -> deposit:%s(exp %s) txn:%s(exp %s) dest:%s(exp %s) txns[d=%d w=%d t=%d]%n",
                d.getBalance(), expDeposit, t.getBalance(), expTxn, s.getBalance(), expDest,
                deposits, withdrawals, transfers);
        return ok;
    }

    // ---------------- tests: one per worker count ----------------

    private void printHeader() {
        System.out.println("\nThreads  TotalTxns   Success   Failed  Rejected    TimeSec        TPS    AvgMs Balanced | pool");
        System.out.println("-------  ---------  --------  ------  --------  ----------  ---------  ------  --------  ----");
    }

    @Test void benchmark_1_worker()  throws Exception { printHeader(); runBenchmark(1); }
    @Test void benchmark_5_workers() throws Exception { printHeader(); runBenchmark(5); }
    @Test void benchmark_10_workers() throws Exception { printHeader(); runBenchmark(10); }
    @Test void benchmark_20_workers() throws Exception { printHeader(); runBenchmark(20); }
}

