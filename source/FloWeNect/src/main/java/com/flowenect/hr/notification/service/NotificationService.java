package com.flowenect.hr.notification.service;

import java.util.List;

import com.flowenect.hr.dto.notification.NotificationDTO;

public interface NotificationService {

    /** DB 저장 + (연결되어 있으면) 실시간 푸시 */
    NotificationDTO createAndPushToUser(NotificationDTO dto);

    /** 전사 알림: DB 저장(사원 수만큼) + 실시간 푸시(연결된 사용자만) */
    int createAndPushToAllEmployees(NotificationDTO template);

    List<NotificationDTO> getSummary(String recvEmpNo, int days, int limit);

    NotificationPage getPage(String recvEmpNo, int months, int page, int size);

    int getUnreadCount(String recvEmpNo, int months);

    boolean markAsRead(String recvEmpNo, Long notiNo);

    int markAllAsRead(String recvEmpNo);

    int cleanupOlderThanMonths(int months);
}
