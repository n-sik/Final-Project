package com.flowenect.hr.web;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.emp.mapper.EmpMapper;
import com.flowenect.hr.security.AuthenticationUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 모든 View(JSP)에서 로그인 사용자 정보를 사용할 수 있도록 Model에 주입한다.
 *
 * - loginUser     : EmpDTO (realUser)
 * - loginUserJson : EmpDTO를 JSON 문자열로 직렬화한 값
 *
 * 주의:
 * - realUser를 그대로 프론트에 노출하므로(요청사항), 민감 필드가 포함될 수 있음.
 *   필요 시 EmpDTO 직렬화 설정/필드 제한을 고려할 것.
 */
@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class LoginUserModelAdvice {

    private final ObjectMapper objectMapper;
    private final EmpMapper empMapper;

    @ModelAttribute("loginUser")
    public EmpDTO loginUser(Authentication authentication) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken || !authentication.isAuthenticated()) {
            return null;
        }
        try {
            return AuthenticationUtils.getRealUser(authentication);
        } catch (Exception e) {
            log.debug("Failed to resolve loginUser(realUser): {}", e.getMessage());
            return null;
        }
    }


    @ModelAttribute("loginDeptNm")
    public String loginDeptNm(Authentication authentication) {
        EmpDTO user = loginUser(authentication);
        if (user == null || user.getEmpNo() == null || user.getEmpNo().isBlank()) return null;
        try {
            DeptDTO deptInfo = empMapper.selectDeptInfoByEmpNo(user.getEmpNo());
            return (deptInfo != null) ? deptInfo.getDeptNm() : null;
        } catch (Exception e) {
            log.debug("Failed to resolve loginDeptNm: {}", e.getMessage());
            return null;
        }
    }

    @ModelAttribute("loginUserJson")
    public String loginUserJson(Authentication authentication) {
        EmpDTO user = loginUser(authentication);
        if (user == null) return "null";
        try {
            return objectMapper.writeValueAsString(user);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize loginUser to JSON. Falling back to null. err={}", e.getMessage());
            return "null";
        }
    }
}
