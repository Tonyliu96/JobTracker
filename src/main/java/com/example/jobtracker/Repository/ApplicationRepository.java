package com.example.jobtracker.Repository;

import com.example.jobtracker.Entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {
    // auto-implemented by Spring Data JPA based on method name
    List<JobApplication> findByUserId(Long userId); // costume query for listing applications by user

    @Query("""
        SELECT a FROM JobApplication a
        WHERE a.userId = :userId
          AND a.reminderEnabled = true
          AND a.followUpDate IS NOT NULL
          AND a.followUpDate <= :today
          AND a.remindeAt IS NULL
          AND a.status NOT IN (
              com.example.jobtracker.Entity.ApplicationStatus.OFFER,
              com.example.jobtracker.Entity.ApplicationStatus.REJECTED,
              com.example.jobtracker.Entity.ApplicationStatus.WITHDRAWN
          )
    """)
    List<JobApplication> findDueFollowUpsByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);

    // support for admin dashboard
    @Query("""
        SELECT a FROM JobApplication a
        WHERE a.reminderEnabled = true
          AND a.followUpDate IS NOT NULL
          AND a.followUpDate <= :today
          AND a.remindeAt IS NULL
          AND (a.lastNotifiedAt IS NULL OR a.lastNotifiedAt < :today)
          AND a.status NOT IN (
              com.example.jobtracker.Entity.ApplicationStatus.OFFER,
              com.example.jobtracker.Entity.ApplicationStatus.REJECTED,
              com.example.jobtracker.Entity.ApplicationStatus.WITHDRAWN
          )
    """)
    List<JobApplication> findAllDueFollowUps(@Param("today") LocalDate today);
}