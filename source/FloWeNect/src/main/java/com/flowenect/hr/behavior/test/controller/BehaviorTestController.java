package com.flowenect.hr.behavior.test.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.flowenect.hr.behavior.test.service.BehaviorTestService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/behavior/test")
@RequiredArgsConstructor
public class BehaviorTestController {

	private final BehaviorTestService behaviorTestService;

	@GetMapping
	public String behaviorTestForm(
		Model model
	) {
		// ✅ 대상자 목록은 모달 오픈 시 비동기 로드로 변경(SSR 제거)
		model.addAttribute("testMst", behaviorTestService.readListBehaviorTest());
		return "behavior/test/behaviorTestForm";
	}

}
