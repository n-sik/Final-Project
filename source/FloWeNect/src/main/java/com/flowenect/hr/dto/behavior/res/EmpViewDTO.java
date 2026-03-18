package com.flowenect.hr.dto.behavior.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpViewDTO {
	private String empNo;
	private String empNm;
	private String deptCd;
	private String deptNm;
	private String posNm;
}
