package com.flowenect.hr.annual.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
class AnnualServiceImplTest {

	@Autowired
	private AnnualService annualService;
	
	@Autowired
	private JdbcTemplate jdbcTemplate;
	
	private final Long testAnnualNo = 99999L;
    private String testEmpNo;
    private String currentYear = String.valueOf(java.time.LocalDate.now().getYear());
    private String testPosNm;
	
	@BeforeEach
    void setUp() {
		// [1] 실제 DB에서 사원 1명과 그 사원의 직위명을 한꺼번에 조회 (조인 활용)
        Map<String, Object> realData = jdbcTemplate.queryForMap(
            "SELECT E.EMP_NO, P.POS_NM " +
            "FROM EMP E JOIN POSITION_MST P ON E.POS_CD = P.POS_CD " +
            "WHERE ROWNUM = 1"
        );
        
        testEmpNo = (String) realData.get("EMP_NO");
        testPosNm = (String) realData.get("POS_NM");

        // [2] 기존 테스트용 연차 데이터만 삭제 (사원/직위는 건드리지 않음)
        jdbcTemplate.update("DELETE FROM EMP_ANNUAL_LV WHERE ANNUAL_NO IN (99999, 99998)");

        // [3] 조회한 실제 사번으로 테스트용 연차 데이터 생성
        String sql = "INSERT INTO EMP_ANNUAL_LV (ANNUAL_NO, EMP_NO, BASE_YR, TOT_ANNUAL_LV, USED_ANNUAL_LV, REM_ANNUAL_LV, SICK_LV, OFFICIAL_LV, REWARD_LV) " +
                     "VALUES (?, ?, ?, 15, 0, 15, 0, 0, 0)";
        jdbcTemplate.update(sql, testAnnualNo, testEmpNo, currentYear);
        
        log.info("셋업 완료: 사번 {}, 직위 {}, 연도 {}", testEmpNo, testPosNm, currentYear);
    }
	
	@Test
	void testReadAnnualList() {
		// [Given]
	    // setUp에서 사용한 연도와 동일한 연도로 조회해야 데이터가 나옵니다.
	    // 검색어(search)와 직위(posNm)는 전체 조회를 위해 기본값(null 또는 "전체")을 넣습니다.
	    String baseYr = currentYear;
	    String posNm = "전체";
	    String search = "";

	    // [When]
	    List<AnnualDTO> list = annualService.readAnnualList(baseYr, posNm, search);

	    // [Then]
	    assertNotNull(list, "결과 리스트는 null이 아니어야 합니다.");
	    
	    // 💡 모든 사원이 나오는지 확인
	    log.info("조회된 전체 사원 수: {}명", list.size());
	    assertTrue(list.size() > 0, "최소한 한 명 이상의 사원이 조회되어야 합니다.");

	    // 💡 내가 setUp에서 임시로 넣은 데이터(99999L)가 포함되어 있는지 확인
	    boolean isPresent = list.stream().anyMatch(d -> d.getAnnualNo().equals(testAnnualNo));
	    assertTrue(isPresent, "조회된 리스트에 테스트용 연차 데이터(99999)가 포함되어야 합니다.");
	    
	    // 💡 NVL 처리가 잘 되어 0으로 나오는지 확인 (연차 번호가 99999인 데이터의 수치 검증)
	    AnnualDTO testData = list.stream()
	            .filter(d -> d.getAnnualNo().equals(testAnnualNo))
	            .findFirst()
	            .orElse(null);
	            
	    assertNotNull(testData);
	    assertEquals(15, testData.getTotAnnualLv(), "총 연차는 15일로 조회되어야 합니다.");
	}

	@Test
	void testUpsertAnnual() {
		AnnualDTO updateDto = AnnualDTO.builder()
                .annualNo(testAnnualNo)
                .sickLv(3).officialLv(1).rewardLv(1)
                .build();

        int result = annualService.upsertAnnual(updateDto);
        assertEquals(1, result);

        Map<String, Object> row = jdbcTemplate.queryForMap(
            "SELECT REM_ANNUAL_LV FROM EMP_ANNUAL_LV WHERE ANNUAL_NO = ?", testAnnualNo);
        assertEquals(10, ((Number)row.get("REM_ANNUAL_LV")).intValue());
    }

	@Test
	void testUpsertBulkAnnual() {
		// [Given]
        // 1. setUp에서 99999번 데이터(15일)는 이미 존재함 (UPDATE 대상)
        // 2. 다른 사원의 데이터는 삭제하여 없는 상태로 만듦 (INSERT 대상)
        jdbcTemplate.update("DELETE FROM EMP_ANNUAL_LV WHERE ANNUAL_NO != ? AND BASE_YR = ?", testAnnualNo, currentYear);
        
        Integer newBulkLv = 20;

        // [When] 
        // 인터페이스에 정의된 이름에 맞춰 호출 (upsertBulkAnnual -> modifyBulkAnnual로 이름 확인 필요)
        int result = annualService.upsertBulkAnnual(currentYear, testPosNm, newBulkLv);

        // [Then]
        assertTrue(result >= 1, "최소 1건 이상의 데이터가 처리되어야 합니다.");
        
        // 기존 99999번 데이터가 20일로 변경되었는지 확인
        Integer updatedTotLv = jdbcTemplate.queryForObject(
            "SELECT TOT_ANNUAL_LV FROM EMP_ANNUAL_LV WHERE ANNUAL_NO = ?", Integer.class, testAnnualNo);
        assertEquals(newBulkLv, updatedTotLv, "기존 데이터의 총 연차가 업데이트되지 않았습니다.");
        
        log.info("일괄 부여 성공: {}건 처리됨", result);
	}

	@Test
	void testDeleteAnnual() {
		int result = annualService.removeAnnual(testAnnualNo);
        assertEquals(1, result);
	}

	@Test
	void testDeleteSelectedAnnual() {
		// 추가 임시 데이터 생성
        jdbcTemplate.update("INSERT INTO EMP_ANNUAL_LV (ANNUAL_NO, EMP_NO, BASE_YR) VALUES (99998, ?, ?)", 
                testEmpNo, currentYear);
        
        List<Long> ids = Arrays.asList(testAnnualNo, 99998L);
        int result = annualService.removeSelectedAnnual(ids);
        assertEquals(2, result);
	}

}
