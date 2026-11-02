package com.example.jobtracker.service;

import com.example.jobtracker.entity.ApplicationStatus;
import com.example.jobtracker.entity.JobApplication;
import com.example.jobtracker.repository.ApplicationRepository;
import com.example.jobtracker.dto.CreateApplicationRequest;
import com.example.jobtracker.dto.JobApplicationResponse;
import com.example.jobtracker.mapper.ApplicationMapper;
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

    @Mock
    private ApplicationMapper applicationMapper;

    @InjectMocks
    private JobApplicationService service;

    @Test
    void createDisablesReminderForTerminalStatus() {
        CreateApplicationRequest request = new CreateApplicationRequest();
        request.setCompanyName("Acme");
        request.setJobTitle("Engineer");
        request.setStatus(ApplicationStatus.OFFER);
        request.setReminderEnabled(true);

        when(applicationRepository.save(any(JobApplication.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(applicationMapper.toEntity(request)).thenAnswer(invocation -> {
            JobApplication app = new JobApplication();
            app.setCompanyName(request.getCompanyName());
            app.setJobTitle(request.getJobTitle());
            app.setStatus(request.getStatus());
            return app;
        });
        when(applicationMapper.toResponse(any(JobApplication.class)))
                .thenAnswer(invocation -> {
                    JobApplication app = invocation.getArgument(0);
                    JobApplicationResponse response = new JobApplicationResponse();
                    response.setStatus(app.getStatus());
                    response.setReminderEnabled(app.getReminderEnabled());
                    return response;
                });

        var response = service.create(request, 1L);

        assertThat(response.getStatus()).isEqualTo(ApplicationStatus.OFFER);
        assertThat(response.getReminderEnabled()).isFalse();
    }
}
