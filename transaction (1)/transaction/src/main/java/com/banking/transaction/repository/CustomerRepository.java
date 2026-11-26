package com.banking.transaction.repository;

import com.banking.transaction.models.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email); //searches on the basis of the email
}