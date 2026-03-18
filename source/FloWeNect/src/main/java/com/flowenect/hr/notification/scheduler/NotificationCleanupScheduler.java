package com.flowenect.hr.notification.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.flowenect.hr.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanupScheduler {

    private final NotificationService notificationService;

    /**
     * 알림 보관 정책: 최근 3개월만 보관
     * - 매일 새벽 03:10 실행
     */
    @Scheduled(cron = "0 10 3 * * *")
    public void cleanupOldNotifications() {
        int deleted = notificationService.cleanupOlderThanMonths(3);
        if (deleted > 0) {
            log.info("[NOTI] cleanup deleted {} rows", deleted);
        }
    }
}
