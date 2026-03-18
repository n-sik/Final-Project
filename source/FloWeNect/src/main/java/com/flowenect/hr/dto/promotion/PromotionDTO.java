package com.flowenect.hr.dto.promotion;

import java.sql.Date;

import com.flowenect.hr.dto.EmpDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO extends EmpDTO{
    // ── APRV_DOC ──────────────────────────────────
    private String aprvNo;          // 결재문서번호
    private Date   submitDtm;       // 상신일시
    private String empNo;           // 기안자 사원번호
    private String docWrtrEmpNm;    // 기안자명
    private String docWrtrPosCd;    // 기안자 직위
    private String drafter;         // 기안자명 + 직위 (조회용 concat)
    private String statCd;          // 문서상태코드
    private Date   finalDtm;        // 최종확정일시

    // ── APRV_PROMOTION ────────────────────────────
    private String targetEmpNo;     // 승진 대상 사원번호
    private String targetPosCd;     // 승진 적용 직위코드
    private Date   effectiveDtm;    // 발효일시
    private String reason;          // 사유

    // ── EMP JOIN ──────────────────────────────────
    private String targetEmpNm;     // 승진 대상 사원명 (EMP.EMP_NM)
    private String currentPosCd;    // 현재 직위코드   (EMP.POS_CD)
    
   
}