package com.flowenect.hr.dto.data;

import java.util.Date;
import java.util.List;

import com.flowenect.hr.dto.kpi.KpiDTO;

import lombok.Data;

@Data
public class ResponseDeptKpiEvalDTO {
    private Long projectNo;          // 프로젝트 번호
    private String regEmpNo;          // 등록 사원
    private String deptCd;            // 부서 코드
    private String projectNm;         // 프로젝트명
    private String projectDesc;       // 프로젝트 설명
    private String projectStatCd;     // 상태 코드 (ING / END / HOLD)
    private Date startDtm;            // 시작일
    private Date endDtm;              // 종료일
    private String useYn;             // 사용 여부 (Y/N)
    private String mainImgPath;       // 대표 이미지 경로
    
    private List<KpiDTO> kpi;
}
