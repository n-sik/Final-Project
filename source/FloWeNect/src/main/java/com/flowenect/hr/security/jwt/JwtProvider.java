package com.flowenect.hr.security.jwt;

import java.time.Instant;
import java.util.Date;
import java.util.Map;

import org.springframework.http.ResponseCookie;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

@Component
public class JwtProvider {

    @Value("${jwt.secret-key}")
    private String sharedSecret;
    
    @Value("${jwt.expire-ms}")
    private long VALIDTIME_MS;

    // 30분
//    private final long VALIDTIME_MS = 30L * 60L * 1000L;

    public long getValidtimeMs() {
        return VALIDTIME_MS;
    }

    public String createAccessTokenCookieValue(String token, boolean secure) {
        return ResponseCookie.from(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE)
                .value(token)
                .path("/")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .maxAge(VALIDTIME_MS / 1000)
                .build()
                .toString();
    }

    public String createExpiredAccessTokenCookieValue(boolean secure) {
        return ResponseCookie.from(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE)
                .value("")
                .path("/")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .maxAge(0)
                .build()
                .toString();
    }

    public String extractJti(String token) {
        try {
            return SignedJWT.parse(token).getJWTClaimsSet().getJWTID();
        } catch (Exception e) {
            return null;
        }
    }

    public Long extractExpEpochSeconds(String token) {
        try {
            Date expirationTime = SignedJWT.parse(token).getJWTClaimsSet().getExpirationTime();
            return expirationTime == null ? null : expirationTime.toInstant().getEpochSecond();
        } catch (Exception e) {
            return null;
        }
    }

    public static boolean isSecureRequest(jakarta.servlet.http.HttpServletRequest request) {
        if (request.isSecure()) {
            return true;
        }

        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        if (forwardedProto != null && "https".equalsIgnoreCase(forwardedProto)) {
            return true;
        }

        String forwardedSsl = request.getHeader("X-Forwarded-Ssl");
        return forwardedSsl != null && "on".equalsIgnoreCase(forwardedSsl);
    }

    public String generateJwt(Authentication authentication) {
        EmpDTOWrapper principal = (EmpDTOWrapper) authentication.getPrincipal();
        EmpDTO realUser = principal.getRealUser();

        // JWT에 “필요 최소 정보”만 넣는 걸 권장 (민감정보/과다정보 금지)
        Map<String, Object> realUserClaim = Map.of(
                "empNo", realUser.getEmpNo(),
                "empNm", realUser.getEmpNm(),
                "deptCd", realUser.getDeptCd(),
                "posCd", realUser.getPosCd()
        );

        try {
            JWSSigner signer = new MACSigner(sharedSecret.getBytes());

            Date now = new Date();
            Date exp = new Date(now.getTime() + VALIDTIME_MS);
            
            String jti = java.util.UUID.randomUUID().toString();

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
            		.jwtID(jti)	// JWT에 jti (토큰 ID)를 넣어줌 -> 로그아웃 시 토큰을 무효화 하기 위해
                    .subject(authentication.getName()) // sub = empNo
                    .claim("roles", authentication.getAuthorities().stream().map(a -> a.getAuthority()).toList())
                    .claim("realUser", realUserClaim)
                    .issueTime(now)
                    .expirationTime(exp)
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
            signedJWT.sign(signer);

            return signedJWT.serialize();

        } catch (JOSEException e) {
            throw new RuntimeException("JWT 서명 실패", e);
        }
    }
}
