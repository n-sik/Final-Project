package com.flowenect.hr.attendance.service;

import java.util.List;
import java.util.Map;

import com.flowenect.hr.dto.attendance.AttendanceDTO;

public interface AttendanceService {
	
	/**
	 * 전체 사원의 근태 목록
	 * @param params
	 */
	List<AttendanceDTO> readAttendanceList(Map<String, Object> params);
	
	/**
	 * 페이징 처리를 위해 검색 조건에 맞는 데이터 개수 파악
	 * @param params
	 */
	long readAttendanceCount(Map<String, Object> params);
	
	/**
	 * 사원 근태정보 저장 (있으면 update, 없으면 insert)
	 * @param attendance
	 */
	int modifyAttendance(AttendanceDTO attendance);
	
}
