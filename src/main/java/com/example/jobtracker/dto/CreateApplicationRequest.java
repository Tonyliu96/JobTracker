package com.example.jobtracker.dto;

import com.example.jobtracker.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateApplicationRequest {
    @NotBlank(message = "Company name is required")
    private String companyName;
    @NotBlank(message = "Job title is required")
    private String jobTitle;
    private String jobUrl;
    private String location;
    private String source;
    private ApplicationStatus status;
    private LocalDate appliedDate;
    private String notes;
    private LocalDate followUpDate;
    private Boolean reminderEnabled;
    private LocalDate remindeAt;
}
