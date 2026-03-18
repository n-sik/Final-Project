package com.flowenect.hr.dto.payroll;
import lombok.Data;

@Data
public class EmployeePayrollRowDTO {
  private String empNo;
  private String empNm;
  private String deptNm;
  private String posNm;

  /** 오늘 기준 유효한 기준급(없으면 null) */
  private Long baseAmt;

  /** 기준급 존재 여부(0/1) */
  private boolean baseAmtExists;

  /** 개인 기준금액 이력 존재 여부(2건 이상이면 true) */
  private boolean hasHistory;

  /** 현재 급여계좌은행 */
  private String bankName;

  /** 현재 계좌번호 */
  private String accntNo;

  /** 급여계좌은행/계좌번호 모두 없으면 true */
  private boolean unregistered;
}
