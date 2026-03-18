package com.flowenect.hr.commons.exception.common;

import org.springframework.http.HttpStatus;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // [COMMON]
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "올바르지 않은 입력값입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C002", "서버 내부 오류가 발생했습니다."),

    // [EVALUATION]
    ALREADY_EXISTS(HttpStatus.CONFLICT, "E001", "이미 해당 분기의 평가를 완료한 사원입니다."),
    NOT_IN_PERIOD(HttpStatus.FORBIDDEN, "E002", "현재는 평가 가능 기간이 아닙니다."),
    TARGET_NOT_FOUND(HttpStatus.NOT_FOUND, "E003", "평가 대상 사원 정보를 찾을 수 없습니다."),

    // [추가]
    NOT_FOUND(HttpStatus.NOT_FOUND, "E004", "평가할 수 있는 데이터가 부족합니다."); 

    private final HttpStatus status;
    private final String code;
    private final String message;
}