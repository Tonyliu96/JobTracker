package com.example.jobtracker.service;

import com.example.jobtracker.entity.JobApplication;
import com.example.jobtracker.repository.ApplicationRepository;
import com.example.jobtracker.dto.CreateApplicationRequest;
import com.example.jobtracker.dto.UpdateApplicationRequest;
import com.example.jobtracker.dto.JobApplicationResponse;
import com.example.jobtracker.mapper.ApplicationMapper;
import com.example.jobtracker.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Australia/Sydney");

    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;

    public List<JobApplicationResponse> listByUserId(Long userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(applicationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public JobApplicationResponse getById(Long id, Long userId) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found: " + id);
        }
        return applicationMapper.toResponse(app);
    }

    @Transactional
    public JobApplicationResponse create(CreateApplicationRequest request, Long userId) {
        var nowDate = java.time.LocalDate.now();
        // if (request.getCreatedDate() != null && request.getCreatedDate().isAfter(nowDate)) {
        //     throw new IllegalArgumentException("Created date cannot be in the future");
        // }

        boolean reminderEnabled = request.getReminderEnabled() == null || request.getReminderEnabled();

        JobApplication app = applicationMapper.toEntity(request);
        app.setUserId(userId);
        app.setStatus(app.getStatus() != null ? app.getStatus()
                : com.example.jobtracker.entity.ApplicationStatus.APPLIED);

        LocalDate appliedDate = request.getAppliedDate() != null ? request.getAppliedDate() : nowDate;
        app.setAppliedDate(appliedDate);

        app.setCreatedAt(LocalDateTime.now());
        app.setNotes(request.getNotes());
        app.setUpdatedAt(LocalDateTime.now());

        if (request.getFollowUpDate() != null) {
            app.setFollowUpDate(request.getFollowUpDate());
        } else if (reminderEnabled) {
            app.setFollowUpDate(appliedDate.plusDays(7));
        }

        

        app.setRemindedAt(null);
        app.setReminderEnabled(reminderEnabled);
        app.setLastNotifiedAt(null);
        closeReminderForTerminalStatus(app);

        return applicationMapper.toResponse(applicationRepository.save(app));
    }

    @Transactional
    public JobApplicationResponse update(Long id, UpdateApplicationRequest request, Long userId) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));

        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found: " + id);
        }
        if (request.getCompanyName() != null)
            app.setCompanyName(request.getCompanyName());
        if (request.getJobTitle() != null)
            app.setJobTitle(request.getJobTitle());
        if (request.getJobUrl() != null)
            app.setJobUrl(request.getJobUrl());
        if (request.getLocation() != null)
            app.setLocation(request.getLocation());
        if (request.getSource() != null)
            app.setSource(request.getSource());
        if (request.getStatus() != null)
            app.setStatus(request.getStatus());
        if (request.getAppliedDate() != null)
            app.setAppliedDate(request.getAppliedDate());
        if (request.getNotes() != null)
            app.setNotes(request.getNotes());
        app.setUpdatedAt(LocalDateTime.now());
        if (request.getReminderEnabled() != null) {
            app.setReminderEnabled(request.getReminderEnabled());
        }

        if (request.getFollowUpDate() != null) {
            app.setFollowUpDate(request.getFollowUpDate());
        }

        if(request.getRemindedAt() != null) {
            app.setRemindedAt(request.getRemindedAt());
        }


        closeReminderForTerminalStatus(app);

        return applicationMapper.toResponse(applicationRepository.save(app));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found: " + id);
        }
        applicationRepository.delete(app);
    }

    public List<JobApplicationResponse> getDueFollowUps(Long userId) {
        
        LocalDate today = LocalDate.now();
        return applicationRepository.findDueFollowUpsByUserId(userId, today).stream()
                .map(applicationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationResponse markFollowUpDone(Long id, Long userId) {
        JobApplication app = applicationRepository.findById(id)
                .filter(application -> application.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));

        app.setRemindedAt(LocalDate.now(BUSINESS_ZONE));
        app.setLastNotifiedAt(null);
        app.setUpdatedAt(LocalDateTime.now());
        return applicationMapper.toResponse(applicationRepository.save(app));
    }

    private void closeReminderForTerminalStatus(JobApplication app) {
        if (app.getStatus() == com.example.jobtracker.entity.ApplicationStatus.OFFER
                || app.getStatus() == com.example.jobtracker.entity.ApplicationStatus.REJECTED
                || app.getStatus() == com.example.jobtracker.entity.ApplicationStatus.WITHDRAWN) {
            app.setReminderEnabled(false);
        }
    }
}
