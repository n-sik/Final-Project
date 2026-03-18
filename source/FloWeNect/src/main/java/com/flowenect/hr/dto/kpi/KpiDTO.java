package com.flowenect.hr.dto.kpi;

import java.util.Date;
import java.util.List;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;

import lombok.Data;

@Data
public class KpiDTO {
    private Long kpiNo;          // KPI 번호 (PK)
    private Long kpiParentNo;    // KPI 상위 번호 (0: 최상위)
    private Long projNo;         // 프로젝트 번호 (FK)
    private String regEmpNo;     // 작성자 사번
//    private String empNo;        // 대상자 사번
    private String kpiNm;        // KPI 명
    private String kpiCn;        // KPI 내용
    private String calcStandard; // 산출 기준
    private String kpiTypeCd;    // 지표 유형 코드
    private Long targetVal;      // 목표값 (정수)
    private String startDtm;     // 시작일
    private String endDtm;       // 종료일
    private String useYn;        // 사용 여부 (Y/N)
    private Date regDtm;         // 등록 일시
    private Date modDtm;         // 수정 일시
    private Long progressRate;   // 진행률 (0~100 정수)
}