package com.flowenect.hr.dto.payroll;
import lombok.Data;

@Data
public class PayrollHeaderDTO {
  private Long payrollNo;
  private String empNo;
  private String payYyyymm;
  private Long totalPayAmt;
  private Long totalDeductAmt;
  private Long netPayAmt;
  private String confirmYn;
  private String createdDtm;
}
