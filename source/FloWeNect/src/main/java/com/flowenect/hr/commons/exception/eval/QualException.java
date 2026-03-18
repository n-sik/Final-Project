package com.flowenect.hr.commons.exception.eval;

import com.flowenect.hr.commons.exception.common.ErrorCode;
import com.flowenect.hr.dto.eval.QualTargetDTO;

public class QualException extends EvalException {
	
	public QualException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

	public QualException(ErrorCode errorCode, Object details) {
        super(errorCode, details);
    }

	public QualException(QualTargetDTO dto) {
        super(ErrorCode.ALREADY_EXISTS, dto);
    }
}
