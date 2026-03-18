package com.flowenect.hr.dto.accesslog;

import java.time.LocalDateTime;

import lombok.Data;

/**
 * 사용자 접속/인증 이력 DTO
 *
 * 운영 정책 변경 반영:
 * - 인증 토큰은 HttpOnly access_token 쿠키 기반
 * - JSP 세션과 토큰 만료 예정 시각을 함께 조회 가능
 * - 부서/직위는 조회 시점이 아닌 로그인 시점 스냅샷 기준으로 보관
 */
@Data
public class AccessLogDTO {
    // PK
    private Long accessLogNo;

    // 사용자 스냅샷
    private String empNo;
    private String empNm;
    private String deptCd;
    private String deptNm;
    private String posCd;
    private String posNm;

    // 로그인 유형
    private String authChannel;    // FORM / REST_JWT / BRIDGE_JWT(구데이터)
    private String tokenStoreCd;   // HTTPONLY_COOKIE

    // 로그인
    private String loginIp;
    private String loginUa;
    private LocalDateTime loginDtm;

    // 세션/토큰 정책 스냅샷
    private Integer sessionTimeoutSec;
    private LocalDateTime sessionExpDtm;
    private String tokenJti;
    private LocalDateTime tokenExpDtm;
    private LocalDateTime accessExpireDtm;

    // 로그아웃(또는 세션 종료)
    private String logoutIp;
    private LocalDateTime logoutDtm;
    private String logoutReason;   // LOGOUT / TIMEOUT / FORCE / UNKNOWN

    // 화면 계산 필드
    private Long stayMin;
    private String activeYn;       // Y / N
    private String statusCd;       // ACTIVE / ENDED
    private Long tokenRemainMin;
    private Long sessionRemainMin;
    private Long expireRemainMin;
}
