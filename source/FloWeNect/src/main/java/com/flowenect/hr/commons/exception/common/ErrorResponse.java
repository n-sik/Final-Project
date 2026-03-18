package com.flowenect.hr.commons.exception.common;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ErrorResponse {

	@Builder.Default // 현재 시간으로 초기화하기 위해 권장
	private final LocalDateTime timestamp = LocalDateTime.now();
	private final int status;
	private final String code;
	private final String message;
	private final Object details;

}
