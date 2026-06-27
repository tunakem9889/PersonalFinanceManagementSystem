package com.example.Finance.service;

import com.example.Finance.dto.ChangePasswordDto;
import com.example.Finance.dto.UserDto;

import java.util.List;

public interface UserService {
    UserDto getProfile(String email);
    UserDto updateProfile(String email, UserDto userDto);
    void changePassword(String email, ChangePasswordDto changePasswordDto);
    
    // Admin methods
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    void deleteUser(Long id);
}

