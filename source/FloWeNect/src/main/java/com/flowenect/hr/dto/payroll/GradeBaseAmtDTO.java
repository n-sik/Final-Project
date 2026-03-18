package com.flowenect.hr.dto.payroll;
import lombok.Data;

/**
 * ERD: GRADE_BASE_AMT (직위별 기준금액)
 */
@Data
public class GradeBaseAmtDTO {
  private Long baseAmtNo;
  private String posCd;
  private Long stdAmt;
  private String startDtm;
  private String endDtm;
}
