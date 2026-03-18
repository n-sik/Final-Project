package com.flowenect.hr.eval.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.modelmapper.ModelMapper;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.commons.exception.eval.QualException;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import com.flowenect.hr.dto.eval.QualEvalMasterDTO;
import com.flowenect.hr.dto.eval.QualEvalResultDTO;
import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.dto.eval.VectorMetadataDTO;
import com.flowenect.hr.dto.eval.WorkSearchDTO;
import com.flowenect.hr.dto.kpi.KpiDTO;
import com.flowenect.hr.dto.project.ProjectDTO;
import com.flowenect.hr.emp.mapper.EmpMapper;
import com.flowenect.hr.eval.mapper.EvalMapper;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvalServiceImpl implements EvalService {

	@Value("${eval.qual.record-size:2}")
	private int recordSize;
	private final EvalMapper evalMapper;
	private final EmpMapper empMapper;
	private final ModelMapper modelMapper;

	/**
	 * [정량 평가] 부서별 평가 대상 사원 명단 조회 하드코딩된 부서코드(2026HR01)를 기준으로 해당 부서원들의 평가 현황을 조회합니다.
	 * 
	 * @param deptTypeCd 부서 유형 코드
	 * @return 평가 대상 사원 목록
	 */
	@Override
	@Transactional(readOnly = true)
	public List<QualTargetDTO> readDeptEmpList(String deptTypeCd) {
		return evalMapper.selectEvalTargetList(deptTypeCd);
	}

	/**
	 * [정량 평가] 부서별/기수별 평가 대상 사원 명단 조회 * 비즈니스 로직: 1. 화면(JS)에서 전달된 연도(evalYear)와
	 * 반기(evalHalf) 정보를 바탕으로 필터링합니다. 2. 단순 사원 명단뿐만 아니라, 해당 기수의 '평가 상태(대기/완료)' 정보를
	 * 조인하여 가져옵니다. 3. 정성 평가 명단과 분리하여 정량적 지표 분석을 위한 기초 데이터를 형성합니다. 
	 * 
	 * @param reqDTO
	 * 부서코드, 평가연도, 평가반기 정보를 담은 요청 객체
	 * 
	 * @return 평가 상태가 포함된 사원 명단 (QualTargetDTO 리스트)
	 */
	@Override
	public List<QualTargetDTO> readQuantDeptEmpList(QualTargetDTO reqDTO) {
		// TODO Auto-generated method stub
		return evalMapper.selectQuantEvalTargetList(reqDTO);
	}

	/**
	 * [정성 평가] 평가 화면 초기 데이터 로드 (문항 + 대상자 + 페이징) 평가 항목(Master)과 평가 대상 사원 목록을 한 번에
	 * 조회하여 Map으로 반환합니다.
	 * 
	 * @param deptTypeCd 부서코드
	 * @param pagingDTO  페이징 정보
	 * @return 평가 문항 리스트, 사원 리스트, 업데이트된 페이징 정보를 포함한 Map
	 */
	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> readListQualEval(EmpDTOWrapper userDetails, PagingDTO pagingDTO) {
		
		String deptTypeCd = empMapper.selectDeptInfoByEmpNo(userDetails.getUsername()).getDeptTypeCd();
		EmpDTO realUser = userDetails.getRealUser();
		int totalCount = evalMapper.selectCountQualEval(deptTypeCd);
		
		pagingDTO.setRecordSize(recordSize);
		pagingDTO.setTotalCount(totalCount);

		List<QualEvalMasterDTO> questions = evalMapper.selectListQualEval(deptTypeCd, pagingDTO).stream()
				.map(entity -> modelMapper.map(entity, QualEvalMasterDTO.class)).collect(Collectors.toList());

		List<QualTargetDTO> targetList = readDeptEmpList(realUser.getDeptCd());

		return Map.of("questions", (questions != null) ? questions : Collections.emptyList(), "targetList",
				(targetList != null) ? targetList : Collections.emptyList(), "pagingDTO", pagingDTO);

	}

	/**
	 * [정성 평가] 평가 결과 저장 중복 평가 여부를 사전에 체크하며, 중복 시 사용자 정의 예외(QualException)를 발생시킵니다.
	 * 
	 * @param qualEvalResultDTO 저장할 평가 데이터
	 * @throws QualException 이미 해당 분기에 평가가 완료된 경우 발생
	 */
	@Override
	@Transactional
	public void createQualEval(QualEvalResultDTO qualEvalResultDTO) {
		int existCount = evalMapper.checkExistEval(qualEvalResultDTO);

		if (existCount > 0) {
			QualTargetDTO detail = evalMapper.selectEmpDetailByNo(qualEvalResultDTO.getTargetEmpNo());
			evalMapper.selectEmpDetailByNo(qualEvalResultDTO.getTargetEmpNo());
			throw new QualException(detail);
		}

		evalMapper.insertQualEvalResults(qualEvalResultDTO);
	}

	/**
	 * [1단계] 사원별 참여 프로젝트 목록 조회 특정 사원이 참여하고 있는 모든 프로젝트의 전체 컬럼 정보를 가져옵니다.
	 * 
	 * @param empNo 조회 대상 사원 번호
	 * @return 사원 참여 프로젝트 리스트
	 */
	@Override
	@Transactional(readOnly = true)
	public List<ProjectDTO> readProjectList(String empNo) {
		log.info("서비스: 사원번호 {}의 프로젝트 목록 조회 시작", empNo);
		return evalMapper.selectProjectListByEmp(empNo);
	}

	/**
	 * [2단계] 프로젝트별 KPI 목록 조회 선택된 프로젝트에 포함된 모든 KPI 항목들을 상세히 가져옵니다.
	 * 
	 * @param projNo 프로젝트 고유 번호
	 * @return 프로젝트별 KPI 리스트
	 */
	@Override
	@Transactional(readOnly = true)
	public List<KpiDTO> readKpiList(Long projNo, String empNo) {
		log.info("서비스: 프로젝트 번호 {}의 KPI 목록 조회 시작", projNo);
		return evalMapper.selectKpiListByProj(projNo, empNo);
	}

	/**
	 * [3단계] 특정 사원의 KPI별 담당 업무(Task) 목록 조회 특정 KPI 하위 업무 중, 조회 대상 사원에게 할당된 세부 업무 리스트를
	 * 반환합니다.
	 * 
	 * @param assignTaskDTO 검색 조건 객체 (kpiNo 및 필터링을 위한 empNo 포함)
	 * @return 특정 사원이 해당 KPI 달성을 위해 수행 중인 업무 리스트
	 * 
	 *         KPI는 부서 공통 지표일 수 있으나, 세부 Task는 사원별로 개별 할당됩니다. 따라서 리더가 특정 부서원의 업무 현황을
	 *         정확히 파악할 수 있도록 KPI 번호와 사원 번호를 결합하여 개인별 할당 데이터를 필터링합니다.
	 */
	@Override
	@Transactional(readOnly = true)
	public List<AssignTaskDTO> readTaskList(AssignTaskDTO assignTaskDTO) {
		log.info("서비스: KPI 및 사원 기준 업무 목록 조회 시작 - 조건: {}", assignTaskDTO);

		// Mapper를 통해 복합 조건(KPI_NO, EMP_NO)에 부합하는 업무 리스트 조회
		return evalMapper.selectTaskListByKpi(assignTaskDTO);
	}

	/**
	 * [4단계] 업무별 일일 업무일지(Log) 목록 조회 특정 업무의 진행 과정이 담긴 일지 리스트를 최신순으로 가져옵니다.
	 * 
	 * @param taskNo 업무 고유 번호
	 * @return 업무별 일지 리스트
	 */
	@Override
	@Transactional(readOnly = true)
	public List<DailyTaskLogDTO> readLogList(Long taskNo) {
		log.info("서비스: 업무 번호 {}의 일지 목록 조회 시작", taskNo);
		return evalMapper.selectDailyTaskLogListByTask(taskNo);
	}

	/**
	 * [개인업무] KPI 미배정 개인 담당 업무 목록 조회 특정 사원에게 할당된 업무 중, 성과 지표(KPI)가 연결되지 않은 순수 개인 업무
	 * 리스트를 가져옵니다.
	 * 
	 * @param empNo 조회 대상 사원의 사번
	 * @return KPI 번호가 NULL인 개인 전용 AssignTaskDTO 리스트
	 */
	@Override
	@Transactional(readOnly = true)
	public List<AssignTaskDTO> readPersonalTaskList(String empNo) {
		log.info("[개인업무 조회] 요청 사번 -> {}", empNo);

		List<AssignTaskDTO> list = evalMapper.selectPersonalTaskList(empNo);

		log.info("[개인업무 조회] 결과 건수 -> {}건", list != null ? list.size() : 0);

		return list;
	}

	/**
	 * [리더용 업무 통합 조회 API] GET /rest/eval/work-list
	 * 
	 * @param searchDTO (deptCd, startDate, endDate, searchType, searchKeyword)
	 * @return 검색된 업무 리스트 JSON
	 */
	@Override
	public List<Map<String, Object>> readSearchWorkList(WorkSearchDTO search) {
		log.info("업무 조회 요청 시작 - 부서: {}, 검색어: {}", search.getDeptCd(), search.getSearchKeyword());

		if (search.getSearchKeyword() == null) {
			search.setSearchKeyword("");
		}

		List<Map<String, Object>> workList = evalMapper.selectSearchWorkList(search);

		log.info("업무 조회 완료 - 건수: {}건", workList.size());

		return workList;
	}
}