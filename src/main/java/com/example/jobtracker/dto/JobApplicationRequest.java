package com.example.jobtracker.dto;

import com.example.jobtracker.Entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;

import java.time.LocalDate;

@Data
public class JobApplicationRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    private String jobUrl;
    private String location;
    private String source;
    private ApplicationStatus status;

    @PastOrPresent(message = "Applied date cannot be in the future")
    private LocalDate appliedDate;

    @PastOrPresent(message = "Created date cannot be in the future")
    private LocalDate createdDate;

    private String notes;
}
