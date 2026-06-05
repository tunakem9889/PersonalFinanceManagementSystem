package com.example.Finance.service;

import com.example.Finance.dto.ChangePasswordDto;
import com.example.Finance.dto.UserDto;

public interface UserService {
    UserDto getProfile(String email);
    UserDto updateProfile(String email, UserDto userDto);
    void changePassword(String email, ChangePasswordDto changePasswordDto);
}
