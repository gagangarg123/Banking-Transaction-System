package com.banking.transaction.repository;

import com.banking.transaction.models.Customer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CustomerRepositoryTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    void save_andFindByEmail_works() {

        // Arrange: Create a customer
        Customer customer = new Customer(
                "Test User",
                "repo@test.com",
                "9998887776"
        );

        // Act: Save customer in database
        customerRepository.save(customer);

        // Find customer by email
        Optional<Customer> found = customerRepository.findByEmail("repo@test.com");

        // Assert: Verify customer exists
        assertTrue(found.isPresent());

        // Verify customer name
        assertEquals("Test User", found.get().getName());

        // Verify customer email
        assertEquals("repo@test.com", found.get().getEmail());

        // Verify customer phone
        assertEquals("9998887776", found.get().getPhone());
    }

    @Test
    void findByEmail_returnsEmpty_whenNotExists() {

        // Act: Search for a customer that does not exist
        Optional<Customer> found = customerRepository.findByEmail("nobody@test.com");

        // Assert: Verify no customer is found
        assertTrue(found.isEmpty());
    }
}