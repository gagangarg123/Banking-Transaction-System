
package com.banking.transaction.service;

import com.banking.transaction.dto.CustomerRequest;
import com.banking.transaction.dto.CustomerResponse;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.CustomerRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private CustomerRequest request(String name, String email, String phone) {
        CustomerRequest r = new CustomerRequest();
        r.setName(name);
        r.setEmail(email);
        r.setPhone(phone);
        return r;
    }

    // 1. Create customer successfully
    @Test
    void createCustomer_success() {

        when(customerRepository.findByEmail("a@b.com"))
                .thenReturn(Optional.empty());

        when(customerRepository.save(any(Customer.class)))
                .thenAnswer(inv -> {
                    return inv.getArgument(0);
                });

        CustomerResponse res = customerService.createCustomer(
                request("Gagan", "a@b.com", "999"));

        assertNotNull(res);
        assertEquals("Gagan", res.getName());
        assertEquals("a@b.com", res.getEmail());

        verify(customerRepository).save(any(Customer.class));
    }

    // 2. Duplicate email should throw 409 Conflict
    @Test
    void createCustomer_duplicateEmail_throws409() {

        when(customerRepository.findByEmail("dup@b.com"))
                .thenReturn(Optional.of(
                        new Customer("X", "dup@b.com", "1")));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> customerService.createCustomer(
                        request("Y", "dup@b.com", "2")));

        assertEquals(409, ex.getStatusCode().value());

        verify(customerRepository, never()).save(any());
    }

    // 3. Customer not found should throw 404
    @Test
    void getCustomerById_notFound_throws404() {

        when(customerRepository.findById(99L))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> customerService.getCustomerById(99L));

        assertEquals(404, ex.getStatusCode().value());
    }

    // 4. Get all customers successfully
    @Test
    void getAllCustomers_returnsList() {

        when(customerRepository.findAll())
                .thenReturn(List.of(
                        new Customer("A", "a@x.com", "1"),
                        new Customer("B", "b@x.com", "2")));

        List<CustomerResponse> list = customerService.getAllCustomers();

        assertNotNull(list);
        assertEquals(2, list.size());
    }
}
