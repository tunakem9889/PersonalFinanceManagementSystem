package com.example.Finance.dto;

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
public class TransferResponseDto {

    private Long fromWalletId;
    private String fromWalletName;
    private BigDecimal fromWalletBalanceAfter;

    private Long toWalletId;
    private String toWalletName;
    private BigDecimal toWalletBalanceAfter;

    private BigDecimal transferAmount;
    private String description;
    private LocalDate transferDate;

    private String message;
}
