package com.example.Finance.service;

import com.example.Finance.dto.LoginDto;
import com.example.Finance.dto.RegisterDto;

public interface AuthService {
    String login(LoginDto loginDto);
    String register(RegisterDto registerDto);
}
