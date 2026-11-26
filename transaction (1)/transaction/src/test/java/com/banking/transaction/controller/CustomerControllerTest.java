
package com.banking.transaction.controller;

import com.banking.transaction.dto.CustomerRequest;
import com.banking.transaction.dto.CustomerResponse;
import com.banking.transaction.service.CustomerService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private CustomerController customerController;

    // 1. Get all customers
    @Test
    void getAllCustomers_delegatesToService() {

        when(customerService.getAllCustomers())
                .thenReturn(List.of(
                        new CustomerResponse(
                                1L, "A", "a@x.com", "1")));

        List<CustomerResponse> result =
                customerController.getAllCustomers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("A", result.get(0).getName());
        assertEquals("a@x.com", result.get(0).getEmail());

        verify(customerService).getAllCustomers();
    }

    // 2. Create customer
    @Test
    void createCustomer_delegatesRequest() {

        CustomerRequest req = new CustomerRequest();
        req.setName("New");
        req.setEmail("n@x.com");
        req.setPhone("5");

        when(customerService.createCustomer(req))
                .thenReturn(new CustomerResponse(
                        2L, "New", "n@x.com", "5"));

        CustomerResponse res =
                customerController.createCustomer(req);

        assertNotNull(res);
        assertEquals(2L, res.getId());
        assertEquals("New", res.getName());
        assertEquals("n@x.com", res.getEmail());
        assertEquals("5", res.getPhone());

        verify(customerService).createCustomer(req);
    }
}
