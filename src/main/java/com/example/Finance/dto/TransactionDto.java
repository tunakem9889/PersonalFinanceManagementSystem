package com.example.Finance.dto;

import com.example.Finance.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private String title;
    private String description;
    private LocalDate transactionDate;
    private Long categoryId;
}
