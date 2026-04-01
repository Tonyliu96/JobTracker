package com.example.jobtracker.Controller;

import com.example.jobtracker.dto.NotificationResponse;
import com.example.jobtracker.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;
    private Long currentUserId(Authentication auth) {
    return (Long) auth.getPrincipal();
}

@GetMapping
public List<NotificationResponse> getNotifications(Authentication auth) {
    return notificationService.listByUserId(currentUserId(auth));
}

@GetMapping("/unread-count")
public ResponseEntity<Long> getUnreadCount(Authentication auth) {
    return ResponseEntity.ok(notificationService.unreadCount(currentUserId(auth)));
}

@PatchMapping("/{id}/read")
public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication auth) {
    notificationService.markAsRead(id, currentUserId(auth));
    return ResponseEntity.noContent().build();
}



}
