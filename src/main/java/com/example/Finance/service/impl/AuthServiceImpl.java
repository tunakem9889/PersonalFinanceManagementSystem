package com.example.Finance.service.impl;

import com.example.Finance.dto.JwtAuthResponse;
import com.example.Finance.dto.LoginDto;
import com.example.Finance.dto.RefreshTokenRequest;
import com.example.Finance.dto.RegisterDto;
import com.example.Finance.entity.RefreshToken;
import com.example.Finance.entity.Role;
import com.example.Finance.entity.User;
import com.example.Finance.exception.APIException;
import com.example.Finance.repository.RefreshTokenRepository;
import com.example.Finance.repository.UserRepository;
import com.example.Finance.security.JwtTokenProvider;
import com.example.Finance.service.AuthService;
import com.example.Finance.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional
    public JwtAuthResponse login(LoginDto loginDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateToken(authentication);

        // Lay userId de tao refresh token
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new APIException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        JwtAuthResponse response = new JwtAuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken.getToken());
        return response;
    }

    @Override
    public String register(RegisterDto registerDto) {
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Email is already exists!.");
        }

        User user = new User();
        user.setFullName(registerDto.getFullName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setRole(Role.ROLE_USER);

        userRepository.save(user);

        return "User registered successfully!.";
    }

    @Override
    public JwtAuthResponse refreshToken(RefreshTokenRequest request) {
        String requestToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestToken)
                .orElseThrow(() -> new APIException(HttpStatus.UNAUTHORIZED, "Refresh token not found in database"));

        // Kiem tra expiry
        refreshTokenService.verifyExpiration(refreshToken);

        // Sinh access token moi tu thong tin user
        User user = refreshToken.getUser();
        String newAccessToken = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        JwtAuthResponse response = new JwtAuthResponse();
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(refreshToken.getToken());
        return response;
    }

    @Override
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));
        refreshTokenService.deleteByUserId(user.getId());
        SecurityContextHolder.clearContext();
    }
}
