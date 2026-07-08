package com.example.Finance.repository;

import com.example.Finance.entity.Transaction;
import com.example.Finance.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:walletId IS NULL OR t.wallet.id = :walletId) " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> filterTransactions(
            @Param("userId") Long userId,
            @Param("walletId") Long walletId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Calculate the actual total expense amount for a given user, category, month and year.
     * This is used to keep budget spentAmount accurate regardless of create/update/delete order.
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId " +
           "AND t.category.id = :categoryId " +
           "AND t.type = :type " +
           "AND FUNCTION('MONTH', t.transactionDate) = :month " +
           "AND FUNCTION('YEAR', t.transactionDate) = :year")
    BigDecimal sumAmountByUserCategoryTypeMonthYear(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("type") TransactionType type,
            @Param("month") int month,
            @Param("year") int year
    );
}
