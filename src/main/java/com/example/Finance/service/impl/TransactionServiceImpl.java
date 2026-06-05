package com.example.Finance.service.impl;

import com.example.Finance.dto.TransactionDto;
import com.example.Finance.entity.Budget;
import com.example.Finance.entity.Category;
import com.example.Finance.entity.Transaction;
import com.example.Finance.entity.TransactionType;
import com.example.Finance.entity.User;
import com.example.Finance.exception.APIException;
import com.example.Finance.exception.ResourceNotFoundException;
import com.example.Finance.repository.BudgetRepository;
import com.example.Finance.repository.CategoryRepository;
import com.example.Finance.repository.TransactionRepository;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;

    @Override
    @Transactional
    public TransactionDto createTransaction(String email, TransactionDto transactionDto) {
        User user = getUserByEmail(email);
        Category category = getCategoryById(transactionDto.getCategoryId());

        if(!category.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Category does not belong to user");
        }

        Transaction transaction = new Transaction();
        transaction.setAmount(transactionDto.getAmount());
        transaction.setType(transactionDto.getType());
        transaction.setTitle(transactionDto.getTitle());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setTransactionDate(transactionDto.getTransactionDate());
        transaction.setUser(user);
        transaction.setCategory(category);

        Transaction newTransaction = transactionRepository.save(transaction);

        // Update budget if it's an expense
        if(transaction.getType() == TransactionType.EXPENSE) {
            updateBudgetSpentAmount(user.getId(), category.getId(), transaction.getTransactionDate(), transaction.getAmount());
        }

        return mapToDto(newTransaction);
    }

    @Override
    public List<TransactionDto> getAllTransactions(String email) {
        User user = getUserByEmail(email);
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        return transactions.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public TransactionDto getTransactionById(String email, Long transactionId) {
        User user = getUserByEmail(email);
        Transaction transaction = getTransactionEntityById(transactionId);

        if(!transaction.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Transaction does not belong to user");
        }

        return mapToDto(transaction);
    }

    @Override
    @Transactional
    public TransactionDto updateTransaction(String email, Long transactionId, TransactionDto transactionDto) {
        User user = getUserByEmail(email);
        Transaction transaction = getTransactionEntityById(transactionId);

        if(!transaction.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Transaction does not belong to user");
        }

        Category category = getCategoryById(transactionDto.getCategoryId());
        if(!category.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Category does not belong to user");
        }

        // Revert budget if it was an expense
        if(transaction.getType() == TransactionType.EXPENSE) {
            updateBudgetSpentAmount(user.getId(), transaction.getCategory().getId(), transaction.getTransactionDate(), transaction.getAmount().negate());
        }

        transaction.setAmount(transactionDto.getAmount());
        transaction.setType(transactionDto.getType());
        transaction.setTitle(transactionDto.getTitle());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setTransactionDate(transactionDto.getTransactionDate());
        transaction.setCategory(category);

        Transaction updatedTransaction = transactionRepository.save(transaction);

        // Apply new budget if it is an expense
        if(updatedTransaction.getType() == TransactionType.EXPENSE) {
            updateBudgetSpentAmount(user.getId(), category.getId(), updatedTransaction.getTransactionDate(), updatedTransaction.getAmount());
        }

        return mapToDto(updatedTransaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(String email, Long transactionId) {
        User user = getUserByEmail(email);
        Transaction transaction = getTransactionEntityById(transactionId);

        if(!transaction.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Transaction does not belong to user");
        }

        // Revert budget if it was an expense
        if(transaction.getType() == TransactionType.EXPENSE) {
            updateBudgetSpentAmount(user.getId(), transaction.getCategory().getId(), transaction.getTransactionDate(), transaction.getAmount().negate());
        }

        transactionRepository.delete(transaction);
    }

    @Override
    public List<TransactionDto> filterTransactions(String email, LocalDate startDate, LocalDate endDate) {
        User user = getUserByEmail(email);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), startDate, endDate);
        return transactions.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private void updateBudgetSpentAmount(Long userId, Long categoryId, LocalDate date, BigDecimal amount) {
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                userId, categoryId, date.getMonthValue(), date.getYear());
        
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            budget.setSpentAmount(budget.getSpentAmount().add(amount));
            budgetRepository.save(budget);
        }
    }

    private User getUserByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Category getCategoryById(Long id){
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private Transaction getTransactionEntityById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
    }

    private TransactionDto mapToDto(Transaction transaction){
        TransactionDto transactionDto = new TransactionDto();
        transactionDto.setId(transaction.getId());
        transactionDto.setAmount(transaction.getAmount());
        transactionDto.setType(transaction.getType());
        transactionDto.setTitle(transaction.getTitle());
        transactionDto.setDescription(transaction.getDescription());
        transactionDto.setTransactionDate(transaction.getTransactionDate());
        transactionDto.setCategoryId(transaction.getCategory().getId());
        return transactionDto;
    }
}
