package com.flowenect.hr.dto.retirestatus;

import lombok.Data;

@Data // Getter, Setter, ToString 자동 생성
public class ResponseRetireDeptSummary {
    private String deptNm;          // 부서명
    private String docWrtrDeptCd;   // 부서코드
    private int totalCount;         // 총 건수
    private int pendingCount;       // 대기 건수 (SUBMITTED)
    private int approvedCount;      // 승인 건수 (APPROVED)
    private int rejectedCount;      // 반려 건수 (REJECTED)
}