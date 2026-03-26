package com.example.jobtracker.Service;

import com.example.jobtracker.Entity.User;
import com.example.jobtracker.Repository.UserRepository;
import com.example.jobtracker.dto.AuthRequest;
import com.example.jobtracker.dto.AuthResponse;
import com.example.jobtracker.dto.ChangePasswordRequest;
import com.example.jobtracker.dto.UserProfileResponse;
import com.example.jobtracker.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${google.client-id:}")
    private String googleClientId;

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail());
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserProfileResponse(user.getId(), user.getEmail());
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public AuthResponse loginWithGoogle(String idTokenString) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalArgumentException("Google login is not configured");
        }
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Google token");
        }
        if (idToken == null) {
            throw new IllegalArgumentException("Invalid Google token");
        }
        String email = idToken.getPayload().getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account has no email");
        }
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            return userRepository.save(newUser);
        });
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail());
    }
}
