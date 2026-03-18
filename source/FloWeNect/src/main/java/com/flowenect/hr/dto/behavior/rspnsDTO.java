package com.flowenect.hr.dto.behavior;

import java.time.LocalDate;

import lombok.Data;

@Data
public class rspnsDTO {

	private Integer rspnsNo;
	private Integer testNo;
	private String rspnrEmpNo;
	private String trgtEmpNo;
	private LocalDate rspnsDtm;
	private String actnTypeRslt;
	
}
