package com.example.Finance.service;

import com.example.Finance.dto.WalletDto;

import java.util.List;

public interface WalletService {
    WalletDto createWallet(String email, WalletDto walletDto);
    List<WalletDto> getAllWallets(String email);
    WalletDto getWalletById(String email, Long walletId);
    WalletDto updateWallet(String email, Long walletId, WalletDto walletDto);
    void deleteWallet(String email, Long walletId);
}
