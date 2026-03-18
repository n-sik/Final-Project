package com.flowenect.hr.dto.payroll;
import lombok.Data;

@Data
public class PayrollListRowDTO {
  private Long payrollNo;
  private String createdDtm;
  private String empNo;
  private String empNm;
    private String deptNm;
  private String posNm;
private String confirmYn;
}
