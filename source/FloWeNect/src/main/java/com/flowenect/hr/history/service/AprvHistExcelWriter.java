package com.flowenect.hr.history.service;

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
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.flowenect.hr.dto.history.AprvHistDetailDTO;

public final class AprvHistExcelWriter {

    private AprvHistExcelWriter() {
    }

    public static byte[] write(List<AprvHistDetailDTO> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("전자결재이력");
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle bodyStyle = createBodyStyle(workbook);

            String[] headers = {
                    "번호", "문서번호", "상신일자", "결재양식", "기안자", "작성부서", "작성직위",
                    "문서제목", "문서상태", "최종확정일", "HR 반영 여부", "상태메모", "문서내용"
            };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            if (rows != null) {
                for (int i = 0; i < rows.size(); i++) {
                    AprvHistDetailDTO rowData = rows.get(i);
                    Row row = sheet.createRow(i + 1);
                    writeCell(row, 0, i + 1, bodyStyle);
                    writeCell(row, 1, rowData.getAprvNo(), bodyStyle);
                    writeCell(row, 2, rowData.getSubmitDtm(), bodyStyle);
                    writeCell(row, 3, rowData.getFormNm(), bodyStyle);
                    writeCell(row, 4, rowData.getEmpNm(), bodyStyle);
                    writeCell(row, 5, rowData.getDocWrtrDeptNm(), bodyStyle);
                    writeCell(row, 6, rowData.getDocWrtrPosNm(), bodyStyle);
                    writeCell(row, 7, rowData.getAprvTtl(), bodyStyle);
                    writeCell(row, 8, valueOrDash(rowData.getStatNm(), rowData.getStatCd()), bodyStyle);
                    writeCell(row, 9, rowData.getFinalDtm(), bodyStyle);
                    writeCell(row, 10, valueOrDash(rowData.getHrApplyNm(), rowData.getHrApplyYn()), bodyStyle);
                    writeCell(row, 11, rowData.getDocStatCmt(), bodyStyle);
                    writeCell(row, 12, rowData.getAprvCn(), bodyStyle);
                }
            }

            int[] widths = {8, 12, 14, 18, 14, 18, 14, 30, 14, 14, 14, 28, 50};
            for (int i = 0; i < widths.length; i++) {
                sheet.setColumnWidth(i, widths[i] * 256);
            }
            sheet.createFreezePane(0, 1);
            sheet.setAutoFilter(new CellRangeAddress(0, 0, 0, headers.length - 1));
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("전자결재 이력 Excel 생성 중 오류가 발생했습니다.", e);
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

    private static String valueOrDash(String preferred, String fallback) {
        if (preferred != null && !preferred.isBlank()) {
            return preferred;
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        return "-";
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
        style.setWrapText(true);
        return style;
    }
}
