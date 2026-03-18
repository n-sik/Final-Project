package com.flowenect.hr.data.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.data.service.AttendLogService;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseAttendanceDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/attendlog") 
public class AttendLogController {
	
    private final AttendLogService attendLogService;
    
    /**
     * [조직도] 1. 전체 부서 목록 조회
     * GET /api/attendlog/depts
     */
    @GetMapping("/depts")
    public ResponseEntity<List<DeptDTO>> getDeptList() {
        return ResponseEntity.ok(attendLogService.readActiveDeptList());
    }

    /**
     * [조직도] 2. 특정 부서 사원 목록 조회 (지연 로딩)
     * GET /api/attendlog/depts/{deptCd}/employees
     */
    @GetMapping("/depts/{deptCd}/employees")
    public ResponseEntity<List<EmpDTO>> getDeptEmployees(@PathVariable String deptCd) {
        return ResponseEntity.ok(attendLogService.readEmpListByDept(deptCd));
    }

    /**
     * [조회] 근태 로그 목록 조회 (검색/페이징)
     * URL: GET /api/attendlog/list
     */
    @GetMapping("/list")
    public ResponseEntity<PagedResponse<ResponseAttendanceDTO>> getAttendLogList(SearchRequest searchRequest) {
        log.info("근태 목록 조회 요청: {}", searchRequest);
        PagedResponse<ResponseAttendanceDTO> response = attendLogService.readAttendLogList(searchRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * [조회] 오늘 근태 현황 조회
     * URL: GET /api/attendlog/today
     */
    @GetMapping("/today")
    public ResponseEntity<AttendanceDTO> getTodayAttend(@RequestParam("empNo") String empNo) {
        log.info("오늘 근태 조회 요청 - 사번: {}", empNo);
        AttendanceDTO response = attendLogService.readTodayAttend(empNo);
        return ResponseEntity.ok(response);
    }
}