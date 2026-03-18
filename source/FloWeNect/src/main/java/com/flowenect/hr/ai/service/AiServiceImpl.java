package com.flowenect.hr.ai.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.IndividualEval.mapper.IndividualEvalMapper;
import com.flowenect.hr.ai.util.AiTextParser;
import com.flowenect.hr.ai.util.AiVectorUtil;
import com.flowenect.hr.commons.exception.common.ErrorCode;
import com.flowenect.hr.commons.exception.eval.QualException;
import com.flowenect.hr.commons.util.DateUtil;
import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.dto.eval.QuantEvalResultDTO;
import com.flowenect.hr.dto.kpi.KpiDTO;
import com.flowenect.hr.eval.mapper.EvalMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements Aiservice {

	private final ChatClient chatClient;
	private final EvalMapper evalMapper;
	private final IndividualEvalMapper individualEvalMapper;
	private final AiVectorUtil aiVectorUtil;
	private final AiTextParser aiTextParser;

	@Value("classpath:/Aiprompt/peer-analysis.st")
	private Resource peerAnalysisPrompt;

	@Value("classpath:/Aiprompt/quant-analysis.st")
	private Resource quantAnalysisPrompt;

	@Value("classpath:/Aiprompt/dept-analysis.st")
	private Resource deptAnalysisPrompt;
	
	@Value("classpath:/Aiprompt/total-analysis.st")
	private Resource totalAnalysisPrompt;
	
	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> readInitialAnalysisStatus(String empNo) {
	    log.info("🔍 [초기 분석 데이터 로드 및 벡터 준비] 사번: {}", empNo);

	    // 1. DB 소스 확보 (정량/정성/로그)
	    QuantEvalResultDTO quant = evalMapper.selectLatestQuantEvalResult(empNo);
	    List<Map<String, Object>> qualList = evalMapper.selectQualEvalDetails(empNo);
	    List<Map<String, Object>> taskLogs = evalMapper.selectLogsForVectorSync(empNo);
	    
	    if (qualList == null) qualList = new ArrayList<>();

	    prepareVectorDocuments(empNo, taskLogs, qualList, quant);

	    // 3. 리액트 반환용 결과 맵 구성
	    Map<String, Object> result = new HashMap<>();

	    if (quant != null) {
	        result.put("quantResult", quant);
	        result.put("quantScore", quant.getScoreReach());
	        result.put("regComent", quant.getRegComent()); 
	        result.put("hasQuant", true);
	    } else {
	        result.put("quantResult", null);
	        result.put("hasQuant", false);
	    }

	    result.put("qualList", qualList);
	    result.put("hasQual", !qualList.isEmpty());
	    result.put("hasData", (quant != null || !qualList.isEmpty() || !taskLogs.isEmpty()));
	    result.put("status", "READY_FOR_AI");

	    return result;
	}
	
	// --- [1. 동료 피드백 기반 행동 분석] ---
	@Override
	@Transactional
	public Map<String, Object> analyzePeerBehaviorVector(String empNo) {
		log.info("🧠 [신뢰성 기반 AI 분석] 사번: {}", empNo);

		Map<String, Object> savedReport = evalMapper.selectLatestPeerAiReport(empNo);
		if (savedReport != null && !savedReport.isEmpty()) {
			return processClobInMap(savedReport, "analysisText");
		}

		QualTargetDTO targetEmp = evalMapper.selectEmpDetailByNo(empNo);
		String targetName = (targetEmp != null) ? targetEmp.getEmpNm() : empNo;

		List<Map<String, Object>> peerEvals = individualEvalMapper.selectIndividualEvalCbti(empNo);
		if (peerEvals == null || peerEvals.isEmpty())
			return Map.of("status", "EMPTY");

		// 삭제 없이 바로 싱크 (Upsert)
		aiVectorUtil.syncPeerFeedback(empNo, peerEvals);
		String baseType = String.valueOf(peerEvals.get(0).get("TYPE_NM"));
		String context = aiVectorUtil.searchContext(empNo, "PEER_LOG", baseType + " 핵심 역량 분석");

		String evaluatorNames = peerEvals.stream().map(row -> String.valueOf(row.get("EMP_NM"))).distinct()
				.collect(Collectors.joining(", "));

		PromptTemplate template = new PromptTemplate(peerAnalysisPrompt);
		Map<String, Object> params = Map.of("targetName", targetName, "evaluatorNames", evaluatorNames, "context",
				context);

		String rawAnalysis = chatClient.prompt(template.create(params)).call().content();
		Map<String, String> modelMap = aiTextParser.parseModelInfo(rawAnalysis);

		Map<String, Object> result = new HashMap<>();
		result.put("targetEmpNo", empNo);
		result.put("modelCd", modelMap.get("code"));
		result.put("modelName", modelMap.get("name"));
		result.put("analysisText", aiTextParser.cleanMarkdown(rawAnalysis));
		result.put("similarity", aiTextParser.parseScore(rawAnalysis, "Similarity점수"));
		result.put("consensus", aiTextParser.parseScore(rawAnalysis, "Consensus점수"));

		evalMapper.insertPeerAiReport(result);
		result.put("status", "SUCCESS");
		return result;
	}

	// --- [2. 정량 성과 분석] ---
	@Override
	@Transactional
	public QuantEvalResultDTO analyzeQuantitativePerformance(String empNo) {
		log.info("📊 [정량 성과 분석 시작] 사번: {}", empNo);

		QuantEvalResultDTO savedReport = evalMapper.selectLatestQuantEvalResult(empNo);
		if (savedReport != null)
			return savedReport;

		List<Map<String, Object>> latestLogs = evalMapper.selectLogsForVectorSync(empNo);
		if (latestLogs == null || latestLogs.isEmpty()) {
			throw new QualException(ErrorCode.NOT_FOUND, "실적 로그가 존재하지 않습니다.");
		}

		Map<String, Object> perfFact = evalMapper.selectEmpPerformanceFact(empNo);
		String empName = String.valueOf(perfFact.getOrDefault("EMP_NM", "해당 사원"));

		// 🚨 400 에러를 유발하던 deleteVectorData를 과감히 제거
		aiVectorUtil.syncQuantFact(empNo, latestLogs);

		String vectorSearchContext = aiVectorUtil.searchContext(empNo, "QUANT_FACT", "업무 태도 및 기록 성실성");

		StringBuilder finalContext = new StringBuilder();
		finalContext.append(String.format("### [%s 사원 실적 내역]\n", empName));
		for (Map<String, Object> log : latestLogs) {
			finalContext.append(String.format("- 업무: %s | 진행: %s%% | 상세: %s\n", log.get("TASK_TITLE"),
					log.get("TASK_PROGRESS"), log.get("LOG_CONTENT")));
		}
		finalContext.append("\n## [벡터 분석 데이터]\n").append(vectorSearchContext);

		PromptTemplate template = new PromptTemplate(quantAnalysisPrompt);
		String rawReport = chatClient
				.prompt(template.create(Map.of("context", finalContext.toString(), "targetName", empName))).call()
				.content();

		return saveQuantResult(empNo, rawReport);
	}

	// --- [3. 부서 성과 분석] ---
	@Override
	@Transactional
	public Map<String, Object> analyzeDepartmentPerformance(Map<String, Object> requestData) {
	    String deptCd = String.valueOf(requestData.get("deptCd"));
	    String deptNm = String.valueOf(requestData.getOrDefault("deptNm", "부서"));
	    List<Map<String, Object>> projects = (List<Map<String, Object>>) requestData.get("projects");

	    log.info("🏢 [부서 성과 분석] 부서: {}", deptNm);

	    StringBuilder deptContext = new StringBuilder();
	    if (projects != null && !projects.isEmpty()) {
	        for (Map<String, Object> p : projects) {
	            // 대문자 PROJECT_NO와 소문자 projectNo 모두 대응
	            Object projNoObj = p.get("PROJECT_NO") != null ? p.get("PROJECT_NO") : p.get("projectNo");
	            
	            if (projNoObj == null || "0".equals(String.valueOf(projNoObj))) {
	                log.warn("⚠️ 프로젝트 번호를 찾을 수 없어 스킵합니다: {}", p);
	                continue;
	            }

	            Long projNo = Long.valueOf(String.valueOf(projNoObj));
	            String projNm = String.valueOf(p.getOrDefault("PROJECT_NM", p.getOrDefault("projectNm", "명칭없음")));
	            
	            deptContext.append("▶ 프로젝트: ").append(projNm).append("\n");

	            // 부서 전체 KPI 리스트 조회
	            List<KpiDTO> kpiList = evalMapper.selectAllKpiListByProj(projNo);
	            
	            if (kpiList != null && !kpiList.isEmpty()) {
	                for (KpiDTO kpi : kpiList) {
	                    deptContext.append(String.format("   - [KPI] %s (진척률: %d%%)\n", 
	                        kpi.getKpiNm(), kpi.getProgressRate()));
	                }
	            } else {
	                deptContext.append("   - 등록된 KPI 데이터가 없습니다.\n");
	            }
	        }
	    } else {
	        deptContext.append("분석할 프로젝트 데이터가 존재하지 않습니다.");
	    }
	    String rawReport;
	    try {
	        rawReport = chatClient
	                .prompt(new PromptTemplate(deptAnalysisPrompt).create(Map.of("deptContext", deptContext.toString())))
	                .call().content();
	    } catch (Exception e) {
	        log.error("❌ AI 분석 프롬프트 실행 실패: {}", e.getMessage());
	        rawReport = "데이터 분석 중 오류가 발생했습니다. 프롬프트 설정을 확인하십시오.";
	    }

	    Map<String, Object> result = new HashMap<>();
	    result.put("deptCd", deptCd);
	    result.put("aiInsight", aiTextParser.cleanMarkdown(rawReport));
	    result.put("performanceGrade", aiTextParser.parseGrade(rawReport));

	    evalMapper.insertDeptAiReport(result);
	    return result;
	}
	
	@Override
	@Transactional
	public Map<String, Object> analyzeTotalPerformance(String empNo) {
	    log.info("🎯 [융합 분석 실행] 사번: {}", empNo);

	    // 1. DB 데이터 로드
	    List<Map<String, Object>> taskLogsData = evalMapper.selectLogsForVectorSync(empNo);
	    List<Map<String, Object>> qualDetails = evalMapper.selectQualEvalDetails(empNo);
	    QuantEvalResultDTO quantResult = evalMapper.selectLatestQuantEvalResult(empNo);

	    // 2. 벡터 DB 동기화 (최신화)
	    if (taskLogsData != null && !taskLogsData.isEmpty()) {
	        aiVectorUtil.syncQuantFact(empNo, taskLogsData); 
	    }
	    
	    if (qualDetails != null && !qualDetails.isEmpty()) {
	        // 정성평가는 'QUAL_FACT' 타입으로 저장됩니다.
	        aiVectorUtil.syncQualitativeEval(empNo, qualDetails, "QUAL_FACT");
	    }

	    // 3. RAG: 검색 타입을 저장한 타입과 일치시킵니다.
	    // 'QUAL_FACT'로 저장했으므로 'QUAL_FACT'로 검색해야 데이터가 나옵니다.
	    String vectorContext = aiVectorUtil.searchContext(empNo, "QUAL_FACT", "직원의 업무 전문성 및 팀워크 평가 내용");

	    // 4. 프롬프트 파라미터 구성
	    Map<String, Object> params = new HashMap<>();
	    
	    // 수치 데이터 포맷팅
	    String scoreText = (quantResult != null) 
	        ? String.format("달성률:%d, 속도:%d, 성실도:%d", 
	            quantResult.getScoreReach(), quantResult.getScoreSpeed(), quantResult.getScoreFaith())
	        : "점수 데이터 없음";
	    params.put("quantScore", scoreText);

	    // 검색된 맥락 데이터 주입
	    params.put("taskLogs", (vectorContext != null && !vectorContext.contains("찾을 수 없습니다")) 
	        ? vectorContext : "최근 정성평가 및 실무 기록이 존재하지 않습니다.");

	    // 부서장 피드백 (Correction Request)
	    String feedback = (quantResult != null && quantResult.getRegComent() != null) 
	        ? quantResult.getRegComent() : "특이사항 없음";
	    params.put("correctionRequest", feedback);

	    // 5. AI 리포트 생성
	    try {
	        PromptTemplate template = new PromptTemplate(totalAnalysisPrompt);
	        String rawInsight = chatClient.prompt(template.create(params)).call().content();

	        Map<String, Object> result = new HashMap<>();
	        result.put("empNo", empNo);
	        result.put("aiInsight", aiTextParser.cleanMarkdown(rawInsight));
	        result.put("quantResult", quantResult); 
	        result.put("status", "SUCCESS");
	        
	        log.info("✅ [분석 성공] 사번: {} 리포트 생성 완료", empNo);
	        return result;

	    } catch (Exception e) {
	        log.error("❌ AI 분석 프로세스 오류: {}", e.getMessage(), e);
	        throw new RuntimeException("분석 리포트 생성 중 시스템 오류가 발생했습니다.");
	    }
	}

	// --- [5. 부서장 코멘트 확정] ---
	@Override
	@Transactional
	public boolean updateLeaderComment(QuantEvalResultDTO dto, String regEmpNo) {
		dto.setRegEmpNo(regEmpNo);
		if (dto.getEvalYear() == null)
			dto.setEvalYear(DateUtil.getCurrentYear());
		dto.setEvalHalf("2".equals(dto.getEvalHalf()) ? "H2" : "H1");

		return evalMapper.updateLeaderComment(dto) > 0;
	}
	
	
	
	private void prepareVectorDocuments(String empNo, List<Map<String, Object>> logs, 
	                                   List<Map<String, Object>> quals, QuantEvalResultDTO quant) {
	    log.info("벡터 DB 동기화 준비 완료: 로그 {}건, 정성평가 {}건", logs.size(), quals.size());
	}

	// --- [6. 데이터 조회 메서드들] ---
	@Override
	public QuantEvalResultDTO readSavedAnalysis(String empNo) {
		return evalMapper.selectLatestQuantEvalResult(empNo);
	}

	@Override
	public Map<String, Object> readSavedDeptAnalysis(String deptCd) {
		return processClobInMap(evalMapper.selectLatestDeptAiReport(deptCd), "aiInsight");
	}

	// --- [보조 메서드] ---
	private QuantEvalResultDTO saveQuantResult(String empNo, String rawReport) {
		QuantEvalResultDTO dto = new QuantEvalResultDTO();
		dto.setEmpNo(empNo);
		dto.setAiSummary(aiTextParser.cleanMarkdown(rawReport));
		dto.setScoreAlign(aiTextParser.parseScore(rawReport, "Alignment"));
		dto.setScoreSpeed(aiTextParser.parseScore(rawReport, "Speed"));
		dto.setScoreFaith(aiTextParser.parseScore(rawReport, "Diligence"));
		dto.setScoreReach(aiTextParser.parseScore(rawReport, "Achievement"));
		dto.setScoreDiff(aiTextParser.parseScore(rawReport, "Complexity"));
		dto.setRegEmpNo("SYSTEM_AI");
		dto.setEvalYear(DateUtil.getCurrentYear());
		dto.setEvalHalf(DateUtil.getCurrentHalf());
		evalMapper.insertQuantEvalResult(dto);
		return dto;
	}

	private Map<String, Object> processClobInMap(Map<String, Object> map, String key) {
		if (map != null && map.get(key) instanceof java.sql.Clob clob) {
			try {
				map.put(key, clob.getSubString(1, (int) clob.length()));
			} catch (Exception e) {
				log.error("CLOB 변환 실패");
			}
		}
		if (map != null)
			map.put("status", "SUCCESS");
		return map;
	}
}