package com.flowenect.hr.data.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseAttendanceDTO;

@Mapper
public interface AttendLogMapper {
	
	/**
     * 전체 부서 목록 조회 (좌측 메뉴 초기 바인딩용)
     */
    List<DeptDTO> selectActiveDeptList();

    /**
     * 특정 부서에 속한 사원 목록 조회 (부서 클릭 시 호출)
     */
    List<EmpDTO> selectEmpListByDept(@Param("deptCd") String deptCd);
    
	/**
     * 근태 로그 목록 조회 (검색 및 페이징 포함)
     */
	List<ResponseAttendanceDTO> selectAttendLogList(SearchRequest searchRequest);

    /**
     * 오늘 근태 기록 단건 조회
     */
    AttendanceDTO selectTodayAttend(@Param("empNo") String empNo);
    
    /**
     * 페이징 처리를 위한 전체 레코드 개수 조회
     */
    int selectAttendLogCount(SearchRequest searchRequest);
}
