package com.example.Finance.service.impl;

import com.example.Finance.dto.TransactionDto;
import com.example.Finance.entity.*;
import com.example.Finance.exception.APIException;
import com.example.Finance.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User user;
    private User otherUser;
    private Category category;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");

        category = new Category();
        category.setId(1L);
        category.setName("Food");
        category.setType(CategoryType.EXPENSE);
        category.setUser(user);

        wallet = new Wallet();
        wallet.setId(1L);
        wallet.setName("My Cash");
        wallet.setType(WalletType.CASH_WALLET);
        wallet.setInitialBalance(BigDecimal.valueOf(1000));
        wallet.setCurrentBalance(BigDecimal.valueOf(1000));
        wallet.setUser(user);
    }

    @Test
    void createTransaction_successIncome_updatesWalletBalance() {
        // Arrange
        TransactionDto inputDto = new TransactionDto();
        inputDto.setAmount(BigDecimal.valueOf(200));
        inputDto.setType(TransactionType.INCOME);
        inputDto.setTitle("Salary");
        inputDto.setTransactionDate(LocalDate.now());
        inputDto.setCategoryId(category.getId());
        inputDto.setWalletId(wallet.getId());

        category.setType(CategoryType.INCOME); // set to INCOME category

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(categoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(walletRepository.findById(wallet.getId())).thenReturn(Optional.of(wallet));

        Transaction savedTx = new Transaction();
        savedTx.setId(10L);
        savedTx.setAmount(inputDto.getAmount());
        savedTx.setType(inputDto.getType());
        savedTx.setTitle(inputDto.getTitle());
        savedTx.setTransactionDate(inputDto.getTransactionDate());
        savedTx.setUser(user);
        savedTx.setCategory(category);
        savedTx.setWallet(wallet);

        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);

        // Act
        TransactionDto result = transactionService.createTransaction(user.getEmail(), inputDto);

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals(BigDecimal.valueOf(1200), wallet.getCurrentBalance()); // 1000 + 200
        verify(walletRepository, times(1)).save(wallet);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void createTransaction_insufficientBalance_throwsException() {
        // Arrange
        TransactionDto inputDto = new TransactionDto();
        inputDto.setAmount(BigDecimal.valueOf(1500)); // Greater than 1000 wallet balance
        inputDto.setType(TransactionType.EXPENSE);
        inputDto.setTitle("Buying Phone");
        inputDto.setTransactionDate(LocalDate.now());
        inputDto.setCategoryId(category.getId());
        inputDto.setWalletId(wallet.getId());

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(categoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(walletRepository.findById(wallet.getId())).thenReturn(Optional.of(wallet));

        // Act & Assert
        APIException exception = assertThrows(APIException.class, () -> {
            transactionService.createTransaction(user.getEmail(), inputDto);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("Insufficient balance"));
        assertEquals(BigDecimal.valueOf(1000), wallet.getCurrentBalance()); // balance unchanged
        verify(walletRepository, never()).save(any(Wallet.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_exceedsBudget_returnsWarning() {
        // Arrange
        TransactionDto inputDto = new TransactionDto();
        inputDto.setAmount(BigDecimal.valueOf(300));
        inputDto.setType(TransactionType.EXPENSE);
        inputDto.setTitle("Lunch");
        inputDto.setTransactionDate(LocalDate.of(2026, 7, 9));
        inputDto.setCategoryId(category.getId());
        inputDto.setWalletId(wallet.getId());

        Budget budget = new Budget();
        budget.setId(1L);
        budget.setLimitAmount(BigDecimal.valueOf(500));
        budget.setSpentAmount(BigDecimal.valueOf(300)); // already spent 300
        budget.setMonth(7);
        budget.setYear(2026);
        budget.setUser(user);
        budget.setCategory(category);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(categoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(walletRepository.findById(wallet.getId())).thenReturn(Optional.of(wallet));
        when(budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(user.getId(), category.getId(), 7, 2026))
                .thenReturn(Optional.of(budget));

        Transaction savedTx = new Transaction();
        savedTx.setId(11L);
        savedTx.setAmount(inputDto.getAmount());
        savedTx.setType(inputDto.getType());
        savedTx.setTitle(inputDto.getTitle());
        savedTx.setTransactionDate(inputDto.getTransactionDate());
        savedTx.setUser(user);
        savedTx.setCategory(category);
        savedTx.setWallet(wallet);

        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);

        // Act
        TransactionDto result = transactionService.createTransaction(user.getEmail(), inputDto);

        // Assert
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(700), wallet.getCurrentBalance()); // 1000 - 300
        assertEquals(BigDecimal.valueOf(600), budget.getSpentAmount()); // 300 + 300 = 600
        assertNotNull(result.getWarning());
        assertTrue(result.getWarning().contains("Warning: Monthly budget exceeded"));
        verify(walletRepository, times(1)).save(wallet);
        verify(budgetRepository, times(1)).save(budget);
    }

    @Test
    void createTransaction_unauthorizedCategoryOwnership_throwsException() {
        // Arrange
        TransactionDto inputDto = new TransactionDto();
        inputDto.setAmount(BigDecimal.valueOf(50));
        inputDto.setType(TransactionType.EXPENSE);
        inputDto.setTitle("Hack");
        inputDto.setTransactionDate(LocalDate.now());
        inputDto.setCategoryId(category.getId());
        inputDto.setWalletId(wallet.getId());

        category.setUser(otherUser); // Category belongs to otherUser!

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(categoryRepository.findById(category.getId())).thenReturn(Optional.of(category));

        // Act & Assert
        APIException exception = assertThrows(APIException.class, () -> {
            transactionService.createTransaction(user.getEmail(), inputDto);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("Category does not belong to user"));
        verify(walletRepository, never()).save(any(Wallet.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void createTransaction_unauthorizedWalletOwnership_throwsException() {
        // Arrange
        TransactionDto inputDto = new TransactionDto();
        inputDto.setAmount(BigDecimal.valueOf(50));
        inputDto.setType(TransactionType.EXPENSE);
        inputDto.setTitle("Hack Wallet");
        inputDto.setTransactionDate(LocalDate.now());
        inputDto.setCategoryId(category.getId());
        inputDto.setWalletId(wallet.getId());

        wallet.setUser(otherUser); // Wallet belongs to otherUser!

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(categoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(walletRepository.findById(wallet.getId())).thenReturn(Optional.of(wallet));

        // Act & Assert
        APIException exception = assertThrows(APIException.class, () -> {
            transactionService.createTransaction(user.getEmail(), inputDto);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("Wallet does not belong to user"));
        verify(walletRepository, never()).save(any(Wallet.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}
