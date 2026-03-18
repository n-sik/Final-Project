package com.flowenect.hr.commons.exception.eval;

import com.flowenect.hr.commons.exception.common.ErrorCode;

import lombok.Getter;

@Getter
public class EvalException extends RuntimeException {
    private final ErrorCode errorCode;
    private final Object details;
    
    public EvalException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.details = null;
    }

    public EvalException(ErrorCode errorCode, Object details) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = details;
    }
}