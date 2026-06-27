package com.example.Finance.service;

import com.example.Finance.dto.JwtAuthResponse;
import com.example.Finance.dto.LoginDto;
import com.example.Finance.dto.RefreshTokenRequest;
import com.example.Finance.dto.RegisterDto;

public interface AuthService {
    JwtAuthResponse login(LoginDto loginDto);
    String register(RegisterDto registerDto);
    JwtAuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String email);
}

