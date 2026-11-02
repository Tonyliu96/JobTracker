package com.example.jobtracker.Service;

import com.example.jobtracker.Entity.ApplicationStatus;
import com.example.jobtracker.Entity.JobApplication;
import com.example.jobtracker.Repository.ApplicationRepository;
import com.example.jobtracker.dto.JobApplicationRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private JobApplicationService service;

    @Test
    void createDisablesReminderForTerminalStatus() {
        JobApplicationRequest request = new JobApplicationRequest();
        request.setCompanyName("Acme");
        request.setJobTitle("Engineer");
        request.setStatus(ApplicationStatus.OFFER);
        request.setReminderEnabled(true);

        when(applicationRepository.save(any(JobApplication.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.create(request, 1L);

        assertThat(response.getStatus()).isEqualTo(ApplicationStatus.OFFER);
        assertThat(response.getReminderEnabled()).isFalse();
    }
}
