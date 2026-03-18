package com.flowenect.hr.security.handler;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import com.flowenect.hr.security.jwt.CookieBearerTokenResolver;
import com.flowenect.hr.security.jwt.JwtProvider;
import com.flowenect.hr.security.jwt.TokenRevocationStore;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

    private final TokenRevocationStore tokenRevocationStore;
    private final JwtProvider jwtProvider;

    public CustomLogoutSuccessHandler(TokenRevocationStore tokenRevocationStore, JwtProvider jwtProvider) {
        this.tokenRevocationStore = tokenRevocationStore;
        this.jwtProvider = jwtProvider;
    }

    @Override
    public void onLogoutSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        try {
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if (CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
                        String token = cookie.getValue();
                        String jti = jwtProvider.extractJti(token);
                        Long exp = jwtProvider.extractExpEpochSeconds(token);
                        if (jti != null && exp != null) {
                            tokenRevocationStore.revoke(jti, exp);
                        }
                        break;
                    }
                }
            }
        } catch (Exception ignore) {
        }

        boolean secure = JwtProvider.isSecureRequest(request);
        response.addHeader("Set-Cookie", jwtProvider.createExpiredAccessTokenCookieValue(secure));

        response.sendRedirect(request.getContextPath() + "/login");
    }
}