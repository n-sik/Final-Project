package com.flowenect.hr.attendance.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

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
@Slf4j
@Transactional
class AttendanceMapperTest {

	@Autowired
	private AttendanceMapper attendanceMapper;
	
	@Test
	void testInsertAttendanceIn() {
		
	}

	@Test
	void testUpdateAttendanceOut() {
		
	}

	@Test
	void testUpdateAttendanceAutoOutAt18() {
		
	}

	@Test
	void testSelectAttendanceList() {
		// Given: 검색 및 페이징 조건 설정
        Map<String, Object> params = new HashMap<>();
        params.put("startRow", 1);
        params.put("endRow", 10);
        params.put("empNo", "2026020221"); // 존재하는 사번 가정
        params.put("workDt", LocalDate.of(2026, 2, 20));

        // When: 매퍼 메서드 실행
        List<AttendanceDTO> list = attendanceMapper.selectAttendanceList(params);

        // Then: 검증
        log.info("[목록 조회 결과 크기]: {}", list.size());
        
        if (!list.isEmpty()) {
            list.forEach(dto -> log.info("사원번호: {}, 출근시간: {}, 상태: {}", 
                dto.getEmpNo(), dto.getInDtm(), dto.getAttdStatCd()));
        }

        assertThat(list).isNotNull();
	}

	@Test
	void testSelectAttendanceCount() {
		// 1. Given: 검색 조건 설정
        Map<String, Object> params = new HashMap<>();
        params.put("empNo", "2026020221");
        params.put("workDt", LocalDate.of(2026, 2, 20));

        // 2. When: 개수 조회 실행
        long totalCount = attendanceMapper.selectAttendanceCount(params);

        // 3. Then: 로그 출력 및 검증
        log.info("[조회된 전체 데이터 개수]: {}건", totalCount);
        
        assertThat(totalCount).isGreaterThanOrEqualTo(0L);
	}

	@Test
	void testUpdateAttendance() {
		// 1. Given: 수정할 데이터 세팅
        AttendanceDTO attendanceDto = new AttendanceDTO();
        attendanceDto.setAttdNo(9L); // 수정할 대상 PK
        attendanceDto.setWorkDt(LocalDate.of(2021, 3, 20));
        attendanceDto.setInDtm(LocalDateTime.of(2021, 3, 20, 8, 50, 0)); // 08:50 출근
        attendanceDto.setOutDtm(LocalDateTime.of(2021, 3, 20, 18, 0, 0));  // 18:00 퇴근
        attendanceDto.setLateYn("N");
        attendanceDto.setOutAutoYn("N");
        attendanceDto.setAttdStatCd("20");
        attendanceDto.setRemark("오전 반차 사후 승인으로 인한 수정");

        // 2. When: 업데이트 실행
        int result = attendanceMapper.updateAttendance(attendanceDto);

        // 3. Then: 성공 여부 확인
        assertThat(result).isEqualTo(1); 
        log.info("수정 성공 여부(1이면 성공): " + result);
	}
	
	@Test
	void testInsertAttendance() {
		// given
        AttendanceDTO dto = AttendanceDTO.builder()
                .empNo("2025005")
                .workDt(LocalDate.of(2026, 2, 25))
                .inDtm(LocalDateTime.of(2026, 2, 25, 9, 30))
                .lateYn("Y")
                .outAutoYn("N")
                .attdStatCd("LATE")
                .remark("테스트 지각 등록")
                .build();

        // when
        int result = attendanceMapper.insertAttendance(dto);

        // then
        log.info("insert 결과: {}", result);

        assertEquals(1, result);
	}

}
