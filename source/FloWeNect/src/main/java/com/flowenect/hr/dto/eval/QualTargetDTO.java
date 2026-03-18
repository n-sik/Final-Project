package com.flowenect.hr.dto.eval;

import com.flowenect.hr.dto.EmpDTO;

import lombok.Data;

@Data
public class QualTargetDTO extends EmpDTO {
    private String posNm;
    private String deptNm;
    private String evalStatCd;
}