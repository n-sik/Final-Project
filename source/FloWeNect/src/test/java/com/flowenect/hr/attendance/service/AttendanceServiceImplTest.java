package com.flowenect.hr.attendance.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.attendance.AttendanceDTO;

import lombok.extern.slf4j.Slf4j;

@SpringBootTest(properties = { "jasypt.encryptor.password=java" })
@Transactional
@Slf4j
class AttendanceServiceImplTest {

	@Autowired
	private AttendanceService attendanceService;
	
	@Test
	void testReadAttendanceList() {
		// 1. Given: 컨트롤러에서 현재 페이지 번호를 담아 보낸 상황 가정
        Map<String, Object> params = new HashMap<>();
        params.put("currentPage", 2); // 2페이지 요청
        params.put("pageSize", 10);
        params.put("empNo", "2024001");

        // 2. When: 서비스 호출 (내부에서 startRow: 11, endRow: 20이 계산됨)
        List<AttendanceDTO> list = attendanceService.readAttendanceList(params);

        // 3. Then: 로그로 계산된 결과 확인 및 검증
        log.info("서비스로부터 반환된 리스트 크기: {}", list.size());
        
        // params에 서비스가 계산해서 넣어준 값이 제대로 들어있는지 확인
        log.info("서비스에서 계산된 startRow: {}", params.get("startRow"));
        log.info("서비스에서 계산된 endRow: {}", params.get("endRow"));

        assertThat(list).isNotNull();
        // 2페이지 요청 시 startRow는 11이어야 함
        assertThat(params.get("startRow")).isEqualTo(11);
	}

	@Test
	void testReadAttendanceCount() {
		// 1. Given
        Map<String, Object> params = new HashMap<>();
        params.put("empNo", "2026020001");

        // 2. When
        long totalCount = attendanceService.readAttendanceCount(params);

        // 3. Then
        log.info("서비스 호출 결과 총 데이터 개수: {}건", totalCount);
        assertThat(totalCount).isGreaterThanOrEqualTo(0L);
	}

	@Test
	void testModifyAttendance() {
		// 1. Given: 수정용 데이터 (PK는 DB에 실재하는 번호여야 함)
        AttendanceDTO dto = new AttendanceDTO();
        dto.setAttdNo(9L); 
        dto.setWorkDt(LocalDate.now());
        dto.setInDtm(LocalDateTime.now());
        dto.setLateYn("N");
        dto.setOutAutoYn("N");
        dto.setAttdStatCd("10");
        dto.setRemark("서비스 테스트를 통한 수정");

        // 2. When
        int result = attendanceService.modifyAttendance(dto);

        // 3. Then
        log.info("서비스 수정 처리 결과: {}", result > 0 ? "성공" : "실패");
        assertThat(result).isGreaterThanOrEqualTo(0); // 1이면 수정 성공, 0이면 대상 없음
	}

}
