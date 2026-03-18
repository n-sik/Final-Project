package com.flowenect.hr.security.handler;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.accesslog.AccessLogDTO;
import com.flowenect.hr.emp.mapper.EmpMapper;
import com.flowenect.hr.security.auth.EmpDTOWrapper;
import com.flowenect.hr.security.jwt.JwtProvider;
import com.nimbusds.jwt.SignedJWT;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final EmpMapper empMapper;
    private final JwtProvider jwtProvider;

    @Value("${server.servlet.session.timeout}")
    private Duration sessionTimeout;

    public CustomAuthenticationSuccessHandler(@Lazy EmpMapper empMapper, JwtProvider jwtProvider) {
        this.empMapper = empMapper;
        this.jwtProvider = jwtProvider;
        setDefaultTargetUrl("/");
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        String jwt = jwtProvider.generateJwt(authentication);

        Object principal = authentication.getPrincipal();

        log.info("[LOGIN-SUCCESS] sessionId={}, authClass={}, principalClass={}, authorities={}",
                request.getSession(false) != null ? request.getSession(false).getId() : "NO_SESSION",
                authentication != null ? authentication.getClass().getName() : "NULL",
                principal != null ? principal.getClass().getName() : "NULL",
                authentication != null
                        ? authentication.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.joining(", "))
                        : "NULL");

        if (principal instanceof EmpDTOWrapper wrapper) {

            HttpSession session = request.getSession();
            session.setAttribute("LOGIN_EMP_NO", wrapper.getRealUser().getEmpNo());
            session.setAttribute("LOGIN_EMP_NM", wrapper.getRealUser().getEmpNm());
            session.setAttribute("LOGIN_DEPT_CD", wrapper.getRealUser().getDeptCd());
            session.setAttribute("LOGIN_POS_CD", wrapper.getRealUser().getPosCd());
            String posCd = wrapper.getRealUser().getPosCd();
            String posNm = switch (posCd != null ? posCd : "") {
                case "POS_06" -> "대표";
                case "POS_05" -> "부장";
                case "POS_04" -> "차장";
                case "POS_03" -> "과장";
                case "POS_02" -> "대리";
                case "POS_07" -> "주임";
                case "POS_01" -> "사원";
                default -> "";
            };
            session.setAttribute("LOGIN_POS_NM", posNm);

            String deptCd = wrapper.getRealUser().getDeptCd();
            String deptNm = switch (deptCd != null ? deptCd : "") {
            case "2026HR01" -> "인사부서";
            case "2026PD01" -> "생산제조부서";
            case "2026DV01" -> "개발1부서";
            case "2026DV02" -> "개발2부서";
            case "2026PM01" -> "서비스기획부서";
            case "2026CS01" -> "고객지원부서";
            case "2026MK01" -> "마케팅부서";
            case "2026SL01" -> "영업부서";
            default -> "기타부서";
            };
            session.setAttribute("LOGIN_DEPT_NM", deptNm);

            try {
                String empNo = wrapper.getRealUser().getEmpNo();
                String loginIp = extractClientIp(request);
                String loginUa = request.getHeader("User-Agent");

                DeptDTO deptInfo = empMapper.selectDeptInfoByEmpNo(empNo);
                String deptNmForLog = (deptInfo != null && deptInfo.getDeptNm() != null)
                        ? deptInfo.getDeptNm()
                        : (String) session.getAttribute("LOGIN_DEPT_NM");
                String deptCdForLog = (deptInfo != null && deptInfo.getDeptCd() != null)
                        ? deptInfo.getDeptCd()
                        : wrapper.getRealUser().getDeptCd();

                SignedJWT parsed = SignedJWT.parse(jwt);
                String jti = parsed.getJWTClaimsSet().getJWTID();
                LocalDateTime expDtm = LocalDateTime.ofInstant(
                        parsed.getJWTClaimsSet().getExpirationTime().toInstant(),
                        ZoneId.systemDefault());

                Integer sessionTimeoutSec = null;
                if (sessionTimeout != null) {
                    sessionTimeoutSec = Math.toIntExact(sessionTimeout.getSeconds());
                }

                AccessLogDTO log = new AccessLogDTO();
                log.setEmpNo(empNo);
                log.setEmpNm(wrapper.getRealUser().getEmpNm());
                log.setDeptCd(deptCdForLog);
                log.setDeptNm(deptNmForLog);
                log.setPosCd(wrapper.getRealUser().getPosCd());
                log.setAuthChannel("FORM");
                log.setTokenStoreCd("HTTPONLY_COOKIE");
                log.setLoginIp(loginIp);
                log.setLoginUa(loginUa);
                log.setSessionTimeoutSec(sessionTimeoutSec);
                log.setTokenJti(jti);
                log.setTokenExpDtm(expDtm);

                empMapper.insertAccessLog(log);
                session.setAttribute("ACCESS_LOG_NO", log.getAccessLogNo());
            } catch (Exception ignore) {
            }
        }

        boolean secure = JwtProvider.isSecureRequest(request);
        response.addHeader("Set-Cookie", jwtProvider.createAccessTokenCookieValue(jwt, secure));

        super.onAuthenticationSuccess(request, response, authentication);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) {
            return xri.trim();
        }
        String ip = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) return "127.0.0.1";
        return ip;
    }
}
