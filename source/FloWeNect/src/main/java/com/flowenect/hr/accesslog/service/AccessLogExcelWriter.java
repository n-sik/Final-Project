package com.flowenect.hr.accesslog.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.flowenect.hr.dto.accesslog.AccessLogDTO;

public final class AccessLogExcelWriter {

    private static final DateTimeFormatter DTM_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private AccessLogExcelWriter() {
    }

    public static byte[] write(List<AccessLogDTO> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("접속이력");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle bodyStyle = createBodyStyle(workbook);

            String[] headers = {
                "번호", "로그 번호", "상태", "종료유형", "부서", "직위", "사원명", "사원번호",
                "로그인 시각", "로그아웃 시각", "접속 IP", "로그아웃 IP", "체류 시간",
                "세션 정책", "세션 만료 예정", "접속 종료 예정", "남은 시간", "User-Agent"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            if (rows != null) {
                for (int i = 0; i < rows.size(); i++) {
                    AccessLogDTO rowData = rows.get(i);
                    Row row = sheet.createRow(i + 1);
                    writeCell(row, 0, i + 1, bodyStyle);
                    writeCell(row, 1, rowData.getAccessLogNo(), bodyStyle);
                    writeCell(row, 2, statusLabel(rowData.getStatusCd()), bodyStyle);
                    writeCell(row, 3, reasonLabel(rowData.getLogoutReason()), bodyStyle);
                    writeCell(row, 4, valueOrDash(rowData.getDeptNm()), bodyStyle);
                    writeCell(row, 5, valueOrDash(rowData.getPosNm() != null ? rowData.getPosNm() : rowData.getPosCd()), bodyStyle);
                    writeCell(row, 6, valueOrDash(rowData.getEmpNm()), bodyStyle);
                    writeCell(row, 7, valueOrDash(rowData.getEmpNo()), bodyStyle);
                    writeCell(row, 8, formatDateTime(rowData.getLoginDtm()), bodyStyle);
                    writeCell(row, 9, formatDateTime(rowData.getLogoutDtm()), bodyStyle);
                    writeCell(row, 10, valueOrDash(rowData.getLoginIp()), bodyStyle);
                    writeCell(row, 11, valueOrDash(rowData.getLogoutIp()), bodyStyle);
                    writeCell(row, 12, formatMinutes(rowData.getStayMin()), bodyStyle);
                    writeCell(row, 13, formatTimeoutSec(rowData.getSessionTimeoutSec()), bodyStyle);
                    writeCell(row, 14, formatDateTime(rowData.getSessionExpDtm()), bodyStyle);
                    writeCell(row, 15, formatDateTime(rowData.getAccessExpireDtm()), bodyStyle);
                    writeCell(row, 16, formatMinutes(rowData.getExpireRemainMin()), bodyStyle);
                    writeCell(row, 17, valueOrDash(rowData.getLoginUa()), bodyStyle);
                }
            }

            int[] widths = {8, 12, 12, 14, 18, 12, 12, 14, 22, 22, 18, 18, 14, 14, 22, 22, 14, 50};
            for (int i = 0; i < widths.length; i++) {
                sheet.setColumnWidth(i, widths[i] * 256);
            }

            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, headers.length - 1));

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("접속 이력 Excel 생성 중 오류가 발생했습니다.", e);
        }
    }

    private static void writeCell(Row row, int cellIndex, Object value, CellStyle style) {
        Cell cell = row.createCell(cellIndex);
        if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else {
            cell.setCellValue(value == null ? "-" : String.valueOf(value));
        }
        cell.setCellStyle(style);
    }

    private static CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private static CellStyle createBodyStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private static String formatDateTime(LocalDateTime value) {
        return value == null ? "-" : value.format(DTM_FORMATTER);
    }

    private static String formatMinutes(Long value) {
        if (value == null) return "-";
        long minutes = value;
        if (minutes < 0) return Math.abs(minutes) + "분 경과";
        if (minutes < 60) return minutes + "분";
        long hour = minutes / 60;
        long remain = minutes % 60;
        return remain > 0 ? hour + "시간 " + remain + "분" : hour + "시간";
    }

    private static String formatTimeoutSec(Integer value) {
        if (value == null || value <= 0) return "-";
        int minutes = value / 60;
        if (minutes < 60) return minutes + "분";
        int hour = minutes / 60;
        int remain = minutes % 60;
        return remain > 0 ? hour + "시간 " + remain + "분" : hour + "시간";
    }

    private static String valueOrDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private static String statusLabel(String value) {
        if (value == null || value.isBlank()) return "-";
        return "ACTIVE".equals(value) ? "접속중" : "접속종료";
    }

    private static String reasonLabel(String value) {
        if (value == null || value.isBlank()) return "-";
        if ("LOGOUT".equals(value)) return "로그아웃";
        if ("TIMEOUT".equals(value)) return "세션 만료";
        if ("FORCE".equals(value)) return "강제 종료";
        if ("UNKNOWN".equals(value)) return "기타";
        return value;
    }
}
