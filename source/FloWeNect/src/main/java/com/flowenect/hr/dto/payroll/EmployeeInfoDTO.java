package com.flowenect.hr.dto.payroll;
import lombok.Data;

@Data
public class EmployeeInfoDTO {
  private String empNo;
  private String empNm;
  private String deptNm;
  private String posCd;
  private String posNm;
  private String email;
}
