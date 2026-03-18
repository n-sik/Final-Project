package com.flowenect.hr.dto.payroll;
import lombok.Data;

/**
 * ERD: INSURANCE_RATE (공제율)
 */
@Data
public class InsuranceRateDTO {
  private Long rateNo;
  private Double pensionRate;
  private Double healthRate;
  private Double employRate;
  private Double careRate;
  private Double incomeTaxRate;
  private Double localTaxRate;
  private String startDtm;
  private String endDtm;
}
