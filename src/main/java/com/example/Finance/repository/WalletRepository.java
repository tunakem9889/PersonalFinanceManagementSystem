package com.example.Finance.repository;

import com.example.Finance.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    List<Wallet> findByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(w.currentBalance), 0) FROM Wallet w WHERE w.user.id = :userId")
    BigDecimal sumCurrentBalanceByUserId(Long userId);
}
