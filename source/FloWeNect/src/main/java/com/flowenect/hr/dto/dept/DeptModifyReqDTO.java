package com.flowenect.hr.dto.dept;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DeptModifyReqDTO {

    private String deptCd;          // PK (변경 불가, 식별용)
    private String upDeptCd;        // 상위부서 (nullable)
    private String deptTypeCd;      // FK
    private String deptHeadEmpNo;   // 수정 시 NULL 허용(공석)
    private String deptNm;
    private String deptLoc;
    private String deptTel;

    /**
     * delYn: N/Y (복구도 modify에서 처리)
     */
    private String delYn;
}