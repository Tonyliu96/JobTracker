package com.example.jobtracker.repository;

import org.springframework.stereotype.Repository;
import com.example.jobtracker.entity.Notification;
import java.util.Optional;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // List<Notification> findByUserIdAndReadFalse(Long userId);
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);
    // List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndReadFalse(Long userId);
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
}
