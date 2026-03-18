package com.flowenect.hr.notification.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.notification.NotificationDTO;
import com.flowenect.hr.notification.mapper.NotificationMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final int DEFAULT_MONTHS_SCOPE = 3;

    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public NotificationDTO createAndPushToUser(NotificationDTO dto) {
        if (dto == null || dto.getRecvEmpNo() == null || dto.getRecvEmpNo().isBlank()) {
            throw new IllegalArgumentException("recvEmpNo is required");
        }

        notificationMapper.insertNotification(dto);

        // 실시간 푸시는 연결된 사용자만 자동 수신. 연결 없으면 조용히 스킵됨.
        try {
            messagingTemplate.convertAndSendToUser(
                    dto.getRecvEmpNo(),
                    "/queue/notifications",
                    dto
            );
        } catch (Exception e) {
            log.debug("WebSocket push skipped/failed for empNo={}, reason={}", dto.getRecvEmpNo(), e.getMessage());
        }
        return dto;
    }

    @Override
    @Transactional
    public int createAndPushToAllEmployees(NotificationDTO template) {
        if (template == null) {
            return 0;
        }

        List<String> empNos = notificationMapper.selectAllActiveEmpNos();
        if (empNos == null || empNos.isEmpty()) {
            return 0;
        }

        int success = 0;
        List<String> failed = new ArrayList<>();

        for (String empNo : empNos) {
            NotificationDTO dto = NotificationDTO.builder()
                    .recvEmpNo(empNo)
                    .notiTypeCd(template.getNotiTypeCd())
                    .notiCn(template.getNotiCn())
                    .srcTypeCd(template.getSrcTypeCd())
                    .srcNo(template.getSrcNo())
                    .moveUrl(template.getMoveUrl())
                    .readYn("N")
                    .build();
            try {
                createAndPushToUser(dto);
                success++;
            } catch (Exception e) {
                failed.add(empNo);
            }
        }

        if (!failed.isEmpty()) {
            log.warn("createAndPushToAllEmployees partial failures: {}", failed.size());
        }
        return success;
    }

    @Override
    public List<NotificationDTO> getSummary(String recvEmpNo, int days, int limit) {
        int safeDays = Math.max(1, days);
        int safeLimit = Math.min(Math.max(1, limit), 50);
        return notificationMapper.selectRecentSummary(recvEmpNo, safeDays, safeLimit);
    }

    @Override
    public NotificationPage getPage(String recvEmpNo, int months, int page, int size) {
        int safeMonths = Math.max(1, months);
        int safePage = Math.max(1, page);
        int safeSize = Math.min(Math.max(5, size), 50);
        int offset = (safePage - 1) * safeSize;

        int total = notificationMapper.selectNotificationCount(recvEmpNo, safeMonths);
        List<NotificationDTO> list = notificationMapper.selectNotificationPage(recvEmpNo, safeMonths, offset, safeSize);

        return NotificationPage.builder()
                .list(list)
                .totalCount(total)
                .page(safePage)
                .size(safeSize)
                .build();
    }

    @Override
    public int getUnreadCount(String recvEmpNo, int months) {
        int safeMonths = months > 0 ? months : DEFAULT_MONTHS_SCOPE;
        return notificationMapper.selectUnreadCount(recvEmpNo, safeMonths);
    }

    @Override
    @Transactional
    public boolean markAsRead(String recvEmpNo, Long notiNo) {
        if (notiNo == null) return false;
        return notificationMapper.markAsRead(notiNo, recvEmpNo) > 0;
    }

    @Override
    @Transactional
    public int markAllAsRead(String recvEmpNo) {
        return notificationMapper.markAllAsRead(recvEmpNo);
    }

    @Override
    @Transactional
    public int cleanupOlderThanMonths(int months) {
        int safeMonths = Math.max(1, months);
        return notificationMapper.deleteOlderThanMonths(safeMonths);
    }
}
