package com.example.Finance.controller;

import com.example.Finance.dto.ChangePasswordDto;
import com.example.Finance.dto.UserDto;
import com.example.Finance.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(Authentication authentication, @RequestBody UserDto userDto){
        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateProfile(email, userDto));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(Authentication authentication, @RequestBody ChangePasswordDto changePasswordDto){
        String email = authentication.getName();
        userService.changePassword(email, changePasswordDto);
        return ResponseEntity.ok("Password changed successfully.");
    }
}
