package com.flowenect.hr.commons.exception;

public class PkNotFoundException extends RuntimeException{

	public PkNotFoundException() {
		super();
	}

	public PkNotFoundException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
		super(message, cause, enableSuppression, writableStackTrace);
	}

	public PkNotFoundException(String message, Throwable cause) {
		super(message, cause);
	}

	public PkNotFoundException(String message) {
		super(message);
	}

	public PkNotFoundException(Throwable cause) {
		super(cause);
	}

}
