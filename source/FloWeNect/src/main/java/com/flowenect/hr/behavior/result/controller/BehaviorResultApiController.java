package com.flowenect.hr.behavior.result.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.flowenect.hr.behavior.result.service.BehaviorResultService;
import com.flowenect.hr.dto.behavior.res.BehaviorResultDetailRes;
import com.flowenect.hr.dto.behavior.res.BehaviorRspnsSummaryDTO;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/behavior/result")
@RequiredArgsConstructor
public class BehaviorResultApiController {

	private final BehaviorResultService behaviorResultService;

	/**
	 * 대상자(기본) 기준 응답 목록 조회
	 * - empNo: 대상자 사번(필수)
	 * - testNo: 검사번호(선택)
	 * - startDate/endDate: yyyy-MM-dd (선택, 미입력 시 현재 반기)
	 */
	@GetMapping("/rspns")
	public List<BehaviorRspnsSummaryDTO> readRspnsList(
		@RequestParam String empNo,
		@RequestParam(required = false) String testNo,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate
	) {
		return behaviorResultService.readRspnsSummaries(empNo, testNo, startDate, endDate);
	}

	/** 응답 상세 조회 (문항/항목/선택점수) */
	@GetMapping("/detail")
	public BehaviorResultDetailRes readRspnsDetail(
		@RequestParam int rspnsNo
	) {
		return behaviorResultService.readRspnsDetail(rspnsNo);
	}

	/**
	 * 셀프테스트 결과 상세(저장 없이)
	 * - 프론트에서 점수로 typeCd 산출 후, type 리포트만 조회하여 모달로 표시
	 */
	@GetMapping("/self-detail")
	public BehaviorResultDetailRes readSelfDetail(
		@RequestParam int testNo,
		@RequestParam String typeCd,
		@AuthenticationPrincipal EmpDTOWrapper principal
	) {
		String empNo = principal != null ? principal.getUsername() : null;
		return behaviorResultService.readSelfResultDetail(empNo, testNo, typeCd);
	}
}
