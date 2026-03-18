package com.flowenect.hr.dto.behavior.res;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BehaviorRspnsSummaryDTO {
	private Integer rspnsNo;
	private Integer testNo;
	private String testNm;

	private String rspnrEmpNo;
	private String rspnrEmpNm;
	private String rspnrDeptNm;
	private String rspnrPosNm;

	private String trgtEmpNo;
	private String trgtEmpNm;
	private String trgtDeptNm;
	private String trgtPosNm;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime rspnsDtm;

	private String actnTypeRslt;
}
