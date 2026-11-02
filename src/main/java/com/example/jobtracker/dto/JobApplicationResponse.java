package com.example.jobtracker.dto;

import com.example.jobtracker.entity.ApplicationStatus;
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
    private LocalDate followUpDate;
    private Boolean reminderEnabled;
    private LocalDate remindeAt;
    private LocalDate lastNotifiedAt;

}
