package com.flowenect.hr.aprv.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class PdfFileNameUtil {

    private PdfFileNameUtil() {}

    public static String buildPdfFileName(long aprvNo) {
        // 예: aprv_12345_20260211_173012.pdf
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return "aprv_" + aprvNo + "_" + ts + ".pdf";
    }
}
