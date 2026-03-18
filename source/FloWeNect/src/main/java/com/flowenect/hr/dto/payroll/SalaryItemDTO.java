package com.flowenect.hr.dto.payroll;
import lombok.Data;

/**
 * ERD: SALARY_ITEM (수당 정의)
 */
@Data
public class SalaryItemDTO {
  private String salaryItemCode;
  private String salaryItemName;
  /** 지급/공제 구분 */
  private String itemType;
  /** 과세/비과세 구분 */
  private String taxType;
}
