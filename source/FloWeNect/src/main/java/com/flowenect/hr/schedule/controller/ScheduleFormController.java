package com.flowenect.hr.schedule.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/schedule/integrationList")
public class ScheduleFormController {

	@GetMapping
	public String scheduleForm() {
		return "schedule/scheduleForm";
	}
}
