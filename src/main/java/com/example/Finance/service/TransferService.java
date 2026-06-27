package com.example.Finance.service;

import com.example.Finance.dto.TransferDto;
import com.example.Finance.dto.TransferResponseDto;

public interface TransferService {
    TransferResponseDto transfer(String email, TransferDto transferDto);
}
