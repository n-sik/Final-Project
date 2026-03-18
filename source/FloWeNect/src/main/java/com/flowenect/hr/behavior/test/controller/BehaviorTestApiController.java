package com.flowenect.hr.behavior.test.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.behavior.test.service.BehaviorTestService;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.behavior.EmpPickDTO;
import com.flowenect.hr.dto.behavior.req.BehaviorTestReq;
import com.flowenect.hr.dto.behavior.res.BehaviorTestRes;
import com.flowenect.hr.security.AuthenticationUtils;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("rest/behavior/test")
@RequiredArgsConstructor
public class BehaviorTestApiController {

	private final BehaviorTestService behaviorTestService;

	@GetMapping
	public BehaviorTestRes readListBehaviorTest(
		@RequestParam String testNo
	) {
		
		log.info("{}", testNo);
		log.info("{}", testNo);
		log.info("{}", testNo);
		log.info("{}", testNo);
		log.info("{}", testNo);
		log.info("{}", testNo);
		log.info("{}", testNo);
		
		BehaviorTestRes res = behaviorTestService.readBehaviorTest(testNo);
		return res;
	}

	/**
	 * 대상자 선택 모달용 목록 조회
	 * - 현재 로그인은 미구현이라, rspnrEmpNo는 서버에서 로그인 사용자로 강제 주입
	 * - 응답에 doneYn(Y/N)이 포함되며, doneYn=Y는 이번 반기에 이미 완료한 대상자
	 */
	@GetMapping("/targets")
	public java.util.List<EmpPickDTO> readTargets(
		@RequestParam String testNo,
		@AuthenticationPrincipal EmpDTOWrapper principal
	) {
		EmpDTO empDTO = principal.getRealUser();
		return behaviorTestService.readEmpPickList(testNo, empDTO);
	}

	@PostMapping
	public BehaviorTestReq createRspns(@RequestBody BehaviorTestReq req, Authentication authentication) {
        try {
            if (authentication != null && authentication.isAuthenticated() && req != null && req.getRspns() != null) {
                EmpDTO u = AuthenticationUtils.getRealUser(authentication);
                if (u != null && u.getEmpNo() != null && !u.getEmpNo().isBlank()) {
                    req.getRspns().setRspnrEmpNo(u.getEmpNo());
                }
            }
        } catch (Exception ignore) {}

        behaviorTestService.createRspns(req);

		return req;
	}

}
