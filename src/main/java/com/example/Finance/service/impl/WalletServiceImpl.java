package com.example.Finance.service.impl;

import com.example.Finance.dto.WalletDto;
import com.example.Finance.entity.User;
import com.example.Finance.entity.Wallet;
import com.example.Finance.exception.APIException;
import com.example.Finance.exception.ResourceNotFoundException;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.repository.WalletRepository;
import com.example.Finance.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WalletDto createWallet(String email, WalletDto walletDto) {
        User user = getUserByEmail(email);

        Wallet wallet = new Wallet();
        wallet.setName(walletDto.getName());
        wallet.setType(walletDto.getType());
        wallet.setInitialBalance(walletDto.getInitialBalance());
        wallet.setCurrentBalance(walletDto.getInitialBalance());
        wallet.setUser(user);

        Wallet saved = walletRepository.save(wallet);
        return mapToDto(saved);
    }

    @Override
    public List<WalletDto> getAllWallets(String email) {
        User user = getUserByEmail(email);
        return walletRepository.findByUserId(user.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public WalletDto getWalletById(String email, Long walletId) {
        User user = getUserByEmail(email);
        Wallet wallet = getWalletEntity(walletId);
        checkOwnership(wallet, user);
        return mapToDto(wallet);
    }

    @Override
    @Transactional
    public WalletDto updateWallet(String email, Long walletId, WalletDto walletDto) {
        User user = getUserByEmail(email);
        Wallet wallet = getWalletEntity(walletId);
        checkOwnership(wallet, user);

        wallet.setName(walletDto.getName());
        wallet.setType(walletDto.getType());

        Wallet updated = walletRepository.save(wallet);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteWallet(String email, Long walletId) {
        User user = getUserByEmail(email);
        Wallet wallet = getWalletEntity(walletId);
        checkOwnership(wallet, user);
        walletRepository.delete(wallet);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Wallet getWalletEntity(Long id) {
        return walletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", id));
    }

    private void checkOwnership(Wallet wallet, User user) {
        if (!wallet.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "Wallet does not belong to the current user");
        }
    }

    private WalletDto mapToDto(Wallet wallet) {
        WalletDto dto = new WalletDto();
        dto.setId(wallet.getId());
        dto.setName(wallet.getName());
        dto.setType(wallet.getType());
        dto.setInitialBalance(wallet.getInitialBalance());
        dto.setCurrentBalance(wallet.getCurrentBalance());
        dto.setCreatedAt(wallet.getCreatedAt());
        return dto;
    }
}
