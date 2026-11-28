package com.banking.transaction.service;

import com.banking.transaction.dto.LoginRequest;
import com.banking.transaction.dto.LoginResponse;
import com.banking.transaction.exception.ApiException;
import com.banking.transaction.models.Customer;
import com.banking.transaction.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        // Dev admin — replace with a proper admins table/role column later
        if ("admin@bankingsystem.com".equals(email)
                && "admin123".equals(request.getPassword())) {
            return new LoginResponse(
                    jwtService.generateToken(email, "ADMIN"),
                    email, "Admin", "ADMIN");
        }

        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"));

        if (customer.getPassword() == null
                || !passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        // No role column yet — every customer logs in as CUSTOMER.
        // Admin role can be added later (separate users table or role column).
        String token = jwtService.generateToken(customer.getEmail(), "CUSTOMER");
        return new LoginResponse(token, customer.getEmail(), customer.getName(),
                "CUSTOMER", customer.getId());
    }
}
