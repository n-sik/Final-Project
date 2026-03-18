package com.flowenect.hr.dto.payroll;
import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("PayrollPositionDTO")
public class PositionDTO {
  private String posCd;
  private String posNm;
}
