package com.example.jobtracker.dto;

import com.example.jobtracker.Entity.ApplicationStatus;
import com.example.jobtracker.Entity.JobApplication;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class JobApplicationResponse {

    private Long id;
    private String companyName;
    private String jobTitle;
    private String jobUrl;
    private String location;
    private String source;
    private ApplicationStatus status;
    private LocalDate appliedDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static JobApplicationResponse fromEntity(JobApplication app) {
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
        return dto;
    }
}
