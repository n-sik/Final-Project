package com.flowenect.hr.security.handler;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;

import com.flowenect.hr.emp.mapper.EmpMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

/**
 * 로그아웃 시점에(세션 invalidate 전에) ACCESS_LOG를 업데이트하기 위한 LogoutHandler.
 *
 * - SecurityConfig.logout().invalidateHttpSession(true) 설정 때문에,
 *   LogoutSuccessHandler에서는 세션 접근이 불가능할 수 있으므로 여기서 처리한다.
 */
@Component
@RequiredArgsConstructor
public class AccessLogLogoutHandler implements LogoutHandler {

    private final EmpMapper empMapper;

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        try {
            HttpSession session = request.getSession(false);
            if (session == null) return;

            Object accessLogNoObj = session.getAttribute("ACCESS_LOG_NO");
            if (accessLogNoObj == null) return;

            Long accessLogNo = null;
            if (accessLogNoObj instanceof Long l) {
                accessLogNo = l;
            } else {
                accessLogNo = Long.parseLong(String.valueOf(accessLogNoObj));
            }

            String logoutIp = extractClientIp(request);
            empMapper.updateAccessLogLogout(accessLogNo, logoutIp, "LOGOUT");

            // 세션 destroy 이벤트에서 TIMEOUT으로 중복 업데이트 되는 것을 방지
            session.removeAttribute("ACCESS_LOG_NO");
        } catch (Exception ignore) {
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();

        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri.trim();

        String ip = request.getRemoteAddr();
        // localhost 개발환경에서 IPv6 loopback이 찍히는 경우 정규화
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) return "127.0.0.1";
        return ip;
    }
}
