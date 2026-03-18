package com.flowenect.hr.data.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.data.mapper.DeptKpiEvalMapper;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.data.ResponseDeptKpiEvalDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeptKpiEvalServiceImpl implements DeptKpiEvalService {
	
	private final DeptKpiEvalMapper deptKpiEvalMapper;	
	
	/**
     * 성과평가 대상 부서 목록을 조회합니다.
     * @return 부서 정보 리스트 (DeptDTO)
     */
	@Override
    public List<DeptDTO> readDeptList() {
        return deptKpiEvalMapper.selectDeptList();
    }

    /**
     * 부서 코드를 받아 해당 부서의 프로젝트들과 
     * 각 프로젝트에 포함된 KPI 리스트를 한 번에 가져옵니다.
     */
    @Override
    public List<ResponseDeptKpiEvalDTO> readDeptProjectKpiList(String deptCd) {
        // 매퍼에서 조인 쿼리와 resultMap 처리가 완료된 리스트를 반환합니다.
        return deptKpiEvalMapper.selectDeptProjectKpiList(deptCd);
    }

	

}
