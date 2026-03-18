package com.flowenect.hr.login.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.from-name:Flowenect HR System}")
    private String fromName;

    /**
     * 임시 비밀번호 안내 이메일 발송 (비동기)
     */
    @Async
    public void sendTempPasswordEmail(String toEmail, String name, String tempPw) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("[Flowenect] 임시 비밀번호 안내");
            helper.setText(buildTempPasswordHtml(name, tempPw), true); // true = HTML

            mailSender.send(message);
            log.info("임시 비밀번호 이메일 발송 완료: {}", toEmail);

        } catch (MessagingException e) {
            log.error("이메일 발송 실패 - to: {}, error: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("이메일 발송 중 오류가 발생했습니다.", e);
        } catch (Exception e) {
            log.error("이메일 발송 실패 - to: {}, error: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("이메일 발송 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * HTML 이메일 템플릿
     */
    private String buildTempPasswordHtml(String name, String tempPw) {
        return """
            <!DOCTYPE html>
            <html lang="ko">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background:#f5f6fb;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f6fb;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="520" cellpadding="0" cellspacing="0"
                           style="background:#ffffff;border-radius:20px;overflow:hidden;
                                  box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                      <!-- 헤더 -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#4b49ac,#7b79d4);
                                   padding:36px 40px;text-align:center;">
                          <p style="margin:0;font-size:22px;font-weight:700;color:#fff;
                                    letter-spacing:0.5px;">
                            🔐 Flowenect
                          </p>
                          <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">
                            HR Management Platform
                          </p>
                        </td>
                      </tr>

                      <!-- 본문 -->
                      <tr>
                        <td style="padding:40px 40px 32px;">
                          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a1a2e;">
                            안녕하세요, %s님 👋
                          </p>
                          <p style="margin:0 0 28px;font-size:14px;color:#8b8fa8;line-height:1.7;">
                            임시 비밀번호가 발급되었습니다.<br>
                            아래 임시 비밀번호로 로그인 후 반드시 비밀번호를 변경해 주세요.
                          </p>

                          <!-- 임시 비밀번호 박스 -->
                          <div style="background:#f0f0fb;border:2px dashed #c4c2ee;
                                      border-radius:14px;padding:24px;text-align:center;
                                      margin-bottom:28px;">
                            <p style="margin:0 0 6px;font-size:11px;color:#8b8fa8;
                                      letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
                              임시 비밀번호
                            </p>
                            <p style="margin:0;font-size:28px;font-weight:700;
                                      color:#4b49ac;letter-spacing:4px;font-family:monospace;">
                              %s
                            </p>
                          </div>

                          <!-- 안내 사항 -->
                          <table width="100%%" style="background:#fff8f0;border-radius:12px;
                                                      border:1px solid #ffe0b2;margin-bottom:28px;">
                            <tr>
                              <td style="padding:16px 18px;">
                                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#e65100;">
                                  ⚠️ 보안 안내
                                </p>
                                <ul style="margin:0;padding-left:16px;font-size:13px;
                                           color:#8b8fa8;line-height:1.8;">
                                  <li>로그인 후 즉시 비밀번호를 변경해 주세요.</li>
                                  <li>임시 비밀번호는 1회 사용 후 변경을 권장합니다.</li>
                                  <li>본인이 요청하지 않은 경우 즉시 관리자에게 문의해 주세요.</li>
                                </ul>
                              </td>
                            </tr>
                          </table>

                          <p style="margin:0;font-size:13px;color:#8b8fa8;line-height:1.7;">
                            문의사항이 있으시면 시스템 관리자에게 연락해 주세요.
                          </p>
                        </td>
                      </tr>

                      <!-- 푸터 -->
                      <tr>
                        <td style="background:#f9faff;border-top:1px solid #eef0f8;
                                   padding:20px 40px;text-align:center;">
                          <p style="margin:0;font-size:11px;color:#c4c7d9;line-height:1.6;">
                            © 2026 Flowenect HR System. All rights reserved.<br>
                            본 메일은 발신 전용이며 회신이 불가합니다.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(name, tempPw);
    }
}