package com.flowenect.hr.dto.kpi;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class TaskDTO {

	// PK 및 연관 키
	private Long taskNo;
	private String empNo;
	private Long projectNo;
	private Long kpiNo;
	private String deptCd;

	// 업무 정보
	private String taskTitle;
	private String taskCn;
	private String taskStatCd;
	private Long progressRate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date taskStartDtm;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date taskEndDtm;

	// 시스템 공통
	private String regDtm;
	private String modDtm;
	private String delYn;
	private String delDtm;

	// 조인용 추가 필드
	private String empNm;
}