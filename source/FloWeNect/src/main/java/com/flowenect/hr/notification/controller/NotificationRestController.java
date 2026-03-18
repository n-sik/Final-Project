package com.flowenect.hr.notification.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.notification.NotificationDTO;
import com.flowenect.hr.notification.service.NotificationPage;
import com.flowenect.hr.notification.service.NotificationService;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rest/notifications")
@RequiredArgsConstructor
public class NotificationRestController {

    private final NotificationService notificationService;

    private static String empNo(EmpDTOWrapper principal) {
        return (principal != null && principal.getRealUser() != null)
                ? principal.getRealUser().getEmpNo()
                : null;
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> unreadCount(
            @AuthenticationPrincipal EmpDTOWrapper principal,
            @RequestParam(defaultValue = "3") int months) {

        String recvEmpNo = empNo(principal);
        int cnt = (recvEmpNo == null) ? 0 : notificationService.getUnreadCount(recvEmpNo, months);

        Map<String, Object> res = new HashMap<>();
        res.put("unreadCount", cnt);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/summary")
    public ResponseEntity<List<NotificationDTO>> summary(
            @AuthenticationPrincipal EmpDTOWrapper principal,
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "10") int limit) {

        String recvEmpNo = empNo(principal);
        if (recvEmpNo == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationService.getSummary(recvEmpNo, days, limit));
    }

    @GetMapping("/page")
    public ResponseEntity<NotificationPage> page(
            @AuthenticationPrincipal EmpDTOWrapper principal,
            @RequestParam(defaultValue = "3") int months,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        String recvEmpNo = empNo(principal);
        if (recvEmpNo == null) {
            return ResponseEntity.ok(NotificationPage.builder().list(List.of()).totalCount(0).page(1).size(size).build());
        }
        return ResponseEntity.ok(notificationService.getPage(recvEmpNo, months, page, size));
    }

    @PostMapping("/{notiNo}/read")
    public ResponseEntity<Map<String, Object>> markRead(
            @AuthenticationPrincipal EmpDTOWrapper principal,
            @PathVariable Long notiNo) {

        String recvEmpNo = empNo(principal);
        boolean ok = recvEmpNo != null && notificationService.markAsRead(recvEmpNo, notiNo);

        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllRead(
            @AuthenticationPrincipal EmpDTOWrapper principal) {

        String recvEmpNo = empNo(principal);
        int updated = (recvEmpNo == null) ? 0 : notificationService.markAllAsRead(recvEmpNo);

        Map<String, Object> res = new HashMap<>();
        res.put("updated", updated);
        return ResponseEntity.ok(res);
    }
}
