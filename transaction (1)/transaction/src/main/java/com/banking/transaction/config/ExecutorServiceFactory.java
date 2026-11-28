package com.banking.transaction.config;

import org.springframework.stereotype.Component;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class ExecutorServiceFactory {

    // Creates a fixed thread pool with the given number of workers
    public ExecutorService createExecutor(int workers) {
        return Executors.newFixedThreadPool(workers);
    }
}