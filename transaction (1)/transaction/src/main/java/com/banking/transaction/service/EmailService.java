package com.banking.transaction.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeCredentials(String toEmail, String name,
                                       String password, String accountNumber) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("garggagan243@gmail.com");
            msg.setTo(toEmail);
            msg.setSubject("Your Banking System account credentials");
            msg.setText("""
                    Hello %s,

                    Your bank account has been created successfully.

                    Login email   : %s
                    Password      : %s
                    Account number: %s

                    Please log in and change your password at the earliest.
                    Do not share these credentials with anyone.

                    - Banking System
                    """.formatted(name, toEmail, password, accountNumber));
            mailSender.send(msg);
            log.info("Welcome email sent | to={} account={}", toEmail, accountNumber);
        } catch (Exception e) {
            // Email failure must NOT break customer creation
            log.warn("Failed to send welcome email | to={} reason={}", toEmail, e.getMessage());
        }
    }
}
