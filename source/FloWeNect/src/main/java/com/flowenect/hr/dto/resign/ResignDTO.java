package com.flowenect.hr.dto.resign;

import java.sql.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResignDTO {
    // ── APRV_DOC ──────────────────────────────────
    private String aprvNo;          // 결재문서번호 (PK, 처리 기준)
    private String formCd;          // 양식코드 (RETIRE 고정)
    private Date   submitDtm;       // 상신일시
    private Date   finalDtm;        // 최종확정일시
    private String statCd;          // 문서상태코드 (APPROVED/COMPLETED/REJECTED)
    private String docWrtrEmpNm;    // 기안자명
    private String docWrtrPosCd;    // 기안자 직위
    private String docWrtrDeptCd;   // 기안자 부서

    // ── APRV_RETIRE ───────────────────────────────
    private String retrNo;          // 퇴직신청번호
    private String empNo;           // 대상 사원번호
    private Date   expRetrDt;       // 퇴사예정일자
    private String retrRsn;         // 퇴사사유
    private Date   reqDtm;          // 신청일시

    // ── EMP JOIN ──────────────────────────────────
    private String empNm;           // 사원명 (EMP.EMP_NM)
    private String deptCd;          // 부서코드 (EMP.DEPT_CD)
    private String posCd;           // 직위코드 (EMP.POS_CD)
}