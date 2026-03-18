package com.flowenect.hr.dto.payroll;
import java.util.List;

import lombok.Data;

@Data
public class PayrollConfirmReq {
  private List<Long> payrollIds;
}
