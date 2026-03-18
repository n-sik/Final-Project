package com.flowenect.hr.attendance.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.attendance.mapper.AttendanceMapper;
import com.flowenect.hr.dto.attendance.AttendanceDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

	private final AttendanceMapper attendanceMapper;
	
	/**
	 * 전체 사원의 근태 목록
	 */
	@Override
	@Transactional
	public List<AttendanceDTO> readAttendanceList(Map<String, Object> params) {
		
		// 1. 페이지 정보 추출 (Controller에서 넘어온 값)
        // 만약 값이 없으면 기본값으로 1페이지, 10개씩 설정
        int currentPage = Integer.parseInt(String.valueOf(params.getOrDefault("currentPage", 1)));
        int pageSize = 10; 

        // 2. 오라클용 startRow, endRow 계산 (Service의 핵심 역할)
        int startRow = (currentPage - 1) * pageSize + 1;
        int endRow = currentPage * pageSize;

        // 3. Mapper가 이해할 수 있는 파라미터로 가공해서 전달
        params.put("startRow", startRow);
        params.put("endRow", endRow);

        log.info("근태 목록 조회 [페이지: {}, 구간: {} ~ {}]", currentPage, startRow, endRow);
		
		return attendanceMapper.selectAttendanceList(params);
	}

	/**
	 * 페이징 처리를 위해 검색 조건에 맞는 데이터 개수 파악
	 */
	@Override
	@Transactional
	public long readAttendanceCount(Map<String, Object> params) {
		
		return attendanceMapper.selectAttendanceCount(params);
	}

	/**
	 * 사원 근태정보 저장 (있으면 update, 없으면 insert)
	 */
	@Override
	@Transactional
	public int modifyAttendance(AttendanceDTO attendance) {
		
		// 상태가 'VACATION'(연차) 또는 'ABSENT'(결근)인 경우
		String stat = attendance.getAttdStatCd();
		
		if ("VACATION".equals(stat) || "ABSENT".equals(stat)) {
			
			log.info("사원번호 {}의 상태가 {}이므로 시간을 초기화합니다.", attendance.getEmpNo(), stat);
			
			attendance.setInDtm(null);
			attendance.setOutDtm(null);
			attendance.setLateYn("N");    // 지각 여부 초기화
		}		
		
		// update 시도
		int updated = attendanceMapper.updateAttendance(attendance);
		
		// update가 0건이면 => 해당 날짜 근태 행이 없던 것 => insert
		if (updated == 0) {
			return attendanceMapper.insertAttendance(attendance);
		}
		
		return updated;
	}


}
