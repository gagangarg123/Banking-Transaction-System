package com.banking.transaction.exception;

import org.springframework.http.HttpStatus;

public class CustomerNotFoundException extends ApiException {

    public CustomerNotFoundException(Long id) {
        super(HttpStatus.NOT_FOUND, "Customer not found: " + id);
    }
}