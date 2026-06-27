package com.example.Finance.controller;

import com.example.Finance.dto.TransferDto;
import com.example.Finance.dto.TransferResponseDto;
import com.example.Finance.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
@Tag(name = "Transfer", description = "Transfer money between wallets")
public class TransferController {

    private final TransferService transferService;

    @Operation(summary = "Transfer money between two wallets of the same user")
    @PostMapping
    public ResponseEntity<TransferResponseDto> transfer(
            Authentication authentication,
            @Valid @RequestBody TransferDto transferDto) {
        return ResponseEntity.ok(transferService.transfer(authentication.getName(), transferDto));
    }
}
