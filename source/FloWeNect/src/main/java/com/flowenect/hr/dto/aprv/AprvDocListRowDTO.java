package com.flowenect.hr.dto.aprv;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 전자결재 목록 화면 전용 Row DTO
 * - APRV_DOC(문서) + 코드/양식 조인 + 화면표시용 가공 컬럼
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AprvDocListRowDTO {

    private long aprvNo;        // PK (표시도 숫자 그대로)
    private String formNm;

    private String aprvTtl;

    private String docStatCd;
    private String docStatNm;

    private String stepText;    // 예: 1/3
    private String regDt;       // YYYY-MM-DD
    private String lastProcDt;  // YYYY-MM-DD
}
