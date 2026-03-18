package com.flowenect.hr.dto.payroll;
import lombok.Data;

@Data
public class StepRateDTO {
  private Long stepRateNo;
  private Integer salaryStep;
  /** 증가율(%) */
  private Double increaseRate;
  private String createdDtm;
  private String startDtm;
  private String endDtm;
  private String useYn;
}
