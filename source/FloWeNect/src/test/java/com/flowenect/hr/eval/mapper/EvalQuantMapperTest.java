package com.flowenect.hr.eval.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.dto.eval.QuantEvalResultDTO;
import com.flowenect.hr.dto.project.ProjectDTO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@Transactional
class EvalQuantMapperTest {

	@Autowired
	EvalMapper evalMapper;

	@Autowired
	private VectorStore vectorStore;

	@Test
	@DisplayName("정량평가 대상 부서원 목록 조회 테스트")
	void selectQuantEvalTargetListTest() {
		QualTargetDTO req = new QualTargetDTO();
		req.setDeptCd("2026HR01");

		List<QualTargetDTO> result = evalMapper.selectQuantEvalTargetList(req);

		assertThat(result).isNotNull();

		if (result.isEmpty()) {
			log.warn("[목록조회] 조회된 데이터가 없습니다. 부서코드나 재직상태를 확인하세요.");
		} else {
			log.info("[목록조회] 성공! 총 {}명의 부서원을 찾았습니다.", result.size());
			result.forEach(emp -> {
				log.info(">> [사원정보] [{}] {} {} | 분석여부: {}", emp.getEmpNo(), emp.getEmpNm(), emp.getPosNm(),
						emp.getEvalStatCd());
			});
		}
	}

	@Test
	@DisplayName("AI 분석 결과 저장 테스트")
	void insertQuantResultTest() {
		QuantEvalResultDTO result = new QuantEvalResultDTO();
		result.setEmpNo("2025001");
		result.setScoreAlign(95);
		result.setScoreSpeed(88);
		result.setScoreFaith(100);
		result.setScoreReach(92);
		result.setScoreDiff(70);
		result.setAiSummary("전반적으로 업무 속도가 빠르고 성실함이 돋보이는 사원입니다.");
		result.setRegEmpNo("M1_LEADER");

		int count = evalMapper.insertQuantEvalResult(result);

		assertThat(count).isEqualTo(1);
		log.info("✅ [저장테스트] DB에 AI 분석 결과가 저장되었습니다! 사번: {}", result.getEmpNo());
	}

	@Test
	@DisplayName("AI 분석용 통합 팩트 데이터 조회 테스트")
	void selectEmpPerformanceFactTest() {
		String empNo = "2025001";

		Map<String, Object> fact = evalMapper.selectEmpPerformanceFact(empNo);

		assertThat(fact).isNotNull();

		log.info("====================================================");
		log.info("🚀 [AI 팩트 리포트 추출]");
		log.info("대상 사원: {} ({})", fact.get("EMP_NM"), empNo);
		log.info("1. KPI 목표:\n{}", fact.get("KPI_LIST"));
		log.info("2. 담당 업무:\n{}", fact.get("TASK_LIST"));
		log.info("3. 상세 로그:\n{}", fact.get("DETAILED_LOGS"));
		log.info("4. 로그 횟수: {}회", fact.get("LOG_COUNT"));
		log.info("====================================================");
	}
	
	@Test
	@Rollback(false)
	@DisplayName("모든 프로젝트 로그를 하나도 빠짐없이 벡터 DB에 꽂기")
	void syncLogsToVectorTest() {
	    String empNo = "2025044"; 
	    
	    // 1. 참여 중인 프로젝트 리스트 확보
	    List<ProjectDTO> projectList = evalMapper.selectProjectListByEmp(empNo);
	    
	    if (projectList == null || projectList.isEmpty()) {
	        log.warn("참여 중인 프로젝트가 없습니다.");
	        return;
	    }

	    // 2. 프로젝트 번호만 리스트로 추출 딲!
	    List<Long> projNoList = projectList.stream()
	                                    .map(ProjectDTO::getProjectNo)
	                                    .collect(Collectors.toList());

	    List<Document> allDocuments = new ArrayList<>();

	    // 3. [개선] 모든 프로젝트 로그를 '한 번의 쿼리'로 싹 긁어오기
	    List<Map<String, Object>> projectLogs = evalMapper.selectLogsForVectorSync(empNo, projNoList);
	    
	    log.info("📊 프로젝트 로그 수집 완료: {}건", projectLogs.size());
	    for (Map<String, Object> row : projectLogs) {
	        allDocuments.add(new Document(String.valueOf(row.get("vectorContent")), 
	                    Map.of("empNo", empNo, "type", "PROJECT", "taskNo", row.get("taskNo"))));
	    }

	    // 4. 개인 업무 로그 추가 (기존 로직 유지)
	    List<Map<String, Object>> personalLogs = evalMapper.selectPersonalLogsForVector(empNo);
	    log.info("📋 개인 업무 로그 수집 완료: {}건", personalLogs.size());
	    for (Map<String, Object> row : personalLogs) {
	        allDocuments.add(new Document(String.valueOf(row.get("vectorContent")), 
	                    Map.of("empNo", empNo, "type", "PERSONAL")));
	    }

	    // 5. 벡터 DB 저장
	    log.info("🚀 최종 집계: 총 {}건의 데이터를 벡터 DB에 저장합니다.", allDocuments.size());
	    if (!allDocuments.isEmpty()) {
	        vectorStore.add(allDocuments); 
	        log.info("✅ 벡터 DB 저장 완료!");
	    }
	}
}