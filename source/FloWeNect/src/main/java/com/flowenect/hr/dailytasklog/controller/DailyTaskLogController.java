package com.flowenect.hr.dailytasklog.controller;

import com.flowenect.hr.dailytasklog.service.DailyTaskLogService;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.security.AuthenticationUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("work/emp")
public class DailyTaskLogController {

    private final DailyTaskLogService service;

    /** 페이지 진입 */
    @GetMapping("/readList")
    public String workForm() {
        return "responsibilities/workForm";
    }

    // ──────────────────────────────────────────
    // REST API
    // ──────────────────────────────────────────

    /**
     * 담당업무 목록 조회 (사이드바 렌더링용)
     * GET /work/emp/tasks
     */
    @GetMapping("/tasks")
    @ResponseBody
    public ResponseEntity<List<DailyTaskLogDTO>> getTaskList(Authentication authentication) {
        String empNo = getAuthenticatedEmpNo(authentication);
        if (empNo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(service.getTaskList(empNo));
    }

    /**
     * 이전 일지 목록 조회 (기간 필터)
     * GET /work/emp/logs?taskNo=1&dateFrom=2025-02-01&dateTo=2025-02-20
     */
    @GetMapping("/logs")
    @ResponseBody
    public ResponseEntity<List<DailyTaskLogDTO>> getLogList(
            @RequestParam Long taskNo,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            Authentication authentication) {

        String empNo = getAuthenticatedEmpNo(authentication);
        if (empNo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        DailyTaskLogDTO param = new DailyTaskLogDTO();
        param.setTaskNo(taskNo);
        param.setEmpNo(empNo);
        param.setDateFrom(dateFrom);
        param.setDateTo(dateTo);

        return ResponseEntity.ok(service.getLogList(param));
    }

    /**
     * 일지 단건 조회
     * GET /work/emp/logs/{taskLogNo}
     */
    @GetMapping("/logs/{taskLogNo}")
    @ResponseBody
    public ResponseEntity<DailyTaskLogDTO> getLog(@PathVariable Long taskLogNo) {
        DailyTaskLogDTO dto = service.getLog(taskLogNo);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    /**
     * 일지 제출 (등록 or 수정 + 진행률 업데이트)
     * POST /work/emp/logs/submit
     * Body: { taskNo, logTitle, logCn, logDivCd, taskStatCd, progressRate }
     */
    @PostMapping("/logs/submit")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> submitLog(
            @RequestBody DailyTaskLogDTO dto,
            Authentication authentication) {

        String empNo = getAuthenticatedEmpNo(authentication);
        if (empNo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        dto.setEmpNo(empNo);
        String action = service.submitLog(dto);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("action", action); // "inserted" | "updated"
        return ResponseEntity.ok(res);
    }

    /**
     * 임시저장
     * POST /work/emp/logs/draft
     */
    @PostMapping("/logs/draft")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveDraft(
            @RequestBody DailyTaskLogDTO dto,
            Authentication authentication) {

        String empNo = getAuthenticatedEmpNo(authentication);
        if (empNo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        dto.setEmpNo(empNo);
        service.saveDraft(dto);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }

    /**
     * 일지 삭제
     * DELETE /work/emp/logs/{taskLogNo}
     */
    @DeleteMapping("/logs/{taskLogNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteLog(
            @PathVariable Long taskLogNo,
            Authentication authentication) {

        String empNo = getAuthenticatedEmpNo(authentication);
        if (empNo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        DailyTaskLogDTO dto = new DailyTaskLogDTO();
        dto.setTaskLogNo(taskLogNo);
        dto.setEmpNo(empNo);
        service.deleteLog(dto);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }
    
    
    @PutMapping("/logs/{taskLogNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLog(
            @PathVariable Long taskLogNo,
            @RequestBody DailyTaskLogDTO dto,
            Authentication authentication) {

        String empNo = getAuthenticatedEmpNo(authentication);
        if (empNo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        dto.setTaskLogNo(taskLogNo);
        dto.setEmpNo(empNo);
        service.updateLog(dto);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }

    private String getAuthenticatedEmpNo(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        try {
            EmpDTO realUser = AuthenticationUtils.getRealUser(authentication);
            return realUser != null ? realUser.getEmpNo() : null;
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
