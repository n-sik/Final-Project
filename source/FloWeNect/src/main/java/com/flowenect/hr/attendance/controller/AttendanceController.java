package com.flowenect.hr.attendance.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.attendance.service.AttendanceService;
import com.flowenect.hr.dto.attendance.AttendanceDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

	private final AttendanceService attendanceService;
	
	/**
	 * 근태 목록 및 검색 결과 총 개수 조회
	 * @param currentPage
	 * @param empNo
	 * @param workDt
	 * @param attdStatCd
	 */
	@GetMapping("/readList")
	public Map<String, Object> readAttendanceList(
			@RequestParam(defaultValue = "1") int currentPage,
            @RequestParam(required = false) String empNo,
            @RequestParam(required = false) String empNm,
            @RequestParam(required = true) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate workDt,
            @RequestParam(required = false) String attdStatCd,
            @RequestParam(required = false) String deptNm
	) {
		// 파라미터 맵 구성 (Service에 전달)
        Map<String, Object> params = new HashMap<>();
        params.put("currentPage", currentPage);
        params.put("empNo", empNo);
        params.put("empNm", empNm); 
        params.put("workDt", workDt);
        params.put("attdStatCd", attdStatCd);
        params.put("deptNm", deptNm);

        // 서비스 호출하여 결과 데이터 확보
        List<AttendanceDTO> list = attendanceService.readAttendanceList(params);
        long totalCount = attendanceService.readAttendanceCount(params);

        // 응답 데이터 구성 (JSON으로 변환될 맵)
        Map<String, Object> response = new HashMap<>();
        response.put("list", list);
        response.put("totalCount", totalCount);
        response.put("currentPage", currentPage);

        log.info("근태 목록 조회 완료 - 검색된 데이터 총 {}건", totalCount);

        return response; // 200 OK 상태코드와 함께 JSON 반환
	}
	
	
	/**
	 * 사원 근태정보 저장 (있으면 update, 없으면 insert)
	 * @param attendanceDTO
	 */
	@PutMapping("/modify")
	public String modifyAttendance(@RequestBody AttendanceDTO attendanceDTO) {
		log.info("근태 수정 요청 - 번호: {}, 상태: {}", attendanceDTO.getAttdNo(), attendanceDTO.getAttdStatCd());
	
		int result = attendanceService.modifyAttendance(attendanceDTO);
        
        return result > 0 ? "success" : "fail";
	}
	
}
