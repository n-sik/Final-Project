package com.flowenect.hr.dto.transfer;

import java.sql.Date;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferDTO {

    private String aprvNo;
    private Date submitDtm;
    private String empNo;
    private String docWrtrEmpNm;
    private String apptTypeCd;
    private String befDeptCd;	 // 변경전 부서 
    private String aftDeptCd; 	 // 변경 후 부서 
    private String befPosCd;
    private String aftPosCd;
    private Date effectiveDt;
    private String statCd;
    private String drafter; 
    private String reason;
    private String targetEmpNo;     // ★ 발령 대상 사원번호 (APRV_APPOINTMENT.TARGET_EMP_NO)
    private String targetEmpNm;
}
