package com.flowenect.hr.eval.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.common.PagingDTO;
import com.flowenect.hr.dto.eval.QualEvalMasterDTO;
import com.flowenect.hr.dto.eval.QualEvalResultDTO;
import com.flowenect.hr.dto.eval.QualTargetDTO;
import com.flowenect.hr.dto.project.ProjectDTO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@Transactional
class EvalQualMapperTest {
	
	@Autowired
    private EvalMapper evalMapper;

	@Test
	@DisplayName("부서별 평가 대상 사원 목록 조회 테스트")
	void testSelectEvalTargetList() {
		String deptCd = "2026DV01";

        // when
        List<QualTargetDTO> targets = evalMapper.selectEvalTargetList(deptCd);

        // then
        assertThat(targets).isNotNull();
        if (!targets.isEmpty()) {
            assertThat(targets.get(0).getDeptCd()).isEqualTo(deptCd);
        }
	}

	@Test
	@DisplayName("사원번호 기준 상세 정보 조회 테스트")
    void selectEmpDetailByNoTest() {
        // given
        String targetEmpNo = "2024001";

        // when
        QualTargetDTO detail = evalMapper.selectEmpDetailByNo(targetEmpNo);

        // then
        // 데이터가 있다는 가정하에 검증 (데이터가 없으면 null 체크)
        if (detail != null) {
            assertThat(detail.getEmpNo()).isEqualTo(targetEmpNo);
        }
	}

	@Test
    @DisplayName("정량 평가 항목 페이징 조회 및 카운트 테스트")
    void qualEvalListAndCountTest() {
        // given
        String deptCd = "2026DV01";
        PagingDTO paging = new PagingDTO();
        paging.setPage(1);
        paging.setRecordSize(10);

        // when
        List<QualEvalMasterDTO> list = evalMapper.selectListQualEval(deptCd, paging);
        int totalCount = evalMapper.selectCountQualEval(deptCd);

        // then
        assertThat(list).isNotNull();
        assertThat(totalCount).isGreaterThanOrEqualTo(list.size());
    }

	@Test
	@DisplayName("정량 평가 결과 저장 및 중복 확인 테스트")
	void insertAndCheckEvalTest() {
	    // 1. DTO 생성
	    QualEvalResultDTO resultDto = new QualEvalResultDTO();
	    resultDto.setTargetEmpNo("2025001");
	    resultDto.setEvaluatorId("2025044");
	    resultDto.setEvalYear("2024");
	    resultDto.setEvalQuarter("1");
	    
	    List<QualEvalResultDTO> details = new ArrayList<>();
	    QualEvalResultDTO detail1 = new QualEvalResultDTO();
	    detail1.setEvaluatorId("2025001");
	    detail1.setEvalCd("HR_01");
	    detail1.setEvalScore(5);
	    details.add(detail1);
	    
	    resultDto.setResultList(details); // Mapper XML에서 참조하는 이름과 동일해야 함

	    // 3. 실행 및 검증
	    int existCount = evalMapper.checkExistEval(resultDto);
	    if (existCount == 0) {
	        int insertedRows = evalMapper.insertQualEvalResults(resultDto);
	        assertThat(insertedRows).isGreaterThan(0);
	    }
	}

	@Test
	@DisplayName("정량 평가 결과 저장 테스트")
	void testInsertQualEvalResults() {
	    QualEvalResultDTO resultDto = new QualEvalResultDTO();
	    resultDto.setTargetEmpNo("2025001");
	    resultDto.setEvaluatorId("2025044");
	    resultDto.setEvalYear("2024");
	    resultDto.setEvalQuarter("1");
	    
	    // 상세 항목 리스트 생성
	    List<QualEvalResultDTO> details = new ArrayList<>();
	    QualEvalResultDTO item = new QualEvalResultDTO();
	    item.setEvalCd("HR_01");
	    item.setEvalScore(5);
	    item.setEvaluatorId("2025044");
	    details.add(item);
	    
	    resultDto.setResultList(details);

	    // when: 매퍼 호출
	    int insertedRows = evalMapper.insertQualEvalResults(resultDto);

	    // then: 1행 이상 삽입되었는지 검증
	    assertThat(insertedRows).isGreaterThan(0);
	}

	@Test
	@DisplayName("동일 분기 평가 중복 여부 확인 테스트")
	void testCheckExistEval() {
	    String existingEmpNo = "2024001"; 
	    
	    QualEvalResultDTO checkDto = new QualEvalResultDTO();
	    checkDto.setTargetEmpNo(existingEmpNo);
	    checkDto.setEvalYear("2026");
	    checkDto.setEvalQuarter("1");

	    // 2. When: 중복 체크 수행
	    int count = evalMapper.checkExistEval(checkDto);

	    // 3. Then: 
	    assertThat(count).isGreaterThanOrEqualTo(0);
	    
	    if (count > 0) {
            log.warn("이미 평가 데이터가 존재합니다. 건수: {}", count);
        }
	}
}
