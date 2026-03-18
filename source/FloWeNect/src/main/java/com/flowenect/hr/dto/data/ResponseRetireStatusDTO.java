package com.flowenect.hr.dto.data;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ResponseRetireStatusDTO {
    // 1. APRV_DOC (공통 결재 정보)
    private String aprvNo;
    private String docWrtrEmpNm;  // 기안자 이름
    private String docWrtrDeptCd; // 기안자 부서 코드
    private String deptNm;         // 부서 이름
    private String statCd;         // 결재 상태
    private LocalDateTime submitDtm; // 신청일

    // 2. APRV_RETIRE (퇴직 상세 정보)
    private String empNo;          // 퇴직 대상 사번
    private String expRetrDt;      // 퇴직 예정일
    private String retrRsn;        // 퇴직 사유
    private String procStatCd;     // 퇴직 처리 상태
}
