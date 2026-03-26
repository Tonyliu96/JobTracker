package com.example.jobtracker.Controller;

import com.example.jobtracker.Entity.ApplicationStatus;
import com.example.jobtracker.Service.JobApplicationService;
import com.example.jobtracker.dto.JobApplicationResponse;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class JobApplicationControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private JobApplicationService jobApplicationService;

    @InjectMocks
    private JobApplicationController jobApplicationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(jobApplicationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void listReturnsApplicationsForAuthenticatedUser() throws Exception {
        when(jobApplicationService.listByUserId(1L)).thenReturn(List.of(sampleResponse()));

        mockMvc.perform(get("/api/applications")
                        .principal(new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("Acme Corp"))
                .andExpect(jsonPath("$[0].status").value("APPLIED"));
    }

    @Test
    void createReturnsCreatedApplication() throws Exception {
        when(jobApplicationService.create(any(), eq(1L))).thenReturn(sampleResponse());

        mockMvc.perform(post("/api/applications")
                        .principal(new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "companyName", "Acme Corp",
                                "jobTitle", "Backend Engineer",
                                "status", "APPLIED"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Acme Corp"))
                .andExpect(jsonPath("$.jobTitle").value("Backend Engineer"));
    }

    @Test
    void deleteReturnsNoContent() throws Exception {
        doNothing().when(jobApplicationService).delete(42L, 1L);

        mockMvc.perform(delete("/api/applications/42")
                        .principal(new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList())))
                .andExpect(status().isNoContent());
    }

    private JobApplicationResponse sampleResponse() {
        JobApplicationResponse response = new JobApplicationResponse();
        response.setId(42L);
        response.setCompanyName("Acme Corp");
        response.setJobTitle("Backend Engineer");
        response.setStatus(ApplicationStatus.APPLIED);
        response.setAppliedDate(LocalDate.of(2026, 3, 18));
        response.setCreatedAt(LocalDateTime.of(2026, 3, 18, 9, 0));
        response.setUpdatedAt(LocalDateTime.of(2026, 3, 19, 10, 0));
        return response;
    }
}
