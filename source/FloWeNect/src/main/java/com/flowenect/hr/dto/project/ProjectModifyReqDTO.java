package com.flowenect.hr.dto.project;

import java.util.Date;

import lombok.Data;

/**
 * [프로젝트 부여/관리] 프로젝트 수정 요청 DTO
 * - USE_YN='N' 으로 소프트 삭제
 * - USE_YN='Y' 로 복구
 */
@Data
public class ProjectModifyReqDTO {

    private Long projectNo;           // 프로젝트 번호 (필수)

    private String deptCd;            // 부서 코드
    private String projectNm;         // 프로젝트명
    private String projectDesc;       // 프로젝트 설명
    private String projectStatCd;     // 상태 코드 (ING / END / HOLD)
    private Date startDtm;            // 시작일
    private Date endDtm;              // 종료일
    private String useYn;             // 사용 여부 (Y/N)
}
