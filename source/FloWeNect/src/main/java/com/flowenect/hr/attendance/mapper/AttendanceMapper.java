package com.flowenect.hr.attendance.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.attendance.AttendanceDTO;

@Mapper
public interface AttendanceMapper {

	// 메인보드 - 출근처리 : 근태 레코드 생성(ATTD_NO는 시퀀스
	int insertAttendanceIn(@Param("empNo") String empNo);

	// 메인보드 - 퇴근 처리: 금일 OUT_DTM 업데이트(멱등: OUT_DTM IS NULL 조건을 XML에서 보장)
	int updateAttendanceOut(@Param("empNo") String empNo);  // 18시 고정 포함

	// 메인보드 - 자동퇴근 배치 : 18시 기준 미퇴근자 OUT_DTM 설정 + OUT_AUTO_YN='Y'
	int updateAttendanceAutoOutAt18();
	
	/*--- 출퇴 현황/관리 페이지용 ---*/
	
	// 전체 사원의 근태 목록
	List<AttendanceDTO> selectAttendanceList(Map<String, Object> params);
	
	// 페이징 처리를 위해 검색 조건에 맞는 데이터 개수 파악
    long selectAttendanceCount(Map<String, Object> params);
	
	// 사원 근태정보 수정
	int updateAttendance(AttendanceDTO attendance);

	// 사원 근태정보 등록(근태에 없을 때)
	int insertAttendance(AttendanceDTO attendance);
}
