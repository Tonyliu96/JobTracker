package com.example.jobtracker.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.jobtracker.Entity.JobApplication;
import com.example.jobtracker.Entity.Notification;
import com.example.jobtracker.Entity.NotificationType;
import com.example.jobtracker.Repository.ApplicationRepository;
import com.example.jobtracker.Repository.NotificationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class Scheduler {
    private final ApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 9 * * *", zone = "Australia/Sydney")
    // @Scheduled(fixedRate = 10000)

    @Transactional
    public void processDueFollowUps() {
        LocalDate today = LocalDate.now();
        List<JobApplication> dueApps = applicationRepository.findAllDueFollowUps(today);
        List<Notification> notificationsToSave = new ArrayList<>();
        if (dueApps.isEmpty())
            return;

        for (JobApplication app : dueApps) {
            // Compose and send notification (e.g. email) to user about follow-up
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

        // batch update all notified applications
        applicationRepository.saveAll(dueApps);
    }

}