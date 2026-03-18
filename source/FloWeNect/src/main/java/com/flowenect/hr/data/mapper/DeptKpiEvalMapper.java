package com.flowenect.hr.data.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.data.ResponseDeptKpiEvalDTO;

@Mapper
public interface DeptKpiEvalMapper {
	/**
	 * 성과평가 대상이 되는 전체 부서 목록을 조회한다.
	 * @return 부서 정보(DeptDTO) 리스트
	 */
	List<DeptDTO> selectDeptList();
	
	/**
     * 특정 부서의 프로젝트와 그에 딸린 KPI 목록을 통합 조회한다.
     * XML의 resultMap(ProjectKpiResultMap)과 매핑됨.
     * @param deptCd 부서코드
     * @return 프로젝트 및 KPI 통합 정보 리스트
     */
    List<ResponseDeptKpiEvalDTO> selectDeptProjectKpiList(@Param("deptCd") String deptCd);
}
