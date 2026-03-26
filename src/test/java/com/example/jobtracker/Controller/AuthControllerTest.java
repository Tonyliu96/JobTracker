package com.example.jobtracker.Controller;

import com.example.jobtracker.Service.AuthService;
import com.example.jobtracker.dto.AuthResponse;
import com.example.jobtracker.dto.UserProfileResponse;
import com.example.jobtracker.exception.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void registerReturnsTokenPayload() throws Exception {
        when(authService.register(any())).thenReturn(new AuthResponse("token", 1L, "user@example.com"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "user@example.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    void registerRejectsInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.details.email").exists())
                .andExpect(jsonPath("$.details.password").exists());
    }

    @Test
    void meReturnsAuthenticatedProfile() throws Exception {
        when(authService.getProfile(1L)).thenReturn(new UserProfileResponse(1L, "user@example.com"));

        mockMvc.perform(get("/api/auth/me")
                        .principal(new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    void changePasswordReturnsNoContentWhenAuthenticated() throws Exception {
        doNothing().when(authService).changePassword(any(), any());

        mockMvc.perform(post("/api/auth/change-password")
                        .principal(new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("oldPassword", "old-secret", "newPassword", "new-secret"))))
                .andExpect(status().isNoContent());
    }
}
