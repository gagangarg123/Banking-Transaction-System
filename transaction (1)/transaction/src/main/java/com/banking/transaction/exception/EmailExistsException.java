package com.banking.transaction.exception;

import org.springframework.http.HttpStatus;

public class EmailExistsException extends ApiException {

    public EmailExistsException(String email) {
        super(HttpStatus.CONFLICT, "Email already registered: " + email);
    }
}