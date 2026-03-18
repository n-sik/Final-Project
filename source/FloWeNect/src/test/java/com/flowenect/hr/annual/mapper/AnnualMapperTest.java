package com.flowenect.hr.annual.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.AnnualDTO;

import lombok.extern.slf4j.Slf4j;

@SpringBootTest(properties = { "jasypt.encryptor.password=java" })
@Slf4j
@Transactional
class AnnualMapperTest {

	@Autowired
	private AnnualMapper annualMapper;
	
	@Autowired
	private JdbcTemplate jdbcTemplate;
	
	private Long testAnnualNo = 9999L;
    private String testEmpNo = "2025001";
    private String testBaseYr = "2025";
	
	@BeforeEach
	void setUp() {
		// 테스트용 데이터 삽입 (기존에 데이터가 없을 경우를 대비해 clean up 후 insert)
        jdbcTemplate.execute("DELETE FROM EMP_ANNUAL_LV WHERE ANNUAL_NO = " + testAnnualNo);
        
        jdbcTemplate.execute("INSERT INTO EMP_ANNUAL_LV (ANNUAL_NO, EMP_NO, BASE_YR, TOT_ANNUAL_LV, USED_ANNUAL_LV, REM_ANNUAL_LV, SICK_LV, OFFICIAL_LV, REWARD_LV) " +
                             "VALUES (" + testAnnualNo + ", '" + testEmpNo + "', '" + testBaseYr + "', 15, 0, 15, 0, 0, 0)");
	}
	
	@Test
	void testSelectAnnualList() {
		// When: 전체 조회 (검색어 없이)
        List<AnnualDTO> list = annualMapper.selectAnnualList(testBaseYr, "전체", "");

        // Then
        assertNotNull(list);
        assertFalse(list.isEmpty(), "목록이 비어있지 않아야 합니다.");
        
        // 9999번 데이터가 포함되어 있는지 확인
        boolean exists = list.stream().anyMatch(dto -> dto.getAnnualNo().equals(testAnnualNo));
        assertTrue(exists, "테스트로 넣은 9999번 데이터가 조회되어야 합니다.");
	}

	@Test
	void testInsertAnnual() {
		// [중요] 반드시 EMP 테이블에 실제로 존재하는 사번을 적으세요!
	    String realEmpNo = "2026020213"; 

	    // 테스트를 위해 기존에 혹시 있을지 모를 연차 데이터 삭제 (중복 방지)
	    jdbcTemplate.execute("DELETE FROM EMP_ANNUAL_LV WHERE EMP_NO = '" + realEmpNo + "' AND BASE_YR = '2026'");

	    AnnualDTO newDto = AnnualDTO.builder()
	            .empNo(realEmpNo)
	            .baseYr("2026") // 연도는 사번과 상관없으니 2026으로 테스트 가능
	            .sickLv(3)
	            .officialLv(1)
	            .rewardLv(1)
	            .build();

	    // When
	    int result = annualMapper.insertAnnual(newDto);

	    // Then
	    assertEquals(1, result, "실제 존재하는 사원의 연차 데이터는 삽입되어야 합니다.");
	}
	
	@Test
	void testUpdateAnnual() {
		// Given
        AnnualDTO updateDto = AnnualDTO.builder()
                .annualNo(testAnnualNo)
                .sickLv(5)      // 기존 0 -> 5
                .officialLv(2)  // 기존 0 -> 2
                .rewardLv(1)    // 기존 0 -> 1
                .build();

        // When
        int result = annualMapper.updateAnnual(updateDto);

        // Then
        assertEquals(1, result);
        
        // 잔여 연차 계산 검증: 15(TOT) - (0(USED) + 5 + 2 + 1) = 7
        List<AnnualDTO> list = annualMapper.selectAnnualList(testBaseYr, "전체", testEmpNo);
        assertEquals(7, list.get(0).getRemAnnualLv(), "수정 후 잔여 연차 재계산이 틀렸습니다.");
	}
	
	@Test
	void testInsertBulkAnnual() {
		// [Given] 깨끗한 테스트를 위해 특정 년도/직위 데이터 삭제
        // 테스트용 사원(testEmpNo)의 직위가 '사원'이라고 가정
        String targetPos = "부장"; 
        jdbcTemplate.update("DELETE FROM EMP_ANNUAL_LV WHERE BASE_YR = ? AND EMP_NO = ?", testBaseYr, testEmpNo);
        
        Integer newTotLv = 15;

        // [When] 데이터가 없는 사원들에 대해 INSERT 수행
        int insertedRows = annualMapper.insertBulkAnnual(testBaseYr, targetPos, newTotLv);

        // [Then]
        log.info("신규 생성된 사원 수: {}", insertedRows);
        assertTrue(insertedRows >= 0, "인서트된 행은 0 이상이어야 합니다.");
        
        // 실제 DB에 설정한 값대로 들어갔는지 확인 (testEmpNo 기준)
        Integer checkLv = jdbcTemplate.queryForObject(
            "SELECT TOT_ANNUAL_LV FROM EMP_ANNUAL_LV WHERE BASE_YR = ? AND EMP_NO = ?",
            Integer.class, testBaseYr, testEmpNo
        );
        assertEquals(newTotLv, checkLv, "총 연차가 설정한 15일로 저장되어야 합니다.");
	}

	@Test
	void testUpdateBulkAnnual() {
		// [Given] 이미 데이터가 존재하는 상태 (setUp에서 15일로 넣어둠)
        String targetPos = "부장"; 
        Integer updateTotLv = 20;

        // [When] 기존 데이터가 있는 사원들에 대해 UPDATE 수행
        int updatedRows = annualMapper.updateBulkAnnual(testBaseYr, targetPos, updateTotLv);

        // [Then]
        log.info("업데이트된 사원 수: {}", updatedRows);
        assertTrue(updatedRows >= 1, "setUp에서 넣은 데이터가 있으므로 1건 이상 수정되어야 합니다.");
        
        // 값 변경 및 잔여 연차 재계산 검증
        // 공식: (총 20 + 포상 0) - (사용 0 + 병가 0) = 20
        Map<String, Object> row = jdbcTemplate.queryForMap(
            "SELECT TOT_ANNUAL_LV, REM_ANNUAL_LV FROM EMP_ANNUAL_LV WHERE ANNUAL_NO = ?", testAnnualNo);
        
        assertEquals(updateTotLv, ((Number)row.get("TOT_ANNUAL_LV")).intValue());
        assertEquals(20, ((Number)row.get("REM_ANNUAL_LV")).intValue());
	}

	@Test
	void testDeleteAnnual() {
		// When
        int result = annualMapper.deleteAnnual(testAnnualNo);

        // Then
        assertEquals(1, result, "삭제 행 수는 1이어야 합니다.");
	}

	@Test
	void testDeleteSelectedAnnual() {
		// Given: 삭제할 ID 리스트 (실제 존재하지 않아도 문법 오류 체크)
        List<Long> idList = Arrays.asList(testAnnualNo, 8888L);

        // When
        int result = annualMapper.deleteSelectedAnnual(idList);

        // Then
        log.info("삭제된 항목 수: {}", result);
        assertTrue(result >= 1, "최소한 testAnnualNo는 삭제되어야 합니다.");
	}

}
