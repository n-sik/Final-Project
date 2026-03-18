package com.flowenect.hr.eval.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import com.flowenect.hr.dto.eval.QualEvalMasterDTO;
import com.flowenect.hr.dto.eval.QualEvalResultDTO;
import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.dto.eval.QuantEvalResultDTO;
import com.flowenect.hr.dto.eval.WorkSearchDTO;
import com.flowenect.hr.dto.kpi.KpiDTO;
import com.flowenect.hr.dto.project.ProjectDTO;

@Mapper
public interface EvalMapper {

	// qualEval

	/**
	 * 해당 부서에 소속된 평가 대상 사원 명단을 조회한다. (부서 정보, 직급 정보 및 당해 분기 평가 완료 여부 포함)
	 * 
	 * @param deptCd 부서코드
	 * @return 평가 대상 사원 목록 (QualTargetDTO 리스트)
	 */
	List<QualTargetDTO> selectEvalTargetList(@Param("deptCd") String deptCd);

	/**
	 * 해당 부서에 소속된 평가 대상 사원 명단을 조회한다. (부서 정보, 직급 정보 및 당해 분기 평가 완료 여부 포함) * @param
	 * reqDTO 부서코드(deptCd), 평가연도(evalYear), 평가반기(evalHalf) 정보를 담은 DTO
	 * 
	 * @return 평가 대상 사원 목록 (QualTargetDTO 리스트)
	 */
	List<QualTargetDTO> selectQuantEvalTargetList(QualTargetDTO reqDTO);

	/**
	 * 특정 사원번호를 기준으로 사원의 상세 정보(성명, 부서명, 직급명 등)를 조회한다. 주로 예외 발생 시 피드백 정보를 구성하기 위해
	 * 사용된다.
	 * 
	 * @param targetEmpNo 조회할 사원번호
	 * @return 사원 상세 정보 (QualTargetDTO)
	 */
	QualTargetDTO selectEmpDetailByNo(@Param("targetEmpNo") String targetEmpNo);

	/**
	 * 정량 평가 항목(Master) 목록을 페이징 처리하여 조회한다.
	 * 
	 * @param deptCd    부서코드 (부서별 평가 항목이 다를 경우 사용)
	 * @param pagingDTO 페이징 정보 (현재 페이지, 페이지 당 레코드 수 등)
	 * @return 평가 항목 목록 (QualEvalMasterDTO 리스트)
	 */
	List<QualEvalMasterDTO> selectListQualEval(@Param("deptCd") String deptCd, @Param("paging") PagingDTO pagingDTO);

	/**
	 * 특정 부서의 전체 정량 평가 항목 개수를 조회한다. (페이징 계산용)
	 * 
	 * @param deptCd 부서코드
	 * @return 전체 평가 항목 수
	 */
	int selectCountQualEval(@Param("deptCd") String deptCd);

	/**
	 * 작성된 정량 평가 결과 데이터를 테이블에 저장한다.
	 * 
	 * @param dto 저장할 평가 결과 데이터 (QualEvalResultDTO)
	 * @return 성공 시 저장된 행(Row)의 수
	 */
	int insertQualEvalResults(QualEvalResultDTO dto);

	/**
	 * 해당 사원이 동일한 분기에 이미 평가되었는지 중복 여부를 확인한다.
	 * 
	 * @param qualEvalResultDTO 사원번호, 연도, 분기 정보를 포함한 DTO
	 * @return 중복 데이터 존재 시 1 이상의 값, 미존재 시 0
	 */
	int checkExistEval(QualEvalResultDTO qualEvalResultDTO);

	// workInquiry

	/**
	 * @param empNo 조회 대상 사원 번호
	 * @return 사원이 참여 중인 프로젝트 리스트 (PROJ_NO, PROJ_NM 등)
	 */
	List<ProjectDTO> selectProjectListByEmp(String empNo);

	/**
	 * @param projNo 프로젝트 고유 번호
	 * @return 프로젝트에 포함된 KPI 리스트 (KPI_NM, PROGRESS_RATE 등)
	 */
	List<KpiDTO> selectKpiListByProj(@Param("projNo") Long projNo, @Param("empNo") String empNo);
	List<KpiDTO> selectAllKpiListByProj(@Param("projNo") Long projNo);

	/**
	 * [3단계] KPI 및 사원 기준 담당 업무(Task) 목록 조회 * @param assignTaskDTO 검색 조건 객체 (kpiNo:
	 * 성과지표 번호, empNo: 피평가자 사번)
	 * 
	 * @return 특정 사원이 해당 KPI 달성을 위해 할당받은 세부 업무 리스트 동일한 KPI 내에서도 사원별로 담당하는 Task가
	 *         다르므로, 객체 내의 KPI 번호와 사번을 복합 조건으로 사용하여 데이터를 필터링합니다.
	 */
	List<AssignTaskDTO> selectTaskListByKpi(AssignTaskDTO assignTaskDTO);

	/**
	 * [4단계] KPI별 업무 및 일지(Log) 통합 조회 특정 KPI의 업무들과 각 업무에 작성된 일일 업무일지를 1:N 구조로 조회합니다.
	 * (상세 보기용) ResultMap(TaskLogMap)을 사용하여 계층 구조로 매핑합니다.
	 * 
	 * @param kpiNo KPI 고유 번호 (KPI_NO)
	 * @return 일지가 포함된 업무 목록 (AssignTaskDTO 리스트)
	 */
	List<DailyTaskLogDTO> selectDailyTaskLogListByTask(Long kpiNo);

	/**
	 * [개인업무] 특정 사원의 KPI 미지정 배정 업무 목록 조회
	 * 
	 * @param empNo 조회 대상 사원의 사번
	 * @return KPI 번호가 없는(NULL) 개인 전용 AssignTaskDTO 리스트 ※ 비즈니스 로직: 동일한 업무
	 *         테이블(assign_task)을 사용하되, 특정 목표(KPI)에 귀속되지 않은 사원 개인의 업무 데이터를 필터링합니다.
	 */
	List<AssignTaskDTO> selectPersonalTaskList(String empNo);

	/**
	 * [리더용 업무 통합 조회] XML의 <select id="selectSearchWorkList">와 연결됩니다. 결과는
	 * <resultMap id="WorkResultMap">에 정의된 Key값들로 담깁니다.
	 * 
	 * @param search 검색 조건(부서코드, 기간, 키워드 등)
	 * @return 업무 정보(workNo, workNm, empNm, rankNm, startDate, endDate) 리스트
	 */
	List<Map<String, Object>> selectSearchWorkList(WorkSearchDTO search);

	// quantEval
	/**
	 * [정량평가] AI 분석 결과 저장
	 * 
	 * @param resultDTO AI가 생성한 점수 및 요약 정보
	 * @return 저장된 행 수
	 */
	int insertQuantEvalResult(QuantEvalResultDTO resultDTO);

	/**
	 * [정량평가] AI 분석을 위한 사원별 성과 팩트 데이터 조회
	 * 
	 * @param empNo 사원번호
	 * @return KPI, 담당업무, 상세로그가 포함된 Map
	 */
	Map<String, Object> selectEmpPerformanceFact(String empNo);

	/**
	 * 벡터 DB 동기화용 상세 로그 리스트 조회
	 * 
	 * @param empNo 사원번호
	 * @return 가공된 로그 리스트
	 */
	List<Map<String, Object>> selectLogsForVectorSync(@Param("empNo") String empNo);

	/**
	 * [개인업무] 특정 사원의 KPI 미지정 업무 및 로그 조회
	 * 
	 * @param empNo 사원번호
	 * @return 개인 업무 로그 리스트
	 */
	List<Map<String, Object>> selectPersonalLogsForVector(String empNo);

	/**
	 * 특정 사원의 가장 최근 AI 정량 평가 분석 결과를 조회한다.
	 * 
	 * @param empNo 조회할 사원의 사번
	 * @return {@link QuantEvalResultDTO} AI 요약 리포트 및 5대 지표 점수가 포함된 객체
	 * @author 팀장님 (또는 Flowenect AI 모듈)
	 * @since 2026-02-20
	 */
	QuantEvalResultDTO selectLatestQuantEvalResult(String empNo);

	/**
	 * 팀장 최종 의견 저장 (Update 전용)
	 * 
	 * @param dto
	 * @return
	 */
	int updateLeaderComment(QuantEvalResultDTO dto);

	/**
	 * [부서성과] AI 부서 전략 리포트 신규 저장
	 * 
	 * @param params 부서코드(deptCd), 분석내용(aiInsight), 등급(performanceGrade)을 담은 맵
	 * @return 저장 성공 시 1, 실패 시 0
	 */
	int insertDeptAiReport(Map<String, Object> params);

	/**
	 * [부서성과] 특정 부서의 최신 AI 분석 리포트 조회
	 * 
	 * @param deptCd 부서코드
	 * @return 최신 리포트 정보 (부서코드, 분석내용, 등급, 분석일시 포함)
	 */
	Map<String, Object> selectLatestDeptAiReport(String deptCd);

	/**
	 * [동료인식] 특정 사원의 CBTI 기반 동료 평가 및 유형 정의 데이터 조회 - AI 벡터 분석(RAG)의 기초 데이터로 사용됩니다. -
	 * BEHAVIOR_TYPE의 표준 모델 정의(typeCn)와 동료의 평가 정보를 함께 가져옵니다.
	 * 
	 * @param empNo  피평가자 사번
	 * @param testNo 테스트 차수 (예: 11)
	 * @return 응답번호, 응답일시, 유형코드, 유형명, 평가자성명, 유형상세정의(CLOB)가 포함된 리스트
	 */
	List<Map<String, Object>> selectIndividualEvalCbti(@Param("empNo") String empNo, @Param("testNo") int testNo);

	/**
	 * [AI 동료인식] 분석 결과 영구 저장
	 * 
	 * @param params targetEmpNo, modelCd, analysisText, similarity, consensus 포함
	 * @return 저장 성공 시 1
	 */
	int insertPeerAiReport(Map<String, Object> params);

	/**
	 * [AI 동료인식] 특정 사원의 최신 AI 분석 리포트 조회
	 * 
	 * @param empNo 조회할 사번
	 * @return 최신 리포트 정보 (analysisText, similarity 등)
	 */
	Map<String, Object> selectLatestPeerAiReport(@Param("empNo") String empNo);

	/**
	 * [AI 종합분석용] 특정 사원의 당해년도 정성 평가 상세 피드백 및 점수 리스트 조회 - AI가 정량 수치(KPI)와 대조할 '정성적
	 * 근거' 데이터로 사용됩니다.
	 * 
	 * @param empNo 피평가자 사번
	 * @return EVAL_SCORE(점수), EVAL_COMMENT(피드백 문장) 등이 포함된 맵 리스트
	 */
	List<Map<String, Object>> selectQualEvalDetails(@Param("empNo") String empNo);
}