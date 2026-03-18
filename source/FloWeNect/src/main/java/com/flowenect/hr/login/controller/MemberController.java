package com.flowenect.hr.login.controller;


import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.login.FindEmpNoRequestDTO;
import com.flowenect.hr.dto.login.ResetPasswordRequestDTO;
import com.flowenect.hr.login.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

	private final MemberService memberService;

    /**
     * 사번 찾기
     * POST /api/member/find-empno
     * Body: { "name": "홍길동", "email": "hong@company.com" }
     */
    @PostMapping("/find-empno")
    public ResponseEntity<Map<String, Object>> findEmpNo(
            @RequestBody FindEmpNoRequestDTO dto) {

        Map<String, Object> result = new HashMap<>();

        try {
            String empNo = memberService.findEmpNo(dto.getName(), dto.getEmail());

            if (empNo == null) {
                result.put("success", false);
                result.put("message", "입력하신 정보와 일치하는 사원을 찾을 수 없습니다.");
                return ResponseEntity.status(404).body(result);
            }

            result.put("success", true);
            result.put("empNo", empNo);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("사번 찾기 오류: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            return ResponseEntity.status(500).body(result);
        }
    }

    /**
     * 비밀번호 찾기 (임시 비밀번호 발급 + 이메일 발송)
     * POST /api/member/reset-password
     * Body: { "empNo": "2025001", "name": "홍길동", "email": "hong@company.com" }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestBody ResetPasswordRequestDTO dto) {

        Map<String, Object> result = new HashMap<>();

        try {
            memberService.resetPassword(dto.getEmpNo(), dto.getName(), dto.getEmail());

            result.put("success", true);
            result.put("message", "임시 비밀번호가 이메일로 발송되었습니다.");
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            // 사원 정보 불일치
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.status(404).body(result);

        } catch (Exception e) {
            log.error("비밀번호 초기화 오류: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            return ResponseEntity.status(500).body(result);
        }
    }

}