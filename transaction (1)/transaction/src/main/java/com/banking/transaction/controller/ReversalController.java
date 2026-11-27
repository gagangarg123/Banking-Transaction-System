package com.banking.transaction.controller;

import com.banking.transaction.dto.TransactionResponse;
import com.banking.transaction.service.ReversalService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reversals")
public class ReversalController {

    private final ReversalService reversalService;

    public ReversalController(ReversalService reversalService) {
        this.reversalService = reversalService;
    }

    // POST /api/reversals/{transactionId}
    @PostMapping("/{transactionId}")
    public TransactionResponse reverse(
            @PathVariable String transactionId) {

        return reversalService.reverse(transactionId);
    }
}