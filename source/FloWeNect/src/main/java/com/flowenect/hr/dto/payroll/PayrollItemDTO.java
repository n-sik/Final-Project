package com.flowenect.hr.dto.payroll;
import lombok.Data;

@Data
public class PayrollItemDTO {
  private Long itemDetailNo;
  private Long payrollNo;

  private String itemCode;
  private String itemName;
  /** 지급/공제 코드 */
  private String itemTypeCd;
  private Long amount;
  private String taxableYn;
}
