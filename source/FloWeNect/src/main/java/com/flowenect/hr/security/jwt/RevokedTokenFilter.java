package com.flowenect.hr.security.jwt;

import java.io.IOException;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RevokedTokenFilter extends OncePerRequestFilter {

    private final JwtDecoder jwtDecoder;
    private final TokenRevocationStore store;
    private final CookieBearerTokenResolver cookieBearerTokenResolver;

    public RevokedTokenFilter(JwtDecoder jwtDecoder, TokenRevocationStore store, CookieBearerTokenResolver cookieBearerTokenResolver) {
        this.jwtDecoder = jwtDecoder;
        this.store = store;
        this.cookieBearerTokenResolver = cookieBearerTokenResolver;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = resolveToken(request);
        if (StringUtils.hasText(token)) {
            try {
                Jwt jwt = jwtDecoder.decode(token); // 서명검증 포함
                String jti = jwt.getId();
                if (store.isRevoked(jti)) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            } catch (Exception ignore) {
                // 서명/만료 오류 등은 기존 ResourceServer 흐름에서 처리되게 둠
            }
        }


        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return cookieBearerTokenResolver.resolve(request);
    }
}