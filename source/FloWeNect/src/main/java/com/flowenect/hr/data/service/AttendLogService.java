package com.flowenect.hr.data.service;

import java.util.List;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseAttendanceDTO;

public interface AttendLogService {
	
	/**
     * [조직도] 활성화된 모든 부서 목록 조회
     * @return 부서 정보 리스트
     */
    List<DeptDTO> readActiveDeptList();

    /**
     * [조직도] 특정 부서에 속한 사원 목록 조회 (지연 로딩용)
     * @param deptCd 부서 코드
     * @return 해당 부서의 재직 사원 리스트
     */
    List<EmpDTO> readEmpListByDept(String deptCd);

    /**
     * 근태 로그 목록 조회 (페이징 데이터 포함)
     * @param searchRequest 검색 조건 및 페이징 정보
     * @return 목록 데이터와 페이징 결과가 담긴 Map (또는 전용 Response 객체)
     */
	PagedResponse<ResponseAttendanceDTO> readAttendLogList(SearchRequest searchRequest);

    /**
     * 오늘 근태 기록 조회
     * @param empNo 사원번호
     * @return 오늘의 근태 정보
     */
    AttendanceDTO readTodayAttend(String empNo);
}
