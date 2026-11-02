package com.example.jobtracker.dto;

import com.example.jobtracker.entity.ApplicationStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateApplicationRequest {
    private String companyName;
    private String jobTitle;
    private String jobUrl;
    private String location;
    private String source;
    private ApplicationStatus status;
    private LocalDate appliedDate;
    private String notes;
    private LocalDate followUpDate;
    private Boolean reminderEnabled;
    private LocalDate remindedAt;
}
