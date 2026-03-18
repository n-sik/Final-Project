package com.flowenect.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class AnnualDTO {

	private Long annualNo;
	private String empNo;
	private String baseYr;
	private Integer totAnnualLv;
	private Integer usedAnnualLv;
	private Integer remAnnualLv;
	private Integer sickLv;
	private Integer officialLv;
	private Integer rewardLv;
	
	// join 
    private String empNm;   
    private String posNm;
    private String deptNm;
}
