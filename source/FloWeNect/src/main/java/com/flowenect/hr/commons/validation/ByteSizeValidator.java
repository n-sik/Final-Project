package com.flowenect.hr.commons.validation;

import java.nio.charset.Charset;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ByteSizeValidator implements ConstraintValidator<ByteSize, String> {

    private int min;
    private int max;
    private Charset charset;

    @Override
    public void initialize(ByteSize annotation) {
        this.min = annotation.min();
        this.max = annotation.max();
        this.charset = Charset.forName(annotation.charset());
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // nullable 컬럼은 null이면 통과 (NotNull/NotBlank로 따로 막음)
        if (value == null) {
			return true;
		}

        int byteLen = value.getBytes(charset).length;
        return byteLen >= min && byteLen <= max;
    }
}
