package com.banking.transaction.service;

import com.banking.transaction.dto.CustomerRequest;
import com.banking.transaction.dto.CustomerResponse;
import com.banking.transaction.exception.ApiException;
import com.banking.transaction.exception.CustomerNotFoundException;
import com.banking.transaction.exception.EmailExistsException;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (customerRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new EmailExistsException(normalizedEmail);
        }

        Customer customer = new Customer();
        customer.setName(request.getName().trim());
        customer.setEmail(normalizedEmail);
        customer.setPhone(request.getPhone().trim());

        return convertToResponse(customerRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream().map(this::convertToResponse).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        if (id == null || id <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Customer ID must be positive");
        }

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));

        return convertToResponse(customer);
    }

    private CustomerResponse convertToResponse(Customer customer) {
        return new CustomerResponse(customer.getId(), customer.getName(),
                customer.getEmail(), customer.getPhone());
    }
}