package com.example.jobtracker.dto;

import java.time.LocalDateTime;
import lombok.Data;

import com.example.jobtracker.Entity.Notification;
import com.example.jobtracker.Entity.NotificationType;

@Data
public class NotificationResponse {
    private Long id;
    private Long applicationId;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(notification.getId());
        dto.setApplicationId(notification.getApplicationId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getNotificationType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setReadAt(notification.getReadAt());
        return dto;
    }

}
