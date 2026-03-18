package com.flowenect.hr.security.jwt;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.accesslog.AccessLogDTO;
import com.flowenect.hr.emp.mapper.EmpMapper;
import com.flowenect.hr.security.auth.EmpDTOWrapper;
import com.nimbusds.jwt.SignedJWT;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class RestAuthenticateController {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final EmpMapper empMapper;

    @PostMapping("/api/authenticate")
    public ResponseEntity<?> restAuthenticate(HttpServletRequest request, @RequestBody @Valid RestAuthDTO authDTO) {
        UsernamePasswordAuthenticationToken inputToken =
                UsernamePasswordAuthenticationToken.unauthenticated(authDTO.getUsername(), authDTO.getPassword());

        try {
            Authentication authentication = authenticationManager.authenticate(inputToken);

            String token = jwtProvider.generateJwt(authentication);

            try {
                String empNo = authentication.getName();
                EmpDTOWrapper principal = (EmpDTOWrapper) authentication.getPrincipal();
                String empNm = principal.getRealUser().getEmpNm();
                String posCd = principal.getRealUser().getPosCd();

                DeptDTO deptInfo = empMapper.selectDeptInfoByEmpNo(empNo);
                String deptCd = (deptInfo != null) ? deptInfo.getDeptCd() : principal.getRealUser().getDeptCd();
                String deptNm = (deptInfo != null) ? deptInfo.getDeptNm() : null;

                SignedJWT parsed = SignedJWT.parse(token);
                String jti = parsed.getJWTClaimsSet().getJWTID();
                LocalDateTime expDtm = LocalDateTime.ofInstant(
                        parsed.getJWTClaimsSet().getExpirationTime().toInstant(),
                        ZoneId.systemDefault()
                );

                AccessLogDTO log = new AccessLogDTO();
                log.setEmpNo(empNo);
                log.setEmpNm(empNm);
                log.setDeptCd(deptCd);
                log.setDeptNm(deptNm);
                log.setPosCd(posCd);
                log.setAuthChannel("REST_JWT");
                log.setTokenStoreCd("HTTPONLY_COOKIE");
                log.setTokenJti(jti);
                log.setTokenExpDtm(expDtm);
                log.setLoginIp(extractClientIp(request));
                log.setLoginUa(request.getHeader("User-Agent"));

                empMapper.insertAccessLog(log);
            } catch (Exception ignore) {
            }

            boolean secure = JwtProvider.isSecureRequest(request);
            String accessTokenCookie = jwtProvider.createAccessTokenCookieValue(token, secure);

            return ResponseEntity.noContent()
                    .header(HttpHeaders.SET_COOKIE, accessTokenCookie)
                    .build();

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri.trim();
        String ip = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) return "127.0.0.1";
        return ip;
    }
}
