package com.flowenect.hr.dto.eval;

import java.util.List;

import lombok.Data;

@Data
public class QualEvalMasterDTO {
	private String evalCd;
    private String deptCd;
    private String evalItemNm;
    private String useYn;

    private List<QualEvalRubricDTO> rubrics;
}
