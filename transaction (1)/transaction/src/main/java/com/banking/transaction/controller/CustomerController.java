package com.banking.transaction.controller;

import com.banking.transaction.dto.CustomerRequest;
import com.banking.transaction.dto.CustomerResponse;
import com.banking.transaction.dto.OnboardCustomerRequest;
import com.banking.transaction.service.AdminOnboardingService;
import com.banking.transaction.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final AdminOnboardingService onboardingService;

    public CustomerController(CustomerService customerService,
                              AdminOnboardingService onboardingService) {
        this.customerService = customerService;
        this.onboardingService = onboardingService;
    }

    // Create customer
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse createCustomer(
            @Valid @RequestBody CustomerRequest request) {

        return customerService.createCustomer(request);
    }

    // Admin onboarding: customer + account + credentials email in one call
    @PostMapping("/onboard")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> onboardCustomer(
            @Valid @RequestBody OnboardCustomerRequest request) {
        return onboardingService.onboard(request);
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