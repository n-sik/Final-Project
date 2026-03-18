package com.flowenect.hr.dto.behavior;

import java.time.LocalDate;

import lombok.Data;

@Data
public class TestMstDTO {

	private Integer testNo;
	private String testNm;
	private String testDesc;
	private String wrtrEmpNo;
	private LocalDate regDtm;
	private LocalDate modDtm;

}
