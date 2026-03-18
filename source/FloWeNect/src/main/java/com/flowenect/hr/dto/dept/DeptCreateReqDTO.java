package com.flowenect.hr.dto.dept;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DeptCreateReqDTO {

    private String deptCd;          // PK
    private String upDeptCd;        // 상위부서 (nullable)
    private String deptTypeCd;      // FK (부서종류)
    private String deptHeadEmpNo;   // FK (등록 시 필수)
    private String deptNm;          // 부서명
    private String deptLoc;         // 위치
    private String deptTel;         // 대표전화
}