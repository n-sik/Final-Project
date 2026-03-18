package com.flowenect.hr.data.service;

import java.util.List;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.data.ResponseDeptKpiEvalDTO;

public interface DeptKpiEvalService {
	/**
	 * 성과평가 대상 부서 목록을 조회합니다.
	 * @return 부서 정보 리스트 (DeptDTO)
	 */
	List<DeptDTO> readDeptList();
	
	/**
     * 부서 코드를 기반으로 프로젝트와 그에 딸린 KPI 목록을 통합 조회합니다.
     * @param deptCd 부서 코드
     * @return 프로젝트 및 KPI 정보가 포함된 DTO 리스트
     */
    List<ResponseDeptKpiEvalDTO> readDeptProjectKpiList(String deptCd);
}
