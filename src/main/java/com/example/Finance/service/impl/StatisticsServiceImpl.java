package com.example.Finance.service.impl;

import com.example.Finance.entity.Transaction;
import com.example.Finance.entity.TransactionType;
import com.example.Finance.entity.User;
import com.example.Finance.exception.ResourceNotFoundException;
import com.example.Finance.repository.TransactionRepository;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    public Map<String, Object> getMonthlyStatistics(String email, int month, int year) {
        User user = getUserByEmail(email);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), startDate,
                endDate);

        return calculateStatistics(transactions);
    }

    @Override
    public Map<String, Object> getYearlyStatistics(String email, int year) {
        User user = getUserByEmail(email);

        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), startDate,
                endDate);

        return calculateStatistics(transactions);
    }

    @Override
    public Map<String, Object> getCategoryStatistics(String email, int month, int year) {
        User user = getUserByEmail(email);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), startDate,
                endDate);

        Map<String, BigDecimal> expensesByCategory = new HashMap<>();

        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.EXPENSE) {
                String categoryName = transaction.getCategory().getName();
                BigDecimal amount = transaction.getAmount();
                expensesByCategory.put(categoryName,
                        expensesByCategory.getOrDefault(categoryName, BigDecimal.ZERO).add(amount));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("expensesByCategory", expensesByCategory);
        return result;
    }

    private Map<String, Object> calculateStatistics(List<Transaction> transactions) {
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(transaction.getAmount());
            } else if (transaction.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(transaction.getAmount());
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpense);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalIncome", totalIncome);
        statistics.put("totalExpense", totalExpense);
        statistics.put("balance", balance);

        return statistics;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
