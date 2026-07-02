package com.crowd.service;

import com.crowd.dto.AuthResponse;
import com.crowd.dto.LoginRequest;
import com.crowd.dto.RegisterRequest;
import com.crowd.dto.UserDto;
import com.crowd.entity.Role;
import com.crowd.entity.User;
import com.crowd.entity.UserStatus;
import com.crowd.exception.UnauthorizedException;
import com.crowd.repository.UserRepository;
import com.crowd.security.JwtTokenProvider;
import com.crowd.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;
    private Authentication authentication;
    private UserPrincipal userPrincipal;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .username("testuser")
                .firstName("Test")
                .lastName("User")
                .email("test@example.com")
                .password("password")
                .role(Role.OPERATOR)
                .build();

        loginRequest = LoginRequest.builder()
                .username("test@example.com")
                .password("password")
                .build();

        user = User.builder()
                .id(1L)
                .username("testuser")
                .firstName("Test")
                .lastName("User")
                .email("test@example.com")
                .password("encoded_password")
                .role(Role.OPERATOR)
                .status(UserStatus.ACTIVE)
                .build();

        userPrincipal = new UserPrincipal(user);
        authentication = mock(Authentication.class);
    }

    @Test
    void register_ShouldRegisterUser_WhenEmailDoesNotExist() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userPrincipal);
        when(tokenProvider.generateToken(authentication)).thenReturn("jwt_token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jwt_token", response.getToken());
        UserDto userDto = response.getUser();
        assertNotNull(userDto);
        assertEquals("test@example.com", userDto.getEmail());
        assertEquals("OPERATOR", userDto.getRole().name());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userPrincipal);
        when(tokenProvider.generateToken(authentication)).thenReturn("jwt_token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt_token", response.getToken());
        UserDto userDto = response.getUser();
        assertNotNull(userDto);
        assertEquals("test@example.com", userDto.getEmail());
        assertEquals("OPERATOR", userDto.getRole().name());
    }

    @Test
    void login_ShouldThrowUnauthorizedException_WhenCredentialsAreInvalid() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenThrow(new RuntimeException("Bad credentials"));

        assertThrows(UnauthorizedException.class, () -> authService.login(loginRequest));
    }
}
