package com.example.Finance.service;

import com.example.Finance.dto.TransactionDto;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {
    TransactionDto createTransaction(String email, TransactionDto transactionDto);
    List<TransactionDto> getAllTransactions(String email);
    TransactionDto getTransactionById(String email, Long transactionId);
    TransactionDto updateTransaction(String email, Long transactionId, TransactionDto transactionDto);
    void deleteTransaction(String email, Long transactionId);
    List<TransactionDto> filterTransactions(String email, Long walletId, Long categoryId, LocalDate startDate, LocalDate endDate);
}
