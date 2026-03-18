package com.flowenect.hr.data.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.data.service.DeptKpiEvalService;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.data.ResponseDeptKpiEvalDTO;

import lombok.RequiredArgsConstructor;

/**
 * 부서별 KPI 성과평가 데이터를 제공하는 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dept/kpi")
public class DeptKpiEvalController {
	
	private final DeptKpiEvalService deptKpiEvalService;
	
	/**
	 * 성과평가 대상 전체 부서 목록을 조회합니다.
	 * @return 부서 리스트 JSON
	 */
	@GetMapping("/depts")
	public ResponseEntity<List<DeptDTO>> getDeptList() {
		List<DeptDTO> list = deptKpiEvalService.readDeptList();
		return ResponseEntity.ok(list);
	}

	/**
	 * 특정 부서의 프로젝트 및 KPI 목록을 통합 조회합니다.
	 * React의 fetchProjectData 로직에서 호출하는 엔드포인트입니다.
	 * @param deptCd 부서코드
	 * @return 프로젝트-KPI 통합 데이터 리스트 JSON
	 */
	@GetMapping("/projects/{deptCd}")
	public ResponseEntity<List<ResponseDeptKpiEvalDTO>> getDeptProjectKpiList(@PathVariable("deptCd") String deptCd) {
		List<ResponseDeptKpiEvalDTO> list = deptKpiEvalService.readDeptProjectKpiList(deptCd);
		return ResponseEntity.ok(list);
	}
}
