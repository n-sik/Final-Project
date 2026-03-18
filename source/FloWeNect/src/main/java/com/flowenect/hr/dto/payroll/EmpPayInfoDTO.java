package com.flowenect.hr.dto.payroll;
import lombok.Data;

/**
 * ERD: EMP_PAY_INFO
 */
@Data
public class EmpPayInfoDTO {
  private Long paySeq;
  private String empNo;

  private Long baseAmt;
  private String bankName;
  private String accntNo;

  private Integer deductFamCnt;
  private Integer salaryGrade;
  private String adjustRsn;

  /** Oracle DATE */
  private String startDtm;
  private String endDtm;
}
