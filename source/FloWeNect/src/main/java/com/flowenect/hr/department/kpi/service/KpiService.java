package com.flowenect.hr.department.kpi.service;

import java.util.List;

import com.flowenect.hr.dto.kpi.KpiDTO;

public interface KpiService {

	List<KpiDTO> getKpiListByProj(Long projNo); // 프로젝트별 KPI 목록
    KpiDTO getKpiDetail(Long kpiNo);            // 상세 조회
    int registerKpi(KpiDTO kpiDto);             // 등록
    int modifyKpi(KpiDTO kpiDto);               // 수정
    int removeKpi(Long kpiNo);                  // 삭제 (USE_YN = 'N')
    List<KpiDTO> getSubKpiListByParent(Long parentNo);
}
