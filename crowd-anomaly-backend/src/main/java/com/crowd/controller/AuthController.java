package com.crowd.controller;

import com.crowd.dto.AuthResponse;
import com.crowd.dto.LoginRequest;
import com.crowd.dto.RegisterRequest;
import com.crowd.dto.UserDto;
import com.crowd.security.UserPrincipal;
import com.crowd.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for User Registration and JWT Logins")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user profile and returns a JWT access token.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Log in a user", description = "Validates user credentials and generates a JWT access token.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the currently authenticated user's details.")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        UserDto user = UserDto.builder()
                .id(principal.getUser().getId())
                .username(principal.getUser().getUsername())
                .email(principal.getUser().getEmail())
                .firstName(principal.getUser().getFirstName())
                .lastName(principal.getUser().getLastName())
                .role(principal.getUser().getRole())
                .status(principal.getUser().getStatus())
                .createdAt(principal.getUser().getCreatedAt())
                .updatedAt(principal.getUser().getUpdatedAt())
                .lastLogin(principal.getUser().getLastLogin())
                .avatarUrl(principal.getUser().getAvatarUrl())
                .build();
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out a user", description = "Logs out the user (client-side token removal should be used).")
    public ResponseEntity<Void> logout() {
        // In a real app, you would invalidate the token here
        return ResponseEntity.ok().build();
    }
}
