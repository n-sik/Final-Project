package com.flowenect.hr.dto.attendlog;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AttendanceResponseDTO {
    // 1. 근태 정보 (attendance 테이블)
    private Long attdNo;
    private String empNo;
    private String workDt;
    private String inDtm;
    private String outDtm;
    private String lateYn;
    private String attdStatCd;
    private String remark;

    // 2. 사원 상세 정보 (employee 테이블 JOIN 결과)
    private String empNm;   // 사원명
    private String posNm;   // 직급명
    private String deptNm;  // 부서명
}