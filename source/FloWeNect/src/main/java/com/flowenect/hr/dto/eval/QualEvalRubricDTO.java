package com.flowenect.hr.dto.eval;

import lombok.Data;

@Data
public class QualEvalRubricDTO {
	private int rubricSeq;
	private String evalCd;
	private int evalScore;
	private String scoreDesc;
}