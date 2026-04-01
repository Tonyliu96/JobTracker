package com.example.jobtracker.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.jobtracker.Entity.Notification;
import com.example.jobtracker.Repository.NotificationRepository;
import com.example.jobtracker.dto.NotificationResponse;
import com.example.jobtracker.exception.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public List<NotificationResponse> listByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        // First, we fetch the notification by its ID. If it doesn't exist, we throw a
        // ResourceNotFoundException.
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);

        // User possibly can only mark their own notifications as read, so we check the
        // userId
        // if (notification.getUserId().equals(userId)) {
        // notification.setRead(true);
        // // sync readAt timestamp with the time when the notification is marked as
        // read
        // notification.setReadAt(LocalDateTime.now());
        // notificationRepository.save(notification);
        // } else {
        // // if the notification does not belong to the user, we can either ignore or
        // // throw an exception
        // throw new ResourceNotFoundException("Notification not found: " +
        // notificationId);
        // }
    }

}
