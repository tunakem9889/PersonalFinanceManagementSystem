package com.example.Finance.service.impl;

import com.example.Finance.dto.TransactionDto;
import com.example.Finance.entity.Budget;
import com.example.Finance.entity.Category;
import com.example.Finance.entity.Transaction;
import com.example.Finance.entity.TransactionType;
import com.example.Finance.entity.User;
import com.example.Finance.exception.APIException;
import com.example.Finance.exception.ResourceNotFoundException;
import com.example.Finance.entity.Wallet;
import com.example.Finance.repository.BudgetRepository;
import com.example.Finance.repository.CategoryRepository;
import com.example.Finance.repository.TransactionRepository;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.repository.WalletRepository;
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
    private final WalletRepository walletRepository;

    @Override
    @Transactional
    public TransactionDto createTransaction(String email, TransactionDto transactionDto) {
        User user = getUserByEmail(email);
        Category category = getCategoryById(transactionDto.getCategoryId());

        if(!category.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Category does not belong to user");
        }

        if (transactionDto.getWalletId() == null) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Wallet ID is required");
        }

        Wallet wallet = walletRepository.findById(transactionDto.getWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", transactionDto.getWalletId()));

        if (!wallet.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Wallet does not belong to user");
        }

        // Check and update wallet balance
        if (transactionDto.getType() == TransactionType.INCOME) {
            wallet.setCurrentBalance(wallet.getCurrentBalance().add(transactionDto.getAmount()));
        } else if (transactionDto.getType() == TransactionType.EXPENSE) {
            if (wallet.getCurrentBalance().compareTo(transactionDto.getAmount()) < 0) {
                throw new APIException(HttpStatus.BAD_REQUEST, "Insufficient balance in wallet. Available: " + wallet.getCurrentBalance());
            }
            wallet.setCurrentBalance(wallet.getCurrentBalance().subtract(transactionDto.getAmount()));
        }
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setAmount(transactionDto.getAmount());
        transaction.setType(transactionDto.getType());
        transaction.setTitle(transactionDto.getTitle());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setTransactionDate(transactionDto.getTransactionDate());
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setWallet(wallet);

        Transaction newTransaction = transactionRepository.save(transaction);

        // Update budget and get potential warning
        String warningMessage = null;
        if(transaction.getType() == TransactionType.EXPENSE) {
            warningMessage = updateBudgetSpentAmountAndGetWarning(user.getId(), category.getId(), transaction.getTransactionDate(), transaction.getAmount(), category);
        }

        TransactionDto dto = mapToDto(newTransaction);
        dto.setWarning(warningMessage);
        return dto;
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

        if (transactionDto.getWalletId() == null) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Wallet ID is required");
        }

        Wallet newWallet = walletRepository.findById(transactionDto.getWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", transactionDto.getWalletId()));

        if (!newWallet.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Wallet does not belong to user");
        }

        Wallet oldWallet = transaction.getWallet();

        // 1. Revert old transaction balance impact from old wallet
        if (oldWallet != null) {
            if (transaction.getType() == TransactionType.INCOME) {
                oldWallet.setCurrentBalance(oldWallet.getCurrentBalance().subtract(transaction.getAmount()));
            } else if (transaction.getType() == TransactionType.EXPENSE) {
                oldWallet.setCurrentBalance(oldWallet.getCurrentBalance().add(transaction.getAmount()));
            }
            walletRepository.save(oldWallet);
        }

        // 2. Revert budget if it was an expense
        if(transaction.getType() == TransactionType.EXPENSE) {
            updateBudgetSpentAmountAndGetWarning(user.getId(), transaction.getCategory().getId(), transaction.getTransactionDate(), transaction.getAmount().negate(), transaction.getCategory());
        }

        // 3. Apply new transaction balance impact to new wallet
        if (transactionDto.getType() == TransactionType.INCOME) {
            newWallet.setCurrentBalance(newWallet.getCurrentBalance().add(transactionDto.getAmount()));
        } else if (transactionDto.getType() == TransactionType.EXPENSE) {
            if (newWallet.getCurrentBalance().compareTo(transactionDto.getAmount()) < 0) {
                throw new APIException(HttpStatus.BAD_REQUEST, "Insufficient balance in wallet. Available: " + newWallet.getCurrentBalance());
            }
            newWallet.setCurrentBalance(newWallet.getCurrentBalance().subtract(transactionDto.getAmount()));
        }
        walletRepository.save(newWallet);

        transaction.setAmount(transactionDto.getAmount());
        transaction.setType(transactionDto.getType());
        transaction.setTitle(transactionDto.getTitle());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setTransactionDate(transactionDto.getTransactionDate());
        transaction.setCategory(category);
        transaction.setWallet(newWallet);

        Transaction updatedTransaction = transactionRepository.save(transaction);

        // 4. Apply new budget if it is an expense and get potential warning
        String warningMessage = null;
        if(updatedTransaction.getType() == TransactionType.EXPENSE) {
            warningMessage = updateBudgetSpentAmountAndGetWarning(user.getId(), category.getId(), updatedTransaction.getTransactionDate(), updatedTransaction.getAmount(), category);
        }

        TransactionDto dto = mapToDto(updatedTransaction);
        dto.setWarning(warningMessage);
        return dto;
    }

    @Override
    @Transactional
    public void deleteTransaction(String email, Long transactionId) {
        User user = getUserByEmail(email);
        Transaction transaction = getTransactionEntityById(transactionId);

        if(!transaction.getUser().getId().equals(user.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Transaction does not belong to user");
        }

        // Revert wallet balance
        Wallet wallet = transaction.getWallet();
        if (wallet != null) {
            if (transaction.getType() == TransactionType.INCOME) {
                if (wallet.getCurrentBalance().compareTo(transaction.getAmount()) < 0) {
                    throw new APIException(HttpStatus.BAD_REQUEST, "Cannot delete transaction: would result in negative wallet balance");
                }
                wallet.setCurrentBalance(wallet.getCurrentBalance().subtract(transaction.getAmount()));
            } else if (transaction.getType() == TransactionType.EXPENSE) {
                wallet.setCurrentBalance(wallet.getCurrentBalance().add(transaction.getAmount()));
            }
            walletRepository.save(wallet);
        }

        // Revert budget if it was an expense
        if(transaction.getType() == TransactionType.EXPENSE) {
            updateBudgetSpentAmountAndGetWarning(user.getId(), transaction.getCategory().getId(), transaction.getTransactionDate(), transaction.getAmount().negate(), transaction.getCategory());
        }

        transactionRepository.delete(transaction);
    }

    @Override
    public List<TransactionDto> filterTransactions(String email, Long walletId, Long categoryId, LocalDate startDate, LocalDate endDate) {
        User user = getUserByEmail(email);
        List<Transaction> transactions = transactionRepository.filterTransactions(user.getId(), walletId, categoryId, startDate, endDate);
        return transactions.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private String updateBudgetSpentAmountAndGetWarning(Long userId, Long categoryId, LocalDate date, BigDecimal amount, Category category) {
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                userId, categoryId, date.getMonthValue(), date.getYear());
        
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            BigDecimal newSpent = budget.getSpentAmount().add(amount);
            budget.setSpentAmount(newSpent);
            budgetRepository.save(budget);
            if (newSpent.compareTo(budget.getLimitAmount()) > 0) {
                return "Warning: Monthly budget exceeded for category: " + category.getName() + 
                       "! Limit: " + budget.getLimitAmount() + ", Spent: " + newSpent;
            }
        }
        return null;
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
        if (transaction.getWallet() != null) {
            transactionDto.setWalletId(transaction.getWallet().getId());
        }
        return transactionDto;
    }
}

