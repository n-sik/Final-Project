package com.flowenect.hr.commons.validation;

import jakarta.validation.Payload;

public @interface ByteSize {

	 String message() default "바이트 길이가 제한을 초과했습니다.";

	    int min() default 0;
	    int max();

	    /**
	     * 바이트 계산 charset. 실무에선 UTF-8 고정이 가장 흔함.
	     */
	    String charset() default "UTF-8";

	    Class<?>[] groups() default {};
	    Class<? extends Payload>[] payload() default {};
}
