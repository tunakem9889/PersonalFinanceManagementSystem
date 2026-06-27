package com.example.Finance.service.impl;

import com.example.Finance.entity.Transaction;
import com.example.Finance.entity.TransactionType;
import com.example.Finance.entity.User;
import com.example.Finance.exception.ResourceNotFoundException;
import com.example.Finance.repository.TransactionRepository;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.repository.WalletRepository;
import com.example.Finance.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

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

    /**
     * Dashboard summary:
     * - totalIncome: tong thu nhap toan thoi gian
     * - totalExpense: tong chi tieu toan thoi gian
     * - totalAssets: tong so du hien tai cua tat ca vi
     * - netBalance: tong thu - tong chi
     */
    @Override
    public Map<String, Object> getSummary(String email) {
        User user = getUserByEmail(email);

        List<Transaction> allTransactions = transactionRepository.findByUserId(user.getId());

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction t : allTransactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(t.getAmount());
            }
        }

        BigDecimal totalAssets = walletRepository.sumCurrentBalanceByUserId(user.getId());
        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        BigDecimal incomeExpenseRatio = BigDecimal.ZERO;
        if (totalExpense.compareTo(BigDecimal.ZERO) > 0) {
            incomeExpenseRatio = totalIncome.divide(totalExpense, 2, RoundingMode.HALF_UP);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalIncome", totalIncome);
        result.put("totalExpense", totalExpense);
        result.put("netBalance", netBalance);
        result.put("totalAssets", totalAssets);
        result.put("incomeExpenseRatio", incomeExpenseRatio);

        return result;
    }

    /**
     * Trend: Thu chi tung thang trong nam (12 thang)
     */
    @Override
    public Map<String, Object> getTrend(String email, int year) {
        User user = getUserByEmail(email);

        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(user.getId(), startDate, endDate);

        Map<Integer, BigDecimal> incomeByMonth = new LinkedHashMap<>();
        Map<Integer, BigDecimal> expenseByMonth = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) {
            incomeByMonth.put(m, BigDecimal.ZERO);
            expenseByMonth.put(m, BigDecimal.ZERO);
        }

        for (Transaction t : transactions) {
            int month = t.getTransactionDate().getMonthValue();
            if (t.getType() == TransactionType.INCOME) {
                incomeByMonth.put(month, incomeByMonth.get(month).add(t.getAmount()));
            } else if (t.getType() == TransactionType.EXPENSE) {
                expenseByMonth.put(month, expenseByMonth.get(month).add(t.getAmount()));
            }
        }

        List<Map<String, Object>> monthlyTrend = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", m);
            entry.put("income", incomeByMonth.get(m));
            entry.put("expense", expenseByMonth.get(m));
            entry.put("balance", incomeByMonth.get(m).subtract(expenseByMonth.get(m)));
            monthlyTrend.add(entry);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("monthlyTrend", monthlyTrend);
        return result;
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

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
