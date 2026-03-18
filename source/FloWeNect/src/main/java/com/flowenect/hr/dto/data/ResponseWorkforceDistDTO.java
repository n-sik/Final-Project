package com.flowenect.hr.dto.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 인력 분포 현황 전용 DTO
 * 차트 데이터(부서명 위주)와 상세 리스트 조회에 최적화
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ResponseWorkforceDistDTO {

    // 1. 기본 정보
    private String empNo;      // 사번 (식별자)
    private String empNm;      // 성명

    // 2. 부서 정보 (코드 대신 명칭 위주)
    private String deptCd;     // 부서코드 (필터링용)
    private String deptNm;     // 부서명 (차트 표시용 - 핵심!)

    // 3. 직급 및 상태 정보
    private String posCd;      // 직급코드
    private String posNm;      // 직급명 (과장, 대리 등)
    private String empStatCd;  // 상태코드
    private String empStatNm;  // 상태명 (재직, 휴직 등)

    // 4. 기타 화면 표시용
    private String hireDt;     // 입사일 (YYYY-MM-DD 형식으로 가공)
}