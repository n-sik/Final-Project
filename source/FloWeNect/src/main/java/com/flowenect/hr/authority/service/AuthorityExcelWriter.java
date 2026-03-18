package com.flowenect.hr.authority.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

import com.flowenect.hr.dto.authority.AuthorityEmpRowDTO;

public final class AuthorityExcelWriter {

    private AuthorityExcelWriter() {
    }

    public static byte[] write(List<AuthorityEmpRowDTO> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("사원권한");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle bodyStyle = createBodyStyle(workbook);

            String[] headers = {
                "번호", "부서", "직위", "사원명", "사원번호", "부서권한", "직급권한", "계정 활성"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            if (rows != null) {
                for (int i = 0; i < rows.size(); i++) {
                    AuthorityEmpRowDTO rowData = rows.get(i);
                    Row row = sheet.createRow(i + 1);
                    writeCell(row, 0, i + 1, bodyStyle);
                    writeCell(row, 1, valueOrDash(rowData.getDeptNm()), bodyStyle);
                    writeCell(row, 2, valueOrDash(rowData.getPosNm()), bodyStyle);
                    writeCell(row, 3, valueOrDash(rowData.getEmpNm()), bodyStyle);
                    writeCell(row, 4, valueOrDash(rowData.getEmpNo()), bodyStyle);
                    writeCell(row, 5, valueOrDash(firstText(rowData.getDeptRoleNm(), rowData.getDeptRoleCd())), bodyStyle);
                    writeCell(row, 6, valueOrDash(firstText(rowData.getPosRoleNm(), rowData.getPosRoleCd())), bodyStyle);
                    writeCell(row, 7, valueOrDash(rowData.getAcntActNm()), bodyStyle);
                }
            }

            int[] widths = {8, 18, 14, 12, 14, 18, 18, 12};
            for (int i = 0; i < widths.length; i++) {
                sheet.setColumnWidth(i, widths[i] * 256);
            }

            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, headers.length - 1));

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("사원 권한 Excel 생성 중 오류가 발생했습니다.", e);
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

    private static String valueOrDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private static String firstText(String first, String second) {
        if (first != null && !first.isBlank()) return first;
        return second;
    }
}
