package com.flowenect.hr.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

public class AuthenticationUtils {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static EmpDTO getRealUser(Authentication authentication) {
        if (authentication instanceof UsernamePasswordAuthenticationToken) {
            EmpDTOWrapper principal = (EmpDTOWrapper) authentication.getPrincipal();
            return principal.getRealUser();

        } else if (authentication instanceof JwtAuthenticationToken) {
            Jwt jwt = (Jwt) authentication.getPrincipal();

            Object realUserClaim = jwt.getClaim("realUser");

            // JWT에는 최소 정보만 들어있으므로 EmpDTO 필드 중 일부만 채워져도 정상
            return mapper.convertValue(realUserClaim, EmpDTO.class);

        } else {
            throw new IllegalArgumentException(
                    "현재 인증객체(%s)에는 realUser를 꺼낼 수 없음"
                            .formatted(authentication.getClass().getSimpleName())
            );
        }
    }
}
