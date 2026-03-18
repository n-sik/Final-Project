package com.flowenect.hr.dto.payroll;
import lombok.Data;

/**
 * ERD: EMP_SALARY_ITEM (사원별 수당)
 */
@Data
public class EmpSalaryItemDTO {
  private String empNo;
  private String salaryItemCode;
  /** 표시용(조인) */
  private String salaryItemName;
  private Long itemAmount;
  private String startDtm;
  private String endDtm;
}
