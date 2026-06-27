package com.example.Finance.service.impl;

import com.example.Finance.dto.TransferDto;
import com.example.Finance.dto.TransferResponseDto;
import com.example.Finance.entity.User;
import com.example.Finance.entity.Wallet;
import com.example.Finance.exception.APIException;
import com.example.Finance.exception.ResourceNotFoundException;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.repository.WalletRepository;
import com.example.Finance.service.TransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransferServiceImpl implements TransferService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    /**
     * BR02: Không được chuyển khi số dư không đủ.
     * BR04: Toàn bộ thao tác trong một Atomic Transaction.
     * Tổng tài sản người dùng không thay đổi sau khi chuyển.
     */
    @Override
    @Transactional
    public TransferResponseDto transfer(String email, TransferDto dto) {
        User user = getUserByEmail(email);

        // Validate wallets are different
        if (dto.getFromWalletId().equals(dto.getToWalletId())) {
            throw new APIException(HttpStatus.BAD_REQUEST,
                    "Source wallet and destination wallet must be different");
        }

        Wallet fromWallet = getWallet(dto.getFromWalletId());
        Wallet toWallet = getWallet(dto.getToWalletId());

        // BR05: chỉ được thao tác ví của mình
        checkOwnership(fromWallet, user, "Source");
        checkOwnership(toWallet, user, "Destination");

        // BR02: kiểm tra số dư
        if (fromWallet.getCurrentBalance().compareTo(dto.getAmount()) < 0) {
            throw new APIException(HttpStatus.BAD_REQUEST,
                    "Insufficient balance in source wallet. Available: "
                            + fromWallet.getCurrentBalance() + ", Required: " + dto.getAmount());
        }

        // Atomic update: trừ nguồn, cộng đích
        fromWallet.setCurrentBalance(fromWallet.getCurrentBalance().subtract(dto.getAmount()));
        toWallet.setCurrentBalance(toWallet.getCurrentBalance().add(dto.getAmount()));

        walletRepository.save(fromWallet);
        walletRepository.save(toWallet);

        LocalDate transferDate = dto.getTransferDate() != null ? dto.getTransferDate() : LocalDate.now();

        TransferResponseDto response = new TransferResponseDto();
        response.setFromWalletId(fromWallet.getId());
        response.setFromWalletName(fromWallet.getName());
        response.setFromWalletBalanceAfter(fromWallet.getCurrentBalance());
        response.setToWalletId(toWallet.getId());
        response.setToWalletName(toWallet.getName());
        response.setToWalletBalanceAfter(toWallet.getCurrentBalance());
        response.setTransferAmount(dto.getAmount());
        response.setDescription(dto.getDescription());
        response.setTransferDate(transferDate);
        response.setMessage("Transfer completed successfully");

        return response;
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Wallet getWallet(Long id) {
        return walletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "id", id));
    }

    private void checkOwnership(Wallet wallet, User user, String label) {
        if (!wallet.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN,
                    label + " wallet does not belong to the current user");
        }
    }
}
