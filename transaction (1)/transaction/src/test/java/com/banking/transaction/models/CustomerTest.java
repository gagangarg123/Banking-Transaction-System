
package com.banking.transaction.models;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CustomerTest {

    @Test
    void constructor_setsFields() {
        Customer customer = new Customer(
                "Gagan",
                "gagan@test.com",
                "9999999999"
        );

        assertEquals("Gagan", customer.getName());
        assertEquals("gagan@test.com", customer.getEmail());
        assertEquals("9999999999", customer.getPhone());
        assertNull(customer.getId());
    }

    @Test
    void setters_updateFields() {
        Customer customer = new Customer();

        customer.setName("Test");
        customer.setEmail("t@t.com");
        customer.setPhone("123");

        assertEquals("Test", customer.getName());
        assertEquals("t@t.com", customer.getEmail());
        assertEquals("123", customer.getPhone());
    }
}
