package com.flowenect.hr.eval.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.eval.QualEvalResultDTO;
import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@Transactional // 테스트 완료 후 자동 롤백 (DB 오염 방지)
class EvalServiceTest {

    @Autowired
    private EvalService evalService;

    @Test
    @DisplayName("부서별 평가 대상 사원 명단 조회 테스트")
    void testReadDeptEmpList() {
        // given: 실제 DB에 존재하는 부서 코드
        String deptCd = "2026HR01"; 

        // when
        List<QualTargetDTO> list = evalService.readDeptEmpList(deptCd);

        // then
        assertThat(list).isNotNull();
        log.info("조회된 사원 수: {}", list.size());
    }
    
    @Test
    @DisplayName("정량 평가 항목 페이징 조회 및 데이터 가공 테스트")
    void testReadListQualEval() {
        // 1. Given
        // Mock 객체 생성 (또는 실제 객체 생성)
        EmpDTOWrapper mockWrapper = mock(EmpDTOWrapper.class);
        EmpDTO mockEmp = new EmpDTO();
        mockEmp.setDeptCd("2026HR01"); // 실제 부서 코드 세팅
        
        // Wrapper 동작 정의
        when(mockWrapper.getUsername()).thenReturn("20230001"); // 테스트용 사번
        when(mockWrapper.getRealUser()).thenReturn(mockEmp);

        PagingDTO pagingDTO = new PagingDTO();
        pagingDTO.setPage(1);

        // 2. When
        // 이제 String이 아닌 Wrapper 객체를 넘깁니다.
        Map<String, Object> result = evalService.readListQualEval(mockWrapper, pagingDTO);

        // 3. Then
        assertThat(result).isNotNull();
        assertThat(result).containsKey("questions");
        assertThat(result).containsKey("targetList");
        
        List<?> questions = (List<?>) result.get("questions");
        List<?> targetList = (List<?>) result.get("targetList");

        log.info("조회 성공 - 사번: {}", mockWrapper.getUsername());
        log.info("조회된 항목(questions) 수: {}", questions.size());
        log.info("조회된 대상자(targetList) 수: {}", targetList.size());
    }

    @Test
    @DisplayName("정성 평가 결과 테이블 인서트 테스트")
    void testCreateQualEval() {
        String realEmpNo = "2025053"; 
        String realEvalCd = "HR_01"; // 또는 HR_01이 실제 DB에 있다면 그것을 사용
        
        // 1. Given: 전체 평가 정보를 담은 메인 DTO
        QualEvalResultDTO mainDto = new QualEvalResultDTO();
        mainDto.setTargetEmpNo(realEmpNo);   // 2024044 대신 실제 사번 사용
        mainDto.setEvaluatorId(realEmpNo);  // 실제 사번 사용
        mainDto.setEvalYear("2026");
        mainDto.setEvalQuarter("2");

        // 2. 핵심: 정성 평가 항목별 점수 리스트 생성
        List<QualEvalResultDTO> details = new ArrayList<>();
        
        // 항목 1
        QualEvalResultDTO item1 = new QualEvalResultDTO();
        item1.setEvalCd(realEvalCd);         // 실제 코드 변수 사용
        item1.setEvalScore(5);      
        item1.setTargetEmpNo(realEmpNo);    // 실제 사번 변수 사용
        item1.setEvaluatorId(realEmpNo);    // 실제 사번 변수 사용
        details.add(item1);
        
        // 항목 2
        QualEvalResultDTO item2 = new QualEvalResultDTO();
        item2.setEvalCd(realEvalCd);         // 실제 코드 변수 사용
        item2.setEvalScore(5);      
        item2.setTargetEmpNo(realEmpNo);    // 실제 사번 변수 사용
        item2.setEvaluatorId(realEmpNo);    // 실제 사번 변수 사용
        details.add(item2);

        mainDto.setResultList(details);

        // 3. When & Then
        assertDoesNotThrow(() -> {
            evalService.createQualEval(mainDto);
        }, "정성 평가 결과 인서트 중 예외가 발생하지 않아야 합니다.");
    }
    
    @Test
    @DisplayName("특정 사원의 성과 데이터를 벡터 DB에 저장(Insert) 테스트")
    void testInsertEmployeeLogsToVector() {
        String realEmpNo = "2025044"; 

        int savedCount = evalService.createEmployeeLogsToVector(realEmpNo);

        log.info("🚀 [Vector Test] 사번 {}의 성과 데이터 저장 완료 - 총 {}건", realEmpNo, savedCount);
        
        assertThat(savedCount).isGreaterThan(0);
    }
}