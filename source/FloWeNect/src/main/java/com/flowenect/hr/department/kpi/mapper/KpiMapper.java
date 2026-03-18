package com.flowenect.hr.department.kpi.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.kpi.KpiDTO;

@Mapper
public interface KpiMapper {
	// 프로젝트별 KPI 목록 조회
	List<KpiDTO> selectKpiListByProj(Long projNo);

	// KPI 단건 상세 조회
	KpiDTO selectKpiDetail(Long kpiNo);

	// 신규 KPI 등록
	int insertKpi(KpiDTO kpiDto);

	// KPI 수정
	int updateKpi(KpiDTO kpiDto);

	// KPI 삭제
	int deleteKpi(Long kpiNo);

	List<KpiDTO> getSubKpiListByParent(Long parentNo);
}
