package com.example.Finance.dto;

import com.example.Finance.entity.WalletType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WalletDto {

    private Long id;

    @NotBlank(message = "Wallet name is required")
    private String name;

    @NotNull(message = "Wallet type is required")
    private WalletType type;

    @NotNull(message = "Initial balance is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Initial balance must be >= 0")
    private BigDecimal initialBalance;

    private BigDecimal currentBalance;

    private LocalDateTime createdAt;
}
