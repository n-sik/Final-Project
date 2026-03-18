package com.flowenect.hr.behavior.result.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.flowenect.hr.behavior.result.service.BehaviorResultService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/behavior/result")
@RequiredArgsConstructor
public class BehaviorResultController {

	private final BehaviorResultService behaviorResultService;

	@GetMapping
	public String behaviorResultForm(Model model) {
		model.addAttribute("deptList", behaviorResultService.readDeptList());
		model.addAttribute("empList", behaviorResultService.readEmpViewList());
		model.addAttribute("testMst", behaviorResultService.readTestMstList());
		return "behavior/result/behaviorResultForm";
	}
}
