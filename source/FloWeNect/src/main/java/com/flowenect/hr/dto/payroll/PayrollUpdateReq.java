package com.flowenect.hr.dto.payroll;
import java.util.List;

import lombok.Data;

@Data
public class PayrollUpdateReq {
  private List<PayrollItemDTO> items;
}
