package com.banking.transaction.controller;

import com.banking.transaction.dto.CustomerRequest;
import com.banking.transaction.dto.CustomerResponse;
import com.banking.transaction.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // Create customer
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse createCustomer(
            @Valid @RequestBody CustomerRequest request) {

        return customerService.createCustomer(request);
    }

    // Get all customers
    @GetMapping
    public List<CustomerResponse> getAllCustomers() {

        return customerService.getAllCustomers();
    }

    // Get customer by ID
    @GetMapping("/{id}")
    public CustomerResponse getCustomerById(@PathVariable Long id) {

        return customerService.getCustomerById(id);
    }
}