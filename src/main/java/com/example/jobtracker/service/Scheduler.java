package com.example.jobtracker.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.example.jobtracker.entity.JobApplication;
import com.example.jobtracker.entity.Notification;
import com.example.jobtracker.entity.NotificationType;
import com.example.jobtracker.repository.ApplicationRepository;
import com.example.jobtracker.repository.NotificationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class Scheduler {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Australia/Sydney");
    private final ApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "${notifications.cron:0 0 9 * * *}", zone = "${notifications.zone:Australia/Sydney}")
    public void processDueFollowUps() {
        generateDueNotifications();
    }

    @Transactional
    public void generateDueNotifications() {
        generateDueNotifications(LocalDate.now(BUSINESS_ZONE));
    }

    @Transactional
    public void generateDueNotificationsForUser(Long userId) {
        generateDueNotifications(userId, LocalDate.now(BUSINESS_ZONE));
    }

    @EventListener(ApplicationReadyEvent.class)
    public void generateNotificationsOnStartup() {
        generateDueNotifications();
    }

    private void generateDueNotifications(LocalDate today) {
        List<JobApplication> dueApps = applicationRepository.findAllDueFollowUps(today);
        saveNotifications(dueApps, today);
    }

    private void generateDueNotifications(Long userId, LocalDate today) {
        List<JobApplication> dueApps = applicationRepository.findDueFollowUpsByUserId(userId, today);
        saveNotifications(dueApps, today);
    }

    private void saveNotifications(List<JobApplication> dueApps, LocalDate today) {
        List<Notification> notificationsToSave = new ArrayList<>();
        if (dueApps.isEmpty()) {
            return;
        }

        for (JobApplication app : dueApps) {
            Notification notification = new Notification();
            notification.setUserId(app.getUserId());
            notification.setApplicationId(app.getId());
            notification.setTitle("Follow-up due");
            notification.setMessage(app.getJobTitle() + " at " + app.getCompanyName() + " is due for follow-up.");
            notification.setNotificationType(NotificationType.FOLLOW_UP_DUE);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            notificationsToSave.add(notification);
            app.setLastNotifiedAt(today);
        }
        notificationRepository.saveAll(notificationsToSave);

        applicationRepository.saveAll(dueApps);
    }

}
