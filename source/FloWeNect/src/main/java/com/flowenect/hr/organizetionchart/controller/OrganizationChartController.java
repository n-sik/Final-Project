package com.flowenect.hr.organizetionchart.controller;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.flowenect.hr.organizetionchart.service.OrganizationService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/organization")
@RequiredArgsConstructor
public class OrganizationChartController {
	
	private final OrganizationService organizationService;

    @GetMapping("/chart")
    public String organizationChartPage(Model model) {
    	List<Map<String, Object>> deptList = organizationService.getDeptChartList();
    	model.addAttribute("deptList", deptList);
        return "organizetionchart/organizetionchart";
    }
}
