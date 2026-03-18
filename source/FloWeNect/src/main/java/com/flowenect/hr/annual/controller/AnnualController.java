package com.flowenect.hr.annual.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.annual.service.AnnualService;
import com.flowenect.hr.attendance.controller.AttendanceController;
import com.flowenect.hr.attendance.service.AttendanceService;
import com.flowenect.hr.dto.AnnualDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class AnnualController {

	private final AnnualService annualService;
	
	/**
	 * 연차 목록 조회
	 */
	@GetMapping("/readList")
	public ResponseEntity<List<AnnualDTO>> readAnnualList(
			@RequestParam String baseYr,
	        @RequestParam(defaultValue = "전체") String posNm,
	        @RequestParam(defaultValue = "") String search
		){
		
		// DB에서 이미 NVL로 0 처리를 다 해서 오기 때문에 
	    // 컨트롤러에서는 로직 추가 없이 바로 반환하면 됩니다.
		return ResponseEntity.ok(annualService.readAnnualList(baseYr, posNm, search));
	}
	
	/**
	 * 연차 정보 저장 (최초 생성 혹은 수정)
	 * @param annualDTO
	 */
	@PutMapping("/upsert")
	public ResponseEntity<String> upsertAnnual(@RequestBody AnnualDTO annualDTO){
		
		log.info("연차 저장 요청: {}", annualDTO);
		int result = annualService.upsertAnnual(annualDTO);
		
		if (result > 0) {
			return ResponseEntity.ok("성공적으로 저장되었습니다.");
		} else {
			return ResponseEntity.badRequest().body("저장에 실패했습니다.");
		}
	}
	
	/**
	 * 직위별 연차 일괄 등록 (최초 생성 혹은 수정)
	 * @param baseYr
	 * @param posNm
	 * @param totAnnualLv
	 */
	@PutMapping("/upsertBulk")
	public ResponseEntity<String> upsertBulkAnnual(
			@RequestParam String baseYr,
			@RequestParam String posNm,
			@RequestParam Integer totAnnualLv
			) {
		
		log.info("일괄 수정 요청: {}년도 {}직위 -> {}일", baseYr, posNm, totAnnualLv);
		int result = annualService.upsertBulkAnnual(baseYr, posNm, totAnnualLv);
		
		return ResponseEntity.ok(result + "명의 연차가 일괄 처리되었습니다.");
	}
	
	/**
	 * 단일 항목 삭제
	 * @param annualNo
	 */
	@DeleteMapping("/remove/{annualNo}")
	public ResponseEntity<String> removeAnnual(@PathVariable Long annualNo) {
		
		log.info("항목 삭제: {}", annualNo);
		int result = annualService.removeAnnual(annualNo);
		
		return ResponseEntity.ok(result + "건이 삭제되었습니다.");
	}
	
	/**
	 * 다중 항목 삭제
	 * @param idList
	 */
	@DeleteMapping("/removeSelected")
	public ResponseEntity<String> removeSelectedAnnual(@RequestBody List<Long> idList) {
		
		if (idList == null || idList.isEmpty()) {
            return ResponseEntity.badRequest().body("삭제할 항목이 선택되지 않았습니다.");
        }
		
		log.info("선택 항목 삭제: {}건", idList.size());
		int result = annualService.removeSelectedAnnual(idList);
		
		return ResponseEntity.ok(result + "건이 삭제되었습니다.");
	}
}
