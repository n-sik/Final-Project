package com.flowenect.hr.ai.service;

import java.util.Map;

import com.flowenect.hr.dto.eval.QuantEvalResultDTO;

public interface Aiservice {
	/**
     * 벡터 DB의 성과 데이터를 기반으로 AI 정량 평가 점수 및 근거를 생성합니다.
     * @param empNo 사원 번호
     * @return AI가 산출한 수치 분석 및 점수 리포트
     */
	QuantEvalResultDTO analyzeQuantitativePerformance(String empNo);
    
    /**
     * 저장된 사원의 AI 분석 결과를 가져온다.
     */
    QuantEvalResultDTO readSavedAnalysis(String empNo);
    
    /**
     * 부서장 의견 저장
     * @param dto
     * @return
     */
    boolean updateLeaderComment(QuantEvalResultDTO dto, String regEmpNo);
	
    /**
     * [부서성과] 실시간 KPI 기반 AI 전략 분석 및 DB 저장
     * 1. 프론트엔드에서 전달받은 부서별 KPI 수치를 벡터 DB에 스냅샷으로 저장(RAG).
     * 2. 벡터 DB에서 해당 부서의 성과 데이터를 검색하여 AI 컨텍스트 구성.
     * 3. AI가 부서의 달성률, 리스크, 전략 제언을 포함한 리포트를 생성.
     * 4. 생성된 리포트와 등급(Grade)을 오라클 DB(DEPT_AI_REPORT)에 영구 저장.
     * @param requestData 부서코드(deptCd), 부서명(deptNm), 프로젝트/KPI 리스트(projects) 포함
     * @return AI 분석 결과 (분석내용, 등급, 분석일시 등)
     */
    Map<String, Object> analyzeDepartmentPerformance(Map<String, Object> requestData);

    /**
     * [부서성과] 기존에 저장된 부서 AI 분석 결과 조회
     * - 부서 선택 시 매번 AI를 실행하지 않고, DB에 저장된 가장 최근의 분석 리포트를 불러옵니다.
     * - DEPT_AI_REPORT 테이블에서 해당 부서코드의 최신 1건을 조회합니다.
     * @param deptCd 조회할 부서 코드
     * @return DB에서 조회된 최신 리포트 정보 (데이터가 없을 경우 null 반환 가능)
     */
    Map<String, Object> readSavedDeptAnalysis(String deptCd);
    
    /**
     * [AI 동료인식] 동료 피드백 기반 행동 메커니즘 심층 분석 (Vector DB + Oracle Persistence)
     * 1. [Cache Check] 먼저 PEER_AI_REPORT 테이블에서 해당 사원의 기존 분석 리포트가 있는지 조회합니다.
     * 2. [Data Fetch] 기존 리포트가 없다면, RSPNS/BEHAVIOR_TYPE 테이블에서 동료 피드백 원천 데이터를 수집합니다.
     * 3. [Vector Analysis] 수집된 피드백을 Vector DB(RAG)에 로드하여 '표준 행동 모델'과의 의미론적 유사도를 계산합니다.
     * 4. [Persistence] 분석된 결과(텍스트, 점수 등)를 PEER_AI_REPORT 테이블에 영구 저장합니다.
     * * @param empNo 분석 대상 사번
     * @return AI 분석 결과 (DB 로드 데이터 또는 실시간 분석 데이터)
     */
    Map<String, Object> analyzePeerBehaviorVector(String empNo);
    
    /**
     * [AI 개인 종합 성과 분석] 정량실적(KPI) + 정성평가(피드백) + 본인업무(일지) 융합 분석
     * 1. [정량] KPI 달성률 및 프로젝트 진행률 수집.
     * 2. [정성] 보여주신 RSPNS_RESULT(피드백 문장, 점수) 데이터를 수집.
     * 3. [본인업무] DAILY_TASK_LOG의 실제 기록 유무 및 구체성 확인.
     * 4. [융합분석] 수치와 정성 피드백 간의 모순(ex. 점수는 높은데 일지 없음)을 포착하여 최종 리포트 생성.
     * 5. [Persistence] 분석 결과는 QUANT_EVAL_RESULT 또는 전용 리포트 테이블에 저장.
     * @param empNo 분석 대상 사번
     * @return AI 융합 분석 리포트 (performanceGrade, aiInsight, scoreFaith 등 포함)
     */
    
    /**
     * 1. 초기 화면용 데이터 조회 (Read)
     * 정량 평가 결과(REG_COMENT 포함)와 정성 평가 리스트를 통합하여 반환합니다.
     */
    Map<String, Object> readInitialAnalysisStatus(String empNo);

    /**
     * 2. 종합 성과 융합 분석 실행 (Analyze)
     * 정량 + 정성 + 업무 로그를 융합하여 AI 인사이트 리포트를 생성합니다.
     */
    Map<String, Object> analyzeTotalPerformance(String empNo);
}
