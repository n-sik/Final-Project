package com.flowenect.hr.behavior.util;

public class BehaviorUtil {

	private BehaviorUtil() {};

	// ===== helpers =====
	public static boolean isPersistedId(String id) {
		return id != null && id.matches("^\\d+$");
	}

}
