package com.example.jobtracker.Service;

import com.example.jobtracker.Entity.JobApplication;
import com.example.jobtracker.Repository.ApplicationRepository;
import com.example.jobtracker.dto.JobApplicationRequest;
import com.example.jobtracker.dto.JobApplicationResponse;
import com.example.jobtracker.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final ApplicationRepository applicationRepository;

    public List<JobApplicationResponse> listByUserId(Long userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(JobApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public JobApplicationResponse getById(Long id, Long userId) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found: " + id);
        }
        return JobApplicationResponse.fromEntity(app);
    }

    @Transactional
    public JobApplicationResponse create(JobApplicationRequest request, Long userId) {
        var nowDate = java.time.LocalDate.now();
        if (request.getCreatedDate() != null && request.getCreatedDate().isAfter(nowDate)) {
            throw new IllegalArgumentException("Created date cannot be in the future");
        }

        JobApplication app = new JobApplication();
        app.setUserId(userId);
        app.setCompanyName(request.getCompanyName());
        app.setJobTitle(request.getJobTitle());
        app.setJoburl(request.getJobUrl());
        app.setLocation(request.getLocation());
        app.setSource(request.getSource());
        app.setStatus(request.getStatus() != null ? request.getStatus() : com.example.jobtracker.Entity.ApplicationStatus.APPLIED);

        LocalDate appliedDate = request.getAppliedDate() != null ? request.getAppliedDate() : nowDate;
        app.setAppliedDate(appliedDate);

        app.setCreatedAt(LocalDateTime.now());
        app.setNotes(request.getNotes());
        app.setUpdatedAt(LocalDateTime.now());
        return JobApplicationResponse.fromEntity(applicationRepository.save(app));
    }

    @Transactional
    public JobApplicationResponse update(Long id, JobApplicationRequest request, Long userId) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found: " + id);
        }
        if (request.getCompanyName() != null) app.setCompanyName(request.getCompanyName());
        if (request.getJobTitle() != null) app.setJobTitle(request.getJobTitle());
        if (request.getJobUrl() != null) app.setJoburl(request.getJobUrl());
        if (request.getLocation() != null) app.setLocation(request.getLocation());
        if (request.getSource() != null) app.setSource(request.getSource());
        if (request.getStatus() != null) app.setStatus(request.getStatus());
        if (request.getAppliedDate() != null) app.setAppliedDate(request.getAppliedDate());
        if (request.getNotes() != null) app.setNotes(request.getNotes());
        app.setUpdatedAt(LocalDateTime.now());
        return JobApplicationResponse.fromEntity(applicationRepository.save(app));
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
}
