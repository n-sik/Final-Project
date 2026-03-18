package com.flowenect.hr.dto.payroll;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmailPreviewDTO {
  private String subject;
  private String body;
}
