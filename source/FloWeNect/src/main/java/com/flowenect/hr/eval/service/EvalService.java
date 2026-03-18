package com.flowenect.hr.eval.service;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import com.flowenect.hr.dto.eval.QualEvalResultDTO;
import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.dto.eval.WorkSearchDTO;
import com.flowenect.hr.dto.kpi.KpiDTO;
import com.flowenect.hr.dto.project.ProjectDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

public interface EvalService {

	// QualEval 정량 평가 관리 로직

	/**
	 * 특정 부서에 소속된 평가 대상 사원 명단을 조회합니다. (부서 정보, 직급 정보 및 해당 분기 평가 완료 여부 포함)
	 * 
	 * @param deptCd 부서코드
	 * @return 평가 대상 사원 목록 (QualTargetDTO 리스트)
	 */
	List<QualTargetDTO> readDeptEmpList(String deptCd);
	
	/**
     * 특정 부서 및 시점(연도/반기) 기준 정량 평가 대상 사원 명단을 조회합니다.
     * @param reqDTO deptCd, evalYear, evalHalf를 담은 DTO
     * @return 평가 상태가 포함된 사원 목록
     */
    List<QualTargetDTO> readQuantDeptEmpList(QualTargetDTO reqDTO);

	/**
	 * 정량 평가 항목 목록을 페이징 처리하여 조회합니다. 평가 항목 리스트와 전체 개수 등을 Map 형태로 반환하여 프론트엔드 페이징 처리를
	 * 지원합니다.
	 * 
	 * @param deptCd    부서코드
	 * @param pagingDTO 페이징 정보 (현재 페이지, 페이지 당 레코드 수 등)
	 * @return 평가 항목 데이터 (리스트 및 페이징 정보가 담긴 Map)
	 */
	Map<String, Object> readListQualEval(@AuthenticationPrincipal EmpDTOWrapper userDetails, PagingDTO pagingDTO);

	/**
	 * 사원에 대한 정량 평가 결과를 생성(저장)합니다. 이미 해당 분기에 평가가 완료되었는지 중복 체크 후 저장을 수행합니다.
	 * 
	 * @param qualEvalResultDTO 저장할 평가 결과 데이터
	 */
	void createQualEval(QualEvalResultDTO qualEvalResultDTO);

	// WorkInquiry 리더용 사원 업무 여정 조회 (4단계 Lazy Loading)

	/**
	 * [1단계] 사원별 참여 프로젝트 목록 조회 리더가 사원을 선택했을 때, 해당 사원이 현재 참여 중인 프로젝트 리스트를 반환합니다.
	 * 
	 * @param empNo 조회 대상 사원 번호
	 * @return 사원 참여 프로젝트 목록 (ProjectDTO 리스트)
	 */
	List<ProjectDTO> readProjectList(String empNo);

	/**
	 * [2단계] 프로젝트별 핵심 성과 지표(KPI) 목록 조회 특정 프로젝트 하위에 정의된 KPI(성과 지표) 리스트를 반환합니다.
	 * 
	 * @param projNo 프로젝트 고유 번호
	 * @return 프로젝트별 KPI 목록 (KpiDTO 리스트)
	 */
	List<KpiDTO> readKpiList(Long projNo, String empNo);

	/**
	 * [3단계] 선택된 사원의 KPI별 세부 담당 업무(Task) 목록 조회 * @param assignTaskDTO 검색 조건을 담은 객체 -
	 * kpiNo: 조회의 기준이 되는 성과지표 번호 - empNo: 업무를 할당받은 특정 사원의 번호
	 * 
	 * @return 특정 사원이 해당 KPI를 달성하기 위해 수행 중인 세부 업무(Task) 리스트 * ※ 비즈니스 로직: 1. KPI는 여러
	 *         사원이 공유할 수 있는 목표 지표입니다. 2. 따라서 리더가 특정 사원의 현황을 조회할 때는 KPI 번호뿐만 아니라 해당
	 *         사원의 사번(empNo)을 함께 필터링하여 '개인별 할당 업무'만 추출합니다.
	 */
	List<AssignTaskDTO> readTaskList(AssignTaskDTO assignTaskDTO);

	/**
	 * [4단계] 업무별 일일 업무일지(DailyTaskLog) 목록 조회 특정 업무에 대해 사원이 작성한 일일 업무 보고(일지) 리스트를
	 * 반환합니다.
	 * 
	 * @param taskNo 업무 고유 번호
	 * @return 업무별 일지 목록 (DailyTaskLogDTO 리스트)
	 */
	List<DailyTaskLogDTO> readLogList(Long taskNo);
	
	/**
     * [개인업무] 특정 사원의 KPI 미배정 개인 업무 목록 조회
     * @param empNo 조회 대상 사원의 사번
     * @return 특정 목표(KPI)에 연결되지 않은 사원 개인의 AssignTaskDTO 리스트
     * ※ 비즈니스 로직: 
     * 1. 성과 관리 체계(KPI) 외에 사원이 개별적으로 수행하는 업무를 조회합니다.
     * 2. 동일한 배정 업무 테이블(assign_task)을 조회하되, KPI_NO가 NULL인 데이터만 필터링합니다.
     */
    List<AssignTaskDTO> readPersonalTaskList(String empNo);

	/**
	 * [리더용 업무 통합 조회] 검색 조건에 따른 프로젝트, KPI, 업무 리스트를 반환합니다.
	 * 
	 * @param search 검색 조건 DTO
	 * @return ResultMap(WorkResultMap) 구조의 업무 리스트
	 */
	List<Map<String, Object>> readSearchWorkList(WorkSearchDTO search);
}
