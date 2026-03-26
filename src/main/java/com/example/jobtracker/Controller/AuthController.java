package com.example.jobtracker.Controller;

import com.example.jobtracker.Service.AuthService;
import com.example.jobtracker.dto.AuthRequest;
import com.example.jobtracker.dto.AuthResponse;
import com.example.jobtracker.dto.ChangePasswordRequest;
import com.example.jobtracker.dto.GoogleLoginRequest;
import com.example.jobtracker.dto.UserProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request.getIdToken()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                               Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        authService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }
}
