package com.example.Finance.controller;

import com.example.Finance.dto.WalletDto;
import com.example.Finance.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
@Tag(name = "Wallet Management", description = "APIs for managing user wallets")
public class WalletController {

    private final WalletService walletService;

    @Operation(summary = "Get all wallets of current user")
    @GetMapping
    public ResponseEntity<List<WalletDto>> getAllWallets(Authentication authentication) {
        return ResponseEntity.ok(walletService.getAllWallets(authentication.getName()));
    }

    @Operation(summary = "Get wallet by ID")
    @GetMapping("/{id}")
    public ResponseEntity<WalletDto> getWalletById(Authentication authentication,
                                                    @PathVariable Long id) {
        return ResponseEntity.ok(walletService.getWalletById(authentication.getName(), id));
    }

    @Operation(summary = "Create a new wallet")
    @PostMapping
    public ResponseEntity<WalletDto> createWallet(Authentication authentication,
                                                   @Valid @RequestBody WalletDto walletDto) {
        return new ResponseEntity<>(walletService.createWallet(authentication.getName(), walletDto),
                HttpStatus.CREATED);
    }

    @Operation(summary = "Update wallet name/type")
    @PutMapping("/{id}")
    public ResponseEntity<WalletDto> updateWallet(Authentication authentication,
                                                   @PathVariable Long id,
                                                   @Valid @RequestBody WalletDto walletDto) {
        return ResponseEntity.ok(walletService.updateWallet(authentication.getName(), id, walletDto));
    }

    @Operation(summary = "Delete a wallet")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWallet(Authentication authentication,
                                                @PathVariable Long id) {
        walletService.deleteWallet(authentication.getName(), id);
        return ResponseEntity.ok("Wallet deleted successfully");
    }
}
