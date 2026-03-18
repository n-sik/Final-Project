package com.flowenect.hr.dto.payroll;
import java.util.List;

import lombok.Data;

@Data
public class PayrollDeleteReq {
  private List<Long> payrollIds;
}
