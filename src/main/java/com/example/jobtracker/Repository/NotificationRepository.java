package com.example.jobtracker.Repository;

import org.springframework.stereotype.Repository;
import com.example.jobtracker.Entity.Notification;
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
