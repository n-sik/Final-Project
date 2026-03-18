package com.flowenect.hr.security.jwt;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class TokenRevocationStore {

    // key: jti
    // value: expEpochSeconds
    private final Map<String, Long> revoked = new ConcurrentHashMap<>();

    public void revoke(String jti, long expEpochSeconds) {
        if (jti == null || jti.isBlank()) return;
        revoked.put(jti, expEpochSeconds);
    }

    public boolean isRevoked(String jti) {
        if (jti == null || jti.isBlank()) return false;

        Long exp = revoked.get(jti);
        if (exp == null) return false;

        long now = Instant.now().getEpochSecond();

        // 만료 시간이 지났으면 자동 정리
        if (now >= exp) {
            revoked.remove(jti);
            return false;
        }

        return true;
    }
}