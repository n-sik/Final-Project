package com.flowenect.hr.dto.payroll;
import java.util.List;

import lombok.Data;

@Data
public class EmpAllowanceSaveReq {
  private List<EmpSalaryItemDTO> allowances;
}
