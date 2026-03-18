package com.flowenect.hr.commons.exception.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.flowenect.hr.commons.exception.eval.EvalException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. 커스텀 비즈니스 예외 처리
	@ExceptionHandler(EvalException.class)
    public ResponseEntity<ErrorResponse> handleEvalException(EvalException e) {
        ErrorCode ec = e.getErrorCode();
        log.warn("🚩 [EvalException] {} : {}", ec.getCode(), e.getMessage());
        
        // ErrorCode의 기본 메시지가 아닌, e.getMessage()를 직접 전달!
        return createResponse(ec, e.getMessage(), e.getDetails());
    }

    // 2. 유효성 검사 예외 처리 (@Valid 실패 시)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidException(MethodArgumentNotValidException e) {
        return createResponse(ErrorCode.INVALID_INPUT_VALUE, e.getBindingResult().getFieldErrors());
    }
    
    // 김형수 추가 2-1. 단순 입력값/정책 위반 예외 처리 (프론트에 메시지 노출)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e) {
        ErrorCode ec = ErrorCode.INVALID_INPUT_VALUE;

        ErrorResponse response = ErrorResponse.builder()
                .status(ec.getStatus().value())
                .code(ec.getCode())
                .message(e.getMessage())
                .details(null)
                .build();

        return new ResponseEntity<>(response, ec.getStatus());
    }

 // 3. 최상위 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        // 원인이 EvalException인지 꼼꼼히 체크
        Throwable cause = e.getCause();
        if (cause instanceof EvalException evalEx) {
            return handleEvalException(evalEx);
        }
        if (e instanceof EvalException evalEx) { // 본인이 EvalException인 경우 대비
            return handleEvalException(evalEx);
        }

        log.error("❌ 미처리 예외 발생: ", e);
        return createResponse(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage(), null);
    }

    // [핵심 수정] 메시지를 외부에서 주입받을 수 있도록 변경
    private ResponseEntity<ErrorResponse> createResponse(ErrorCode ec, String message, Object details) {
        ErrorResponse response = ErrorResponse.builder()
                .status(ec.getStatus().value())
                .code(ec.getCode())
                // 파라미터로 받은 message가 있으면 쓰고, 없으면 ErrorCode 기본값 사용
                .message(message != null ? message : ec.getMessage())
                .details(details)
                .build();
        return new ResponseEntity<>(response, ec.getStatus());
    }
    
    // 기존 MethodArgumentNotValidException 등에서도 사용하기 위해 오버로딩 유지
    private ResponseEntity<ErrorResponse> createResponse(ErrorCode ec, Object details) {
        return createResponse(ec, ec.getMessage(), details);
    }
}