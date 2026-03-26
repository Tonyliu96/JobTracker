package com.example.jobtracker.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String jobTitle;

    private String joburl;

    private String location;

    private String source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private  ApplicationStatus status = ApplicationStatus.APPLIED;

    private LocalDate appliedDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // 关联用户 ID (后续对接 Security)
    private Long userId;


//    public String getCompanyName() {
//        return companyName;
//    }
//
//    public String getJobTitle() {
//        return jobTitle;
//    }
//
//    public String getJoburl() {
//        return joburl;
//    }
//
//    public String getLocation() {
//        return location;
//    }
//
//    public String getSource() {
//        return source;
//    }
//
//    public ApplicationStatus getStatus() {
//        return status;
//    }
//
//    public LocalDate getAppliedDate() {
//        return appliedDate;
//    }
//
//    public String getNotes() {
//        return notes;
//    }
//
//    public LocalDateTime getUpdatedAt() {
//        return updatedAt;
//    }
//
//    public Long setUserId(Long userId) {
//        this.userId = userId;
//        return userId;
//    }
//
//    public String setCompanyName(String companyName) {
//        this.companyName = companyName;
//        return companyName;
//    }
//
//    public String setJobTitle(String jobTitle) {
//        this.jobTitle = jobTitle;
//        return jobTitle;
//    }
//
//    public String setJoburl(String joburl) {
//        this.joburl = joburl;
//        return joburl;
//    }
//
//    public String setLocation(String location) {
//        this.location = location;
//        return location;
//    }
//
//    public String setSource(String source) {
//        this.source = source;
//        return source;
//    }
//
//    public String setStatus(ApplicationStatus status) {
//        this.status = status;
//        return status.toString();
//    }
//
//    public String setAppliedDate(LocalDate appliedDate) {
//        this.appliedDate = appliedDate;
//        return appliedDate.toString();
//    }
//
//    public String setNotes(String notes) {
//        this.notes = notes;
//        return notes;
//    }
//
//    public String setUpdatedAt(LocalDateTime updatedAt) {
//        this.updatedAt = updatedAt;
//        return updatedAt.toString();
//    }


}

