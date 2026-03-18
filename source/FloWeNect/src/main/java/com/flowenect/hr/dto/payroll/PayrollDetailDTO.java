package com.flowenect.hr.dto.payroll;
import java.util.List;

import lombok.Data;

@Data
public class PayrollDetailDTO {
  private Long payrollNo;
  private String payYyyymm;
  private String createdDtm;
  private String confirmYn;

  private String empNo;
  private String empNm;
  private String deptNm;
  private String posNm;
  private String email;

  private List<PayrollItemDTO> items;
}
