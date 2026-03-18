
package com.flowenect.hr.commons.util;

import java.time.LocalDate;

public class DateUtil {

    /**
     * 현재 연도를 문자열로 반환 (예: "2026")
     */
    public static String getCurrentYear() {
        return String.valueOf(LocalDate.now().getYear());
    }

    /**
     * 현재 반기를 반환 (1~6월: "H1", 7~12월: "H2")
     */
    public static String getCurrentHalf() {
        return (LocalDate.now().getMonthValue() <= 6) ? "H1" : "H2";
    }

    /**
     * 현재 분기를 반환 (정성평가용: "1" 또는 "2")
     */
    public static String getCurrentQuarter() {
        return (LocalDate.now().getMonthValue() <= 6) ? "1" : "2";
    }
}