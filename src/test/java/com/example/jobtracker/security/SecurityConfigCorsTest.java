package com.example.jobtracker.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityConfigCorsTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        FrontendProperties frontendProperties = mock(FrontendProperties.class);
        when(frontendProperties.getOrigin())
                .thenReturn("https://jobtrackerau.vercel.app, http://localhost:5173/");

        SecurityConfig securityConfig = new SecurityConfig(
                mock(JwtAuthenticationFilter.class),
                mock(AuthRateLimitFilter.class),
                frontendProperties
        );
        CorsConfigurationSource corsConfigurationSource = securityConfig.corsConfigurationSource();
        mockMvc = MockMvcBuilders.standaloneSetup(new PreflightController())
                .addFilters(new CorsFilter(corsConfigurationSource))
                .build();
    }

    @Test
    void allowsPreflightFromConfiguredFrontend() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://jobtrackerau.vercel.app")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://jobtrackerau.vercel.app"));
    }

    @Test
    void rejectsPreflightFromUnknownFrontend() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://unknown.example.com")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isForbidden());
    }

    @RestController
    @RequestMapping("/api/auth")
    static class PreflightController {
        @PostMapping("/login")
        ResponseEntity<Void> login(HttpServletRequest request, HttpServletResponse response) {
            return ResponseEntity.ok().build();
        }
    }
}
