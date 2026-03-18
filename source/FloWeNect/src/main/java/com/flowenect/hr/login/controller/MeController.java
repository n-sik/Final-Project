package com.flowenect.hr.login.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.security.AuthenticationUtils;

@RestController
@RequestMapping("/api")
public class MeController {

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("인증되지 않은 사용자");
        }

        EmpDTO user = AuthenticationUtils.getRealUser(authentication);

        return ResponseEntity.ok(Map.of(
                "empNo", user.getEmpNo(),
                "empNm", user.getEmpNm(),
                "deptCd", user.getDeptCd(),
                "posCd", user.getPosCd()
        ));
    }
}