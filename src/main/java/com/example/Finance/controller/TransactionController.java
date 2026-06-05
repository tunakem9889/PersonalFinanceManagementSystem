package com.example.Finance.controller;

import com.example.Finance.dto.TransactionDto;
import com.example.Finance.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(Authentication authentication, @RequestBody TransactionDto transactionDto){
        String email = authentication.getName();
        return new ResponseEntity<>(transactionService.createTransaction(email, transactionDto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getAllTransactions(Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(transactionService.getAllTransactions(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDto> getTransactionById(Authentication authentication, @PathVariable("id") Long transactionId){
        String email = authentication.getName();
        return ResponseEntity.ok(transactionService.getTransactionById(email, transactionId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> updateTransaction(Authentication authentication, 
                                                            @PathVariable("id") Long transactionId, 
                                                            @RequestBody TransactionDto transactionDto){
        String email = authentication.getName();
        return ResponseEntity.ok(transactionService.updateTransaction(email, transactionId, transactionDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaction(Authentication authentication, @PathVariable("id") Long transactionId){
        String email = authentication.getName();
        transactionService.deleteTransaction(email, transactionId);
        return ResponseEntity.ok("Transaction deleted successfully.");
    }

    @GetMapping("/filter")
    public ResponseEntity<List<TransactionDto>> filterTransactions(
            Authentication authentication,
            @RequestParam("startDate") LocalDate startDate,
            @RequestParam("endDate") LocalDate endDate){
        String email = authentication.getName();
        return ResponseEntity.ok(transactionService.filterTransactions(email, startDate, endDate));
    }
}
