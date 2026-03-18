package com.flowenect.hr.behavior.set.controller;



import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Controller
@RequestMapping("/behavior/set")
@RequiredArgsConstructor
public class BehaviorSetController {



	@GetMapping
	public String behaviorSetForm() {
		return "behavior/set/behaviorSetForm";
	}



}
