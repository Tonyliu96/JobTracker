package com.example.jobtracker.mapper;

import com.example.jobtracker.dto.CreateApplicationRequest;
import com.example.jobtracker.dto.JobApplicationResponse;
import com.example.jobtracker.entity.JobApplication;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {
    public JobApplication toEntity(CreateApplicationRequest request) {
        JobApplication app = new JobApplication();
        app.setCompanyName(request.getCompanyName());
        app.setJobTitle(request.getJobTitle());
        app.setJoburl(request.getJobUrl());
        app.setLocation(request.getLocation());
        app.setSource(request.getSource());
        app.setStatus(request.getStatus());
        app.setAppliedDate(request.getAppliedDate());
        app.setNotes(request.getNotes());
        app.setFollowUpDate(request.getFollowUpDate());
        app.setReminderEnabled(request.getReminderEnabled());
        app.setRemindeAt(request.getRemindeAt());
        return app;
    }

    public JobApplicationResponse toResponse(JobApplication app) {
        JobApplicationResponse dto = new JobApplicationResponse();
        dto.setId(app.getId());
        dto.setCompanyName(app.getCompanyName());
        dto.setJobTitle(app.getJobTitle());
        dto.setJobUrl(app.getJoburl());
        dto.setLocation(app.getLocation());
        dto.setSource(app.getSource());
        dto.setStatus(app.getStatus());
        dto.setAppliedDate(app.getAppliedDate());
        dto.setNotes(app.getNotes());
        dto.setCreatedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());
        dto.setFollowUpDate(app.getFollowUpDate());
        dto.setReminderEnabled(app.getReminderEnabled());
        dto.setRemindeAt(app.getRemindeAt());
        dto.setLastNotifiedAt(app.getLastNotifiedAt());
        return dto;
    }
}
