package com.flowenect.hr.payroll.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

/**
 * 급여명세서 이메일 발송
 * - 메일 설정이 없는 환경에서도 서버가 죽지 않도록 try/catch + 로그 처리
 * - Excel/PDF를 같은 메일에 함께 첨부 가능
 */
@Service
@RequiredArgsConstructor
public class PayrollMailService {

  private static final Logger log = LoggerFactory.getLogger(PayrollMailService.class);

  private final JavaMailSender mailSender;

  /** 기본 발신자(보통 Gmail 계정). 설정이 없으면 JavaMailSender 기본값에 맡김 */
  @Value("${spring.mail.username:}")
  private String defaultFrom;

  public void sendPayrollPdf(String to, String subject, String body, byte[] pdfBytes, String filename) {
    Map<String, byte[]> atts = new LinkedHashMap<>();
    atts.put(filename, pdfBytes);
    sendPayrollAttachments(to, subject, body, atts);
  }

  public void sendPayrollExcel(String to, String subject, String body, byte[] xlsxBytes, String filename) {
    Map<String, byte[]> atts = new LinkedHashMap<>();
    atts.put(filename, xlsxBytes);
    sendPayrollAttachments(to, subject, body, atts);
  }

  /** Excel + PDF 동시 발송 */
  public void sendPayrollExcelAndPdf(
      String to,
      String subject,
      String body,
      byte[] xlsxBytes,
      String xlsxFilename,
      byte[] pdfBytes,
      String pdfFilename
  ) {
    Map<String, byte[]> atts = new LinkedHashMap<>();
    // 순서 보장: Excel 먼저, PDF 다음
    atts.put(xlsxFilename, xlsxBytes);
    atts.put(pdfFilename, pdfBytes);
    sendPayrollAttachments(to, subject, body, atts);
  }

  /** 여러 첨부파일을 하나의 메일로 발송 */
  public void sendPayrollAttachments(String to, String subject, String body, Map<String, byte[]> attachments) {
    if (to == null || to.isBlank()) {
      log.warn("[PAYROLL] 이메일 주소가 없어 발송을 건너뜁니다.");
      return;
    }
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      if (defaultFrom != null && !defaultFrom.isBlank()) {
        // Gmail SMTP는 보통 username 계정으로 From 설정하는게 안전
        helper.setFrom(defaultFrom);
      }
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(body, false);

      if (attachments != null) {
        for (Map.Entry<String, byte[]> e : attachments.entrySet()) {
          String filename = e.getKey();
          byte[] bytes = e.getValue();
          if (bytes == null || bytes.length == 0) continue;
          if (filename == null || filename.isBlank()) filename = "attachment";
          helper.addAttachment(filename, new ByteArrayResource(bytes));
        }
      }

      mailSender.send(message);
      log.info("[PAYROLL] 급여명세서 메일 발송 완료: {}", to);
    } catch (Exception e) {
      log.error("[PAYROLL] 급여명세서 메일 발송 실패: {}", to, e);
    }
  }
}
