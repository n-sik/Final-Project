package com.flowenect.hr.payroll.service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.flowenect.hr.dto.payroll.PayrollDetailDTO;
import com.flowenect.hr.dto.payroll.PayrollItemDTO;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

@Service
public class PayrollPdfService {

    private static final DateTimeFormatter DTF =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] renderPdf(PayrollDetailDTO d) {
        String xhtml = buildXhtml(d);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            // ✅ classpath: src/main/resources/static/fonts/*.ttf
            ensureFontExists("/static/fonts/NanumGothic.ttf");
            ensureFontExists("/static/fonts/NanumGothicBold.ttf");

            // ✅ 폰트는 Supplier에서 매번 새 스트림으로 열기(중요)
            builder.useFont(() -> getClass().getResourceAsStream("/static/fonts/NanumGothic.ttf"), "NanumGothic");
            builder.useFont(() -> getClass().getResourceAsStream("/static/fonts/NanumGothicBold.ttf"), "NanumGothicBold");

            // fast-mode는 켜져도 되지만, 폰트/레이아웃 이슈 시 꺼두는 게 안전
            // builder.useFastMode();

            builder.withHtmlContent(xhtml, null);
            builder.toStream(baos);
            builder.run();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("급여명세서 PDF 생성에 실패했습니다.", e);
        }
    }

    private void ensureFontExists(String classpath) {
        try (var is = getClass().getResourceAsStream(classpath)) {
            if (is == null) {
                throw new IllegalStateException("폰트 파일을 찾을 수 없습니다: " + classpath);
            }
        } catch (Exception e) {
            if (e instanceof IllegalStateException) throw (IllegalStateException) e;
            throw new IllegalStateException("폰트 파일 확인 중 오류: " + classpath, e);
        }
    }

    private String buildXhtml(PayrollDetailDTO d) {
        NumberFormat nf = NumberFormat.getInstance(Locale.KOREA);

        // 지급/공제 상세 리스트 구성
        List<Row> payRows = new ArrayList<>();
        List<Row> dedRows = new ArrayList<>();

        long paySum = 0L;
        long dedSum = 0L;

        if (d != null && d.getItems() != null) {
            for (PayrollItemDTO i : d.getItems()) {
                if (i == null) continue;

                String type = normalizeType(safe(i.getItemTypeCd()));
                if ("TOTAL".equalsIgnoreCase(type)) continue;

                String name = safe(i.getItemName());
                long amt = (i.getAmount() == null) ? 0L : i.getAmount();

                if ("PAY".equalsIgnoreCase(type)) {
                    payRows.add(new Row(name, amt));
                    paySum += amt;
                } else if ("DEDUCT".equalsIgnoreCase(type)) {
                    dedRows.add(new Row(name, amt));
                    dedSum += amt;
                }
            }
        }

        long net = paySum - dedSum;

        String payYyyymm = escape(safe(d == null ? null : d.getPayYyyymm()));
        String empNm     = escape(safe(d == null ? null : d.getEmpNm()));
        String deptNm    = escape(safe(d == null ? null : d.getDeptNm()));
        String posNm     = escape(safe(d == null ? null : d.getPosNm()));
        String created   = escape(safe(d == null ? null : d.getCreatedDtm()));
        String extracted = escape(LocalDateTime.now().format(DTF));

        String payTable = buildItemsTable(payRows, nf);
        String dedTable = buildItemsTable(dedRows, nf);

        // ✅ XHTML: 맨 앞 공백/개행 없이 시작
        StringBuilder sb = new StringBuilder(14000);

        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")
          .append("<!DOCTYPE html>")
          .append("<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"ko\">")
          .append("<head>")
          .append("<meta charset=\"UTF-8\"/>")
          .append("<style>")
          .append("@page { size: A4; margin: 16mm 14mm; }")
          .append("body { font-family:'NanumGothic', sans-serif; font-size:11px; color:#111827; }")
          .append("b, strong { font-family:'NanumGothicBold','NanumGothic',sans-serif; font-weight:700; }")
          .append(".title { text-align:center; font-size:18px; font-weight:700; margin: 0 0 12px 0; }")

          // 메타
          .append(".meta { width:100%; border-collapse:collapse; border:1px solid #111; }")
          .append(".meta th, .meta td { border:1px solid #111; padding:6px 7px; }")
          .append(".meta th { background:#f3f4f6; text-align:left; width:90px; }")

          // 2컬럼
          .append(".twoCol { width:100%; border-collapse:collapse; margin-top: 12px; }")
          .append(".twoCol td { vertical-align:top; width:50%; }")
          .append(".box { border:1px solid #111; padding:8px; }")
          .append(".boxTitle { font-weight:700; margin:0 0 6px 0; }")

          // items table
          .append(".items { width:100%; border-collapse:collapse; }")
          .append(".items th, .items td { border:1px solid #111; padding:6px; }")
          .append(".items th { background:#f9fafb; }")
          .append(".right { text-align:right; }")
          .append(".muted { color:#6b7280; }")

          // summary
          .append(".summary { width:100%; border-collapse:collapse; border:1px solid #111; margin-top: 12px; }")
          .append(".summary th, .summary td { border:1px solid #111; padding:7px; }")
          .append(".summary th { background:#f3f4f6; text-align:left; width:110px; }")
          .append(".net { font-size:13px; font-weight:700; }")

          .append(".note { margin-top: 10px; font-size:10px; color:#6b7280; }")
          .append("</style>")
          .append("</head>")
          .append("<body>");

        sb.append("<div class=\"title\"><strong>급여명세서</strong></div>");

        // 메타 테이블
        sb.append("<table class=\"meta\">")
          .append("<tr>")
          .append("<th>급여월</th><td>").append(payYyyymm).append("</td>")
          .append("<th>사원명</th><td>").append(empNm).append("</td>")
          .append("</tr>")
          .append("<tr>")
          .append("<th>부서</th><td>").append(deptNm).append("</td>")
          .append("<th>직위</th><td>").append(posNm).append("</td>")
          .append("</tr>")
          .append("<tr>")
          .append("<th>생성일시</th><td>").append(created).append("</td>")
          .append("<th>추출일시</th><td>").append(extracted).append("</td>")
          .append("</tr>")
          .append("</table>");

        // 지급/공제 상세
        sb.append("<table class=\"twoCol\">")
          .append("<tr>");

        sb.append("<td style=\"padding-right:6px;\">")
          .append("<div class=\"box\">")
          .append("<div class=\"boxTitle\">[지급]</div>")
          .append(payTable)
          .append("</div>")
          .append("</td>");

        sb.append("<td style=\"padding-left:6px;\">")
          .append("<div class=\"box\">")
          .append("<div class=\"boxTitle\">[공제]</div>")
          .append(dedTable)
          .append("</div>")
          .append("</td>");

        sb.append("</tr>")
          .append("</table>");

        // 합계
        sb.append("<table class=\"summary\">")
          .append("<tr>")
          .append("<th>지급총액</th><td class=\"right\">").append(escape(nf.format(paySum))).append("</td>")
          .append("<th>공제합계</th><td class=\"right\">").append(escape(nf.format(dedSum))).append("</td>")
          .append("</tr>")
          .append("<tr>")
          .append("<th>실지급액</th><td class=\"right net\" colspan=\"3\"><strong>")
          .append(escape(nf.format(net)))
          .append("</strong></td>")
          .append("</tr>")
          .append("</table>");

        sb.append("<div class=\"note\">본 급여명세서는 시스템에서 자동 생성되었습니다.</div>");

        sb.append("</body></html>");
        return sb.toString();
    }

    private String buildItemsTable(List<Row> rows, NumberFormat nf) {
        StringBuilder sb = new StringBuilder(2048);

        sb.append("<table class=\"items\">")
          .append("<thead>")
          .append("<tr><th>항목</th><th class=\"right\" style=\"width:120px;\">금액</th></tr>")
          .append("</thead><tbody>");

        if (rows == null || rows.isEmpty()) {
            sb.append("<tr><td colspan=\"2\" class=\"muted\" style=\"text-align:center;\">(없음)</td></tr>");
        } else {
            for (Row r : rows) {
                sb.append("<tr>")
                  .append("<td>").append(escape(safe(r.name))).append("</td>")
                  .append("<td class=\"right\">").append(escape(nf.format(r.amount))).append("</td>")
                  .append("</tr>");
            }
        }

        sb.append("</tbody></table>");
        return sb.toString();
    }

    private static class Row {
        final String name;
        final long amount;
        Row(String name, long amount) {
            this.name = name;
            this.amount = amount;
        }
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String normalizeType(String raw) {
        if (raw == null) return "";
        String s = raw.trim();
        String u = s.toUpperCase();
        if ("PAY".equals(u) || "지급".equals(s)) return "PAY";
        if ("DEDUCT".equals(u) || "공제".equals(s) || "DED".equals(u)) return "DEDUCT";
        if ("TOTAL".equals(u) || "합계".equals(s)) return "TOTAL";
        return u;
    }
}