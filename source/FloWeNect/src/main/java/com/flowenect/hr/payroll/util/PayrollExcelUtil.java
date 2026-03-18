package com.flowenect.hr.payroll.util;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.PrintSetup;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.RegionUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.flowenect.hr.dto.payroll.PayrollDetailDTO;
import com.flowenect.hr.dto.payroll.PayrollItemDTO;

/**
 * 급여명세서 Excel(xlsx) 생성 유틸
 * - 확정 시 메일 첨부 및 다운로드에 사용
 *
 * 의존성: org.apache.poi:poi-ooxml:5.3.0
 */
public class PayrollExcelUtil {

  private PayrollExcelUtil() {}

  public static byte[] toXlsx(PayrollDetailDTO detail) {
    try (Workbook wb = new XSSFWorkbook();
         ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

      Sheet sheet = wb.createSheet("급여명세서");

      // ===== Print / Layout (문서처럼) =====
      PrintSetup ps = sheet.getPrintSetup();
      ps.setPaperSize(PrintSetup.A4_PAPERSIZE);
      ps.setLandscape(false);
      sheet.setFitToPage(true);
      ps.setFitWidth((short) 1);
      ps.setFitHeight((short) 1);
      sheet.setHorizontallyCenter(true);

      // ===== Styles (문서형) =====
      Styles st = new Styles(wb);

      // ===== Column widths (A,B, gap(C), D,E) =====
      sheet.setColumnWidth(0, 18 * 256); // 항목/라벨
      sheet.setColumnWidth(1, 16 * 256); // 값/금액
      sheet.setColumnWidth(2, 3 * 256);  // 간격
      sheet.setColumnWidth(3, 18 * 256);
      sheet.setColumnWidth(4, 16 * 256);

      int r = 0;

      // ===== Title =====
      Row titleRow = sheet.createRow(r++);
      titleRow.setHeightInPoints(28);
      Cell t = titleRow.createCell(0);
      t.setCellValue("급여명세서");
      t.setCellStyle(st.title);
      merge(sheet, 0, 0, 0, 4);

      // ===== Meta (2x2 형태로 3행 구성) =====
      String extracted = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
      String payYm   = nvl(detail == null ? null : detail.getPayYyyymm());
      String empNm   = nvl(detail == null ? null : detail.getEmpNm());
      String deptNm  = nvl(detail == null ? null : detail.getDeptNm());
      String posNm   = nvl(detail == null ? null : detail.getPosNm());
      String created = nvl(detail == null ? null : detail.getCreatedDtm());

      r++; // 한 줄 띄움

      // 메타 박스: (A:B) + (D:E)
      r = metaPairRow(sheet, r, st, "급여월", payYm, "사원명", empNm);
      r = metaPairRow(sheet, r, st, "부서", deptNm, "직위", posNm);
      r = metaPairRow(sheet, r, st, "생성일시", created, "추출일시", extracted);

      // 메타 테두리(박스)
      setBoxBorder(sheet, r - 3, r - 1, 0, 1);
      setBoxBorder(sheet, r - 3, r - 1, 3, 4);

      r++; // 한 줄 띄움

      // ===== Items: split PAY / DEDUCT side-by-side =====
      List<PayrollItemDTO> items = (detail == null) ? null : detail.getItems();
      List<RowData> pays = new ArrayList<>();
      List<RowData> deds = new ArrayList<>();

      long totalPay = 0L;
      long totalDeduct = 0L;

      if (items != null) {
        for (PayrollItemDTO it : items) {
          if (it == null) continue;
          String type = normalizeType(it.getItemTypeCd());
          if ("TOTAL".equalsIgnoreCase(type)) continue;

          long amt = it.getAmount() == null ? 0L : it.getAmount();
          String nm = nvl(it.getItemName());

          if ("PAY".equalsIgnoreCase(type)) {
            pays.add(new RowData(nm, amt));
            totalPay += amt;
          } else if ("DEDUCT".equalsIgnoreCase(type)) {
            deds.add(new RowData(nm, amt));
            totalDeduct += amt;
          }
        }
      }

      // 섹션 타이틀 (박스 헤더)
      Row secRow = sheet.createRow(r++);
      secRow.setHeightInPoints(20);
      merge(sheet, r - 1, r - 1, 0, 1);
      Cell payTitle = secRow.createCell(0);
      payTitle.setCellValue("[지급]");
      payTitle.setCellStyle(st.boxTitle);

      merge(sheet, r - 1, r - 1, 3, 4);
      Cell dedTitle = secRow.createCell(3);
      dedTitle.setCellValue("[공제]");
      dedTitle.setCellStyle(st.boxTitle);

      // gap
      Cell gap = secRow.createCell(2);
      gap.setCellValue("");
      gap.setCellStyle(st.gap);

      // 본문 행 수: 최대 항목 수 + 합계 1줄
      int lines = Math.max(pays.size(), deds.size());
      int bodyLines = Math.max(lines, 6); // 너무 적으면 박스가 허전해서 최소 6줄

      int bodyStart = r;

      for (int i = 0; i < bodyLines; i++) {
        Row row = sheet.createRow(r++);
        row.setHeightInPoints(18);

        // 지급
        if (i < pays.size()) {
          setString(row, 0, pays.get(i).name, st.text);
          setLong(row, 1, pays.get(i).amount, st.money);
        } else {
          setString(row, 0, "", st.text);
          setBlank(row, 1, st.money);
        }

        // gap
        setString(row, 2, "", st.gap);

        // 공제
        if (i < deds.size()) {
          setString(row, 3, deds.get(i).name, st.text);
          setLong(row, 4, deds.get(i).amount, st.money);
        } else {
          setString(row, 3, "", st.text);
          setBlank(row, 4, st.money);
        }
      }

      // 합계 행
      Row totalRow = sheet.createRow(r++);
      totalRow.setHeightInPoints(20);
      setString(totalRow, 0, "지급총액", st.sumLabel);
      setLong(totalRow, 1, totalPay, st.sumMoney);
      setString(totalRow, 2, "", st.gap);
      setString(totalRow, 3, "공제합계", st.sumLabel);
      setLong(totalRow, 4, totalDeduct, st.sumMoney);

      int boxEnd = r - 1;

      // 지급/공제 박스 테두리
      setBoxBorder(sheet, bodyStart - 1, boxEnd, 0, 1);
      setBoxBorder(sheet, bodyStart - 1, boxEnd, 3, 4);

      r++; // 한 줄 띄움

      // 실지급액
      long net = totalPay - totalDeduct;
      Row netRow = sheet.createRow(r++);
      netRow.setHeightInPoints(22);
      setString(netRow, 0, "실지급액", st.sumLabel);
      merge(sheet, r - 1, r - 1, 1, 4);
      Cell netCell = netRow.createCell(1);
      netCell.setCellValue(net);
      netCell.setCellStyle(st.netMoney);
      // 병합된 영역 빈칸 스타일 통일
      for (int c = 2; c <= 4; c++) {
        Cell cc = netRow.createCell(c);
        cc.setCellStyle(st.netMoney);
      }
      setBoxBorder(sheet, r - 1, r - 1, 0, 4);

      // 첫 화면 보기 좋게
      sheet.setDisplayGridlines(false);

      wb.write(bos);
      return bos.toByteArray();

    } catch (Exception e) {
      return new byte[0];
    }
  }

  // ===== Helpers / Styles =====

  private static class RowData {
    final String name;
    final long amount;
    RowData(String name, long amount) {
      this.name = name;
      this.amount = amount;
    }
  }

  private static class Styles {
    final CellStyle title;
    final CellStyle label;
    final CellStyle value;
    final CellStyle boxTitle;
    final CellStyle text;
    final CellStyle money;
    final CellStyle sumLabel;
    final CellStyle sumMoney;
    final CellStyle netMoney;
    final CellStyle gap;

    Styles(Workbook wb) {
      BorderStyle thin = BorderStyle.THIN;
      DataFormat df = wb.createDataFormat();

      Font fTitle = wb.createFont();
      fTitle.setBold(true);
      fTitle.setFontHeightInPoints((short) 18);

      Font fBold = wb.createFont();
      fBold.setBold(true);

      Font fNormal = wb.createFont();
      fNormal.setFontHeightInPoints((short) 11);

      title = wb.createCellStyle();
      title.setFont(fTitle);
      title.setAlignment(HorizontalAlignment.CENTER);
      title.setVerticalAlignment(VerticalAlignment.CENTER);

      label = wb.createCellStyle();
      label.setFont(fBold);
      label.setAlignment(HorizontalAlignment.LEFT);
      label.setVerticalAlignment(VerticalAlignment.CENTER);
      label.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
      label.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      setAllBorders(label, thin);

      value = wb.createCellStyle();
      value.setFont(fNormal);
      value.setAlignment(HorizontalAlignment.LEFT);
      value.setVerticalAlignment(VerticalAlignment.CENTER);
      setAllBorders(value, thin);

      boxTitle = wb.createCellStyle();
      boxTitle.setFont(fBold);
      boxTitle.setAlignment(HorizontalAlignment.LEFT);
      boxTitle.setVerticalAlignment(VerticalAlignment.CENTER);
      boxTitle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
      boxTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
      setAllBorders(boxTitle, thin);

      text = wb.createCellStyle();
      text.setFont(fNormal);
      text.setAlignment(HorizontalAlignment.LEFT);
      text.setVerticalAlignment(VerticalAlignment.CENTER);
      setAllBorders(text, thin);

      money = wb.createCellStyle();
      money.cloneStyleFrom(text);
      money.setAlignment(HorizontalAlignment.RIGHT);
      money.setDataFormat(df.getFormat("#,##0"));

      sumLabel = wb.createCellStyle();
      sumLabel.cloneStyleFrom(label);

      sumMoney = wb.createCellStyle();
      sumMoney.cloneStyleFrom(money);
      sumMoney.setFont(fBold);

      netMoney = wb.createCellStyle();
      netMoney.cloneStyleFrom(money);
      Font fNet = wb.createFont();
      fNet.setBold(true);
      fNet.setFontHeightInPoints((short) 14);
      netMoney.setFont(fNet);

      gap = wb.createCellStyle();
      gap.setFont(fNormal);
      gap.setAlignment(HorizontalAlignment.CENTER);
      gap.setVerticalAlignment(VerticalAlignment.CENTER);
    }
  }

  private static void setAllBorders(CellStyle st, BorderStyle border) {
    st.setBorderTop(border);
    st.setBorderBottom(border);
    st.setBorderLeft(border);
    st.setBorderRight(border);
  }

  private static int metaPairRow(Sheet sheet, int r, Styles st,
                                String l1, String v1,
                                String l2, String v2) {
    Row row = sheet.createRow(r++);
    row.setHeightInPoints(20);
    setString(row, 0, l1, st.label);
    setString(row, 1, v1, st.value);
    setString(row, 2, "", st.gap);
    setString(row, 3, l2, st.label);
    setString(row, 4, v2, st.value);
    return r;
  }

  private static void merge(Sheet sheet, int r1, int r2, int c1, int c2) {
    sheet.addMergedRegion(new CellRangeAddress(r1, r2, c1, c2));
  }

  private static void setBoxBorder(Sheet sheet, int r1, int r2, int c1, int c2) {
    CellRangeAddress region = new CellRangeAddress(r1, r2, c1, c2);
    RegionUtil.setBorderTop(BorderStyle.THIN, region, sheet);
    RegionUtil.setBorderBottom(BorderStyle.THIN, region, sheet);
    RegionUtil.setBorderLeft(BorderStyle.THIN, region, sheet);
    RegionUtil.setBorderRight(BorderStyle.THIN, region, sheet);
  }

  private static void setString(Row row, int col, String v, CellStyle style) {
    Cell c = row.getCell(col);
    if (c == null) c = row.createCell(col);
    c.setCellValue(v == null ? "" : v);
    if (style != null) c.setCellStyle(style);
  }

  private static void setLong(Row row, int col, long v, CellStyle style) {
    Cell c = row.getCell(col);
    if (c == null) c = row.createCell(col);
    c.setCellValue(v);
    if (style != null) c.setCellStyle(style);
  }

  private static void setBlank(Row row, int col, CellStyle style) {
    Cell c = row.getCell(col);
    if (c == null) c = row.createCell(col);
    c.setBlank();
    if (style != null) c.setCellStyle(style);
  }

  private static String nvl(Object o) {
    return o == null ? "" : String.valueOf(o);
  }

  private static String normalizeType(String raw) {
    if (raw == null) return "PAY";
    String s = raw.trim();
    String u = s.toUpperCase();
    if ("PAY".equals(u) || "지급".equals(s)) return "PAY";
    if ("DEDUCT".equals(u) || "공제".equals(s) || "DED".equals(u)) return "DEDUCT";
    if ("TOTAL".equals(u) || "합계".equals(s)) return "TOTAL";
    return "PAY";
  }

  private static String displayType(String type) {
    if ("PAY".equalsIgnoreCase(type)) return "지급";
    if ("DEDUCT".equalsIgnoreCase(type)) return "공제";
    return type == null ? "" : type;
  }
}