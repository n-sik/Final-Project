package com.flowenect.hr.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class ScheduleDTO {
	// ASSIGN_TASK 테이블 컬럼
    private Long taskNo;            // 업무번호 (NUMBER)
    private String taskTitle;       // 업무제목
    private String taskCn;          // 업무내용
    private String taskStatCd;      // 업무상태코드 (진행중, 완료 등)
    private Date taskStartDtm;      // 시작일시
    private Date taskEndDtm;        // 종료일시
    private String delYn;           // 삭제여부 ('N')
    private Double progressRate;    // 진행률 (%)

    // EMP 테이블 조인 컬럼
    private String empNo;           // 사원번호 (조인 키)
    private String empNm;           // 담당 사원명
    private String deptCd;          // 담당 부서코드
}
