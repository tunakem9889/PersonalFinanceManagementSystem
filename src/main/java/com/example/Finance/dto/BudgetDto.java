package com.example.Finance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDto {
    private Long id;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private Integer month;
    private Integer year;
    private Long categoryId;
}
